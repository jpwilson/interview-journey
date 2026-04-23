-- ============================================================
-- Interview Journey — v2 redesign
-- Adds employment state + search status + user prefs on profiles.
-- Apply via `supabase db push` or paste into the Supabase SQL editor.
-- ============================================================

alter table public.profiles
  add column if not exists current_employer_id uuid references public.companies(id) on delete set null,
  add column if not exists current_title text,
  add column if not exists employment_start_date date,
  add column if not exists search_status text default 'open'
    check (search_status in ('happy', 'open', 'active')),
  add column if not exists prefs jsonb default
    '{"funnelRange":"90d","autoCloseDays":30,"docConfidenceThreshold":85}'::jsonb;

comment on column public.profiles.current_employer_id is
  'User''s current employer. Independent from the roles pipeline (which tracks job-search applications).';
comment on column public.profiles.search_status is
  'happy | open | active — drives dashboard behavior and retention nudges.';
comment on column public.profiles.prefs is
  'User preferences: funnelRange (30d|90d|180d|all), autoCloseDays, docConfidenceThreshold.';
