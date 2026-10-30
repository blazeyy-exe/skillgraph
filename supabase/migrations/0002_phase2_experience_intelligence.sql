-- SkillGraph Phase 2: Experience Intelligence Engine
-- Entities: discovery_conversations, discovery_messages, experiences, experience_tasks, skill_suggestions, skills catalogue

create table if not exists public.discovery_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'New capability discovery',
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  context_summary text,
  current_interview_stage text not null default 'initial' check (current_interview_stage in ('initial', 'clarifying_role', 'investigating_tasks', 'resolving_challenges', 'ready_for_extraction', 'completed')),
  context_snapshot jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists discovery_conversations_user_id_idx on public.discovery_conversations (user_id, created_at desc);

create table if not exists public.discovery_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.discovery_conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  structured_metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists discovery_messages_conversation_id_idx on public.discovery_messages (conversation_id, created_at asc);
create index if not exists discovery_messages_user_id_idx on public.discovery_messages (user_id);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid references public.discovery_conversations (id) on delete set null,
  title text not null,
  description text not null,
  experience_type text not null default 'Other' check (experience_type in (
    'Community work',
    'Volunteering',
    'Personal projects',
    'Entrepreneurship',
    'Education',
    'Informal work',
    'Employment',
    'Creative work',
    'Family responsibilities',
    'Other'
  )),
  organization_name text,
  start_date text,
  end_date text,
  user_contribution text,
  challenges text[] not null default '{}',
  outcomes text[] not null default '{}',
  tools_used text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'extracted', 'analyzed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experiences_user_id_created_at_idx on public.experiences (user_id, created_at desc);
create index if not exists experiences_conversation_id_idx on public.experiences (conversation_id);

