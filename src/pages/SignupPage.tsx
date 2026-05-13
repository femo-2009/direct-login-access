import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import type { Gender } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const EN = {
  title: "Create Account",
  subtitle: "Join Rawy and discover a world of stories and novels",
  name: "Full Name",
  namePlaceholder: "Enter your full name",
  username: "Username",
  usernamePlaceholder: "e.g. ahmed_2025",
  email: "Email",
  gender: "Gender",
  genderPlaceholder: "Select",
  male: "Male",
  female: "Female",
  unspecified: "Unspecified",
  age: "Age",
  agePlaceholder: "e.g. 25",
  password: "Password",
  passwordPlaceholder: "At least 8 characters",
  confirmPassword: "Confirm Password",
  confirmPlaceholder: "Re-enter your password",
  submit: "Sign Up",
  submitting: "Creating account...",
  google: "Or sign up with Google",
  guest: "Continue as Guest",
  alreadyHave: "Already have an account?",
  signIn: "Sign In",
  showPass: "Show password",
  hidePass: "Hide password",
  show: "Show",
  hide: "Hide",
  errorFix: "Please fix the errors below",
  successMsg: "Account created successfully! Welcome to Rawy 🎉",
  errorMsg: "An error occurred while creating the account. Please try again.",
  googleSoon: "Google sign-up coming soon",
  nameRequired: "Full name is required",
  usernameRequired: "Username is required",
  usernameInvalid:
    "Username: only English letters, numbers, and underscores (3+ chars)",
  emailRequired: "Email is required",
  emailInvalid: "Invalid email format",
  ageInvalid: "Please enter a valid age (6–120)",
  passwordShort: "Password must be at least 8 characters",
  passwordMismatch: "Passwords do not match",
  required: "Required",
};

