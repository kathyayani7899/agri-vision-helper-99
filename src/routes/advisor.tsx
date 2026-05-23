import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { askAdvisor } from "@/lib/ai.functions";
import { Send, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/advisor")({
  component: AdvisorPage,
  head: () => ({ meta: [{ title: "Farming Advisor — AgriVision AI" }, { name: "description", content: "Ask farming questions in simple language. Get rural-friendly AI guidance." }] }),
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Why are my tomato leaves turning yellow?",
  "Which fertilizer is best after heavy rain?",
  "When should I irrigate my rice field?",
  "How to control pests on cotton without chemicals?",
];

function AdvisorPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const fn = useServerFn(askAdvisor);
  const mut = useMutation({
    mutationFn: (history: Msg[]) => fn({ data: { messages: history } }),
    onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.reply }]),
  });
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, mut.isPending]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || mut.isPending) return;
    const next: Msg[] = [...messages, { role: "user", content: t }];
    setMessages(next);
    setInput("");
    mut.mutate(next);
  };

  return (
    <AppLayout>
      <div className="mx-auto flex h-[calc(100vh-180px)] max-w-3xl flex-col px-5 py-8">
        <header className="mb-4">
          <p className="text-sm font-medium text-accent">AI Advisor</p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">Ask anything about your farm</h1>
        </header>

        <div className="flex-1 overflow-y-auto rounded-3xl border border-border bg-card p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <MessageCircle className="h-7 w-7" />
              </span>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">Ask about crops, soil, weather, pests, fertilizer, or irrigation. Answers are in simple language.</p>
              <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm hover:bg-secondary"
                  >
                    <Sparkles className="mb-1 inline h-3.5 w-3.5 text-accent" /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {mut.isPending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="inline h-4 w-4 animate-spin" /> Thinking…
                </div>
              </div>
            )}
            {mut.error && (
              <p className="text-sm text-destructive">{(mut.error as Error).message}</p>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="mt-4 flex gap-2 rounded-full border border-border bg-card p-1.5 shadow-[var(--shadow-soft)]"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question…"
            className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={!input.trim() || mut.isPending}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </AppLayout>
  );
}