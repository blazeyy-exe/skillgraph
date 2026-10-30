# SkillGraph — Architecture

## Current repository state (Phase 0 audit)

- **Location:** `D:\Projects\skillgraph`
- **Prior codebase:** none. Empty git repository created 2026-10-30.
- **Chosen stack:** Next.js App Router, TypeScript (strict), Tailwind CSS, shadcn/ui, Supabase (Postgres, Auth, Storage), OpenAI via a provider abstraction.
- **Python/FastAPI:** not introduced in Phase 1. Next.js server routes handle application logic until document extraction or assessment pipelines justify a separate service.

## System overview

```
Browser (Next.js App Router)
        │
        ├── Public marketing pages
        ├── Auth pages (Supabase Auth)
        └── Authenticated /app (RLS-enforced data)
                │
                ▼
        Next.js Route Handlers / Server Actions
                │
                ├── Supabase (Postgres + Auth + Storage)
                ├── AI Orchestrator (server-only)
                │       ├── Discovery Intelligence
                │       ├── Capability Intelligence
                │       ├── Evidence Intelligence
                │       ├── Assessment Intelligence
                │       ├── Growth Intelligence
                │       └── Opportunity Intelligence
                └── Background jobs (later: queues for extraction / evaluation)
```

The six intelligence modules are **not** autonomous agents. They are versioned, schema-validated operations invoked by a central orchestrator. They never run unrestricted SQL.

## Folder structure

```
src/
  app/
    (marketing)/          public website
    (auth)/               login, signup, recovery, verify
    app/                  authenticated product
    api/                  route handlers
    p/[handle]/           public capability passport (Phase 8)
  components/
    ui/                   shadcn primitives
    marketing/
    app/                  shell, nav, empty/error states
    chat/                 reusable conversation UI (Phase 2+)
    graph/                SkillGraph visualisation (Phase 3)
  lib/
    supabase/             browser + server clients, middleware
    auth/
    validation/           Zod schemas
    ai/                   provider, orchestrator, prompts, schemas
    capabilities/
    opportunities/
    logging/
  types/
supabase/
  migrations/
  seed/                   ontology seeds (Phase 3), demo opportunities (Phase 7)
tests/
  unit/
  integration/
docs/                     optional expansions of these architecture files
```

## Runtime principles

- TypeScript strict mode.
- Server-side validation with Zod for every mutation and every LLM output.
- API keys only on the server.
- Row Level Security as the real authorization boundary; application checks are additional, not a substitute.
- Configuration honesty: if OpenAI or Supabase env vars are missing, the UI reports an unconfigured integration. It does not fake AI or auth.
- Demo data only when `SKILLGRAPH_DEMO_MODE=true` and labelled as such.

## Frontend

- Next.js App Router + React.
- Tailwind + shadcn/ui + Lucide.
- React Hook Form + Zod.
- TanStack Query for client-fetched authenticated lists.
- React Flow for the living graph (Phase 3). Cytoscape remains an option if graph size outgrows React Flow.
- Recharts only for meaningful analytics.

## Backend

Ordinary CRUD, auth, orchestration, and file metadata live in Next.js (Server Actions and Route Handlers).

A Python service is justified only for:

- Heavy document parsing (PDF/Office) at scale
- Batch assessment evaluation
- Ontology import pipelines

Until then, extraction uses the LLM provider plus lightweight parsers in Node.

## Data

- Supabase PostgreSQL + RLS
- Supabase Auth (email/password, verification, recovery)
- Supabase Storage for private evidence (signed URLs)
- pgvector in Phase 3+ for semantic skill/experience retrieval

Migrations live in `supabase/migrations` and are the source of truth.

## AI

See `AI_ARCHITECTURE.md`. Provider interface first; OpenAI as the first implementation. Structured outputs, prompt versions, usage logs, cost tracking.

## Deployment

- Vercel: Next.js
- Supabase: database, auth, storage
- Optional later: Fly.io / Cloud Run for Python workers

Environment variables: `.env.example`. Secrets never committed.

## Why this architecture

| Decision | Why |
| --- | --- |
| Single Next.js app first | Matches the spec; avoids a fake microservice split |
| Supabase | Auth + Postgres + Storage + RLS in one operational unit |
| Orchestrator not multi-agent swarm | Controllable I/O, cheaper, auditable |
| Ontology in Postgres, not only embeddings | Traceable skill IDs, relationships, and graph edges |
| Honest config states | Users never confuse stubbed AI with working intelligence |
