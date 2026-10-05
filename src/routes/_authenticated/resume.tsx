import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery, type Resume } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({ meta: [{ title: "Resume — DevHub" }, { name: "description", content: "Manage your resume." }] }),
  component: ResumePage,
});

function ResumePage() {
  const qc = useQueryClient();
  const { data: profile } = useQuery(profileQuery);
  const [resume, setResume] = useState<Resume>({ experience: [], education: [] });

  useEffect(() => {
    if (profile) {
      const r = profile.resume as Partial<Resume>;
      setResume({ experience: r.experience ?? [], education: r.education ?? [] });
    }
  }, [profile]);

  async function save() {
    if (!profile) return;
    const { error } = await supabase.from("profiles").update({ resume }).eq("id", profile.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Resume saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  const setExp = (i: number, k: keyof Resume["experience"][number], v: string) =>
    setResume({ ...resume, experience: resume.experience.map((e, j) => (j === i ? { ...e, [k]: v } : e)) });
  const setEdu = (i: number, k: keyof Resume["education"][number], v: string) =>
    setResume({ ...resume, education: resume.education.map((e, j) => (j === i ? { ...e, [k]: v } : e)) });

  return (
    <div>
      <div className="flex items-end justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Resume</h1>
          <p className="text-sm text-muted-foreground">Name, headline and skills come from your Portfolio settings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / PDF</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6 print:hidden">
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Experience</h2>
              <Button size="sm" variant="ghost" onClick={() => setResume({ ...resume, experience: [...resume.experience, { role: "", company: "", period: "", details: "" }] })}><Plus className="h-4 w-4" /> Add</Button>
            </div>
            {resume.experience.map((e, i) => (
              <div key={i} className="mt-3 space-y-2 rounded-lg border bg-card p-3">
                <div className="flex gap-2">
                  <Input placeholder="Role" value={e.role} onChange={(x) => setExp(i, "role", x.target.value)} />
                  <button onClick={() => setResume({ ...resume, experience: resume.experience.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Company" value={e.company} onChange={(x) => setExp(i, "company", x.target.value)} />
                  <Input placeholder="2022 – Present" value={e.period} onChange={(x) => setExp(i, "period", x.target.value)} />
                </div>
                <Textarea placeholder="Highlights" rows={3} value={e.details} onChange={(x) => setExp(i, "details", x.target.value)} />
              </div>
            ))}
          </section>
          <section>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Education</h2>
              <Button size="sm" variant="ghost" onClick={() => setResume({ ...resume, education: [...resume.education, { degree: "", school: "", period: "" }] })}><Plus className="h-4 w-4" /> Add</Button>
            </div>
            {resume.education.map((e, i) => (
              <div key={i} className="mt-3 space-y-2 rounded-lg border bg-card p-3">
                <div className="flex gap-2">
                  <Input placeholder="Degree" value={e.degree} onChange={(x) => setEdu(i, "degree", x.target.value)} />
                  <button onClick={() => setResume({ ...resume, education: resume.education.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="School" value={e.school} onChange={(x) => setEdu(i, "school", x.target.value)} />
                  <Input placeholder="Years" value={e.period} onChange={(x) => setEdu(i, "period", x.target.value)} />
                </div>
              </div>
            ))}
          </section>
        </div>

        <article className="rounded-lg border bg-card p-8 print:border-0 print:p-0">
          <h2 className="text-2xl font-bold">{profile?.full_name || "Your Name"}</h2>
          <p className="text-primary">{profile?.headline}</p>
          <p className="mt-1 text-xs text-muted-foreground">{[profile?.location, profile?.website, profile?.github_username && `github.com/${profile.github_username}`].filter(Boolean).join(" · ")}</p>
          {profile?.skills.length ? <p className="mt-4 text-sm"><span className="font-semibold">Skills: </span>{profile.skills.join(", ")}</p> : null}
          <h3 className="mt-6 border-b pb-1 font-mono text-xs uppercase text-muted-foreground">Experience</h3>
          {resume.experience.map((e, i) => (
            <div key={i} className="mt-3">
              <div className="flex justify-between text-sm"><span className="font-semibold">{e.role}{e.company && ` — ${e.company}`}</span><span className="text-muted-foreground">{e.period}</span></div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{e.details}</p>
            </div>
          ))}
          <h3 className="mt-6 border-b pb-1 font-mono text-xs uppercase text-muted-foreground">Education</h3>
          {resume.education.map((e, i) => (
            <div key={i} className="mt-3 flex justify-between text-sm"><span><span className="font-semibold">{e.degree}</span>{e.school && `, ${e.school}`}</span><span className="text-muted-foreground">{e.period}</span></div>
          ))}
        </article>
      </div>
    </div>
  );
}
