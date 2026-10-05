import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getPortfolio = createServerFn({ method: "GET" })
  .inputValidator((d: { username: string }) => ({ username: String(d.username).slice(0, 60).toLowerCase() }))
  .handler(async ({ data }) => {
    const sb = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data: profile } = await sb
      .from("profiles")
      .select("id, username, full_name, headline, bio, location, website, github_username, skills")
      .eq("username", data.username)
      .eq("is_public", true)
      .maybeSingle();
    if (!profile) return null;
    const { data: projects } = await sb
      .from("projects")
      .select("id, title, description, tech_stack, repo_url, live_url")
      .eq("user_id", profile.id)
      .eq("featured", true)
      .order("created_at", { ascending: false });
    const { id: _id, ...publicProfile } = profile;
    return { profile: publicProfile, projects: projects ?? [] };
  });
