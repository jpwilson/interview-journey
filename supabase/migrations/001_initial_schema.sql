-- ============================================================
-- Interview Journey — Initial Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- ─────────────────────────────────────────────────────────────
-- HELPER: auto update updated_at
-- ─────────────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─────────────────────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────────────────────
create table profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  display_name           text,
  avatar_url             text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "profiles: owner read"   on profiles for select using (auth.uid() = id);
create policy "profiles: owner update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: owner insert" on profiles for insert with check (auth.uid() = id);

create trigger trg_profiles_updated_at
  before update on profiles for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────────────────────────
create table subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id   text unique,
  stripe_sub_id        text unique,
  tier                 text not null default 'free' check (tier in ('free', 'pro')),
  status               text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end   timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table subscriptions enable row level security;
create policy "subscriptions: owner read" on subscriptions for select using (auth.uid() = user_id);
-- Writes only via service role (Stripe webhook handler)

create trigger trg_subscriptions_updated_at
  before update on subscriptions for each row execute function update_updated_at();

-- Auto-create free subscription on signup
create or replace function handle_new_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_subscription
  after insert on auth.users for each row execute function handle_new_subscription();

-- ─────────────────────────────────────────────────────────────
-- COMPANIES
-- ─────────────────────────────────────────────────────────────
create table companies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  domain      text,
  logo_url    text,
  website     text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_companies_user        on companies(user_id);
create index idx_companies_name_trgm   on companies using gin(name gin_trgm_ops);

alter table companies enable row level security;
create policy "companies: owner all" on companies for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger trg_companies_updated_at
  before update on companies for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- APPLICATIONS
-- ─────────────────────────────────────────────────────────────
create table applications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  company_id       uuid not null references companies(id) on delete cascade,
  role_title       text not null,
  stage            text not null default 'applied'
                   check (stage in ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
  kanban_order     integer not null default 0,
  job_url          text,
  salary_min       integer,
  salary_max       integer,
  currency         text not null default 'USD',
  location         text,
  remote_type      text check (remote_type in ('remote', 'hybrid', 'onsite')),
  source           text,
  notes            text,
  applied_at       timestamptz,
  offer_deadline   timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_applications_user         on applications(user_id);
create index idx_applications_user_stage   on applications(user_id, stage);
create index idx_applications_company      on applications(company_id);

alter table applications enable row level security;
create policy "applications: owner all" on applications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger trg_applications_updated_at
  before update on applications for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- TIMELINE EVENTS
-- ─────────────────────────────────────────────────────────────
create table timeline_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  application_id  uuid not null references applications(id) on delete cascade,
  event_type      text not null check (event_type in (
                    'applied', 'screening_scheduled', 'screening_completed',
                    'interview_scheduled', 'interview_completed',
                    'technical_assessment', 'offer_received',
                    'offer_accepted', 'offer_declined', 'offer_rescinded',
                    'rejected', 'withdrawn', 'reference_check',
                    'nda_signed', 'document_added', 'note_added', 'stage_changed'
                  )),
  event_date      timestamptz not null default now(),
  title           text not null,
  description     text,
  metadata        jsonb not null default '{}',
  source          text not null default 'manual' check (source in ('manual', 'ai_parsed', 'inferred')),
  created_at      timestamptz not null default now()
);

create index idx_timeline_application on timeline_events(application_id, event_date desc);
create index idx_timeline_user_date   on timeline_events(user_id, event_date desc);

alter table timeline_events enable row level security;
create policy "timeline_events: owner all" on timeline_events for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────────────────────────
create table documents (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  application_id        uuid references applications(id) on delete set null,
  timeline_event_id     uuid references timeline_events(id) on delete set null,
  storage_path          text not null,
  file_name             text not null,
  file_type             text not null,
  file_size_bytes       integer,
  doc_type              text check (doc_type in (
                          'offer_letter', 'rejection_email', 'interview_confirmation',
                          'nda', 'screening_email', 'assessment', 'reference_request',
                          'application_confirmation', 'resume', 'cover_letter', 'other', 'unknown'
                        )),
  classification_status text not null default 'pending'
                        check (classification_status in ('pending', 'processing', 'classified', 'failed')),
  ai_raw_response       jsonb,
  ai_confidence         numeric(3, 2),
  extracted_company     text,
  extracted_role        text,
  extracted_date        timestamptz,
  extracted_outcome     text,
  extracted_summary     text,
  needs_review          boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_documents_user           on documents(user_id, created_at desc);
create index idx_documents_application    on documents(application_id);
create index idx_documents_classification on documents(classification_status) where classification_status = 'pending';

alter table documents enable row level security;
create policy "documents: owner all" on documents for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger trg_documents_updated_at
  before update on documents for each row execute function update_updated_at();

-- Enable Realtime on documents so clients get live classification updates
alter publication supabase_realtime add table documents;

-- ─────────────────────────────────────────────────────────────
-- ANALYTICS EVENTS
-- ─────────────────────────────────────────────────────────────
create table analytics_events (
  id          uuid primary key default gen_random_uuid(),
  event_name  text not null,
  page_path   text,
  user_id     uuid references auth.users(id),
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index idx_analytics_created on analytics_events(created_at desc);
create index idx_analytics_event   on analytics_events(event_name);

alter table analytics_events enable row level security;
create policy "analytics: users insert" on analytics_events for insert
  with check (auth.uid() = user_id or user_id is null);
create policy "analytics: users read own" on analytics_events for select
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKET POLICIES
-- (run after creating 'documents' bucket in Supabase dashboard)
-- ─────────────────────────────────────────────────────────────

-- Bucket: documents (private)
-- Path convention: {user_id}/{document_id}/{filename}

insert into storage.buckets (id, name, public) values ('documents', 'documents', false)
  on conflict (id) do nothing;

create policy "storage: owner insert"
  on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "storage: owner read"
  on storage.objects for select
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "storage: owner delete"
  on storage.objects for delete
  using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
