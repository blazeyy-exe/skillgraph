# SkillGraph — Database Schema

All tables use `uuid` primary keys (`gen_random_uuid()`), `timestamptz` `created_at` / `updated_at`, and explicit ownership. User-owned rows delete with the user (`on delete cascade`) unless noted. Ontology and opportunity catalogues are platform-owned.

## Phase 1 (implemented)

### profiles

Created by trigger on `auth.users` insert.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | = `auth.users.id` |
| preferred_name | text | |
| location | text | optional |
| educational_background | text | optional, never required |
| current_situation | text | |
| preferred_language | text | default `en` |
| onboarding_completed_at | timestamptz | null until finished or explicitly skipped-complete |
| onboarding_step | int | progressive onboarding |
| is_admin | boolean | default false |
| deleted_at | timestamptz | soft-delete marker before hard delete |

RLS: users select/update own row.

### user_preferences

| Column | Type |
| --- | --- |
| user_id | uuid PK FK profiles |
| interests | text[] |
| experience_categories | text[] |
| marketing_email_opt_in | boolean |
| ai_processing_opt_in | boolean | default true for product function; training opt-in separate |
| model_training_consent | boolean | default false |

### user_goals

| Column | Type |
| --- | --- |
| id | uuid PK |
| user_id | uuid FK |
| title | text |
| description | text |
| status | `active` \| `paused` \| `completed` \| `archived` |
| target_occupation_id | uuid nullable | later FK to occupations |

## Later phases (designed, migrations added incrementally)

### Experience

- `experiences` — owner, title, narrative, source (`conversation` \| `manual` \| `document` \| `url` \| `image` \| `voice`), status, occurred_at, location
- `experience_tasks` — FK experience, description, contribution_type (`individual` \| `team` \| `unknown`), actions, tools, obstacles, outcomes
- `discovery_conversations` — owner, status, context snapshot
- `discovery_messages` — conversation FK, role (`user` \| `assistant` \| `system`), content, metadata (not hidden system prompts to the client)

### Skill ontology

- `skill_taxonomy_sources` — ESCO, O\*NET, custom
- `skill_categories`
- `skills` — canonical_id, name, description, category, observable_behaviours, source, source_ref
- `skill_relationships` — from_skill, to_skill, type (`supports` \| `related_to` \| `requires` \| `enables` \| `transferable_to`)
- `occupations` — optional ESCO/O\*NET occupations
- `occupation_skills`

### User capability

- `skill_claims` — user, skill, evidence_state, user_review (`pending` \| `accepted` \| `rejected` \| `corrected`), inference_explanation, source_task_ids
- `claim_evidence` — claim ↔ evidence_asset / assessment / experience
- `proficiency_observations` — independent of evidence_state
- `capability_patterns` — cross-experience suggestions; user accept/reject/investigate

Evidence states: `unexplored` \| `inferred` \| `developing` \| `demonstrated`.

Separate numeric/text fields:

- `evidence_confidence` (0–1, explained)
- `proficiency_level` (rubric-bound, nullable)
- `evidence_coverage` (0–1, explained)

### Evidence

- `evidence_assets` — owner, name, description, storage_path or url, mime, size, processing_status, verification_state
- `evidence_extractions` — raw extract, model, prompt_version; **not** treated as proof of personal performance
- `evidence_reviews` — user corrections

Storage: private bucket `evidence`. Signed URLs only. Ownership checked in RLS and storage policies.

### Assessment

- `assessment_templates`
- `assessment_rubrics` — versioned criteria, levels, scoring rules
- `assessments` — generated instance, skill, difficulty, prompt snapshot
- `assessment_attempts` — response payload
- `assessment_evaluations` — rubric-constrained scores, explanation, strengths/weaknesses

LLM may assist evaluation; `demonstrated` is written only by application policy.

### Growth

- `learning_paths`
- `learning_milestones`
- `learning_activities`
- `progress_events`

### Opportunities

- `opportunities` — real listings only; `source` and `last_verified_at` required
- `opportunity_requirements`
- `opportunity_matches` — explanation, demonstrated vs transferable vs gap vs eligibility
- `saved_opportunities`

No fabricated jobs. Seed data labelled.

### Sharing

- `public_profiles` — handle, enabled flag
- `profile_visibility_settings` — item type + id + visible
- `verification_requests`

### AI operations

- `prompt_versions` — name, version, body hash
- `ai_tasks` — type, status, input/output refs
- `ai_usage_records` — provider, model, tokens, estimated cost, user
- `ai_operation_logs` — structured; no secrets

## Graph edges

The interactive graph is **projected from tables**, not stored as decorative JSON:

- experience —has→ task
- task —inferred_from→ skill_claim
- skill —related→ skill
- claim —demonstrated_by→ assessment / evidence
- skill —enables→ occupation / opportunity requirement

## Indexing (minimum)

- All FKs
- `experiences(user_id, created_at desc)`
- `skill_claims(user_id, evidence_state)`
- `skills(canonical_id)` unique
- `opportunities(application_deadline)`
- pgvector indexes when embeddings land

## RLS summary

| Data | Policy |
| --- | --- |
| profiles, preferences, goals, experiences, evidence, claims, assessments, growth | owner only |
| ontology, public opportunities | authenticated read; admin write |
| public_profiles | public read if enabled; owner write |
| ai logs / usage | owner read own usage; no cross-user |

Service role is used only in server-side jobs that already authenticated the user and enforce ownership in code **and** prefer user-scoped clients.

## Deletion

Account deletion (Phase 1 settings + Phase 9 hardening):

1. Disable public profile
2. Delete storage objects
3. Delete user-owned rows (cascade)
4. Delete `auth.users`

Export: JSON bundle of profile, experiences, claims, assessments (Phase 9 complete; Phase 1 stub endpoint may return available tables only).
