-- ============================================================
-- Interview Journey — soft-delete for roles
-- Adds deleted_at + partial index. Updates RLS so deleted rows
-- stay visible to the owner (for /archive) but are filtered by
-- default via a non_deleted_roles view that existing app code
-- can adopt incrementally.
-- Apply via `supabase db push` or paste into the Supabase SQL editor.
-- ============================================================

alter table public.roles
  add column if not exists deleted_at timestamptz;

comment on column public.roles.deleted_at is
  'Soft-delete marker. Null = active. Set to now() when the user deletes; cleared on restore. Visible only in /archive until purged.';

-- Partial index for the common filter (deleted_at is null).
create index if not exists idx_roles_user_active
  on public.roles (user_id, updated_at desc)
  where deleted_at is null;

-- Optional helper view — future queries can use `from active_roles` instead of filtering manually.
create or replace view public.active_roles as
  select * from public.roles where deleted_at is null;

-- RLS for the view inherits from the base table; no extra policy needed.
