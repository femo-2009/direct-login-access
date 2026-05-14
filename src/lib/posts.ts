import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface FeedPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author_id: string;
  category_id: string | null;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    post_count: number;
    badges: { type: string }[];
  };
  category: { name_en: string; name_ar: string; slug: string } | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
}

export async function fetchFeed(currentUserId?: string): Promise<FeedPost[]> {
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, content, image_url, created_at, author_id, category_id")
    .order("created_at", { ascending: false })
    .limit(50);
  if (!posts) return [];

  const authorIds = [...new Set(posts.map((p) => p.author_id))];
  const categoryIds = [...new Set(posts.map((p) => p.category_id).filter(Boolean) as string[])];

  const [profilesRes, badgesRes, postCountsRes, categoriesRes, likesRes, commentsRes, myLikesRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", authorIds),
      supabase.from("badges").select("user_id, type").in("user_id", authorIds),
      supabase.from("posts").select("author_id").in("author_id", authorIds),
      categoryIds.length
        ? supabase
            .from("categories")
            .select("id, name_en, name_ar, slug")
            .in("id", categoryIds)
        : Promise.resolve({ data: [] as { id: string; name_en: string; name_ar: string; slug: string }[] }),
      supabase.from("likes").select("post_id").in("post_id", posts.map((p) => p.id)),
      supabase.from("comments").select("post_id").in("post_id", posts.map((p) => p.id)),
      currentUserId
        ? supabase
            .from("likes")
            .select("post_id")
            .eq("user_id", currentUserId)
            .in("post_id", posts.map((p) => p.id))
        : Promise.resolve({ data: [] as { post_id: string }[] }),
    ]);

  const profileById = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
  const badgesByUser = new Map<string, { type: string }[]>();
  for (const b of badgesRes.data ?? []) {
    const arr = badgesByUser.get(b.user_id) ?? [];
    arr.push({ type: b.type });
    badgesByUser.set(b.user_id, arr);
  }
  const postCountByUser = new Map<string, number>();
  for (const p of postCountsRes.data ?? []) {
    postCountByUser.set(p.author_id, (postCountByUser.get(p.author_id) ?? 0) + 1);
  }
  const categoryById = new Map((categoriesRes.data ?? []).map((c) => [c.id, c]));
  const likeCount = new Map<string, number>();
  for (const l of likesRes.data ?? []) likeCount.set(l.post_id, (likeCount.get(l.post_id) ?? 0) + 1);
  const commentCount = new Map<string, number>();
  for (const c of commentsRes.data ?? []) commentCount.set(c.post_id, (commentCount.get(c.post_id) ?? 0) + 1);
  const myLikes = new Set((myLikesRes.data ?? []).map((l) => l.post_id));

  return posts.map((p) => {
    const profile = profileById.get(p.author_id);
    const cat = p.category_id ? categoryById.get(p.category_id) ?? null : null;
    return {
      id: p.id,
      title: p.title,
      content: p.content,
      image_url: p.image_url,
      created_at: p.created_at,
      author_id: p.author_id,
      category_id: p.category_id,
      author: {
        id: p.author_id,
        username: profile?.username ?? "user",
        display_name: profile?.display_name ?? "User",
        avatar_url: profile?.avatar_url ?? null,
        post_count: postCountByUser.get(p.author_id) ?? 0,
        badges: badgesByUser.get(p.author_id) ?? [],
      },
      category: cat ? { name_en: cat.name_en, name_ar: cat.name_ar, slug: cat.slug } : null,
      like_count: likeCount.get(p.id) ?? 0,
      comment_count: commentCount.get(p.id) ?? 0,
      liked_by_me: myLikes.has(p.id),
    };
  });
}

export function useFeed(currentUserId?: string) {
  return useQuery({
    queryKey: ["feed", currentUserId ?? "anon"],
    queryFn: () => fetchFeed(currentUserId),
  });
}
