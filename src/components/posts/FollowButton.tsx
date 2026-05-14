import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface FollowButtonProps {
  targetUserId: string;
  size?: "sm" | "default";
}

export function FollowButton({ targetUserId, size = "sm" }: FollowButtonProps) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const qc = useQueryClient();
  const enabled = Boolean(user) && user?.id !== targetUserId;

  const { data: isFollowing } = useQuery({
    queryKey: ["follow", user?.id, targetUserId],
    enabled,
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle();
      return Boolean(data);
    },
  });

  const mut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: targetUserId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow", user?.id, targetUserId] });
      qc.invalidateQueries({ queryKey: ["followers", targetUserId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!enabled) return null;

  return (
    <Button
      type="button"
      size={size}
      variant={isFollowing ? "outline" : "default"}
      onClick={(e) => {
        e.stopPropagation();
        mut.mutate();
      }}
      disabled={mut.isPending}
      className="gap-1.5"
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-3.5 h-3.5" />
          {lang === "ar" ? "إلغاء المتابعة" : "Unfollow"}
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5" />
          {lang === "ar" ? "متابعة" : "Follow"}
        </>
      )}
    </Button>
  );
}
