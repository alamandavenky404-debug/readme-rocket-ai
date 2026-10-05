import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { attemptsQuery, uid } from "@/lib/data";
import { reviewCode } from "@/lib/ai.functions";
import { CHALLENGES } from "@/lib/challenges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/practice")({
  head: () => ({ meta: [{ title: "Practice — DevHub" }, { name: "description", content: "Practice coding with AI review." }] }),
  component: PracticePage,
});

function PracticePage() {
  const qc = useQueryClient();
  const review = useServerFn(reviewCode);
  const { data: attempts = [] } = useQuery(attemptsQuery);
  const [active, setActive] = useState(CHALLENGES[0]);
  const [code, setCode] = useState(CHALLENGES[0].starter);
  const [result, setResult] = useState<{ score: number | null; feedback: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const best = (id: string) => Math.max(-1, ...attempts.filter((a) => a.challenge_id === id).map((a) => a.score ?? 0));

  function pick(c: (typeof CHALLENGES)[number]) {
    setActive(c);
    setCode(c.starter);
    setResult(null);
  }

  async function submit() {
    setBusy(true);
    try {
      const r = await review({ data: { challenge: `${active.title}: ${active.prompt}`, code } });
      setResult(r);
      await supabase.from("practice_attempts").insert({ user_id: await uid(), challenge_id: active.id, code, feedback: r.feedback, score: r.score });
      qc.invalidateQueries({ queryKey: ["attempts"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy(false);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Practice Coding</h1>
      <p className="text-sm text-muted-foreground">Pick a challenge, write a solution, get an AI code review.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="space-y-2">
          {CHALLENGES.map((c) => {
            const b = best(c.id);
            return (
              <button
                key={c.id}
                onClick={() => pick(c)}
                className={`w-full rounded-md border p-3 text-left text-sm ${active.id === c.id ? "border-primary bg-card" : "hover:bg-card"}`}
              >
                <div className="flex items-center justify-between font-medium">
                  {c.title}
                  {b >= 0 && <span className="flex items-center gap-1 font-mono text-xs text-primary"><CheckCircle2 className="h-3 w-3" />{b}</span>}
                </div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{c.level} · {c.topic}</div>
              </button>
            );
          })}
        </div>
        <div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{active.title}</h2>
              <Badge variant="secondary">{active.level}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{active.prompt}</p>
          </div>
          <Textarea value={code} onChange={(e) => setCode(e.target.value)} rows={14} spellCheck={false} className="mt-4 font-mono text-sm" />
          <Button onClick={submit} disabled={busy} className="mt-3">
            <Sparkles className="h-4 w-4" /> {busy ? "Reviewing…" : "Submit for review"}
          </Button>
          {result && (
            <div className="mt-5 rounded-lg border bg-card p-4">
              <div className="font-mono text-sm">Score: <span className="text-2xl font-bold text-primary">{result.score ?? "—"}</span>/100</div>
              <pre className="prose-md mt-3">{result.feedback}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
