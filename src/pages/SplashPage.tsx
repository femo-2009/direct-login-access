import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ─── Floating particle data ───────────────────────────────────────────────────
const PARTICLES = [
  { id: 1, x: 12, y: 18, size: 1.5, delay: 0.2, duration: 4.5, glyph: "✦" },
  { id: 2, x: 82, y: 14, size: 1.2, delay: 0.8, duration: 5.2, glyph: "✦" },
  { id: 3, x: 25, y: 72, size: 1.0, delay: 1.2, duration: 4.8, glyph: "✦" },
  { id: 4, x: 70, y: 65, size: 1.4, delay: 0.5, duration: 5.0, glyph: "✦" },
  { id: 5, x: 55, y: 20, size: 0.9, delay: 1.5, duration: 4.2, glyph: "✦" },
  { id: 6, x: 38, y: 82, size: 1.3, delay: 0.3, duration: 5.5, glyph: "✦" },
  { id: 7, x: 90, y: 45, size: 1.1, delay: 1.0, duration: 4.6, glyph: "✦" },
  { id: 8, x: 8, y: 55, size: 0.8, delay: 1.8, duration: 5.1, glyph: "✦" },
  { id: 9, x: 48, y: 90, size: 1.2, delay: 0.6, duration: 4.9, glyph: "✦" },
  { id: 10, x: 65, y: 8, size: 1.0, delay: 1.3, duration: 4.4, glyph: "✦" },
  // Pen nibs / book decorations
  { id: 11, x: 18, y: 40, size: 1.6, delay: 0.9, duration: 6.0, glyph: "🖋" },
  { id: 12, x: 76, y: 78, size: 1.4, delay: 1.6, duration: 5.8, glyph: "📖" },
  { id: 13, x: 42, y: 12, size: 1.5, delay: 0.4, duration: 5.6, glyph: "🖋" },
];

// ─── Animated ink splatter SVG paths ─────────────────────────────────────────
function InkSplatter() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="amberGlow" cx="50%" cy="50%" r="45%">
          <stop
            offset="0%"
            stopColor="oklch(0.75 0.14 75)"
            stopOpacity="0.18"
          />
          <stop
            offset="40%"
            stopColor="oklch(0.65 0.12 75)"
            stopOpacity="0.08"
          />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="innerGlow" cx="50%" cy="50%" r="20%">
          <stop
            offset="0%"
            stopColor="oklch(0.75 0.14 75)"
            stopOpacity="0.22"
          />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <filter id="inkBlur">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <ellipse cx="500" cy="300" rx="380" ry="240" fill="url(#amberGlow)" />
      <ellipse cx="500" cy="300" rx="150" ry="100" fill="url(#innerGlow)" />
      <motion.ellipse
        cx="500"
        cy="300"
        rx="280"
        ry="180"
        fill="oklch(0.65 0.12 75)"
        fillOpacity="0"
        filter="url(#inkBlur)"
        initial={{ fillOpacity: 0, rx: 50, ry: 30 }}
        animate={{ fillOpacity: 0.06, rx: 280, ry: 180 }}
        transition={{ duration: 2.5, ease: "easeOut", delay: 0.3 }}
      />
      <motion.path
        d="M 420 280 Q 500 240 580 280 Q 540 320 500 310 Q 460 320 420 280 Z"
        fill="oklch(0.75 0.14 75)"
        fillOpacity="0"
        filter="url(#inkBlur)"
        initial={{ fillOpacity: 0 }}
        animate={{ fillOpacity: 0.08 }}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.8 }}
      />
    </svg>
  );
}

// ─── Floating decorative particle ─────────────────────────────────────────────
interface ParticleProps {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  glyph: string;
}

function Particle({ x, y, size, delay, duration, glyph }: ParticleProps) {
  const isEmoji = glyph.length > 1;
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        fontSize: isEmoji ? `${size * 14}px` : `${size * 10}px`,
        opacity: 0,
        color: "oklch(0.75 0.14 75)",
        filter: isEmoji
          ? "none"
          : "drop-shadow(0 0 4px oklch(0.75 0.14 75 / 0.6))",
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: [0, isEmoji ? 0.3 : 0.55, isEmoji ? 0.2 : 0.4, 0],
        y: [8, 0, -6, -14],
      }}
      transition={{
        duration,
        delay,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatDelay: 1.5,
      }}
    >
      {glyph}
    </motion.div>
  );
}

