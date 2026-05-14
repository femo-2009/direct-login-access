import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { FeedPost } from "@/lib/posts";
import { playCommentSound, playLikeSound } from "@/lib/sounds";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserBadges } from "./UserBadges";

interface PostModalProps {
  post: FeedPost | null;
  onClose: () => void;
  readOnly?: boolean;
}

export function PostModal({ post, onClose, readOnly }: PostModalProps) {
  const { lang } = useLanguage();
  const { user, isAdmin, adminPerms } = useAuth();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: comments } = useQuery({
    queryKey: ["comments", post?.id],
    enabled: Boolean(post),
    queryFn: async () => {
      if (!post) return [];
      const { data } = await supabase
        .from("comments")
        .select("id, content, created_at, author_id")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });
      const ids = [...new Set((data ?? []).map((c) => c.author_id))];
      const { data: profiles } = ids.length
        ? await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url")
            .in("id", ids)
        : { data: [] as { id: string; username: string; display_name: string; avatar_url: string | null }[] };
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((c) => ({
        ...c,
        profile: byId.get(c.author_id),
      }));
    },
  });

  const likeMut = useMutation({
    mutationFn: async () => {
      if (!user || !post) throw new Error("Not signed in");
      if (post.liked_by_me) {
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      } else {
        playLikeSound();
        await supabase.from("likes").insert({ post_id: post.id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feed"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const commentMut = useMutation({
    mutationFn: async () => {
      if (!user || !post) throw new Error("Not signed in");
      const txt = comment.trim();
      if (!txt) throw new Error(lang === "ar" ? "اكتب تعليقاً" : "Write a comment");
      playCommentSound();
      const { error } = await supabase
        .from("comments")
        .insert({ post_id: post.id, author_id: user.id, content: txt });
      if (error) throw error;
    },
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["comments", post?.id] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deletePostMut = useMutation({
    mutationFn: async () => {
      if (!post) return;
      const { error } = await supabase.from("posts").delete().eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted");
      qc.invalidateQueries({ queryKey: ["feed"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canDelete =
    user && post && (post.author_id === user.id || (isAdmin && adminPerms?.can_delete_posts));

  return (
    <Dialog open={Boolean(post)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {post && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.author.avatar_url ?? undefined} />
                  <AvatarFallback>{post.author.display_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-start">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-sm">{post.author.display_name}</span>
                    <UserBadges badges={post.author.badges} postCount={post.author.post_count} />
                  </div>
                  <p className="text-xs text-muted-foreground">@{post.author.username}</p>
                </div>
              </div>
              <DialogTitle className="font-display text-2xl mt-3 text-start">
                {post.title}
              </DialogTitle>
              {post.category && (
                <DialogDescription asChild>
                  <Badge
                    variant="secondary"
                    className="self-start text-xs bg-primary/10 text-primary border-primary/20"
                  >
                    {lang === "ar" ? post.category.name_ar : post.category.name_en}
                  </Badge>
                </DialogDescription>
              )}
            </DialogHeader>

            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full rounded-xl object-cover"
              />
            )}

            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>

            {!readOnly && (
              <div className="flex items-center gap-2 border-t border-border pt-3">
                <Button
                  size="sm"
                  variant={post.liked_by_me ? "default" : "outline"}
                  onClick={() => likeMut.mutate()}
                  disabled={!user || likeMut.isPending}
                  className="gap-1.5"
                >
                  <Heart
                    className={`w-4 h-4 ${post.liked_by_me ? "fill-rose-200" : ""}`}
                  />
                  {post.like_count}
                </Button>
                {canDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deletePostMut.mutate()}
                    disabled={deletePostMut.isPending}
                    className="ms-auto gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    {lang === "ar" ? "حذف" : "Delete"}
                  </Button>
                )}
              </div>
            )}

            {/* Comments */}
            {!readOnly && (
              <div className="border-t border-border pt-3 space-y-3">
                <h3 className="font-display text-sm">
                  {lang === "ar" ? "التعليقات" : "Comments"} ({comments?.length ?? 0})
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {comments?.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={c.profile?.avatar_url ?? undefined} />
                        <AvatarFallback>{c.profile?.display_name?.[0] ?? "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/40 rounded-xl px-3 py-2">
                        <p className="text-xs font-display text-foreground/90">
                          {c.profile?.display_name ?? "User"}
                        </p>
                        <p className="text-sm text-foreground/80">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  {!comments?.length && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      {lang === "ar" ? "لا توجد تعليقات بعد" : "No comments yet"}
                    </p>
                  )}
                </div>
                {user && (
                  <div className="flex gap-2">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={lang === "ar" ? "أضف تعليقاً..." : "Add a comment..."}
                      className="min-h-[44px] resize-none"
                      maxLength={500}
                    />
                    <Button
                      onClick={() => commentMut.mutate()}
                      disabled={commentMut.isPending || !comment.trim()}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
