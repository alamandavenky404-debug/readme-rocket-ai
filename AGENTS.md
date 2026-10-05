<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## DevHub architecture
- User data CRUD runs from the browser Supabase client with RLS scoped to auth.uid(); why: simple and secure without extra server functions.
- AI features (README, code review) live in src/lib/ai.functions.ts behind requireSupabaseAuth, with the gateway call in ai.server.ts; why: keeps the AI key server-side and blocks anonymous usage.
- Public portfolio /u/$username reads via a public server fn with a publishable-key client and anon policies limited to public profiles and featured projects; why: SSR + shareable OG tags without exposing private rows.
