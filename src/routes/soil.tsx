import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { analyzeSoil } from "@/lib/ai.functions";
import { FlaskConical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/soil")({
  component: SoilPage,
  head: () => ({ meta: [{ title: "Soil Health Analyzer — AgriVision AI" }, { name: "description", content: "Enter soil pH and NPK levels. Get fertilizer plan and crop suitability." }] }),
});

function SoilPage() {
  const [form, setForm] = useState({ ph: 6.5, moisture: 35, nitrogen: 80, phosphorus: 40, potassium: 60, crop: "Wheat" });
  const fn = useServerFn(analyzeSoil);
  const mut = useMutation({ mutationFn: (vars: typeof form) => fn({ data: vars }) });
  const r = mut.data as any;

  const statusColor: Record<string, string> = {
    healthy: "bg-success/15 text-success border-success/30",
    moderate: "bg-warning/20 text-foreground border-warning/40",
    critical: "bg-destructive/15 text-destructive border-destructive/30",
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-5 py-12">
        <header className="mb-10">
          <p className="text-sm font-medium text-accent">Soil intelligence</p>
          <h1 className="mt-2 font-display text-5xl font-medium tracking-tight">Soil health analyzer</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Enter your soil test values. Get a clear assessment, fertilizer plan, and crop suitability.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={(e) => { e.preventDefault(); mut.mutate(form); }}
            className="space-y-5 rounded-3xl border border-border bg-card p-6"
          >
            <Slider label="pH" value={form.ph} min={0} max={14} step={0.1} onChange={(v) => setForm({ ...form, ph: v })} suffix="" />
            <Slider label="Moisture" value={form.moisture} min={0} max={100} step={1} onChange={(v) => setForm({ ...form, moisture: v })} suffix="%" />
            <Slider label="Nitrogen (N)" value={form.nitrogen} min={0} max={300} step={1} onChange={(v) => setForm({ ...form, nitrogen: v })} suffix=" kg/ha" />
            <Slider label="Phosphorus (P)" value={form.phosphorus} min={0} max={300} step={1} onChange={(v) => setForm({ ...form, phosphorus: v })} suffix=" kg/ha" />
            <Slider label="Potassium (K)" value={form.potassium} min={0} max={300} step={1} onChange={(v) => setForm({ ...form, potassium: v })} suffix=" kg/ha" />
            <div>
              <label className="text-sm font-medium">Target crop</label>
              <select
                value={form.crop}
                onChange={(e) => setForm({ ...form, crop: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              >
                {["Rice", "Wheat", "Tomato", "Cotton", "Maize", "Chili", "Potato"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={mut.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {mut.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : "Analyze soil"}
            </button>
          </form>

          <section className="rounded-3xl border border-border bg-card p-6">
            {!r && !mut.isPending && (
              <div className="grid h-full min-h-[300px] place-items-center text-center text-muted-foreground">
                <div>
                  <FlaskConical className="mx-auto h-10 w-10 opacity-50" />
                  <p className="mt-3 max-w-xs text-sm">Submit your values to get a soil report.</p>
                </div>
              </div>
            )}
            {mut.isPending && (
              <div className="grid h-full min-h-[300px] place-items-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {mut.error && <p className="text-sm text-destructive">{(mut.error as Error).message}</p>}
            {r && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Overall</p>
                    <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight capitalize">{r.overall_status}</h2>
                  </div>
                  <div className={cn("rounded-2xl border px-4 py-3 text-center", statusColor[r.overall_status])}>
                    <p className="text-xs font-medium">Score</p>
                    <p className="font-display text-3xl font-semibold">{Math.round(r.score)}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.summary}</p>
                {r.ph_assessment && <Block title="pH assessment" body={r.ph_assessment} />}
                {r.nutrient_balance && <Block title="Nutrient balance" body={r.nutrient_balance} />}
                <List title="Fertilizer recommendation" items={r.fertilizer_recommendation} accent />
                <List title="Suitable crops" items={r.suitable_crops} />
                {r.over_fertilization_risk && <Block title="Over-fertilization risk" body={r.over_fertilization_risk} />}
                <List title="Next actions" items={r.actions} />
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function Slider({ label, value, min, max, step, onChange, suffix }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; suffix: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="font-display text-base font-semibold text-primary">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[oklch(0.38_0.09_150)]"
      />
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function List({ title, items, accent }: { title: string; items?: string[]; accent?: boolean }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className={cn("font-display text-base font-semibold", accent && "text-primary")}>{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 leading-relaxed">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}