import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import {
  BookMarked,
  BookOpen,
  Clock,
  Compass,
  Heart,
  Home,
  LogOut,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const EN = {
  brand: "Rawy",
  home: "Home",
  discover: "Discover",
  favorites: "Favorites",
  logout: "Logout",
  welcome: (name?: string) => `Hello, ${name ?? "Reader"}!`,
  welcomeSub: "Continue your story journey",
  storiesRead: "Stories Read",
  favoritesLabel: "Favorites",
  following: "Following",
  lastRead: "Last Read",
  completedLabel: "completed",
  continueReading: "Continue Reading",
  suggestions: "Suggested for You",
  footerBuilt: "Built with",
  footerOn: "on",
};

const AR = {
  brand: "راوي",
  home: "الرئيسية",
  discover: "اكتشف",
  favorites: "مفضلتي",
  logout: "خروج",
  welcome: (name?: string) => `أهلاً، ${name ?? "القارئ"}!`,
  welcomeSub: "استمر في رحلتك مع القصص",
  storiesRead: "القصص المقروءة",
  favoritesLabel: "المفضلة",
  following: "المتابَعون",
  lastRead: "آخر ما قرأته",
  completedLabel: "مكتملة",
  continueReading: "تابع القراءة",
  suggestions: "اقتراحات لك",
  footerBuilt: "مبني بـ ❤️ على",
  footerOn: "",
};

const SUGGESTIONS = [
  {
    id: 1,
    title: "أصداء المدينة القديمة",
    author: "رنا العمر",
    genre: "تاريخي",
    excerpt:
      "رحلة عبر أزقة القاهرة القديمة تكشف أسراراً دفنها الزمن في طيّات حجارتها الصامتة...",
    readTime: "٣١ دقيقة",
    rating: 4.7,
  },
  {
    id: 2,
    title: "قلب في المنفى",
    author: "سامي الدروبي",
    genre: "اجتماعي",
    excerpt:
      "حين غادر الوطن باحثاً عن لقمة العيش، لم يكن يعلم أنه سيبحث طوال عمره عن شيء أثمن من الخبز...",
    readTime: "٤٠ دقيقة",
    rating: 4.5,
  },
  {
    id: 3,
    title: "نبوءة العارف",
    author: "منى الرفاعي",
    genre: "خيال علمي",
    excerpt:
      "في عالم تحكمه الخوارزميات، وجد المحقق نفسه أمام جريمة لم يرتكبها أحد — أو ربما ارتكبها الجميع...",
    readTime: "٤٥ دقيقة",
    rating: 4.9,
  },
];

const LAST_READ = {
  title: "ليالي بلا نجوم",
  author: "حمد الغامدي",
  progress: 68,
  readTime: "٥٥ دقيقة",
};

function SuggestionCard({
  story,
  index,
}: {
  story: (typeof SUGGESTIONS)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      whileHover={{ y: -3 }}
      data-ocid={`user.suggestion.item.${story.id}`}
      className="group bg-card border border-border rounded-xl p-5 flex flex-col gap-3 transition-smooth cursor-pointer hover:border-primary/50 hover:shadow-amber-glow"
    >
      <div className="flex items-start justify-between gap-2">
        <Badge
          variant="secondary"
          className="text-xs bg-primary/10 text-primary border-primary/20"
        >
          {story.genre}
        </Badge>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3 h-3 fill-primary text-primary" />
          {story.rating}
        </span>
      </div>
      <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
        {story.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {story.excerpt}
      </p>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/60">
        <span className="text-xs text-muted-foreground">{story.author}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {story.readTime}
        </span>
      </div>
    </motion.div>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const t = lang === "ar" ? AR : EN;

  const STATS = [
    { id: "read", label: t.storiesRead, value: "١٢", icon: BookOpen },
    { id: "fav", label: t.favoritesLabel, value: "٥", icon: Heart },
    { id: "following", label: t.following, value: "٨", icon: Users },
  ];

  const NAV_ITEMS = [
    { label: t.home, icon: Home, ocid: "user.nav.home_link" },
    { label: t.discover, icon: Compass, ocid: "user.nav.discover_link" },
    { label: t.favorites, icon: BookMarked, ocid: "user.nav.favorites_link" },
  ];

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header
        className="bg-card border-b border-border shadow-subtle px-4 py-3 sticky top-0 z-30"
        data-ocid="user.header"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="font-display text-xl text-gradient-amber">
              {t.brand}
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary font-body gap-1.5"
                data-ocid={item.ocid}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive gap-1.5 font-body"
            onClick={handleLogout}
            data-ocid="user.logout_button"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t.logout}</span>
          </Button>
        </div>
      </header>

      {/* Welcome */}
      <section
        className="px-4 pt-10 pb-8 bg-background"
        data-ocid="user.welcome_section"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-2">
              <span className="text-gradient-amber">
                {t.welcome(user?.name)}
              </span>
            </h1>
            <p className="text-muted-foreground font-body text-lg">
              {t.welcomeSub}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-6 bg-muted/30" data-ocid="user.stats_section">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                data-ocid={`user.stat.${stat.id}`}
                className="bg-card border border-border rounded-xl p-4 sm:p-6 text-center hover:border-primary/40 transition-smooth"
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-display text-2xl text-foreground mb-0.5">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Last Read */}
      <section
        className="px-4 py-8 bg-background"
        data-ocid="user.last_read_section"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-xl text-foreground mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {t.lastRead}
          </h2>
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            data-ocid="user.last_read.card"
            className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/40 transition-smooth cursor-pointer"
          >
            <div className="flex-1">
              <h3 className="font-display text-xl text-foreground mb-1">
                {LAST_READ.title}
              </h3>
              <p className="text-sm text-muted-foreground font-body mb-3">
                {LAST_READ.author}
              </p>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${LAST_READ.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-2 rounded-full bg-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 font-body">
                {LAST_READ.progress}% {t.completedLabel}
              </p>
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-body shrink-0"
              data-ocid="user.last_read.continue_button"
            >
              <BookOpen className="w-4 h-4 me-2" />
              {t.continueReading}
            </Button>
          </motion.div>
        </div>
      </section>

      <Separator className="opacity-40" />

      {/* Suggestions */}
      <section
        className="px-4 py-8 bg-muted/30"
        data-ocid="user.suggestions_section"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-xl text-foreground mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            {t.suggestions}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SUGGESTIONS.map((story, i) => (
              <SuggestionCard key={story.id} story={story} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="bg-card border-t border-border py-5 px-4"
        data-ocid="user.footer"
      >
        <div className="max-w-6xl mx-auto text-center text-xs text-muted-foreground font-body">
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
