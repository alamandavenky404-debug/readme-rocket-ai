import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { goalsQuery, uid, type Goal } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/learning")({
  head: () => ({ meta: [{ title: "Learning Tracker — DevHub" }, { name: "description", content: "Track what you're learning." }] }),
  component: LearningPage,
});

const CATEGORIES = ["Scalability", "Dev Tools", "Deployment", "Clean Code", "Frontend", "Backend", "General"];
const SUGGESTIONS = [
  { title: "Caching & horizontal scaling", category: "Scalability" },
  { title: "Docker & containers", category: "Dev Tools" },
  { title: "CI/CD with GitHub Actions", category: "Deployment" },
  { title: "SOLID principles & refactoring", category: "Clean Code" },
  { title: "TypeScript strict mode", category: "Dev Tools" },
  { title: "Env vars, secrets & monitoring", category: "Deployment" },
];

function LearningPage() {
  const qc = useQueryClient();
  const { data: goals = [] } = useQuery(goalsQuery);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const refresh = () => qc.invalidateQueries({ queryKey: ["goals"] });

  async function add(t = title, c = category) {
    if (!t.trim()) return;
    const { error } = await supabase.from("learning_goals").insert({ user_id: await uid(), title: t.trim(), category: c });
    if (error) return toast.error(error.message);
    setTitle("");
    refresh();
  }

  async function update(g: Goal, progress: number) {
    const status = progress >= 100 ? "done" : progress > 0 ? "in_progress" : "todo";
    await supabase.from("learning_goals").update({ progress, status }).eq("id", g.id);
    refresh();
  }

  async function remove(id: string) {
    await supabase.from("learning_goals").delete().eq("id", id);
    refresh();
  }

  const existing = new Set(goals.map((g) => g.title));

  return (
    <div>
      <h1 className="text-3xl font-bold">Learning Tracker</h1>
      <p className="text-sm text-muted-foreground">Set goals and drag the slider as you progress.</p>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Input placeholder="What are you learning?" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={() => add()}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.filter((s) => !existing.has(s.title)).map((s) => (
          <button key={s.title} onClick={() => add(s.title, s.category)} className="rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary">
            + {s.title}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {goals.map((g) => (
          <div key={g.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className={`font-medium ${g.status === "done" ? "text-primary" : ""}`}>{g.title}</div>
                <div className="font-mono text-xs text-muted-foreground">{g.category} · {g.status.replace("_", " ")}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm">{g.progress}%</span>
                <button onClick={() => remove(g.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <Slider className="mt-3" defaultValue={[g.progress]} max={100} step={5} onValueCommit={(v) => update(g, v[0])} />
          </div>
        ))}
        {goals.length === 0 && <p className="text-sm text-muted-foreground">No goals yet — try a suggestion above.</p>}
      </div>
    </div>
  );
}
