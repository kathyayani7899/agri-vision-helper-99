import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { detectDisease } from "@/lib/ai.functions";
import { Upload, Camera, Loader2, AlertTriangle, CheckCircle2, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/disease")({
  component: DiseasePage,
  head: () => ({ meta: [{ title: "Crop Disease Detection — AgriVision AI" }, { name: "description", content: "Upload a crop photo. AI detects diseases, pests, nutrient deficiencies with treatment." }] }),
});

const CROPS = ["Rice", "Wheat", "Tomato", "Cotton", "Maize", "Chili", "Potato"];

function DiseasePage() {
  const [crop, setCrop] = useState("Tomato");
  const [image, setImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fn = useServerFn(detectDisease);
  const mut = useMutation({ mutationFn: (vars: { imageBase64: string; crop: string }) => fn({ data: vars }) });

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    mut.reset();
  };

  const result = mut.data as any;

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-5 py-12">
        <header className="mb-10">
          <p className="text-sm font-medium text-accent">Computer vision</p>
          <h1 className="mt-2 font-display text-5xl font-medium tracking-tight">Crop disease scan</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Upload or capture a clear photo of an affected leaf. Our AI returns a diagnosis with treatment and prevention.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-3xl border border-border bg-card p-6">
            <label className="block text-sm font-medium">Crop type</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CROPS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCrop(c)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    crop === c ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/70",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <div
              className="mt-6 grid aspect-square w-full place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/30"
            >
              {image ? (
                <img src={image} alt="Crop preview" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Leaf className="mx-auto h-10 w-10 opacity-60" />
                  <p className="mt-2 text-sm">No image yet</p>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                <Upload className="h-4 w-4" /> Upload
              </button>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-secondary">
                <Camera className="h-4 w-4" /> Camera
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            <button
              disabled={!image || mut.isPending}
              onClick={() => image && mut.mutate({ imageBase64: image, crop })}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] disabled:opacity-50"
            >
              {mut.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : "Analyze crop"}
            </button>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            {mut.isPending && (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-sm">Examining {crop.toLowerCase()} for diseases…</p>
              </div>
            )}
            {mut.error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{(mut.error as Error).message}</div>
            )}
            {!mut.isPending && !result && !mut.error && (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
                <Leaf className="h-10 w-10 opacity-50" />
                <p className="mt-3 max-w-xs text-sm">Your diagnosis report will appear here once you analyze a photo.</p>
              </div>
            )}
            {result && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Diagnosis</p>
                    <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">{result.disease_name}</h2>
                    {result.affected_area && <p className="mt-1 text-sm text-muted-foreground">Affected: {result.affected_area}</p>}
                  </div>
                  <SeverityBadge level={result.severity} />
                </div>
                <div className="flex items-center gap-4 rounded-2xl bg-secondary/60 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Confidence</p>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-background">
                      <div className="h-full bg-primary" style={{ width: `${result.confidence}%` }} />
                    </div>
                  </div>
                  <span className="font-display text-2xl font-semibold">{Math.round(result.confidence)}%</span>
                </div>

                <ReportList title="Possible causes" items={result.causes} />
                <ReportList title="Treatment" items={result.treatment} accent />
                <ReportList title="Prevention" items={result.prevention} />
                {result.organic_alternatives?.length > 0 && (
                  <ReportList title="Organic alternatives" items={result.organic_alternatives} />
                )}

                {result.urgency === "high" && (
                  <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    <p>This looks serious. Please consult your local agricultural extension officer for in-person guidance.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function SeverityBadge({ level }: { level: string }) {
  const map: Record<string, { bg: string; label: string; icon: any }> = {
    healthy: { bg: "bg-success/15 text-success", label: "Healthy", icon: CheckCircle2 },
    mild: { bg: "bg-warning/20 text-foreground", label: "Mild", icon: AlertTriangle },
    moderate: { bg: "bg-accent/15 text-accent", label: "Moderate", icon: AlertTriangle },
    severe: { bg: "bg-destructive/15 text-destructive", label: "Severe", icon: AlertTriangle },
  };
  const m = map[level] ?? map.moderate;
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", m.bg)}>
      <Icon className="h-3.5 w-3.5" /> {m.label}
    </span>
  );
}

function ReportList({ title, items, accent }: { title: string; items?: string[]; accent?: boolean }) {
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