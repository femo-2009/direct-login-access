import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Clock, Eye, Sparkles, Star, UserPlus } from "lucide-react";
import { motion } from "motion/react";

const EN = {
  brand: "Rawy",
  bannerMsg:
    "You are browsing as a guest — create an account to unlock more features",
  createAccount: "Create Account",
  signIn: "Sign In",
  heroTitle: "Welcome to",
  heroSub: "Browse stories without signing in",
  selectedStories: "Selected Stories",
  joinTitle: "Join the World of Rawy",
  joinDesc:
    "Sign in to enjoy the full experience — save your stories, follow authors, and get personalized recommendations.",
  signInFull: "Sign In for Full Experience",
  createNew: "Create New Account",
  footerBuilt: "Built with ❤️ on",
  romance: "Romance",
  mystery: "Mystery",
  literature: "Literature",
};

const AR = {
  brand: "راوي",
  bannerMsg: "أنت تتصفح كضيف — أنشئ حساباً للحصول على مزيد من المميزات",
  createAccount: "إنشاء حساب",
  signIn: "تسجيل الدخول",
  heroTitle: "مرحباً بك في",
  heroSub: "تصفح القصص بدون تسجيل دخول",
  selectedStories: "قصص مختارة",
  joinTitle: "انضم إلى عالم راوي",
  joinDesc:
    "سجل الدخول للاستمتاع بتجربة كاملة — احفظ قصصك، تابع الكتّاب، واحصل على توصيات مخصصة لك.",
  signInFull: "سجل الدخول للاستمتاع بتجربة كاملة",
  createNew: "إنشاء حساب جديد",
  footerBuilt: "مبني بـ ❤️ على",
  romance: "رومانسي",
  mystery: "غموض",
  literature: "أدب",
};

const STORY_CARDS = [
  {
    id: 1,
    title: "ظلال في آخر الليل",
    author: "ليلى المنصور",
    genreKey: "romance" as const,
    excerpt:
      "حين أدركت سلمى أن القلب لا يعرف الحدود، كانت قد رسمت بالفعل خطوطاً لا تُمحى على جدران ذاكرتها...",
    readTime: "٢٢ دقيقة",
    rating: 4.8,
  },
  {
    id: 2,
    title: "ساعة رملية مكسورة",
    author: "ياسر الشريف",
    genreKey: "mystery" as const,
    excerpt:
      "لم يكن المحقق يعلم أن الجريمة التي يحقق فيها ستقوده في النهاية إلى أعتاب بيته الخاص...",
    readTime: "٣٥ دقيقة",
    rating: 4.6,
  },
  {
    id: 3,
    title: "البحر يحكي لمن يسمع",
    author: "نور الإسكندراني",
    genreKey: "literature" as const,
    excerpt:
      "في تلك القرية الصغيرة على ضفاف البحر المتوسط، كانت الحكايات تتناقل بين الأجيال كما تتناقل الأمواج أسرار القاع...",
    readTime: "٢٨ دقيقة",
    rating: 4.9,
  },
];

function StoryCard({
  story,
  index,
  genreLabel,
}: {
  story: (typeof STORY_CARDS)[0];
  index: number;
  genreLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -4, scale: 1.015 }}
      data-ocid={`guest.story.item.${story.id}`}
      className="group relative bg-card border border-border rounded-xl p-6 flex flex-col gap-3 transition-smooth cursor-pointer hover:border-primary/50 hover:shadow-amber-glow"
    >
      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-smooth" />
      <div className="flex items-start justify-between gap-2">
        <Badge
          variant="secondary"
          className="text-xs font-body bg-primary/10 text-primary border-primary/20"
        >
          {genreLabel}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
          <Star className="w-3 h-3 fill-primary text-primary" />
          {story.rating}
        </span>
      </div>
      <h3 className="font-display text-xl text-foreground leading-snug group-hover:text-primary transition-colors">
        {story.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {story.excerpt}
      </p>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/60">
        <span className="text-xs text-muted-foreground font-body">
          {story.author}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {story.readTime}
        </span>
      </div>
    </motion.div>
  );
}

export default function GuestPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = lang === "ar" ? AR : EN;

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-primary/10 border-b border-primary/25 py-3 px-4"
        data-ocid="guest.banner"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-primary font-body text-center sm:text-start">
            <Sparkles className="inline w-4 h-4 me-1.5 opacity-80" />
            {t.bannerMsg}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10 font-body shrink-0"
            onClick={() => navigate({ to: "/signup" })}
            data-ocid="guest.banner.signup_button"
          >
            {t.createAccount}
          </Button>
        </div>
      </motion.div>

      {/* Header */}
      <header
        className="bg-card border-b border-border shadow-subtle px-4 py-4"
        data-ocid="guest.header"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-primary" />
            <span className="font-display text-2xl text-gradient-amber">
              {t.brand}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary font-body"
            onClick={() => navigate({ to: "/login" })}
            data-ocid="guest.login_button"
          >
            {t.signIn}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-14 bg-background" data-ocid="guest.hero">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55 }}
          >
            <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-4 leading-tight">
              {t.heroTitle}{" "}
              <span className="text-gradient-amber">{t.brand}</span>
            </h1>
            <p className="text-lg text-muted-foreground font-body max-w-xl mx-auto">
              {t.heroSub}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Cards */}
      <section
        className="px-4 pb-14 bg-muted/30"
        data-ocid="guest.stories_section"
      >
        <div className="max-w-5xl mx-auto">
          <div className="py-8 flex items-center gap-3">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl text-foreground">
              {t.selectedStories}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORY_CARDS.map((story, i) => (
              <StoryCard
                key={story.id}
                story={story}
                index={i}
                genreLabel={t[story.genreKey]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-4 py-16 bg-background"
        data-ocid="guest.cta_section"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative bg-card border border-primary/30 rounded-2xl p-10 text-center shadow-amber-glow overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/8 pointer-events-none" />
            <BookOpen className="w-12 h-12 text-primary mx-auto mb-5 opacity-90" />
            <h2 className="font-display text-3xl text-foreground mb-3">
              {t.joinTitle}
            </h2>
            <p className="text-muted-foreground font-body mb-8 max-w-md mx-auto">
              {t.joinDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-body shadow-amber-glow"
                onClick={() => navigate({ to: "/login" })}
                data-ocid="guest.cta.login_button"
              >
                <UserPlus className="w-5 h-5 me-2" />
                {t.signInFull}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:border-primary/50 font-body"
                onClick={() => navigate({ to: "/signup" })}
                data-ocid="guest.cta.signup_button"
              >
                {t.createNew}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="bg-card border-t border-border py-6 px-4"
        data-ocid="guest.footer"
      >
        <div className="max-w-5xl mx-auto text-center text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()}. {t.footerBuilt}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