create table if not exists public.experience_tasks (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  description text not null,
  action_type text not null default 'coordination',
  tools_used text[] not null default '{}',
  complexity text not null default 'medium' check (complexity in ('low', 'medium', 'high')),
  responsibility_level text not null default 'individual_contributor' check (responsibility_level in ('supporting', 'individual_contributor', 'lead', 'owner')),
  supporting_context text,
  extraction_source text not null default 'conversation',
  user_review_status text not null default 'pending' check (user_review_status in ('pending', 'accepted', 'rejected', 'modified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experience_tasks_experience_id_idx on public.experience_tasks (experience_id, created_at asc);
create index if not exists experience_tasks_user_id_idx on public.experience_tasks (user_id);

-- Controlled Skills Ontology Catalogue (ESCO & O*NET Canonical reference)
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  canonical_id text unique not null,
  name text not null,
  description text not null,
  category text not null,
  observable_behaviours text[] not null default '{}',
  source text not null default 'esco',
  source_ref text,
  created_at timestamptz not null default now()
);

create index if not exists skills_category_idx on public.skills (category);
create index if not exists skills_canonical_id_idx on public.skills (canonical_id);

-- Preliminary Skill Suggestions (Phase 2 output; never automatically promoted to demonstrated)
create table if not exists public.skill_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  experience_id uuid not null references public.experiences (id) on delete cascade,
  task_id uuid references public.experience_tasks (id) on delete cascade,
  suggested_skill_name text not null,
  skill_description text not null,
  inference_explanation text not null,
  supporting_evidence text not null,
  confidence_level numeric not null check (confidence_level >= 0 and confidence_level <= 1),
  review_status text not null default 'pending' check (review_status in ('pending', 'accepted', 'rejected', 'modified')),
  taxonomy_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skill_suggestions_user_id_idx on public.skill_suggestions (user_id);
create index if not exists skill_suggestions_experience_id_idx on public.skill_suggestions (experience_id);
create index if not exists skill_suggestions_task_id_idx on public.skill_suggestions (task_id);

-- Maintain skill_claims table for capability graph forward-compatibility (Phase 3)
create table if not exists public.skill_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  evidence_state text not null default 'inferred' check (evidence_state in ('unexplored', 'inferred', 'developing', 'demonstrated')),
  user_review text not null default 'pending' check (user_review in ('pending', 'accepted', 'rejected', 'corrected')),
  evidence_confidence numeric not null default 0.7 check (evidence_confidence >= 0 and evidence_confidence <= 1),
  proficiency_level text check (proficiency_level in ('foundational', 'intermediate', 'advanced', 'expert')),
  evidence_coverage numeric not null default 0.5 check (evidence_coverage >= 0 and evidence_coverage <= 1),
  inference_explanation text not null,
  source_experience_ids uuid[] not null default '{}',
  source_task_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skill_claims_user_id_state_idx on public.skill_claims (user_id, evidence_state);
create index if not exists skill_claims_skill_id_idx on public.skill_claims (skill_id);

-- Updated_at triggers
drop trigger if exists discovery_conversations_set_updated_at on public.discovery_conversations;
create trigger discovery_conversations_set_updated_at
before update on public.discovery_conversations
for each row execute function public.set_updated_at();

drop trigger if exists experiences_set_updated_at on public.experiences;
create trigger experiences_set_updated_at
before update on public.experiences
for each row execute function public.set_updated_at();

drop trigger if exists experience_tasks_set_updated_at on public.experience_tasks;
create trigger experience_tasks_set_updated_at
before update on public.experience_tasks
for each row execute function public.set_updated_at();

drop trigger if exists skill_suggestions_set_updated_at on public.skill_suggestions;
create trigger skill_suggestions_set_updated_at
before update on public.skill_suggestions
for each row execute function public.set_updated_at();

drop trigger if exists skill_claims_set_updated_at on public.skill_claims;
create trigger skill_claims_set_updated_at
before update on public.skill_claims
for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.discovery_conversations enable row level security;
alter table public.discovery_messages enable row level security;
alter table public.experiences enable row level security;
alter table public.experience_tasks enable row level security;
alter table public.skills enable row level security;
alter table public.skill_suggestions enable row level security;
alter table public.skill_claims enable row level security;

-- Discovery Conversations RLS
drop policy if exists "conversations_select_own" on public.discovery_conversations;
create policy "conversations_select_own" on public.discovery_conversations for select using (auth.uid() = user_id);

drop policy if exists "conversations_insert_own" on public.discovery_conversations;
create policy "conversations_insert_own" on public.discovery_conversations for insert with check (auth.uid() = user_id);

drop policy if exists "conversations_update_own" on public.discovery_conversations;
create policy "conversations_update_own" on public.discovery_conversations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "conversations_delete_own" on public.discovery_conversations;
create policy "conversations_delete_own" on public.discovery_conversations for delete using (auth.uid() = user_id);

-- Discovery Messages RLS
-- Critical Rule: System messages and internal AI instructions must NEVER be exposed through normal user-facing message retrieval
drop policy if exists "messages_select_own" on public.discovery_messages;
create policy "messages_select_own" on public.discovery_messages for select using (auth.uid() = user_id and role != 'system');

drop policy if exists "messages_insert_own" on public.discovery_messages;
create policy "messages_insert_own" on public.discovery_messages for insert with check (auth.uid() = user_id);

-- Experiences RLS
drop policy if exists "experiences_select_own" on public.experiences;
create policy "experiences_select_own" on public.experiences for select using (auth.uid() = user_id);

drop policy if exists "experiences_insert_own" on public.experiences;
create policy "experiences_insert_own" on public.experiences for insert with check (auth.uid() = user_id);

drop policy if exists "experiences_update_own" on public.experiences;
create policy "experiences_update_own" on public.experiences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "experiences_delete_own" on public.experiences;
create policy "experiences_delete_own" on public.experiences for delete using (auth.uid() = user_id);

-- Experience Tasks RLS
drop policy if exists "tasks_select_own" on public.experience_tasks;
create policy "tasks_select_own" on public.experience_tasks for select using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.experience_tasks;
create policy "tasks_insert_own" on public.experience_tasks for insert with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.experience_tasks;
create policy "tasks_update_own" on public.experience_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.experience_tasks;
create policy "tasks_delete_own" on public.experience_tasks for delete using (auth.uid() = user_id);

-- Skills catalogue (read-only for authenticated users)
drop policy if exists "skills_read_authenticated" on public.skills;
create policy "skills_read_authenticated" on public.skills for select using (auth.role() = 'authenticated');

-- Skill Suggestions RLS
drop policy if exists "suggestions_select_own" on public.skill_suggestions;
create policy "suggestions_select_own" on public.skill_suggestions for select using (auth.uid() = user_id);

drop policy if exists "suggestions_insert_own" on public.skill_suggestions;
create policy "suggestions_insert_own" on public.skill_suggestions for insert with check (auth.uid() = user_id);

drop policy if exists "suggestions_update_own" on public.skill_suggestions;
create policy "suggestions_update_own" on public.skill_suggestions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "suggestions_delete_own" on public.skill_suggestions;
create policy "suggestions_delete_own" on public.skill_suggestions for delete using (auth.uid() = user_id);

-- Skill Claims RLS
drop policy if exists "claims_select_own" on public.skill_claims;
create policy "claims_select_own" on public.skill_claims for select using (auth.uid() = user_id);

drop policy if exists "claims_insert_own" on public.skill_claims;
create policy "claims_insert_own" on public.skill_claims for insert with check (auth.uid() = user_id);

drop policy if exists "claims_update_own" on public.skill_claims;
create policy "claims_update_own" on public.skill_claims for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "claims_delete_own" on public.skill_claims;
create policy "claims_delete_own" on public.skill_claims for delete using (auth.uid() = user_id);

-- Seed Foundational Skills Taxonomy (ESCO & O*NET Controlled Catalogue)
insert into public.skills (canonical_id, name, description, category, observable_behaviours, source)
values
  (
    'esco:volunteer-management',
    'Volunteer Coordination & Management',
    'Recruit, schedule, direct, and motivate volunteers in community or non-profit initiatives.',
    'Leadership & Organizing',
    array['Designs volunteer schedules', 'Delegates roles based on volunteer strengths', 'Maintains team engagement during high-pressure events'],
    'esco'
  ),
  (
    'esco:logistics-planning',
    'Logistics Planning & Resource Allocation',
    'Coordinate supplies, timing, transportation, and facilities to execute operational workflows.',
    'Operations',
    array['Estimates required materials accurately', 'Coordinates vendors and delivery schedules', 'Resolves unexpected venue or transit delays'],
    'esco'
  ),
  (
    'esco:crisis-management',
    'Operational Crisis Management',
    'Act decisively when contingencies fail, adapting procedures in real-time to preserve outcomes.',
    'Problem Solving',
    array['Identifies root cause of unexpected bottlenecks', 'Formulates immediate fallback procedures', 'Communicates critical instructions clearly under pressure'],
    'esco'
  ),
  (
    'esco:stakeholder-negotiation',
    'Community Stakeholder Outreach & Negotiation',
    'Engage community partners, business owners, and sponsors to secure resources and agreements.',
    'Communication',
    array['Frames mutual benefit for non-traditional partners', 'Secures in-kind donations or community permissions', 'Follows up consistently with partners'],
    'esco'
  ),
  (
    'onet:systems-troubleshooting',
    'Systems Diagnosis & Troubleshooting',
    'Isolate hardware, software, or mechanical issues and implement systematic solutions.',
    'Technical',
    array['Gathers error signals methodically', 'Tests hypotheses step-by-step', 'Documents resolution steps for future prevention'],
    'onet'
  ),
  (
    'esco:self-directed-learning',
    'Self-Directed Skill Acquisition',
    'Formulate learning goals, curate independent resources, and acquire technical or operational competence without formal instruction.',
    'Personal Development',
    array['Synthesizes documentation and primary technical sources', 'Builds working proofs-of-concept to validate understanding', 'Persists through complex debugging independently'],
    'esco'
  ),
  (
    'esco:curriculum-design',
    'Curriculum & Workshop Design',
    'Structure knowledge into progressive, engaging learning modules for diverse learners.',
    'Teaching & Education',
    array['Sequences concepts from foundational to advanced', 'Creates practical hands-on exercises', 'Adapts explanations to varied learner skill levels'],
    'esco'
  ),
  (
    'onet:workflow-automation',
    'Workflow Automation & Scripting',
    'Eliminate repetitive manual tasks by creating scripts, macros, or digital tool integrations.',
    'Technical',
    array['Identifies repetitive operational friction', 'Designs automated input-to-output pipeline', 'Tests boundary failure modes'],
    'onet'
  ),
  (
    'esco:peer-mentoring',
    'Peer Mentoring & Skills Coaching',
    'Support other individuals in learning practical skills through guided feedback and encouragement.',
    'Teaching & Education',
    array['Demonstrates techniques clearly', 'Provides constructive feedback', 'Encourages self-directed problem-solving'],
    'esco'
  ),
  (
    'onet:data-organization',
    'Data Organization & Record Keeping',
    'Structure, maintain, and audit digital records or operational logs for accuracy and retrieval.',
    'Operations',
    array['Creates structured filing conventions', 'Audits records for inconsistencies', 'Automates record updates'],
    'onet'
  )
on conflict (canonical_id) do nothing;
