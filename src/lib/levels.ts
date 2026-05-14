export type Level = "beginner" | "silver" | "gold" | "diamond";

export function levelForPosts(count: number): Level {
  if (count >= 16) return "diamond";
  if (count >= 8) return "gold";
  if (count >= 4) return "silver";
  return "beginner";
}

export const LEVEL_LABEL: Record<Level, { en: string; ar: string }> = {
  beginner: { en: "Beginner", ar: "مبتدئ" },
  silver: { en: "Silver", ar: "فضي" },
  gold: { en: "Gold", ar: "ذهبي" },
  diamond: { en: "Diamond", ar: "ماسي" },
};

export const LEVEL_COLOR: Record<Level, string> = {
  beginner: "bg-muted text-muted-foreground border-border",
  silver: "bg-slate-300/15 text-slate-300 border-slate-400/40",
  gold: "bg-amber-500/15 text-amber-400 border-amber-500/40",
  diamond: "bg-cyan-400/15 text-cyan-300 border-cyan-400/40",
};
