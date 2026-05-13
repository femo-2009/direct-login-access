import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthStore } from "@/store/authStore";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Languages,
  LogOut,
  Plus,
  Settings,
  Shield,
  User as UserIcon,
  UserPlus,
  LayoutDashboard,
  Tags,
  Flag,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const T = {
  en: {
    brand: "Rawy",
    feed: "Home",
    add: "Add post",
    notifications: "Notifications",
    settings: "Settings",
    profile: "Profile",
    logout: "Logout",
    signIn: "Sign in",
    signUp: "Sign up",
    guest: "Guest",
    admin: "Admin",
    user: "User",
    adminPanel: "Admin panel",
    users: "Manage users",
    categories: "Categories",
    reports: "Reports",
    soon: "Coming soon",
    guestNotice: "Sign up to add posts and get notifications",
  },
  ar: {
    brand: "راوي",
    feed: "الرئيسية",
    add: "إضافة منشور",
    notifications: "الإشعارات",
    settings: "الإعدادات",
    profile: "الملف الشخصي",
    logout: "تسجيل الخروج",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    guest: "ضيف",
    admin: "مشرف",
    user: "مستخدم",
    adminPanel: "لوحة المشرف",
    users: "إدارة المستخدمين",
    categories: "التصنيفات",
    reports: "البلاغات",
    soon: "قريباً",
    guestNotice: "سجّل لإضافة منشورات واستقبال الإشعارات",
  },
};

export function TopBar() {
  const { lang, toggle } = useLanguage();
  const t = T[lang];
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const isGuest = role === "guest" || !user;
  const isAdmin = role === "admin";

  const handleLogout = () => {
    logout();
    try {
      localStorage.removeItem("rawy-permissions");
    } catch {}
    navigate({ to: "/login" });
  };

  const notImplemented = () => toast.info(t.soon);

  const homeTo = isAdmin
    ? "/admin/dashboard"
    : isGuest
      ? "/guest"
      : "/user/dashboard";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        {/* Brand + role badge */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={homeTo}
            className="flex items-center gap-2 font-display text-lg text-foreground hover:text-primary transition-colors"
          >
            <img
              src="/assets/logo.jpeg"
              alt="Rawy"
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="truncate">{t.brand}</span>
          </Link>
          {isAdmin && (
            <Badge
              variant="default"
              className="hidden sm:inline-flex gap-1 bg-primary/15 text-primary border border-primary/30"
            >
              <Shield className="h-3 w-3" />
              {t.admin}
            </Badge>
          )}
          {isGuest && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {t.guest}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Language */}
          <button
            type="button"
            onClick={toggle}
            aria-label={lang === "en" ? "العربية" : "English"}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:text-primary hover:border-primary/40 transition-colors"
          >
            <Languages className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {lang === "en" ? "العربية" : "EN"}
            </span>
          </button>

          {/* Add post (user + admin only) */}
          {!isGuest && (
            <button
              type="button"
              onClick={notImplemented}
              aria-label={t.add}
              title={t.add}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:text-primary hover:bg-accent transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}

          {/* Notifications (user + admin only) */}
          {!isGuest && (
            <button
              type="button"
              onClick={notImplemented}
              aria-label={t.notifications}
              title={t.notifications}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:text-primary hover:bg-accent transition-colors"
            >
              <Bell className="h-5 w-5" />
            </button>
          )}

          {/* Settings menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t.settings}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:text-primary hover:bg-accent transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={lang === "ar" ? "start" : "end"}
              className="w-56"
            >
              {isGuest ? (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {t.guestNotice}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate({ to: "/login" })}>
                    <UserIcon className="me-2 h-4 w-4" /> {t.signIn}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate({ to: "/signup" })}>
                    <UserPlus className="me-2 h-4 w-4" /> {t.signUp}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel className="truncate">
                    {user?.name ?? user?.username ?? t.profile}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={notImplemented}>
                    <UserIcon className="me-2 h-4 w-4" /> {t.profile}
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => navigate({ to: "/admin/dashboard" })}
                      >
                        <LayoutDashboard className="me-2 h-4 w-4" />{" "}
                        {t.adminPanel}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={notImplemented}>
                        <Users className="me-2 h-4 w-4" /> {t.users}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={notImplemented}>
                        <Tags className="me-2 h-4 w-4" /> {t.categories}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={notImplemented}>
                        <Flag className="me-2 h-4 w-4" /> {t.reports}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="me-2 h-4 w-4" /> {t.logout}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