// ─── Calligraphic separator ───────────────────────────────────────────────────
function CalligraphicLine() {
  return (
    <svg
      width="220"
      height="18"
      viewBox="0 0 220 18"
      className="mx-auto opacity-60"
      aria-hidden="true"
    >
      <motion.path
        d="M 10 9 Q 55 3 110 9 Q 165 15 210 9"
        stroke="oklch(0.75 0.14 75)"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeInOut", delay: 1.8 }}
      />
      <motion.circle
        cx="110"
        cy="9"
        r="2.2"
        fill="oklch(0.75 0.14 75)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.8 }}
        transition={{ duration: 0.5, delay: 2.8 }}
      />
    </svg>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/30">
      <motion.div
        className="h-full"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.65 0.12 75), oklch(0.75 0.14 75), oklch(0.85 0.12 75))",
        }}
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 5, ease: "linear" }}
      />
      <motion.div
        className="absolute top-[-1px] w-6 h-[4px] rounded-full"
        style={{ background: "oklch(0.75 0.14 75)", filter: "blur(3px)" }}
        initial={{ left: "0%" }}
        animate={{ left: "calc(100% - 24px)" }}
        transition={{ duration: 5, ease: "linear" }}
      />
    </div>
  );
}

// ─── Main SplashPage ──────────────────────────────────────────────────────────
export default function SplashPage() {
  const navigate = useNavigate();
  const { sessionToken, role, user } = useAuthStore();
  const { lang } = useLanguage();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const t =
    lang === "ar"
      ? {
          platform: "✦ منصة القصص والروايات ✦",
          tagline: "قصص تعيش للأبد",
          subtitle: "عالم من الحكايات والروايات",
          loading: "جاري التحميل...",
        }
      : {
          platform: "✦ Stories & Royalties Platform ✦",
          tagline: "Stories that live forever",
          subtitle: "A world of tales and royalties",
          loading: "Loading...",
        };

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      try { sessionStorage.setItem("rawy-splash-shown", "1"); } catch {}
      setIsExiting(true);
      setTimeout(() => {
        if (sessionToken && user) {
          if (role === "admin") {
            navigate({ to: "/admin/dashboard" });
          } else {
            const permsRaw = localStorage.getItem("rawy-permissions");
            if (permsRaw) {
              navigate({ to: "/user/dashboard" });
            } else {
              navigate({ to: "/permissions" });
            }
          }
        } else {
          navigate({ to: "/login" });
        }
      }, 500);
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate, sessionToken, role, user]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="splash"
          className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
          style={{ backgroundColor: "oklch(0.10 0.016 52)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          data-ocid="splash.page"
        >
          {/* Ink wash background texture */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url('/assets/generated/splash-ink-bg.dim_1920x1080.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          />

          {/* SVG ink glow overlay */}
          <InkSplatter />

          {/* Floating particles */}
          {PARTICLES.map((p) => (
            <Particle key={p.id} {...p} />
          ))}

          {/* ─── Central content ─────────────────────────────────────── */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
            {/* Small decorative pre-title */}
            <motion.p
              className="text-xs tracking-[0.35em] uppercase font-body"
              style={{ color: "oklch(0.75 0.14 75 / 0.65)" }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 1.0 }}
            >
              {t.platform}
            </motion.p>

            {/* Logo image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.72 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1.4,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3,
              }}
            >
              <img
                src="/assets/logo.jpeg"
                alt="Rawy Blog"
                className="w-48 h-48 object-contain mx-auto drop-shadow-[0_0_30px_rgba(201,168,76,0.6)]"
              />
            </motion.div>

            {/* Calligraphic divider */}
            <CalligraphicLine />

            {/* Main title */}
            <motion.h1
              className="font-display leading-none tracking-tight"
              style={{
                fontSize: "clamp(2.5rem, 8vw, 5rem)",
                color: "oklch(0.88 0.14 75)",
                textShadow: [
                  "0 0 60px oklch(0.75 0.14 75 / 0.5)",
                  "0 0 120px oklch(0.65 0.12 75 / 0.3)",
                  "0 4px 24px oklch(0 0 0 / 0.6)",
                ].join(", "),
              }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 1.6 }}
            >
              {lang === "ar" ? "راوي" : "Rawy Blog"}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="font-display text-lg sm:text-2xl tracking-wide"
              style={{ color: "oklch(0.78 0.08 75 / 0.85)" }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 2.0 }}
            >
              {t.tagline}
            </motion.p>

            {/* Subtitle */}
            <motion.p
              className="font-body text-sm max-w-xs leading-relaxed"
              style={{ color: "oklch(0.65 0.04 75 / 0.7)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, ease: "easeOut", delay: 2.8 }}
            >
              {t.subtitle}
            </motion.p>

            {/* Pulsing dot row */}
            <motion.div
              className="flex gap-2 items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.2, duration: 0.6 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block rounded-full"
                  style={{
                    width: i === 1 ? "8px" : "5px",
                    height: i === 1 ? "8px" : "5px",
                    background: "oklch(0.75 0.14 75)",
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.25,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Progress bar */}
          <ProgressBar />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
