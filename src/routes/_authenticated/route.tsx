import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Code2, FileText, FolderGit2, Github, LayoutDashboard, LogOut, ScrollText, UserRound } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Shell,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderGit2 },
  { to: "/readme", label: "README AI", icon: FileText },
  { to: "/practice", label: "Practice", icon: Code2 },
  { to: "/learning", label: "Learning", icon: BookOpen },
  { to: "/github", label: "GitHub", icon: Github },
  { to: "/resume", label: "Resume", icon: ScrollText },
  { to: "/profile", label: "Portfolio", icon: UserRound },
] as const;

function Shell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b bg-sidebar md:w-56 md:border-b-0 md:border-r print:hidden">
        <div className="px-5 py-5 font-mono font-semibold">
          <span className="text-primary">&gt;_</span> devhub
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              activeProps={{ className: "bg-sidebar-accent !text-primary" }}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
          <button
            onClick={signOut}
            className="flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-destructive md:mt-4"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </nav>
      </aside>
      <main className="flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
