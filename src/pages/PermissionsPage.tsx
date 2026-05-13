import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Image,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const EN = {
  pageTitle: "Permissions & Privacy",
  pageSubtitle: "Before we begin, we need your permission for some features",
  welcome: (name?: string) => (name ? `Hello, ${name}` : "Welcome to Rawy"),
  notifications: "Enable Notifications",
  notificationsDesc: "Stay updated with new stories and updates",
  allow: "Allow",
  photos: "Photo Access",
  photosDesc: "Access your photos for profile pictures",
  privacy: "Privacy Policy",
  privacyDesc: "I agree to the terms and conditions",
  required: "Required",
  readPolicy: "Read Privacy Policy",
  hidePolicy: "Hide Policy",
  continue: "Accept & Continue",
  saving: "Saving…",
  settingsNote: "You can change these settings later from your profile",
  privacyText:
    "At Rawy, we respect your privacy and are committed to protecting your personal data. We only collect information necessary to improve your experience with stories and novels. We do not sell your data to third parties or share it without your consent. Your data is used only to personalize content and provide recommendations. You can request deletion of your account and data at any time. We use first-class encryption to protect your information.",
};

const AR = {
  pageTitle: "الأذونات والخصوصية",
  pageSubtitle: "قبل البدء، نحتاج إذنك لبعض الميزات",
  welcome: (name?: string) => (name ? `أهلاً، ${name}` : "أهلاً بك في راوي"),
  notifications: "تفعيل الإشعارات",
  notificationsDesc: "ابق على اطلاع بالقصص والتحديثات الجديدة",
  allow: "السماح",
  photos: "الوصول إلى الصور",
  photosDesc: "الوصول إلى صورك لصور الملف الشخصي",
  privacy: "سياسة الخصوصية",
  privacyDesc: "أوافق على الشروط والأحكام",
  required: "مطلوب",
  readPolicy: "قراءة سياسة الخصوصية",
  hidePolicy: "إخفاء السياسة",
  continue: "قبول والمتابعة",
  saving: "جاري الحفظ…",
  settingsNote: "يمكنك تغيير هذه الإعدادات لاحقاً من الملف الشخصي",
  privacyText:
    "نحن في راوي نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. نجمع فقط المعلومات الضرورية لتحسين تجربتك مع القصص والروايات. لا نبيع بياناتك لأطراف ثالثة ولا نشاركها دون موافقتك. تُستخدم بياناتك فقط لتخصيص المحتوى وتقديم التوصيات. يمكنك طلب حذف حسابك وبياناتك في أي وقت. نستخدم تشفير من الدرجة الأولى لحماية معلوماتك.",
};

interface PermCard {
  id: "notifications" | "photos" | "privacy";
  icon: React.ReactNode;
  title: string;
  description: string;
  required?: boolean;
}

interface PermCardProps {
  card: PermCard;
  checked: boolean;
  onChange: (checked: boolean) => void;
  index: number;
  privacyExpanded?: boolean;
  onTogglePrivacy?: () => void;
  readPolicyLabel: string;
  hidePolicyLabel: string;
  privacyText: string;
  requiredLabel: string;
}

