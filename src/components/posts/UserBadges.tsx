import { Badge } from "@/components/ui/badge";
import { LEVEL_COLOR, LEVEL_LABEL, levelForPosts, type Level } from "@/lib/levels";
import { useLanguage } from "@/contexts/LanguageContext";
import { BadgeCheck, Crown, Gem, Shield, Sparkles, Star } from "lucide-react";

export interface BadgeRow {
  type: "verified" | "admin" | string;
}

interface UserBadgesProps {
  badges?: BadgeRow[] | null;
  postCount?: number;
  size?: "sm" | "md";
}

const LEVEL_ICON: Record<Level, typeof Star> = {
  beginner: Star,
  silver: Sparkles,
  gold: Crown,
  diamond: Gem,
};

export function UserBadges({ badges, postCount, size = "sm" }: UserBadgesProps) {
  const { lang } = useLanguage();
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0 h-5" : "text-xs px-2 py-0.5 h-6";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  const isAdmin = badges?.some((b) => b.type === "admin");
  const isVerified = badges?.some((b) => b.type === "verified");
  const level = typeof postCount === "number" ? levelForPosts(postCount) : null;
  const LevelIcon = level ? LEVEL_ICON[level] : null;

  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      {isAdmin && (
        <Badge
          className={`${sizeClass} gap-1 bg-primary/20 text-primary border-primary/40`}
        >
          <Shield className={iconSize} /> {lang === "ar" ? "أدمن" : "Admin"}
        </Badge>
      )}
      {isVerified && (
        <Badge
          className={`${sizeClass} gap-1 bg-sky-500/15 text-sky-400 border-sky-500/40`}
        >
          <BadgeCheck className={iconSize} />{" "}
          {lang === "ar" ? "موثّق" : "Verified"}
        </Badge>
      )}
      {level && LevelIcon && (
        <Badge className={`${sizeClass} gap-1 ${LEVEL_COLOR[level]}`}>
          <LevelIcon className={iconSize} /> {LEVEL_LABEL[level][lang]}
        </Badge>
      )}
    </span>
  );
}
