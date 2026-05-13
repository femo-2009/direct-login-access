import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, toggle } = useLanguage();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={lang === "en" ? "Switch to Arabic" : "Switch to English"}
      className="fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-card/80 backdrop-blur px-3 py-1.5 text-xs font-medium text-foreground border border-border shadow-subtle hover:bg-card hover:text-primary transition-colors-smooth"
    >
      <Languages className="w-3.5 h-3.5" />
      {lang === "en" ? "العربية" : "English"}
    </button>
  );
}
