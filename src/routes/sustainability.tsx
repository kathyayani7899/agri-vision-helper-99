import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { sustainabilityReport } from "@/lib/ai.functions";
import { Sprout, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sustainability")({
  component: SustainabilityPage,
  head: () => ({ meta: [{ title: "Sustainability Score — AgriVision AI" }, { name: "description", content: "Estimate your farm's water use, fertilizer overuse, and sustainability score with AI." }] }),
});

function SustainabilityPage() {
  const [form, setForm] = useState({ farmSize: 5, crop: "Rice", waterSource: "Canal + groundwater", fertilizerKgPerAcre: 120, usesOrganic: false, cropRotation: true });
  const fn = useServerFn(sustainabilityReport);
  const mut = useMutation({ mutationFn: (vars: typeof form) => fn({ data: vars }) });
  const r = mut.data as any;

  const gradeColor: Record<string, string> = {
    A: "bg-success text-primary-foreground",
    B: "bg-primary text-primary-foreground",
    C: "bg-warning text-foreground",
    D: "bg-destructive text-destructive-foreground",
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <header className="mb-10">
          <p className="text-sm font-medium text-accent">Eco-impact</p>
          <h1 className="mt-2 font-display text-5xl font-medium tracking-tight">Sustainability & impact</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Score your practices. Get water, fertilizer, and carbon insights — plus simple eco-friendly upgrades.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form onSubmit={(e) => { e.preventDefault(); mut.mutate(form); }} className="space-y-5 rounded-3xl border border-border bg-card p-6">
            <NumField label="Farm size (acres)" value={form.farmSize} onChange={(v) => setForm({ ...form, farmSize: v })} />
            <div>
              <label className="text-sm font-medium">Crop</label>
              <select value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
                {["Rice", "Wheat", "Tomato", "Cotton", "Maize", "Chili", "Potato"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Water source</label>
              <input value={form.waterSource} onChange={(e) => setForm({ ...form, waterSource: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            </div>
            <NumField label="Fertilizer use (kg/acre)" value={form.fertilizerKgPerAcre} onChange={(v) => setForm({ ...form, fertilizerKgPerAcre: v })} />
            <Toggle label="Uses organic methods" value={form.usesOrganic} onChange={(v) => setForm({ ...form, usesOrganic: v })} />
            <Toggle label="Practices crop rotation" value={form.cropRotation} onChange={(v) => setForm({ ...form, cropRotation: v })} />
            <button type="submit" disabled={mut.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {mut.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Calculating…</> : "Calculate score"}
            </button>
          </form>

          <section className="rounded-3xl border border-border bg-card p-6">
            {!r && !mut.isPending && (
              <div className="grid h-full min-h-[300px] place-items-center text-center text-muted-foreground">
                <div>
                  <Sprout className="mx-auto h-10 w-10 opacity-50" />
                  <p className="mt-3 max-w-xs text-sm">Submit your farm details to see your sustainability report.</p>
                </div>
              </div>
            )}
            {mut.isPending && <div className="grid h-full min-h-[300px] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            {mut.error && <p className="text-sm text-destructive">{(mut.error as Error).message}</p>}
            {r && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 rounded-3xl bg-[image:var(--gradient-hero)] p-6 text-primary-foreground">
                  <div className={cn("grid h-20 w-20 place-items-center rounded-2xl font-display text-4xl font-bold", gradeColor[r.grade] ?? gradeColor.B)}>
                    {r.grade}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-80">Sustainability score</p>
                    <p className="font-display text-5xl font-semibold">{Math.round(r.score)}<span className="text-xl opacity-70">/100</span></p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric label="Water" body={r.water_usage_estimate} />
                  <Metric label="Fertilizer" body={r.fertilizer_assessment} />
                  <Metric label="Carbon" body={r.carbon_footprint} />
                </div>

                <List title="Quick wins" items={r.quick_wins} accent />
                <List title="Rainwater harvesting tips" items={r.rainwater_tips} />
                <List title="Organic alternatives" items={r.organic_alternatives} />
                <List title="Crop rotation plan" items={r.crop_rotation_plan} />
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
    </div>
  );
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn("relative h-6 w-11 rounded-full transition-colors", value ? "bg-primary" : "bg-muted")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform", value ? "translate-x-5" : "translate-x-0.5")} />
      </button>
    </label>
  );
}
function Metric({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
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
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" /> {it}
          </li>
        ))}
      </ul>
    </div>
  );
}