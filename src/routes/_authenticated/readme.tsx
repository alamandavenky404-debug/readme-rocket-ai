import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { projectsQuery } from "@/lib/data";
import { generateReadme } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/readme")({
  validateSearch: (s: Record<string, unknown>) => ({ project: typeof s["project"] === "string" ? s["project"] : undefined }),
  head: () => ({ meta: [{ title: "README Generator — DevHub" }, { name: "description", content: "Generate README files with AI." }] }),
  component: ReadmePage,
});

function ReadmePage() {
  const search = Route.useSearch();
  const qc = useQueryClient();
  const { data: projects = [] } = useQuery(projectsQuery);
  const gen = useServerFn(generateReadme);
  const [projectId, setProjectId] = useState<string | undefined>(search.project);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [extra, setExtra] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const p = projects.find((x) => x.id === projectId);
    if (p) {
      setTitle(p.title);
      setDescription(p.description);
      setTechStack(p.tech_stack.join(", "));
      setOut(p.readme);
    }
  }, [projectId, projects]);

  async function run() {
    setBusy(true);
    try {
      const r = await gen({ data: { title, description, techStack, extra } });
      setOut(r.readme);
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy(false);
  }

  async function saveToProject() {
    if (!projectId) return;
    const { error } = await supabase.from("projects").update({ readme: out }).eq("id", projectId);
    if (error) { toast.error(error.message); return; }
    toast.success("README saved to project");
    qc.invalidateQueries({ queryKey: ["projects"] });
  }

  function download() {
    const url = URL.createObjectURL(new Blob([out], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">README Generator</h1>
      <p className="text-sm text-muted-foreground">Describe your project and AI writes a deploy-ready README.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <Select value={projectId ?? ""} onValueChange={setProjectId}>
            <SelectTrigger><SelectValue placeholder="Start from a saved project (optional)" /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Project name" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea rows={5} placeholder="What does it do?" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input placeholder="Tech stack, e.g. React, Node, Postgres" value={techStack} onChange={(e) => setTechStack(e.target.value)} />
          <Textarea rows={3} placeholder="Extra notes: env vars, deployment target, license…" value={extra} onChange={(e) => setExtra(e.target.value)} />
          <Button onClick={run} disabled={busy || !title.trim()} className="w-full">
            <Sparkles className="h-4 w-4" /> {busy ? "Writing README…" : "Generate README"}
          </Button>
        </div>
        <div className="flex flex-col">
          <pre className="prose-md min-h-80 flex-1 overflow-auto rounded-lg border bg-card p-4">{out || "// your README will appear here"}</pre>
          {out && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { navigator.clipboard.writeText(out); toast.success("Copied"); }}>Copy</Button>
              <Button variant="outline" onClick={download}>Download .md</Button>
              {projectId && <Button onClick={saveToProject}>Save to project</Button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
