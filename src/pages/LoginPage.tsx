import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { continueAsGuest } = useAuthStore();
  const { lang } = useLanguage();

  const t =
    lang === "ar"
      ? {
          title: "راوي",
          subtitle: "مرحباً بك — سجّل دخولك للمتابعة",
          identifierLabel: "البريد الإلكتروني أو اسم المستخدم",
          identifierPlaceholder: "أدخل بريدك أو اسم المستخدم",
          passwordLabel: "كلمة المرور",
          passwordPlaceholder: "أدخل كلمة المرور",
          showPassword: "إظهار كلمة المرور",
          hidePassword: "إخفاء كلمة المرور",
          submit: "تسجيل الدخول",
          submitting: "جارٍ التحقق...",
          or: "أو",
          google: "تسجيل الدخول بجوجل",
          guest: "الدخول بدون تسجيل",
          noAccount: "ليس لديك حساب؟",
          signup: "إنشاء حساب جديد",
          errorIdentifier: "يرجى إدخال البريد الإلكتروني أو اسم المستخدم",
          errorPassword: "يرجى إدخال كلمة المرور",
          errorCredentials: "بيانات الدخول غير صحيحة. حاول مجدداً.",
          welcome: "مرحباً بك في راوي!",
          googleSoon: "سيتوفر تسجيل الدخول بجوجل قريباً",
        }
      : {
          title: "Rawy Blog",
          subtitle: "Welcome back — sign in to continue",
          identifierLabel: "Email or Username",
          identifierPlaceholder: "Enter your email or username",
          passwordLabel: "Password",
          passwordPlaceholder: "Enter your password",
          showPassword: "Show password",
          hidePassword: "Hide password",
          submit: "Sign In",
          submitting: "Verifying...",
          or: "or",
          google: "Continue with Google",
          guest: "Continue without signing in",
          noAccount: "Don't have an account?",
          signup: "Create new account",
          errorIdentifier: "Please enter your email or username",
          errorPassword: "Please enter your password",
          errorCredentials: "Invalid credentials. Please try again.",
          welcome: "Welcome to Rawy Blog!",
          googleSoon: "Google sign-in coming soon",
        };

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const permissionsGranted =
    typeof window !== "undefined" &&
    localStorage.getItem("rawy-permissions-granted") === "true";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error(t.errorIdentifier);
      return;
    }
    if (password.length < 1) {
      toast.error(t.errorPassword);
      return;
    }

    setIsSubmitting(true);
    try {
      // Allow login by email OR username — resolve username to email via profiles
      let email = identifier.trim();
      if (!email.includes("@")) {
        const { data: resolvedEmail } = await supabase.rpc(
          "get_email_by_username",
          { _username: email },
        );
        if (!resolvedEmail) {
          toast.error(t.errorCredentials);
          setIsSubmitting(false);
          return;
        }
        email = resolvedEmail as string;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.user) {
        toast.error(t.errorCredentials);
        setIsSubmitting(false);
        return;
      }
      // Determine role for routing
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      const isAdmin = (roles ?? []).some((r) => r.role === "admin");

      toast.success(t.welcome);
      const permissionsGranted =
        typeof window !== "undefined" &&
        localStorage.getItem("rawy-permissions-granted") === "true";
      if (!permissionsGranted) {
        navigate({ to: "/permissions" });
      } else {
        navigate({
          to: isAdmin ? "/admin/dashboard" : "/user/dashboard",
        });
      }
    } catch {
      toast.error(t.errorCredentials);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGuest() {
    continueAsGuest();
    navigate({ to: "/guest" });
  }

  async function handleGoogle() {
    const { lovable } = await import("@/integrations/lovable");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) toast.error(result.error.message ?? "Google sign-in failed");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-accent/4 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <img
              src="/assets/logo.jpeg"
              alt="Rawy Blog"
              className="w-32 h-32 object-contain mx-auto drop-shadow-[0_0_20px_rgba(201,168,76,0.5)]"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="font-display text-3xl font-bold text-gradient-amber tracking-tight"
          >
            {t.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
            className="text-muted-foreground text-sm text-center"
          >
            {t.subtitle}
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card border border-border rounded-2xl p-8 shadow-elevated"
        >
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            noValidate
          >
            {/* Identifier */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="identifier"
                className="text-foreground/90 text-sm"
              >
                {t.identifierLabel}
              </Label>
              <Input
                id="identifier"
                data-ocid="login.identifier_input"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t.identifierPlaceholder}
                autoComplete="username"
                className="bg-background border-input text-foreground placeholder:text-muted-foreground/60 h-11"
                disabled={isSubmitting}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-foreground/90 text-sm">
                {t.passwordLabel}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  data-ocid="login.password_input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="current-password"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground/60 h-11 pr-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  data-ocid="login.toggle_password_button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors-smooth"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              data-ocid="login.submit_button"
              disabled={isSubmitting}
              className="w-full h-11 font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth shadow-amber-glow"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  {t.submitting}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  {t.submit}
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-xs">{t.or}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <Button
            type="button"
            data-ocid="login.google_button"
            variant="outline"
            onClick={handleGoogle}
            className="w-full h-10 text-sm border-border hover:bg-secondary/70 transition-smooth gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t.google}
          </Button>

          {/* Guest */}
          <Button
            type="button"
            data-ocid="login.guest_button"
            variant="ghost"
            onClick={handleGuest}
            className="w-full h-10 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-smooth mt-2"
          >
            {t.guest}
          </Button>
        </motion.div>

        {/* Signup link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center text-sm text-muted-foreground mt-5"
        >
          {t.noAccount}{" "}
          <Link
            to="/signup"
            data-ocid="login.signup_link"
            className="text-primary hover:text-primary/80 font-semibold transition-colors-smooth"
          >
            {t.signup}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
