# SkillGraph — Implementation Roadmap

Work phase by phase. Do not skip. Keep `main` deployable.

## Phase 0 — Audit and architecture — **complete**

- Inspect repository (greenfield)
- Architecture, schema, AI, security, roadmap docs
- `.env.example`, README
- Folder conventions

## Phase 1 — Application foundation — **complete**

- Design system (editorial, not generic AI-SaaS)
- Public website
- Supabase auth (register, login, logout, verify, recovery)
- Protected `/app` routes
- Profiles, preferences, goals
- Progressive onboarding
- App shell, nav, loading/error/empty states
- Account settings (name, password recovery link, sign out)
- Honest integration status when env is missing
- Unit tests for validation and auth helpers

**Exit criteria:** a real user can register, verify (when email is configured), onboard, land on `/app`, update settings, and log out. Unauthenticated users cannot open `/app`.

## Phase 2 — Experience Intelligence

- Discovery conversation + persistence
- Experience + task extraction (structured, editable)
- Skill inference with review (accept / reject / correct)
- No invented achievements

## Phase 3 — Capability engine and graph

- ESCO/O\*NET import (subset first)
- Claims, evidence dimensions, relationships
- Interactive React Flow graph from DB edges
- Pattern detection with user review

## Phase 4 — Evidence Vault

- Private storage, validation, signed URLs
- Extraction + user review
- Links to experiences and claims

## Phase 5 — Challenge Lab

- Scenario assessments first
- Rubrics, evaluation, history, adaptive follow-up
- Policy-gated evidence_state updates

## Phase 6 — Growth Intelligence

- Goals, gaps, practice plans, timeline

## Phase 7 — Opportunity Engine

- Internal listings + admin write path
- Matching explanations
- Saved opportunities
- No fabricated jobs

## Phase 8 — Portable profile

- Opt-in public URL, selective visibility, revoke

## Phase 9 — Production hardening

- Performance, a11y, rate limits, monitoring, SEO, backups, full e2e suite, deploy docs

## Testing policy

| Layer | Tools |
| --- | --- |
| Unit | Vitest |
| Integration | Vitest + Supabase (when credentials present) |
| E2E | Playwright (full journey as credentials allow) |

If an external key is missing, tests skip the live integration and assert the unconfigured path.

## Technical risks

| Risk | Mitigation |
| --- | --- |
| LLM invents experience | Extraction schemas + user review + “never invent” policy + no demonstrated-from-LLM |
| Ontology size (ESCO) | Import incrementally; retrieve slices, not full dump in prompts |
| Cost | Fast model for chat; budgets; logging |
| Auth/email in local dev | Document confirmation-link workflow; show verify state |
| Graph performance | Paginate/expand on demand; filter by category/state |
| Prompt injection via PDFs | Untrusted-data wrapping; no tool access to SQL |
| Scope explosion | Phase gates; unused nav destinations labelled as upcoming only if they exist as honest placeholders |
