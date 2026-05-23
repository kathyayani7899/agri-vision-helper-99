import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { predictWeather } from "@/lib/ai.functions";
import { CloudRain, Droplets, Flame, Waves, Loader2, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/weather")({
  component: WeatherPage,
  head: () => ({ meta: [{ title: "Weather & Yield Forecast — AgriVision AI" }, { name: "description", content: "AI-powered seasonal weather risk and yield forecasts for your crop and location." }] }),
});

function WeatherPage() {
  const [form, setForm] = useState({ location: "Punjab, India", crop: "Wheat", season: "Rabi (winter)" });
  const fn = useServerFn(predictWeather);
  const mut = useMutation({ mutationFn: (vars: typeof form) => fn({ data: vars }) });
  const r = mut.data as any;

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <header className="mb-10">
          <p className="text-sm font-medium text-accent">Seasonal forecast</p>
          <h1 className="mt-2 font-display text-5xl font-medium tracking-tight">Weather & yield prediction</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Get a risk-aware seasonal outlook with sowing, irrigation, and harvest guidance.</p>
        </header>

        <form
          onSubmit={(e) => { e.preventDefault(); mut.mutate(form); }}
          className="grid gap-3 rounded-3xl border border-border bg-card p-4 md:grid-cols-[1.4fr_1fr_1fr_auto]"
        >
          <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="e.g. Pune, Maharashtra" />
          <SelectField label="Crop" value={form.crop} onChange={(v) => setForm({ ...form, crop: v })} options={["Rice", "Wheat", "Tomato", "Cotton", "Maize", "Chili", "Potato"]} />
          <SelectField label="Season" value={form.season} onChange={(v) => setForm({ ...form, season: v })} options={["Kharif (monsoon)", "Rabi (winter)", "Zaid (summer)"]} />
          <button
            type="submit"
            disabled={mut.isPending}
            className="self-end rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Forecast"}
          </button>
        </form>

        {mut.error && <p className="mt-4 text-sm text-destructive">{(mut.error as Error).message}</p>}

        {r && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <RiskCard icon={Droplets} label="Drought" level={r.drought_risk} />
            <RiskCard icon={Waves} label="Flood" level={r.flood_risk} />
            <RiskCard icon={Flame} label="Heat stress" level={r.heat_stress_risk} />

            <Card title="Rainfall outlook" icon={CloudRain} body={r.rainfall_outlook} className="md:col-span-2" />
            <Card title="Sustainability score" icon={Leaf}>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-semibold text-primary">{Math.round(r.sustainability_score)}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
            </Card>

            <Card title="Sowing advice" body={r.sowing_advice} />
            <Card title="Irrigation advice" body={r.irrigation_advice} />
            <Card title="Harvesting alert" body={r.harvesting_alert} />

            <div className="md:col-span-3 rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-xl font-semibold">Yield forecast</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.yield_forecast}</p>
              {r.key_actions?.length > 0 && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {r.key_actions.map((a: string, i: number) => (
                    <li key={i} className="flex gap-2 rounded-2xl bg-secondary/60 p-3 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> {a}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
    </div>
  );
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function RiskCard({ icon: Icon, label, level }: { icon: any; label: string; level: string }) {
  const colors: Record<string, string> = {
    low: "bg-success/15 text-success",
    medium: "bg-warning/25 text-foreground",
    high: "bg-destructive/15 text-destructive",
  };
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", colors[level] ?? colors.medium)}>{level}</span>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{label} risk</h3>
    </div>
  );
}

function Card({ title, body, icon: Icon, children, className }: { title: string; body?: string; icon?: any; children?: any; className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-border bg-card p-6", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <h3 className="font-display text-base font-semibold">{title}</h3>
      </div>
      {body && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}