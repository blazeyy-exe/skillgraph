# SkillGraph — AI-Powered Capability Discovery & Intelligence Platform

> **"Your abilities go beyond your qualifications."**

SkillGraph discovers capabilities developed through real-world experiences (informal work, self-teaching, community volunteering, projects, caregiving), structures them into an interactive living capability graph, validates them through practical assessment, and connects individuals to real opportunities.

---

## 1. Documentation & Architecture

Comprehensive architectural and engineering specifications are located in the repository:

- [PROJECT_SPEC.md](file:///D:/skillgraph/PROJECT_SPEC.md) — Product requirements, user journey, evidence states, boundaries.
- [ARCHITECTURE.md](file:///D:/skillgraph/ARCHITECTURE.md) — Technical stack, runtime principles, client/server boundaries.
- [DATABASE_SCHEMA.md](file:///D:/skillgraph/DATABASE_SCHEMA.md) — PostgreSQL entity relationships, RLS policies, indexing, migrations.
- [AI_ARCHITECTURE.md](file:///D:/skillgraph/AI_ARCHITECTURE.md) — 6 intelligence modules, prompt versioning, schemas, token budgeting.
- [IMPLEMENTATION_ROADMAP.md](file:///D:/skillgraph/IMPLEMENTATION_ROADMAP.md) — Phased rollout from Phase 0 to Phase 9.
- [SECURITY.md](file:///D:/skillgraph/SECURITY.md) — RLS boundaries, rate-limiting, untrusted document handling, privacy controls.

---

## 2. Tech Stack

- **Framework:** Next.js (App Router, Turbopack, React 19, TypeScript strict mode)
- **Styling:** Tailwind CSS v4, editorial design system (Instrument Serif / Source Sans typography, warm paper tones)
- **Components:** Custom accessible UI primitives, Lucide icons, React Hook Form + Zod
- **Database & Auth:** Supabase PostgreSQL, Supabase SSR Auth, Supabase Storage
- **Security:** PostgreSQL Row Level Security (RLS) on all user data, secure cookies, in-memory rate limiting
- **AI Intelligence Layer:** Centralized server orchestrator with structured JSON outputs and validated Zod schemas (OpenAI-compatible provider abstraction)

---

## 3. Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (or local Supabase instance)
- OpenAI API Key (optional for Phase 1; required from Phase 2 for AI intelligence)

### Installation

1. Clone repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Provide your Supabase URL, Anon Key, and OpenAI API key.

3. Run database migrations:
   Apply the SQL files in `supabase/migrations/` using the Supabase CLI or the Supabase SQL Editor.

4. Start development server:
   ```bash
   npm run dev
   ```

5. Run automated tests and linting:
   ```bash
   npm run lint
   npx vitest run
   npm run build
   ```

---

## 4. Engineering Principles

1. **Real Functionality:** Every button, route, filter, and interaction is backed by real logic. Honest unconfigured states are displayed when external keys are omitted.
2. **Strict Authorization:** RLS ensures users can only read and mutate their own records.
3. **Evidence States:** Capabilities follow strict lifecycle transitions: `unexplored` → `inferred` → `developing` → `demonstrated`. LLMs never directly declare a skill demonstrated without rubric-verified assessment.
4. **Editorial Aesthetic:** Restrained typography, deliberate whitespace, and meaningful data visualization—avoiding generic AI SaaS gradients.
