# SkillGraph
### AI-Powered Capability Discovery & Intelligence Platform

**Your abilities go beyond your qualifications.**

SkillGraph helps people discover, demonstrate, and develop capabilities gained through real-world experiences — including informal work, volunteering, self-learning, independent projects, caregiving, and community activities.

It transforms these experiences into an interactive, evidence-backed Capability Graph and connects individuals with opportunities based on what they can actually do, not just what their qualifications say.

---

## The Problem

Traditional CVs, degrees, and certificates capture only a fraction of what someone can do.

People develop valuable capabilities through everyday experiences, independent work, and practical problem-solving. Yet these abilities often remain undocumented, unrecognized, and disconnected from meaningful opportunities.

**The problem isn't always a lack of skills. It's that many skills are never recognized.**

## What SkillGraph Does

SkillGraph uses AI to uncover capabilities hidden within real-world experiences and turn them into structured, demonstrable skills.

Its core system connects four elements:

**Experience → Capability → Evidence → Opportunity**

1. **Experience Discovery** — Understands what people have actually done through conversations, documents, projects, and other experiences.
2. **Capability Mapping** — Identifies tasks and transferable capabilities using structured skill frameworks such as ESCO and O*NET.
3. **Capability Graph** — Builds an interactive network connecting experiences, tasks, skills, evidence, and related capabilities.
4. **Evidence & Verification** — Supports capabilities with work samples, projects, references, and practical assessments.
5. **Growth Intelligence** — Identifies skill gaps and recommends practical ways to develop new capabilities.
6. **Opportunity Matching** — Connects individuals with relevant jobs, internships, scholarships, fellowships, and projects based on demonstrated and transferable capabilities.
7. **Capability Passport** — Creates a portable profile that individuals control and can selectively share.

## The AI Intelligence Layer

AI powers the intelligence behind SkillGraph, acting as a centralized system rather than a standalone chatbot.

It investigates experiences, asks contextual questions, discovers capabilities, maps relationships, analyzes evidence, supports assessments, and identifies development and opportunity pathways.

Every AI-generated inference remains reviewable and correctable by the user.

**AI can suggest a capability, but it cannot automatically declare someone qualified.** Verification requires appropriate evidence and assessment.

## What Makes It Different?

- **Experience over credentials:** Recognizes capabilities developed outside formal education and employment.
- **Evidence over claims:** Connects capabilities to real work and practical demonstrations.
- **Connected capabilities:** Shows how different experiences contribute to related and transferable skills.
- **Continuous development:** Evolves as individuals gain experience and improve.
- **Opportunity based on ability:** Looks beyond conventional qualifications when identifying relevant opportunities.
- **User ownership:** Individuals control their information and what they share.

## Who It's For

- Students and self-taught learners.
- Informal workers and volunteers.
- Independent creators and entrepreneurs.
- Career changers.
- People whose abilities aren't represented by traditional qualifications.

**No university degree, professional job title, or certificate is required to start discovering your capabilities.**

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase PostgreSQL |
| Authentication | Supabase SSR Auth |
| Storage | Supabase Storage |
| AI | OpenAI API, centralized orchestration |
| Validation | Zod |
| Forms | React Hook Form |
| Testing | Vitest |

The platform uses server-side AI orchestration, structured outputs, database-level Row Level Security (RLS), and validated data operations.

## Getting Started

### Prerequisites
- Node.js 20+
- npm
- Supabase project
- OpenAI API key (required for AI functionality)

### Installation

```bash
# Clone the repository and install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

Add your Supabase credentials and OpenAI API key to `.env.local`.

Apply the database migrations in `supabase/migrations/` using the Supabase CLI or SQL Editor.

```bash
# Start development server
npm run dev

# Run checks
npm run lint
npx vitest run
npm run build
```

---

## The Vision

SkillGraph aims to make human capabilities visible, measurable, and accessible.

Because what someone can do is often much bigger than what their résumé says.