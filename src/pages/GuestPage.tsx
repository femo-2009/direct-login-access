import { Button } from "@/components/ui/button";
import { PostFeed } from "@/components/posts/PostFeed";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "@tanstack/react-router";
import { BookOpen, Sparkles, UserPlus } from "lucide-react";
import { motion } from "motion/react";

export default function GuestPage() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/10 border-b border-primary/25 py-3 px-4"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-primary">
            <Sparkles className="inline w-4 h-4 me-1.5" />
            {lang === "ar"
              ? "أنت تتصفّح كضيف — للتفاعل والنشر سجّل حساباً"
              : "You're browsing as a guest — sign up to post and interact"}
          </p>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline" className="border-primary/40 text-primary">
              <Link to="/login">{lang === "ar" ? "دخول" : "Sign in"}</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/signup">
                <UserPlus className="w-4 h-4 me-1.5" />
                {lang === "ar" ? "إنشاء حساب" : "Sign up"}
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <section className="px-4 pt-10 pb-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-primary" />
          <h1 className="font-display text-3xl text-gradient-amber">
            {lang === "ar" ? "راوي" : "Rawy"}
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          {lang === "ar" ? "اقرأ القصص بدون تسجيل" : "Read stories without signing in"}
        </p>
      </section>

      <section className="px-4 pb-12 max-w-5xl mx-auto">
        <PostFeed readOnly />
      </section>
    </div>
  );
}
