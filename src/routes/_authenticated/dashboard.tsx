import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { attemptsQuery, goalsQuery, profileQuery, projectsQuery } from "@/lib/data";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DevHub" }, { name: "description", content: "Your developer hub overview." }] }),
  component: Dashboard,
});

function Stat({ label, value, to }: { label: string; value: string | number; to: string }) {
  return (
    <Link to={to} className="rounded-lg border bg-card p-5 hover:border-primary">
      <div className="font-mono text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </Link>
  );
}

function Dashboard() {
  const profile = useQuery(profileQuery).data;
  const projects = useQuery(projectsQuery).data ?? [];
  const goals = useQuery(goalsQuery).data ?? [];
  const attempts = useQuery(attemptsQuery).data ?? [];
  const scored = attempts.filter((a) => a.score != null);
  const avg = scored.length ? Math.round(scored.reduce((s, a) => s + (a.score ?? 0), 0) / scored.length) : "—";
  const active = goals.filter((g) => g.status !== "done");

  return (
    <div>
      <p className="font-mono text-sm text-signal">// welcome back</p>
      <h1 className="text-3xl font-bold">{profile?.full_name || profile?.username || "Developer"}</h1>
      {profile && (
        <p className="mt-1 text-sm text-muted-foreground">
          Public portfolio:{" "}
          <Link to="/u/$username" params={{ username: profile.username }} className="text-primary hover:underline">
            /u/{profile.username}
          </Link>
        </p>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Projects" value={projects.length} to="/projects" />
        <Stat label="Featured" value={projects.filter((p) => p.featured).length} to="/projects" />
        <Stat label="Challenges solved" value={attempts.length} to="/practice" />
        <Stat label="Avg score" value={avg} to="/practice" />
      </div>
      <h2 className="mt-10 text-lg font-semibold">Currently learning</h2>
      <div className="mt-3 space-y-3">
        {active.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No active goals. <Link to="/learning" className="text-primary">Add one</Link>
          </p>
        )}
        {active.slice(0, 5).map((g) => (
          <div key={g.id} className="rounded-lg border bg-card p-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{g.title}</span>
              <span className="font-mono text-muted-foreground">{g.progress}%</span>
            </div>
            <Progress value={g.progress} className="mt-2 h-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}
