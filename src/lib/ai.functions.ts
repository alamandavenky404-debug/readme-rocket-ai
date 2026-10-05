import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runAi } from "./ai.server";

export const generateReadme = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title: string; description: string; techStack: string; extra?: string }) => {
    if (!d.title?.trim()) throw new Error("Title is required");
    return {
      title: d.title.slice(0, 200),
      description: (d.description ?? "").slice(0, 4000),
      techStack: (d.techStack ?? "").slice(0, 500),
      extra: (d.extra ?? "").slice(0, 2000),
    };
  })
  .handler(async ({ data }) => {
    const text = await runAi(
      "You write excellent, production-quality GitHub README.md files in Markdown. Include: title with one-line tagline, badges placeholder line, overview, features list, tech stack, getting started (prerequisites, install, run), project structure, deployment notes, contributing, license. Output only the Markdown, no code fences around the whole document. Keep it under 700 words.",
      `Project: ${data.title}\nDescription: ${data.description}\nTech stack: ${data.techStack}\nExtra notes: ${data.extra}`,
    );
    return { readme: text.trim() };
  });

export const reviewCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { challenge: string; code: string }) => {
    if (!d.code?.trim()) throw new Error("Write some code first");
    return { challenge: d.challenge.slice(0, 2000), code: d.code.slice(0, 8000) };
  })
  .handler(async ({ data }) => {
    const text = await runAi(
      'You are a senior engineer reviewing a coding exercise. First line MUST be exactly "SCORE: N" where N is 0-100. Then give concise Markdown feedback: correctness, edge cases, complexity (Big-O), readability/maintainability, and one improved snippet. Under 300 words.',
      `Challenge:\n${data.challenge}\n\nSubmission:\n${data.code}`,
    );
    const m = text.match(/SCORE:\s*(\d{1,3})/i);
    const score = m ? Math.min(100, parseInt(m[1], 10)) : null;
    return { score, feedback: text.replace(/^.*SCORE:\s*\d+.*\n?/i, "").trim() };
  });
