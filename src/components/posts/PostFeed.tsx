import { useFeed, type FeedPost } from "@/lib/posts";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PostCard } from "./PostCard";
import { PostModal } from "./PostModal";
import { Loader2 } from "lucide-react";

interface PostFeedProps {
  readOnly?: boolean;
}

export function PostFeed({ readOnly }: PostFeedProps) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const { data: posts, isLoading } = useFeed(user?.id);
  const [openPost, setOpenPost] = useState<FeedPost | null>(null);
  const qc = useQueryClient();

  // Realtime: invalidate feed on any post change
  useEffect(() => {
    const channel = supabase
      .channel("feed-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => qc.invalidateQueries({ queryKey: ["feed"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        () => qc.invalidateQueries({ queryKey: ["feed"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        {lang === "ar" ? "لا توجد منشورات بعد" : "No posts yet"}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onOpen={setOpenPost} readOnly={readOnly} />
        ))}
      </div>
      <PostModal post={openPost} onClose={() => setOpenPost(null)} readOnly={readOnly} />
    </>
  );
}
