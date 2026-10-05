import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery, projectsQuery, uid } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/github")({
  head: () => ({ meta: [{ title: "GitHub — DevHub" }, { name: "description", content: "Connect your GitHub and import repositories." }] }),
  component: GithubPage,
});

type Repo = { id: number; name: string; description: string | null; html_url: string; homepage: string | null; language: string | null; stargazers_count: number; topics?: string[]; fork: boolean };

function GithubPage() {
  const qc = useQueryClient();
  const { data: profile } = useQuery(profileQuery);
  const { data: projects = [] } = useQuery(projectsQuery);
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.github_username) {
      setUsername(profile.github_username);
      load(profile.github_username);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.github_username]);

  async function load(u: string) {
    setLoading(true);
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(u)}/repos?sort=updated&per_page=50`);
    setLoading(false);
    if (!res.ok) { toast.error(res.status === 404 ? "GitHub user not found" : "Couldn't reach GitHub, try again later"); return; }
    setRepos(((await res.json()) as Repo[]).filter((r) => !r.fork));
  }

  async function connect() {
    if (!username.trim()) return;
    await supabase.from("profiles").update({ github_username: username.trim() }).eq("id", await uid());
    qc.invalidateQueries({ queryKey: ["profile"] });
    load(username.trim());
  }

  const imported = new Set(projects.map((p) => p.repo_url));

  async function importRepo(r: Repo) {
    const { error } = await supabase.from("projects").insert({
      user_id: await uid(),
      title: r.name,
      description: r.description ?? "",
      tech_stack: [r.language, ...(r.topics ?? [])].filter(Boolean) as string[],
      repo_url: r.html_url,
      live_url: r.homepage ?? "",
    });
    if (error) { toast.error(error.message); return; }
    toast.success(`Imported ${r.name}`);
    qc.invalidateQueries({ queryKey: ["projects"] });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Connect GitHub</h1>
      <p className="text-sm text-muted-foreground">Link your GitHub username to pull in public repositories.</p>
      <div className="mt-6 flex gap-2">
        <Input placeholder="GitHub username" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && connect()} />
        <Button onClick={connect}>{profile?.github_username ? "Update" : "Connect"}</Button>
      </div>
      {loading && <p className="mt-6 text-muted-foreground">Loading repositories…</p>}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {repos.map((r) => (
          <div key={r.id} className="flex flex-col rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <a href={r.html_url} target="_blank" rel="noreferrer" className="font-semibold hover:text-primary">{r.name}</a>
              <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground"><Star className="h-3 w-3" />{r.stargazers_count}</span>
            </div>
            <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{r.description ?? "No description"}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-xs text-signal">{r.language ?? ""}</span>
              {imported.has(r.html_url) ? (
                <span className="font-mono text-xs text-primary">imported</span>
              ) : (
                <Button size="sm" variant="outline" onClick={() => importRepo(r)}><Download className="h-3.5 w-3.5" /> Import</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
