import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BookOpen, Code2, FileText, FolderGit2, Github, LayoutTemplate, ScrollText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DevHub — AI-Powered Developer Hub" },
      { name: "description", content: "One home for your dev career: portfolio, projects, AI READMEs, coding practice, learning tracker, GitHub and resume." },
      { property: "og:title", content: "DevHub — AI-Powered Developer Hub" },
      { property: "og:description", content: "Portfolio, projects, AI READMEs, coding practice, learning tracker, GitHub and resume in one place." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: LayoutTemplate, title: "Build Portfolio", body: "A public page at /u/you that shows your best work." },
  { icon: FolderGit2, title: "Store Projects", body: "Keep every project, stack and link organized." },
  { icon: FileText, title: "Generate READMEs", body: "AI writes clean, deploy-ready README files." },
  { icon: Code2, title: "Practice Coding", body: "Solve challenges and get instant AI code review." },
  { icon: BookOpen, title: "Track Learning", body: "Set goals for tools you're learning and log progress." },
  { icon: Github, title: "Connect GitHub", body: "Pull in your public repos with one click." },
  { icon: ScrollText, title: "Manage Resume", body: "Edit experience and education, print to PDF." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-grid">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-mono text-lg font-semibold">
          <span className="text-primary">&gt;_</span> devhub
        </span>
        <Button asChild variant="outline" size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <p className="font-mono text-sm text-signal">// scalable · maintainable · deploy-ready</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          Your whole dev career, <span className="text-gradient">one hub.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Showcase projects, let AI write your READMEs, sharpen skills with reviewed challenges, and keep your resume ready to ship.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild size="lg" className="shadow-glow">
            <Link to="/auth">Get started free</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-lg border bg-card p-5 transition-colors hover:border-primary">
            <f.icon className="h-5 w-5 text-primary" />
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
