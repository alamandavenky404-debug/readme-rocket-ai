import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { projectsQuery, uid, type Project } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Github, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({ meta: [{ title: "Projects — DevHub" }, { name: "description", content: "Store and manage your projects." }] }),
  component: ProjectsPage,
});

const empty = { title: "", description: "", tech: "", repo_url: "", live_url: "", featured: false };

function ProjectsPage() {
  const qc = useQueryClient();
  const { data: projects = [], isLoading } = useQuery(projectsQuery);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(empty);
  const [viewReadme, setViewReadme] = useState<Project | null>(null);

  function openNew() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(p: Project) {
    setEditing(p);
    setForm({ title: p.title, description: p.description, tech: p.tech_stack.join(", "), repo_url: p.repo_url, live_url: p.live_url, featured: p.featured });
    setOpen(true);
  }

  async function save() {
    if (!form.title.trim()) return toast.error("Title is required");
    const row = {
      title: form.title.trim(),
      description: form.description,
      tech_stack: form.tech.split(",").map((t) => t.trim()).filter(Boolean),
      repo_url: form.repo_url,
      live_url: form.live_url,
      featured: form.featured,
    };
    const { error } = editing
      ? await supabase.from("projects").update(row).eq("id", editing.id)
      : await supabase.from("projects").insert({ ...row, user_id: await uid() });
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["projects"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["projects"] });
  }

  async function toggleFeatured(p: Project) {
    await supabase.from("projects").update({ featured: !p.featured }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["projects"] });
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">Star a project to show it on your public portfolio.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> New project</Button>
      </div>

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No projects yet. Add one, or <Link to="/github" className="text-primary">import from GitHub</Link>.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <div key={p.id} className="flex flex-col rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => openEdit(p)} className="text-left font-semibold hover:text-primary">{p.title}</button>
                <div className="flex gap-1">
                  <button onClick={() => toggleFeatured(p)} aria-label="Feature" className={p.featured ? "text-primary" : "text-muted-foreground hover:text-foreground"}>
                    <Star className="h-4 w-4" fill={p.featured ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => remove(p.id)} aria-label="Delete" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{p.description || "No description"}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tech_stack.map((t) => <Badge key={t} variant="secondary" className="font-mono text-xs">{t}</Badge>)}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><Github className="h-3.5 w-3.5" /> Repo</a>}
                {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><ExternalLink className="h-3.5 w-3.5" /> Live</a>}
                {p.readme ? (
                  <button onClick={() => setViewReadme(p)} className="text-primary">View README</button>
                ) : (
                  <Link to="/readme" search={{ project: p.id }} className="text-signal">Generate README</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input placeholder="Tech stack (comma separated)" value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} />
            <Input placeholder="Repository URL" value={form.repo_url} onChange={(e) => setForm({ ...form, repo_url: e.target.value })} />
            <Input placeholder="Live URL" value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /> Show on portfolio
            </label>
            <Button className="w-full" onClick={save}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewReadme} onOpenChange={(o) => !o && setViewReadme(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>README — {viewReadme?.title}</DialogTitle></DialogHeader>
          <pre className="prose-md max-h-[60vh] overflow-auto rounded-md bg-muted p-4">{viewReadme?.readme}</pre>
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(viewReadme?.readme ?? ""); toast.success("Copied"); }}>Copy Markdown</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
