import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Shield, Star, Users } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EN = {
  admin: {
    greeting: (name?: string) =>
      name ? `Welcome, ${name}!` : "Welcome, Rawy Admin!",
    subline: "You are now in your control panel.",
    note: "You have full access to manage Rawy Blog.",
  },
  user: {
    greeting: (name?: string) =>
      name ? `Welcome back, ${name}!` : "Welcome back!",
    subline: "A world of stories and royalties awaits you.",
    note: "Explore stories and royalties awaiting you.",
  },
  guest: {
    greeting: () => "Welcome, Guest!",
    subline: "Browse our stories without signing in.",
    note: "Create an account to access more stories and interact with authors.",
  },
  autoRedirect: (n: number) => `Redirecting automatically in ${n} seconds`,
  continueNow: "Continue Now",
};

const AR = {
  admin: {
    greeting: (name?: string) =>
      name ? `مرحباً بك يا ${name}!` : "مرحباً بك يا مدير راوي!",
    subline: "أنت الآن في لوحة التحكم الخاصة بك.",
    note: "لديك وصول كامل لإدارة راوي بلوج.",
  },
  user: {
    greeting: (name?: string) =>
      name ? `مرحباً بعودتك يا ${name}!` : "مرحباً بعودتك!",
    subline: "عالم القصص والروايات بانتظارك.",
    note: "استكشف القصص والروايات التي تنتظرك.",
  },
  guest: {
    greeting: () => "مرحباً أيها الزائر!",
    subline: "تصفح قصصنا بدون تسجيل دخول.",
    note: "سجّل حساباً للوصول إلى المزيد من القصص والتفاعل مع الكتّاب.",
  },
  autoRedirect: (n: number) => `سيتم الانتقال تلقائياً خلال ${n} ثوان`,
  continueNow: "المتابعة الآن",
};

type RoleConfig = {
  greeting: (name?: string) => string;
  subline: string;
  note: string;
};

interface WelcomeConfig {
  en: RoleConfig;
  ar: RoleConfig;
  icon: React.ReactNode;
  destination: "/admin/dashboard" | "/user/dashboard" | "/guest";
  colorClass: string;
}

const CONFIGS: Record<string, WelcomeConfig> = {
  admin: {
    en: EN.admin,
    ar: AR.admin,
    icon: <Shield className="w-10 h-10" />,
    destination: "/admin/dashboard",
    colorClass: "text-primary",
  },
  user: {
    en: EN.user,
    ar: AR.user,
    icon: <BookOpen className="w-10 h-10" />,
    destination: "/user/dashboard",
    colorClass: "text-primary",
  },
  guest: {
    en: EN.guest,
    ar: AR.guest,
    icon: <Users className="w-10 h-10" />,
    destination: "/guest",
    colorClass: "text-muted-foreground",
  },
};

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const progress = (seconds / total) * circ;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-border"
      />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={circ - progress}
        strokeLinecap="round"
        className="text-primary transition-all duration-1000 ease-linear"
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
      />
      <text
        x="28"
        y="33"
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        className="fill-foreground font-body"
      >
        {seconds}
      </text>
    </svg>
  );
}

const PARTICLE_SYMBOLS = ["✦", "✧", "◈", "✦", "✧"];

function Particles() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      {PARTICLE_SYMBOLS.map((sym, i) => (
        <motion.span
          key={sym + String(i)}
          className="absolute text-primary/20 select-none font-display"
          style={{
            left: `${15 + i * 17}%`,
            top: `${20 + (i % 3) * 25}%`,
            fontSize: `${14 + i * 4}px`,
          }}
          animate={{ y: [-8, 8, -8], opacity: [0.15, 0.35, 0.15] }}
          transition={{
            duration: 3 + i * 0.7,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        >
          {sym}
        </motion.span>
      ))}
    </div>
  );
}

const TOTAL_SECONDS = 3;
const STAR_KEYS = ["s1", "s2", "s3", "s4", "s5"] as const;

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const { lang } = useLanguage();
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = CONFIGS[role] ?? CONFIGS.guest;
  const { destination } = config;
  const t = lang === "ar" ? AR : EN;
  const roleT = lang === "ar" ? config.ar : config.en;

  function goNow() {
    if (timerRef.current) clearInterval(timerRef.current);
    navigate({ to: destination });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          navigate({ to: destination });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [navigate, destination]);

  const starCount = role === "admin" ? 5 : role === "user" ? 4 : 3;

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 relative"
      data-ocid="welcome.page"
    >
      <Particles />

      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 40%, oklch(0.72 0.2 55 / 0.09), transparent)",
        }}
      />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 text-center">
        {/* Role icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 18,
            delay: 0.1,
          }}
          className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center shadow-amber-glow"
          data-ocid="welcome.role_icon"
        >
          <span className={config.colorClass}>{config.icon}</span>
        </motion.div>

        {/* Stars rating */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-1 justify-center"
          data-ocid="welcome.stars"
        >
          {STAR_KEYS.map((sk, i) => (
            <Star
              key={sk}
              className={`w-4 h-4 transition-smooth ${
                i < starCount ? "text-primary fill-primary" : "text-border"
              }`}
            />
          ))}
        </motion.div>

        {/* Main greeting block */}
        <div className="flex flex-col gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-3xl font-bold text-gradient-amber leading-snug"
            data-ocid="welcome.greeting"
          >
            {roleT.greeting(user?.name)}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.35,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-xl text-foreground font-body"
          >
            {roleT.subline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground font-body leading-relaxed"
            data-ocid="welcome.note"
          >
            {roleT.note}
          </motion.p>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-24 h-px bg-border origin-center"
        />

        {/* Timer + skip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex flex-col items-center gap-4"
        >
          <div data-ocid="welcome.countdown">
            <CountdownRing seconds={seconds} total={TOTAL_SECONDS} />
          </div>
          <p className="text-xs text-muted-foreground font-body">
            {t.autoRedirect(TOTAL_SECONDS)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2 font-body text-sm h-10 px-6 rounded-xl transition-smooth"
            onClick={goNow}
            data-ocid="welcome.skip_button"
          >
            <ArrowRight className="w-4 h-4" />
            {t.continueNow}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
