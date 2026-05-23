import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import heroImg from "@/assets/hero-farm.jpg";
import { Microscope, MessageCircle, CloudRain, FlaskConical, Sprout, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

const features = [
  { to: "/disease", icon: Microscope, title: "Crop Disease Scan", desc: "Snap a leaf photo. Get diagnosis, treatment & prevention in seconds." },
  { to: "/advisor", icon: MessageCircle, title: "Farming Advisor", desc: "Ask anything in plain language. Get rural-friendly guidance." },
  { to: "/weather", icon: CloudRain, title: "Weather & Yield", desc: "Rainfall, drought, flood risk and yield forecasts for your field." },
  { to: "/soil", icon: FlaskConical, title: "Soil Health", desc: "Enter pH and NPK. Get fertilizer plan and crop suitability." },
  { to: "/sustainability", icon: Sprout, title: "Sustainability", desc: "Score your farm. Save water, reduce inputs, rotate smartly." },
] as const;

function Index() {
  return (
    <AppLayout>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/30 via-background/70 to-background" />
        <div className="mx-auto max-w-7xl px-5 pt-20 pb-28 md:pt-28 md:pb-36">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Powered by AI for rural communities
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-medium leading-[1.05] tracking-tight text-foreground md:text-7xl">
            Smarter farms.<br />
            <span className="italic text-primary">Healthier harvests.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            AgriVision AI helps farmers detect crop disease, plan irrigation, balance soil, and farm sustainably — all in simple language.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/disease"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] transition-transform hover:-translate-y-0.5"
            >
              Scan a crop <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/advisor"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur hover:bg-secondary"
            >
              Ask the advisor
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-accent">What it does</p>
            <h2 className="mt-2 font-display text-4xl font-medium tracking-tight md:text-5xl">Five tools, one platform</h2>
          </div>
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
            Built around the daily decisions a farmer makes — from sowing to harvest.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.to}
                to={f.to}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
          <div className="relative overflow-hidden rounded-3xl bg-[image:var(--gradient-hero)] p-6 text-primary-foreground">
            <h3 className="font-display text-xl font-semibold">Crops we support today</h3>
            <p className="mt-2 text-sm opacity-90">Rice · Wheat · Tomato · Cotton · Maize · Chili · Potato</p>
            <p className="mt-6 text-xs uppercase tracking-wider opacity-80">More coming soon</p>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
