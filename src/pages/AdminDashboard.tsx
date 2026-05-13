import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  BookCheck,
  BookOpen,
  ClipboardList,
  HourglassIcon,
  LogOut,
  PlusCircle,
  Settings,
  Shield,
  UserCog,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const EN = {
  brand: "Rawy",
  dashboard: "Dashboard",
  users: "Users",
  stories: "Stories",
  logout: "Logout",
  adminBadge: "Admin",
  dashboardTitle: "Admin Dashboard",
  welcome: (name?: string) =>
    `Welcome, ${name ?? "Admin"} — here's an overview of the platform today`,
  totalUsers: "Total Users",
  published: "Published Stories",
  pending: "Pending Novels",
  visits: "Visits Today",
  quickActions: "Quick Actions",
  newStory: "Publish New Story",
  newStoryDesc: "Add new content to the platform",
  pendingReview: "Review Pending Requests",
  pendingReviewDesc: "9 requests awaiting review",
  manageUsers: "Manage Users",
  manageUsersDesc: "View and edit user accounts",
  settingsLabel: "Settings",
  settingsDesc: "Configure platform and security settings",
  recentActivity: "Recent Activity",
  footerBuilt: "Built with ❤️ on",
};

const AR = {
  brand: "راوي",
  dashboard: "لوحة التحكم",
  users: "المستخدمون",
  stories: "القصص",
  logout: "خروج",
  adminBadge: "مدير",
  dashboardTitle: "لوحة تحكم المدير",
  welcome: (name?: string) =>
    `مرحباً، ${name ?? "المدير"} — إليك نظرة عامة على المنصة اليوم`,
  totalUsers: "إجمالي المستخدمين",
  published: "القصص المنشورة",
  pending: "الروايات المعلقة",
  visits: "الزيارات اليوم",
  quickActions: "إجراءات سريعة",
  newStory: "نشر قصة جديدة",
  newStoryDesc: "أضف محتوى جديداً للمنصة",
  pendingReview: "مراجعة الطلبات المعلقة",
  pendingReviewDesc: "٩ طلبات تنتظر المراجعة",
  manageUsers: "إدارة المستخدمين",
  manageUsersDesc: "عرض وتعديل حسابات المستخدمين",
  settingsLabel: "الإعدادات",
  settingsDesc: "ضبط إعدادات المنصة والأمان",
  recentActivity: "آخر النشاطات",
  footerBuilt: "مبني بـ ❤️ على",
};

const RECENT_ACTIVITY = [
  {
    id: 1,
    en: "New user: Ahmed Al-Saqr joined the platform",
    ar: "مستخدم جديد: أحمد الصقر انضم للمنصة",
    time: { en: "5 minutes ago", ar: "منذ ٥ دقائق" },
    type: "user",
  },
  {
    id: 2,
    en: "New story pending review: 'Groan of the Wind'",
    ar: "قصة جديدة بانتظار المراجعة: 'أنين الريح'",
    time: { en: "22 minutes ago", ar: "منذ ٢٢ دقيقة" },
    type: "story",
  },
  {
    id: 3,
    en: "Story published: 'Beyond the Horizon' by Leila Al-Mansour",
    ar: "نُشرت قصة: 'وراء الأفق' بقلم ليلى المنصور",
    time: { en: "1 hour ago", ar: "منذ ١ ساعة" },
    type: "publish",
  },
  {
    id: 4,
    en: "Security settings updated — Passwords",
    ar: "تحديث في إعدادات الأمان — كلمات المرور",
    time: { en: "3 hours ago", ar: "منذ ٣ ساعات" },
    type: "settings",
  },
  {
    id: 5,
    en: "New report on story: 'City of Ghosts'",
    ar: "بلاغ جديد على قصة: 'مدينة الأشباح'",
    time: { en: "5 hours ago", ar: "منذ ٥ ساعات" },
    type: "report",
  },
];

