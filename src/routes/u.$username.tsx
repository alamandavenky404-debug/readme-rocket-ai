import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPortfolio } from "@/lib/portfolio.functions";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Globe, MapPin } from "lucide-react";

export const Route = createFileRoute("/u/$username")({
  loader: async ({ params }) => {
    const data = await getPortfolio({ data: { username: params.username } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Portfolio not found — DevHub" }, { name: "robots", content: "noindex" }] };
    const name = loaderData.profile.full_name || loaderData.profile.username;
    const desc = loaderData.profile.headline || `${name}'s developer portfolio`;
    return {
      meta: [
        { title: `${name} — Developer Portfolio` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} — Developer Portfolio` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <p className="font-mono text-primary">404</p>
      <h1 className="text-xl font-semibold">This portfolio doesn't exist or is private.</h1>
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Go to DevHub</Link>
    </div>
  ),
  errorComponent: () => <div className="p-10 text-center">Couldn't load this portfolio.</div>,
  component: Portfolio,
});

function Portfolio() {
  const { profile, projects } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-grid">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="font-mono text-sm text-signal">// @{profile.username}</p>
        <h1 className="mt-2 text-5xl font-bold tracking-tight">{profile.full_name || profile.username}</h1>
        {profile.headline && <p className="mt-3 text-xl text-primary">{profile.headline}</p>}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {profile.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{profile.location}</span>}
          {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground"><Globe className="h-4 w-4" />Website</a>}
          {profile.github_username && <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground"><Github className="h-4 w-4" />{profile.github_username}</a>}
        </div>
        {profile.bio && <p className="mt-6 max-w-2xl whitespace-pre-wrap text-muted-foreground">{profile.bio}</p>}
        {profile.skills.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {profile.skills.map((s) => <Badge key={s} variant="secondary" className="font-mono">{s}</Badge>)}
          </div>
        )}
        <h2 className="mt-14 font-mono text-sm uppercase text-muted-foreground">Projects</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {projects.length === 0 && <p className="text-muted-foreground">No featured projects yet.</p>}
          {projects.map((p) => (
            <div key={p.id} className="rounded-lg border bg-card p-5 hover:border-primary">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tech_stack.map((t) => <Badge key={t} variant="outline" className="font-mono text-xs">{t}</Badge>)}
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground"><Github className="h-3.5 w-3.5" />Code</a>}
                {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary"><ExternalLink className="h-3.5 w-3.5" />Live</a>}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-16 text-center font-mono text-xs text-muted-foreground">built with <Link to="/" className="text-primary">devhub</Link></p>
      </div>
    </div>
  );
}
