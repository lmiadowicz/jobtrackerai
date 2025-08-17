-- Create required extension for UUID generation if not exists
create extension if not exists pgcrypto;

-- Enums for AI generation logging
create type public.ai_generation_type as enum ('generate_cv', 'generate_cover_letter');
create type public.ai_generation_status as enum ('success', 'error');

-- AI generation logs table
create table public.ai_generation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  application_id uuid not null references public.applications(id) on delete cascade,
  type public.ai_generation_type not null,
  model text,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  latency_ms integer,
  status public.ai_generation_status not null default 'success',
  error_message text,
  output_document_id uuid null references public.documents(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

comment on table public.ai_generation_logs is 'Audit logs for AI content generation (CVs and cover letters).';

-- Indexes to optimize common queries
create index if not exists idx_ai_logs_user on public.ai_generation_logs(user_id);
create index if not exists idx_ai_logs_application on public.ai_generation_logs(application_id);
create index if not exists idx_ai_logs_created_at on public.ai_generation_logs(created_at desc);
create index if not exists idx_ai_logs_type on public.ai_generation_logs(type);

-- RLS: enable and restrict to owner
alter table public.ai_generation_logs enable row level security;

create policy ai_logs_select_own
  on public.ai_generation_logs for select
  using (user_id = auth.uid());

create policy ai_logs_insert_own
  on public.ai_generation_logs for insert
  with check (user_id = auth.uid());

-- No update/delete policies => disallowed by default 