const AR = {
  title: "إنشاء حساب",
  subtitle: "انضم إلى راوي واكتشف عالم القصص والروايات",
  name: "الاسم الكامل",
  namePlaceholder: "أدخل اسمك الكامل",
  username: "اسم المستخدم",
  usernamePlaceholder: "مثال: ahmed_2025",
  email: "البريد الإلكتروني",
  gender: "الجنس",
  genderPlaceholder: "اختر",
  male: "ذكر",
  female: "أنثى",
  unspecified: "غير محدد",
  age: "العمر",
  agePlaceholder: "مثال: 25",
  password: "كلمة المرور",
  passwordPlaceholder: "8 محارف على الأقل",
  confirmPassword: "تأكيد كلمة المرور",
  confirmPlaceholder: "أعد كتابة كلمة المرور",
  submit: "إنشاء حساب",
  submitting: "جارٍ إنشاء الحساب...",
  google: "أو سجل بـ Google",
  guest: "المتابعة كزائر",
  alreadyHave: "لديك حساب؟",
  signIn: "سجل دخول",
  showPass: "إظهار كلمة المرور",
  hidePass: "إخفاء كلمة المرور",
  show: "إظهار",
  hide: "إخفاء",
  errorFix: "يرجى تصحيح الأخطاء أدناه",
  successMsg: "تم إنشاء حسابك بنجاح! مرحباً بك في راوي 🎉",
  errorMsg: "حدث خطأ أثناء إنشاء الحساب. حاول مجدداً.",
  googleSoon: "سيتوفر التسجيل بجوجل قريباً",
  nameRequired: "الاسم الكامل مطلوب",
  usernameRequired: "اسم المستخدم مطلوب",
  usernameInvalid:
    "اسم المستخدم: أحرف إنجليزية وأرقام وشرطة سفلية فقط (3+ محارف)",
  emailRequired: "البريد الإلكتروني مطلوب",
  emailInvalid: "تنسيق البريد الإلكتروني غير صحيح",
  ageInvalid: "يرجى إدخال عمر صحيح (6–120)",
  passwordShort: "كلمة المرور يجب أن تحتوي على 8 محارف على الأقل",
  passwordMismatch: "كلمتا المرور غير متطابقتين",
  required: "مطلوب",
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { continueAsGuest } = useAuthStore();
  const { lang } = useLanguage();
  const t = lang === "ar" ? AR : EN;

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    gender: "unspecified" as Gender,
    age: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = t.nameRequired;
    if (!form.username.trim()) next.username = t.usernameRequired;
    else if (!/^[a-zA-Z0-9_]{3,}$/.test(form.username))
      next.username = t.usernameInvalid;
    if (!form.email.trim()) next.email = t.emailRequired;
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      next.email = t.emailInvalid;
    const ageNum = Number(form.age);
    if (!form.age || Number.isNaN(ageNum) || ageNum < 6 || ageNum > 120)
      next.age = t.ageInvalid;
    if (form.password.length < 8) next.password = t.passwordShort;
    if (form.confirmPassword !== form.password)
      next.confirmPassword = t.passwordMismatch;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error(t.errorFix);
      return;
    }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: form.username.trim(),
            display_name: form.name.trim(),
            full_name: form.name.trim(),
          },
        },
      });
      if (error) {
        toast.error(error.message || t.errorMsg);
        setIsSubmitting(false);
        return;
      }
      // Skip email verification — sign the user in immediately.
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (signInError) {
          toast.error(signInError.message || t.errorMsg);
          setIsSubmitting(false);
          return;
        }
      }
      toast.success(t.successMsg);
      navigate({ to: "/permissions" });
    } catch {
      toast.error(t.errorMsg);
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
    if (result.error) toast.error(result.error.message ?? "Google sign-up failed");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-accent/4 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <img
              src="/assets/logo.jpeg"
              alt="Rawy Blog"
              className="w-28 h-28 object-contain mx-auto drop-shadow-[0_0_20px_rgba(201,168,76,0.5)] mb-2"
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
            className="flex flex-col gap-4"
            noValidate
          >
            {/* Full name */}
            <FieldGroup label={t.name} htmlFor="name" error={errors.name}>
              <Input
                id="name"
                data-ocid="signup.name_input"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder={t.namePlaceholder}
                autoComplete="name"
                className={inputCls(!!errors.name)}
                disabled={isSubmitting}
              />
            </FieldGroup>

            {/* Username */}
            <FieldGroup
              label={t.username}
              htmlFor="username"
              error={errors.username}
            >
              <Input
                id="username"
                data-ocid="signup.username_input"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                placeholder={t.usernamePlaceholder}
                autoComplete="username"
                dir="ltr"
                className={`${inputCls(!!errors.username)} text-left`}
                disabled={isSubmitting}
              />
            </FieldGroup>

            {/* Email */}
            <FieldGroup label={t.email} htmlFor="email" error={errors.email}>
              <Input
                id="email"
                data-ocid="signup.email_input"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                dir="ltr"
                className={`${inputCls(!!errors.email)} text-left`}
                disabled={isSubmitting}
              />
            </FieldGroup>

            {/* Gender + Age row */}
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup
                label={t.gender}
                htmlFor="gender"
                error={errors.gender}
              >
                <Select
                  value={form.gender}
                  onValueChange={(v) => update("gender", v)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="gender"
                    data-ocid="signup.gender_select"
                    className={`h-11 ${inputCls(!!errors.gender)}`}
                  >
                    <SelectValue placeholder={t.genderPlaceholder} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="male">{t.male}</SelectItem>
                    <SelectItem value="female">{t.female}</SelectItem>
                    <SelectItem value="unspecified">{t.unspecified}</SelectItem>
                  </SelectContent>
                </Select>
              </FieldGroup>

              <FieldGroup label={t.age} htmlFor="age" error={errors.age}>
                <Input
                  id="age"
                  data-ocid="signup.age_input"
                  type="number"
                  min={6}
                  max={120}
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                  placeholder={t.agePlaceholder}
                  className={`${inputCls(!!errors.age)} text-center`}
                  disabled={isSubmitting}
                />
              </FieldGroup>
            </div>

            {/* Password */}
            <FieldGroup
              label={t.password}
              htmlFor="password"
              error={errors.password}
            >
              <div className="relative">
                <Input
                  id="password"
                  data-ocid="signup.password_input"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="new-password"
                  className={`${inputCls(!!errors.password)} pr-10`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t.hidePass : t.showPass}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </FieldGroup>

            {/* Confirm password */}
            <FieldGroup
              label={t.confirmPassword}
              htmlFor="confirmPassword"
              error={errors.confirmPassword}
            >
              <div className="relative">
                <Input
                  id="confirmPassword"
                  data-ocid="signup.confirm_password_input"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder={t.confirmPlaceholder}
                  autoComplete="new-password"
                  className={`${inputCls(!!errors.confirmPassword)} pr-10`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? t.hide : t.show}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </FieldGroup>

            {/* Submit */}
            <Button
              type="submit"
              data-ocid="signup.submit_button"
              disabled={isSubmitting}
              className="w-full h-11 font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth shadow-amber-glow mt-1"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  {t.submitting}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  {t.submit}
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-xs">{t.google}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <Button
            type="button"
            data-ocid="signup.google_button"
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
            Google
          </Button>

          {/* Guest */}
          <Button
            type="button"
            data-ocid="signup.guest_button"
            variant="ghost"
            onClick={handleGuest}
            className="w-full h-10 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-smooth mt-2"
          >
            {t.guest}
          </Button>
        </motion.div>

        {/* Login link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center text-sm text-muted-foreground mt-5"
        >
          {t.alreadyHave}{" "}
          <Link
            to="/login"
            data-ocid="signup.login_link"
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            {t.signIn}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function inputCls(hasError: boolean) {
  return `bg-background border-input text-foreground placeholder:text-muted-foreground/60 h-11 ${
    hasError ? "border-destructive focus-visible:ring-destructive" : ""
  }`;
}

function FieldGroup({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-foreground/90 text-sm">
        {label}
      </Label>
      {children}
      {error && (
        <p
          data-ocid={`signup.${htmlFor}_field_error`}
          className="text-xs text-destructive mt-0.5"
        >
          {error}
        </p>
      )}
    </div>
  );
}
