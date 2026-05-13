import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface LayoutProps {
  children: ReactNode;
  bare?: boolean;
}

export function Layout({ children, bare = false }: LayoutProps) {
  if (bare) {
    return (
      <div className="min-h-screen bg-background text-foreground font-body">
        <LanguageSwitcher />
        {children}
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-body">
      <LanguageSwitcher />
      <Toaster position="top-center" richColors />
      <main className="flex-1">{children}</main>
      <footer className="bg-card border-t border-border py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span className="font-display text-base text-foreground/80">
            Rawy Blog
          </span>
          <span className="text-xs">
            © {new Date().getFullYear()} Rawy Blog
          </span>
        </div>
      </footer>
    </div>
  );
}
