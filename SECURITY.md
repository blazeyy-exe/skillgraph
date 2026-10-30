# SkillGraph — Security

## Principles

- Least privilege
- Defense in depth: RLS + server checks + storage policies
- No secrets in the client or git
- Fail closed on AI and auth errors
- Users control their data

## Authentication

- Supabase Auth email/password
- Email verification required before full product use when Supabase email is configured
- Session via `@supabase/ssr` cookies (httpOnly)
- Middleware protects `/app/*`
- Password recovery uses Supabase recovery flow
- CSRF: Next.js Server Actions + same-site cookies

## Authorization

- Every user-owned table has RLS `auth.uid() = user_id` (or `id` for profiles)
- Admin flag on `profiles.is_admin` for catalogue writes
- Public profiles expose only rows marked visible
- Signed storage URLs, short TTL
- AI operations scoped to the authenticated user; conversation IDs are ownership-checked before load

## Input and files

- Zod validation on all mutations
- Evidence: MIME allowlist, size cap (default 15 MB), malware-untrusted
- Uploaded text treated as data, never as instructions
- URL fetches server-side with timeout, size cap, and private-network block (Phase 4)

## AI

- Keys only in server env
- Per-user token budgets and route rate limits
- Outputs schema-validated
- No unrestricted tools
- Do not send other users’ data in prompts
- Do not train external models on private evidence unless `model_training_consent` is true **and** a reviewed pipeline exists (none in Phase 1)

## Privacy

- Collect only what the product needs
- Educational background is optional
- Account deletion and export (export expands with phases)
- Audit log for deletion, sharing, admin opportunity edits

## Reliability of claims

- Distinguish lack of evidence from evidence of lack of ability
- Safe error messages (no stack traces to clients)
- Structured server logs without tokens or raw evidence blobs

## Environment

See `.env.example`. Production: Vercel env + Supabase dashboard. Rotate keys if leaked.

## Threat notes (Phase 1)

| Threat | Control |
| --- | --- |
| IDOR on `/app` data | RLS + user-scoped clients |
| Session steal | Secure cookies, HTTPS in production |
| Fake config | Honest unconfigured UI, no mock users in production |
| Open signup abuse | Supabase rate limits + app rate limit on auth routes |