function PermissionCard({
  card,
  checked,
  onChange,
  index,
  privacyExpanded,
  onTogglePrivacy,
  readPolicyLabel,
  hidePolicyLabel,
  privacyText,
  requiredLabel,
}: PermCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.15 + index * 0.13,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`
        relative rounded-2xl border transition-smooth
        ${
          checked
            ? "border-primary/60 bg-card shadow-amber-glow"
            : "border-border bg-card shadow-subtle"
        }
        p-5
      `}
      data-ocid={`permissions.${card.id}_card`}
    >
      {/* Header row */}
      <div className="flex items-start gap-4">
        {/* Icon + Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-primary">{card.icon}</span>
            <span className="font-display text-base font-semibold text-foreground leading-snug">
              {card.title}
            </span>
            {card.required && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-body">
                {requiredLabel}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-body">
            {card.description}
          </p>
        </div>

        {/* Toggle */}
        <div className="mt-0.5 flex-shrink-0">
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={card.title}
            data-ocid={`permissions.${card.id}_toggle`}
            disabled={card.required}
            onClick={() => !card.required && onChange(!checked)}
            className={`
              relative w-12 h-6 rounded-full transition-smooth focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none
              ${checked ? "bg-primary" : "bg-muted"}
              ${card.required ? "cursor-not-allowed opacity-80" : "cursor-pointer"}
            `}
          >
            <span
              className={`
                absolute top-0.5 w-5 h-5 rounded-full bg-foreground shadow transition-smooth
                ${checked ? "right-0.5" : "left-0.5"}
              `}
            />
          </button>
        </div>
      </div>

      {/* Privacy collapsible */}
      {card.id === "privacy" && (
        <div className="mt-4">
          <button
            type="button"
            data-ocid="permissions.privacy_expand_button"
            onClick={onTogglePrivacy}
            className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:underline"
          >
            {privacyExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span>{privacyExpanded ? hidePolicyLabel : readPolicyLabel}</span>
          </button>

          <AnimatePresence>
            {privacyExpanded && (
              <motion.div
                key="privacy-text"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
                data-ocid="permissions.privacy_text"
              >
                <div className="mt-3 p-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground font-body leading-relaxed">
                  {privacyText}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export default function PermissionsPage() {
  const navigate = useNavigate();
  const { hasGrantedPermissions, savePermissions } = usePermissions();
  const { user } = useAuthStore();
  const { lang } = useLanguage();
  const t = lang === "ar" ? AR : EN;

  const [notifications, setNotifications] = useState(false);
  const [photos, setPhotos] = useState(false);
  const [privacy] = useState(true);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hasGrantedPermissions()) {
      navigate({ to: "/welcome" });
    }
  }, [hasGrantedPermissions, navigate]);

  async function handleContinue() {
    setSaving(true);
    try {
      savePermissions({
        notificationsAccepted: notifications,
        photoAccessAccepted: photos,
        privacyAccepted: privacy,
      });
      if (notifications && "Notification" in window) {
        await Notification.requestPermission();
      }
      navigate({ to: "/welcome" });
    } finally {
      setSaving(false);
    }
  }

  const CARDS: PermCard[] = [
    {
      id: "notifications",
      icon: <Bell className="w-6 h-6" />,
      title: t.notifications,
      description: t.notificationsDesc,
    },
    {
      id: "photos",
      icon: <Image className="w-6 h-6" />,
      title: t.photos,
      description: t.photosDesc,
    },
    {
      id: "privacy",
      icon: <ShieldCheck className="w-6 h-6" />,
      title: t.privacy,
      description: t.privacyDesc,
      required: true,
    },
  ];

  const checkedMap: Record<string, boolean> = {
    notifications,
    photos,
    privacy,
  };

  const onChangeMap: Record<string, (v: boolean) => void> = {
    notifications: setNotifications,
    photos: setPhotos,
    privacy: () => {},
  };

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10"
      data-ocid="permissions.page"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 10%, oklch(0.72 0.2 55 / 0.07), transparent)",
        }}
      />

      <div className="relative z-10 w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center shadow-amber-glow">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            {t.welcome(user?.name)}
          </h1>
          <p className="text-sm text-muted-foreground font-body">
            {t.pageSubtitle}
          </p>
        </motion.div>

        {/* Permission cards */}
        <div className="flex flex-col gap-4">
          {CARDS.map((card, i) => (
            <PermissionCard
              key={card.id}
              card={card}
              checked={checkedMap[card.id] ?? false}
              onChange={onChangeMap[card.id] ?? (() => {})}
              index={i}
              privacyExpanded={
                card.id === "privacy" ? privacyExpanded : undefined
              }
              onTogglePrivacy={
                card.id === "privacy"
                  ? () => setPrivacyExpanded((v) => !v)
                  : undefined
              }
              readPolicyLabel={t.readPolicy}
              hidePolicyLabel={t.hidePolicy}
              privacyText={t.privacyText}
              requiredLabel={t.required}
            />
          ))}
        </div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button
            type="button"
            className="w-full h-12 text-base font-display font-semibold rounded-xl shadow-amber-glow transition-smooth"
            onClick={handleContinue}
            disabled={saving}
            data-ocid="permissions.submit_button"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/50 border-t-primary-foreground animate-spin" />
                {t.saving}
              </span>
            ) : (
              t.continue
            )}
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs text-muted-foreground font-body"
        >
          {t.settingsNote}
        </motion.p>
      </div>
    </div>
  );
}
