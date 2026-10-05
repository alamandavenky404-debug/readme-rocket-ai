import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Portfolio Settings — DevHub" }, { name: "description", content: "Build your public developer portfolio." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const { data: profile } = useQuery(profileQuery);
  const [f, setF] = useState({ username: "", full_name: "", headline: "", bio: "", location: "", website: "", skills: "", is_public: true });

  useEffect(() => {
    if (profile)
      setF({ username: profile.username, full_name: profile.full_name, headline: profile.headline, bio: profile.bio, location: profile.location, website: profile.website, skills: profile.skills.join(", "), is_public: profile.is_public });
  }, [profile]);

  async function save() {
    if (!profile) return;
    const username = f.username.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (username.length < 3) { toast.error("Username must be at least 3 characters (letters, numbers, dashes)"); return; }
    const { error } = await supabase
      .from("profiles")
      .update({ ...f, username, skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean) })
      .eq("id", profile.id);
    if (error) { toast.error(error.code === "23505" ? "That username is taken" : error.message); return; }
    toast.success("Portfolio saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  const field = (k: keyof typeof f, label: string, placeholder = "") => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={f[k] as string} placeholder={placeholder} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold">Portfolio</h1>
      <p className="text-sm text-muted-foreground">
        Your public page shows this info plus starred projects.{" "}
        {profile && <Link to="/u/$username" params={{ username: profile.username }} className="text-primary">View portfolio →</Link>}
      </p>
      <div className="mt-6 space-y-4">
        {field("username", "Username", "jane-dev")}
        {field("full_name", "Full name")}
        {field("headline", "Headline", "Full-stack engineer · TypeScript · Cloud")}
        <div className="space-y-1.5">
          <Label>Bio</Label>
          <Textarea rows={4} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
        </div>
        {field("skills", "Skills (comma separated)", "React, Node.js, Docker")}
        {field("location", "Location")}
        {field("website", "Website")}
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={f.is_public} onCheckedChange={(v) => setF({ ...f, is_public: v })} /> Portfolio is public
        </label>
        <Button onClick={save}>Save</Button>
      </div>
    </div>
  );
}