const ACTIVITY_COLORS: Record<string, string> = {
  user: "bg-primary/15 text-primary border-primary/30",
  story: "bg-accent/15 text-accent border-accent/30",
  publish: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  settings: "bg-muted/40 text-muted-foreground border-border",
  report: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const t = lang === "ar" ? AR : EN;

  const STATS = [
    {
      id: "users",
      label: t.totalUsers,
      value: "٣٨٤",
      icon: Users,
      delta: "+١٢",
      positive: true,
    },
    {
      id: "published",
      label: t.published,
      value: "١٢٧",
      icon: BookCheck,
      delta: "+٣",
      positive: true,
    },
    {
      id: "pending",
      label: t.pending,
      value: "٩",
      icon: HourglassIcon,
      delta: "+٢",
      positive: false,
    },
    {
      id: "visits",
      label: t.visits,
      value: "٢٤٥٦",
      icon: BarChart3,
      delta: "+١٨٪",
      positive: true,
    },
  ];

  const QUICK_ACTIONS = [
    {
      id: "new_story",
      label: t.newStory,
      icon: PlusCircle,
      desc: t.newStoryDesc,
    },
    {
      id: "pending_review",
      label: t.pendingReview,
      icon: ClipboardList,
      desc: t.pendingReviewDesc,
    },
    {
      id: "manage_users",
      label: t.manageUsers,
      icon: UserCog,
      desc: t.manageUsersDesc,
    },
    {
      id: "settings",
      label: t.settingsLabel,
      icon: Settings,
      desc: t.settingsDesc,
    },
  ];

  const NAV_ITEMS = [
    { label: t.dashboard, ocid: "admin.nav.dashboard_link" },
    { label: t.users, ocid: "admin.nav.users_link" },
    { label: t.stories, ocid: "admin.nav.stories_link" },
  ];

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Nav */}
      <header
        className="bg-card border-b border-primary/25 shadow-amber-glow px-4 py-3 sticky top-0 z-30"
        data-ocid="admin.header"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BookOpen className="w-6 h-6 text-primary" />
              <Shield className="absolute -bottom-1 -left-1 w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-display text-xl text-gradient-amber">
              {t.brand}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary font-body"
                data-ocid={item.ocid}
              >
                {item.label}
              </Button>
            ))}
          </nav>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive gap-1.5 font-body"
            onClick={handleLogout}
            data-ocid="admin.logout_button"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t.logout}</span>
          </Button>
        </div>
      </header>

      {/* Welcome */}
      <section
        className="px-4 pt-10 pb-8 bg-background"
        data-ocid="admin.welcome_section"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative bg-card border border-primary/40 rounded-2xl px-7 py-6 shadow-amber-glow overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-transparent pointer-events-none" />
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <Badge className="bg-primary/20 text-primary border-primary/40 font-body">
                  {t.adminBadge}
                </Badge>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-1">
                {t.dashboardTitle}
              </h1>
              <p className="text-muted-foreground font-body">
                {t.welcome(user?.name)}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <section
        className="px-4 py-6 bg-muted/30"
        data-ocid="admin.stats_section"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                data-ocid={`admin.stat.${stat.id}`}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-smooth group"
              >
                <div className="flex items-start justify-between mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                  <span
                    className={`text-xs font-body px-2 py-0.5 rounded-full ${
                      stat.positive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {stat.delta}
                  </span>
                </div>
                <p className="font-display text-3xl text-foreground mb-1">
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

      {/* Quick Actions */}
      <section
        className="px-4 py-8 bg-background"
        data-ocid="admin.quick_actions_section"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-xl text-foreground mb-5 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {t.quickActions}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.button
                key={action.id}
                type="button"
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                data-ocid={`admin.quick_action.${action.id}`}
                className="bg-card border border-border rounded-xl p-5 text-start hover:border-primary/50 hover:shadow-amber-glow transition-smooth group flex flex-col gap-3 cursor-pointer"
              >
                <action.icon className="w-7 h-7 text-primary group-hover:scale-110 transition-smooth" />
                <div>
                  <p className="font-display text-base text-foreground">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">
                    {action.desc}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <Separator className="opacity-40" />

      {/* Recent Activity */}
      <section
        className="px-4 py-8 bg-muted/30"
        data-ocid="admin.activity_section"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-xl text-foreground mb-5 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            {t.recentActivity}
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {RECENT_ACTIVITY.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                data-ocid={`admin.activity.item.${item.id}`}
                className={`flex items-center justify-between gap-4 px-6 py-4 ${
                  i < RECENT_ACTIVITY.length - 1
                    ? "border-b border-border/60"
                    : ""
                } hover:bg-muted/20 transition-colors`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`shrink-0 w-2 h-2 rounded-full border ${ACTIVITY_COLORS[item.type]}`}
                  />
                  <p className="text-sm text-foreground truncate">
                    {lang === "ar" ? item.ar : item.en}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground font-body shrink-0">
                  {lang === "ar" ? item.time.ar : item.time.en}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="bg-card border-t border-border py-5 px-4"
        data-ocid="admin.footer"
      >
        <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground font-body">
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
