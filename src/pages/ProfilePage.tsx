import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/posts/FollowButton";
import { PostCard } from "@/components/posts/PostCard";
import { PostModal } from "@/components/posts/PostModal";
import { UserBadges } from "@/components/posts/UserBadges";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchFeed } from "@/lib/posts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { FeedPost } from "@/lib/posts";

export default function ProfilePage() {
  const { username } = useParams({ from: "/profile/$username" });
  const { user } = useAuth();
  const { lang } = useLanguage();
  const qc = useQueryClient();
  const [openPost, setOpenPost] = useState<FeedPost | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio")
        .eq("username", username)
        .maybeSingle();
      return data;
    },
  });

  const { data: badges } = useQuery({
    queryKey: ["badges", profile?.id],
    enabled: Boolean(profile),
    queryFn: async () => {
      const { data } = await supabase.from("badges").select("type").eq("user_id", profile!.id);
      return data ?? [];
    },
  });

  const { data: posts } = useQuery({
    queryKey: ["profile-posts", profile?.id, user?.id],
    enabled: Boolean(profile),
    queryFn: async () => {
      const all = await fetchFeed(user?.id);
      return all.filter((p) => p.author_id === profile!.id);
    },
  });

  const { data: followCounts } = useQuery({
    queryKey: ["follow-counts", profile?.id],
    enabled: Boolean(profile),
    queryFn: async () => {
      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile!.id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile!.id),
      ]);
      return { followers: followers ?? 0, following: following ?? 0 };
    },
  });

  const isMine = user?.id === profile?.id;

  async function handleAvatarUpload(file: File) {
    if (!user || !profile) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${pub.publicUrl}?t=${Date.now()}`;
      const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["profile", username] });
      toast.success(lang === "ar" ? "تم تحديث الصورة" : "Avatar updated");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        {lang === "ar" ? "المستخدم غير موجود" : "User not found"}
      </div>
    );
  }

  const postCount = posts?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <div className="relative">
            <Avatar className="w-28 h-28 ring-2 ring-primary/30">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-3xl">{profile.display_name[0]}</AvatarFallback>
            </Avatar>
            {isMine && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                />
              </button>
            )}
          </div>
          <div className="flex-1 text-center sm:text-start">
            <h1 className="font-display text-3xl text-foreground">{profile.display_name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
            <div className="mt-2 flex items-center justify-center sm:justify-start">
              <UserBadges badges={badges} postCount={postCount} size="md" />
            </div>
            {profile.bio && <p className="mt-3 text-sm text-foreground/80">{profile.bio}</p>}
            <div className="mt-4 flex items-center justify-center sm:justify-start gap-6 text-sm">
              <div>
                <span className="font-display text-xl text-foreground">{postCount}</span>{" "}
                <span className="text-muted-foreground">
                  {lang === "ar" ? "منشور" : "posts"}
                </span>
              </div>
              <div>
                <span className="font-display text-xl text-foreground">{followCounts?.followers ?? 0}</span>{" "}
                <span className="text-muted-foreground">
                  {lang === "ar" ? "متابِع" : "followers"}
                </span>
              </div>
              <div>
                <span className="font-display text-xl text-foreground">{followCounts?.following ?? 0}</span>{" "}
                <span className="text-muted-foreground">
                  {lang === "ar" ? "يتابع" : "following"}
                </span>
              </div>
            </div>
            {!isMine && (
              <div className="mt-4">
                <FollowButton targetUserId={profile.id} size="default" />
              </div>
            )}
          </div>
        </div>

        {/* Posts */}
        <h2 className="font-display text-xl mt-8 mb-4">
          {lang === "ar" ? "المنشورات" : "Posts"}
        </h2>
        {posts?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} onOpen={setOpenPost} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {lang === "ar" ? "لا توجد منشورات" : "No posts yet"}
          </div>
        )}
        <PostModal post={openPost} onClose={() => setOpenPost(null)} />
      </div>
    </div>
  );
}
