import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { playLikeSound } from "@/lib/sounds";
import type { FeedPost } from "@/lib/posts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Flag, Heart, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { FollowButton } from "./FollowButton";
import { UserBadges } from "./UserBadges";

interface PostCardProps {
  post: FeedPost;
  onOpen: (post: FeedPost) => void;
  readOnly?: boolean;
}

export function PostCard({ post, onOpen, readOnly }: PostCardProps) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const likeMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
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

  const reportMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      await supabase.from("reports").insert({
        post_id: post.id,
        reporter_id: user.id,
        reason: "Inappropriate content",
      });
    },
    onSuccess: () => toast.success(lang === "ar" ? "تم إرسال البلاغ" : "Report sent"),
    onError: (e: Error) => toast.error(e.message),
  });

  const openProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: "/profile/$username", params: { username: post.author.username } });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      onClick={() => onOpen(post)}
      className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-amber-glow transition-smooth"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button onClick={openProfile} className="shrink-0">
          <Avatar className="w-10 h-10 ring-1 ring-border hover:ring-primary transition">
            <AvatarImage src={post.author.avatar_url ?? undefined} />
            <AvatarFallback>{post.author.display_name?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openProfile}
              className="font-display text-sm text-foreground hover:text-primary transition truncate"
            >
              {post.author.display_name}
            </button>
            <UserBadges badges={post.author.badges} postCount={post.author.post_count} />
          </div>
          <p className="text-xs text-muted-foreground truncate">@{post.author.username}</p>
        </div>
        {!readOnly && <FollowButton targetUserId={post.author_id} />}
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="w-full aspect-[16/9] bg-muted overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      )}

      {/* Body */}
      <div className="p-4 flex flex-col gap-2">
        {post.category && (
          <Badge variant="secondary" className="self-start text-xs bg-primary/10 text-primary border-primary/20">
            {lang === "ar" ? post.category.name_ar : post.category.name_en}
          </Badge>
        )}
        <h2 className="font-display text-xl text-foreground group-hover:text-primary transition">
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Actions */}
      {!readOnly && (
        <div className="flex items-center gap-1 px-3 py-2 border-t border-border/60">
          <button
            onClick={(e) => {
              e.stopPropagation();
              likeMut.mutate();
            }}
            disabled={!user || likeMut.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm hover:bg-accent transition disabled:opacity-50"
          >
            <Heart
              className={`w-4 h-4 ${post.liked_by_me ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`}
            />
            <span className="text-foreground/80">{post.like_count}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(post);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm hover:bg-accent transition"
          >
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground/80">{post.comment_count}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              reportMut.mutate();
            }}
            disabled={!user || reportMut.isPending}
            className="ms-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
            title={lang === "ar" ? "بلاغ" : "Report"}
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.article>
  );
}
