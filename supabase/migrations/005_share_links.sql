-- ============================================================
-- Interview Journey — public share links
-- A user can mint a slug that renders a read-only timeline at /s/[slug].
-- The owner controls scope (full timeline or single role), anonymization,
-- and whether compensation numbers are visible.
-- Apply via `supabase db push` or paste into the Supabase SQL editor.
-- ============================================================

create table if not exists public.share_links (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  slug                  text unique not null,
  scope                 text not null check (scope in ('full_timeline', 'single_role')),
  role_id               uuid references public.roles(id) on delete cascade,
  display_name          text,
  anonymize_companies   boolean not null default false,
  show_compensation     boolean not null default false,
  view_count            integer not null default 0,
  created_at            timestamptz not null default now(),
  expires_at            timestamptz,
  revoked_at            timestamptz,
  constraint share_links_scope_role_consistent check (
    (scope = 'single_role' and role_id is not null) or
    (scope = 'full_timeline' and role_id is null)
  )
);

create index if not exists idx_share_links_slug on public.share_links(slug);
create index if not exists idx_share_links_user on public.share_links(user_id);

alter table public.share_links enable row level security;

-- Owner sees + manages their own links.
drop policy if exists "share_links: owner all" on public.share_links;
create policy "share_links: owner all" on public.share_links for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Anyone can look up a link by slug. The app route uses the service role
-- to fetch the underlying roles/events/companies, so tightening RLS on those
-- tables isn't necessary — we never expose them via the anon key.
drop policy if exists "share_links: public read" on public.share_links;
create policy "share_links: public read" on public.share_links for select using (true);

-- Atomic view-count increment — avoids the read-modify-write race when a
-- share link is hit from multiple tabs / scrapers.
create or replace function public.share_link_increment_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.share_links
     set view_count = view_count + 1
   where slug = p_slug
     and revoked_at is null
     and (expires_at is null or expires_at > now());
$$;

comment on function public.share_link_increment_view is
  'Atomically bumps view_count for a live share link. Silently no-ops for revoked/expired/unknown slugs.';
