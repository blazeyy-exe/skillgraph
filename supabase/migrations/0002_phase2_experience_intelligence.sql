-- SkillGraph Phase 2: Experience Intelligence, Tasks, Conversations, Skills Ontology & Claims

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  narrative text not null,
  source text not null default 'conversation' check (source in ('conversation', 'manual', 'document', 'url', 'image', 'voice')),
  status text not null default 'draft' check (status in ('draft', 'extracted', 'analyzed', 'archived')),
  category text,
  role_or_contribution text,
  occurred_at text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experiences_user_id_created_at_idx on public.experiences (user_id, created_at desc);

create table if not exists public.experience_tasks (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  description text not null,
  contribution_type text not null default 'individual' check (contribution_type in ('individual', 'team', 'unknown')),
  actions text[] not null default '{}',
  tools text[] not null default '{}',
  obstacles text[] not null default '{}',
  outcomes text[] not null default '{}',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experience_tasks_experience_id_idx on public.experience_tasks (experience_id, order_index);
create index if not exists experience_tasks_user_id_idx on public.experience_tasks (user_id);

create table if not exists public.discovery_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'New capability discovery',
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  context_snapshot jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discovery_conversations_user_id_idx on public.discovery_conversations (user_id, created_at desc);

create table if not exists public.discovery_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.discovery_conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists discovery_messages_conversation_id_idx on public.discovery_messages (conversation_id, created_at asc);
create index if not exists discovery_messages_user_id_idx on public.discovery_messages (user_id);

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

-- Triggers for updated_at
drop trigger if exists experiences_set_updated_at on public.experiences;
create trigger experiences_set_updated_at
before update on public.experiences
for each row execute function public.set_updated_at();

drop trigger if exists experience_tasks_set_updated_at on public.experience_tasks;
create trigger experience_tasks_set_updated_at
before update on public.experience_tasks
for each row execute function public.set_updated_at();

drop trigger if exists discovery_conversations_set_updated_at on public.discovery_conversations;
create trigger discovery_conversations_set_updated_at
before update on public.discovery_conversations
for each row execute function public.set_updated_at();

drop trigger if exists skill_claims_set_updated_at on public.skill_claims;
create trigger skill_claims_set_updated_at
before update on public.skill_claims
for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.experiences enable row level security;
alter table public.experience_tasks enable row level security;
alter table public.discovery_conversations enable row level security;
alter table public.discovery_messages enable row level security;
alter table public.skills enable row level security;
alter table public.skill_claims enable row level security;

-- Experiences policies
drop policy if exists "experiences_select_own" on public.experiences;
create policy "experiences_select_own" on public.experiences for select using (auth.uid() = user_id);

drop policy if exists "experiences_insert_own" on public.experiences;
create policy "experiences_insert_own" on public.experiences for insert with check (auth.uid() = user_id);

drop policy if exists "experiences_update_own" on public.experiences;
create policy "experiences_update_own" on public.experiences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "experiences_delete_own" on public.experiences;
create policy "experiences_delete_own" on public.experiences for delete using (auth.uid() = user_id);

-- Experience Tasks policies
drop policy if exists "tasks_select_own" on public.experience_tasks;
create policy "tasks_select_own" on public.experience_tasks for select using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.experience_tasks;
create policy "tasks_insert_own" on public.experience_tasks for insert with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.experience_tasks;
create policy "tasks_update_own" on public.experience_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.experience_tasks;
create policy "tasks_delete_own" on public.experience_tasks for delete using (auth.uid() = user_id);

-- Discovery Conversations policies
drop policy if exists "conversations_select_own" on public.discovery_conversations;
create policy "conversations_select_own" on public.discovery_conversations for select using (auth.uid() = user_id);

drop policy if exists "conversations_insert_own" on public.discovery_conversations;
create policy "conversations_insert_own" on public.discovery_conversations for insert with check (auth.uid() = user_id);

drop policy if exists "conversations_update_own" on public.discovery_conversations;
create policy "conversations_update_own" on public.discovery_conversations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "conversations_delete_own" on public.discovery_conversations;
create policy "conversations_delete_own" on public.discovery_conversations for delete using (auth.uid() = user_id);

-- Discovery Messages policies
drop policy if exists "messages_select_own" on public.discovery_messages;
create policy "messages_select_own" on public.discovery_messages for select using (auth.uid() = user_id);

drop policy if exists "messages_insert_own" on public.discovery_messages;
create policy "messages_insert_own" on public.discovery_messages for insert with check (auth.uid() = user_id);

-- Skills catalogue (read-only for authenticated users)
drop policy if exists "skills_read_authenticated" on public.skills;
create policy "skills_read_authenticated" on public.skills for select using (auth.role() = 'authenticated');

-- Skill Claims policies
drop policy if exists "claims_select_own" on public.skill_claims;
create policy "claims_select_own" on public.skill_claims for select using (auth.uid() = user_id);

drop policy if exists "claims_insert_own" on public.skill_claims;
create policy "claims_insert_own" on public.skill_claims for insert with check (auth.uid() = user_id);

drop policy if exists "claims_update_own" on public.skill_claims;
create policy "claims_update_own" on public.skill_claims for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "claims_delete_own" on public.skill_claims;
create policy "claims_delete_own" on public.skill_claims for delete using (auth.uid() = user_id);

-- Seed Foundational Skills Taxonomy
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
  )
on conflict (canonical_id) do nothing;
