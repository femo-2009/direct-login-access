import { PostFeed } from "@/components/posts/PostFeed";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "motion/react";

export default function UserDashboard() {
  const { user } = useAuth();
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <section className="px-4 pt-8 pb-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl text-gradient-amber">
            {lang === "ar" ? `أهلاً، ${user?.name ?? "القارئ"}` : `Hello, ${user?.name ?? "Reader"}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lang === "ar" ? "آخر المنشورات من الكتّاب" : "Latest posts from writers"}
          </p>
        </motion.div>
      </section>
      <section className="px-4 pb-12 max-w-5xl mx-auto">
        <PostFeed />
      </section>
    </div>
  );
}
