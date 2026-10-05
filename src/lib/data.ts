import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type Project = Tables<"projects">;
export type Goal = Tables<"learning_goals">;
export type Attempt = Tables<"practice_attempts">;

export type Resume = {
  experience: { role: string; company: string; period: string; details: string }[];
  education: { degree: string; school: string; period: string }[];
};

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const id = await uid();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },
});

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async () => {
    const { data, error } = await supabase.from("projects").select("*").eq("user_id", await uid()).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const goalsQuery = queryOptions({
  queryKey: ["goals"],
  queryFn: async () => {
    const { data, error } = await supabase.from("learning_goals").select("*").eq("user_id", await uid()).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const attemptsQuery = queryOptions({
  queryKey: ["attempts"],
  queryFn: async () => {
    const { data, error } = await supabase.from("practice_attempts").select("*").eq("user_id", await uid()).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export { uid };
