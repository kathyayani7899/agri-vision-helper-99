import { Link, useRouterState } from "@tanstack/react-router";
import { Leaf, Microscope, MessageCircle, CloudRain, FlaskConical, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Home", icon: Leaf },
  { to: "/disease", label: "Disease Scan", icon: Microscope },
  { to: "/advisor", label: "Advisor", icon: MessageCircle },
  { to: "/weather", label: "Weather & Yield", icon: CloudRain },
  { to: "/soil", label: "Soil Health", icon: FlaskConical },
  { to: "/sustainability", label: "Sustainability", icon: Sprout },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">AgriVision <span className="text-accent">AI</span></span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.slice(1).map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-3 py-2 md:hidden">
          {nav.slice(1).map((n) => {
            const Icon = n.icon;
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                  active ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-foreground/80",
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mt-24 border-t border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-5 py-10 text-sm text-muted-foreground">
          <p className="font-display text-base text-foreground">AgriVision AI</p>
          <p className="mt-1 max-w-xl">
            Built for farmers and rural communities. For severe issues, always consult your local agricultural extension officer.
          </p>
        </div>
      </footer>
    </div>
  );
}