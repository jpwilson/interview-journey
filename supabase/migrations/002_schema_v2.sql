-- ============================================================
-- Interview Journey — Schema V2
-- Rename applications→roles, timeline_events→role_events
-- Add meetings, offers, contacts improvements, resumes
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. RENAME CORE TABLES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE applications RENAME TO roles;
ALTER TABLE timeline_events RENAME TO role_events;

-- Rename indexes
ALTER INDEX idx_applications_user         RENAME TO idx_roles_user;
ALTER INDEX idx_applications_user_stage   RENAME TO idx_roles_user_stage;
ALTER INDEX idx_applications_company      RENAME TO idx_roles_company;
ALTER INDEX idx_timeline_application      RENAME TO idx_role_events_role;
ALTER INDEX idx_timeline_user_date        RENAME TO idx_role_events_user_date;

-- Rename triggers
ALTER TRIGGER trg_applications_updated_at ON roles RENAME TO trg_roles_updated_at;

-- ─────────────────────────────────────────────────────────────
-- 2. UPDATE ROLES TABLE
-- ─────────────────────────────────────────────────────────────

-- Rename application_id references in role_events
ALTER TABLE role_events RENAME COLUMN application_id TO role_id;

-- Rename application_id references in documents
ALTER TABLE documents RENAME COLUMN application_id TO role_id;
ALTER INDEX idx_documents_application RENAME TO idx_documents_role;

-- Update RLS policies on roles
DROP POLICY IF EXISTS "applications: owner all" ON roles;
CREATE POLICY "roles: owner all" ON roles FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Update RLS policies on role_events
DROP POLICY IF EXISTS "timeline_events: owner all" ON role_events;
CREATE POLICY "role_events: owner all" ON role_events FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add new columns to roles
ALTER TABLE roles
  ADD COLUMN IF NOT EXISTS resolution        text CHECK (resolution IN (
    'hired', 'rejected', 'withdrew', 'offer_declined', 'ghosted', 'on_hold'
  )),
  ADD COLUMN IF NOT EXISTS ghosted_at        timestamptz,
  ADD COLUMN IF NOT EXISTS engaged_at        timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_at       timestamptz,
  ADD COLUMN IF NOT EXISTS excitement_score  smallint CHECK (excitement_score BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS priority          smallint DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  ADD COLUMN IF NOT EXISTS last_contact_at   timestamptz,
  ADD COLUMN IF NOT EXISTS referrer_contact_id uuid,
  ADD COLUMN IF NOT EXISTS industry          text;

-- Update stage values to include 'exploring' and 'negotiating'
ALTER TABLE roles DROP CONSTRAINT IF EXISTS applications_stage_check;
ALTER TABLE roles ADD CONSTRAINT roles_stage_check CHECK (stage IN (
  'exploring', 'applied', 'screening', 'interviewing', 'offer', 'negotiating', 'resolved'
));

-- Update existing stage values
UPDATE roles SET stage = 'interviewing' WHERE stage = 'interview';
UPDATE roles SET stage = 'screening'    WHERE stage = 'screening';
UPDATE roles SET stage = 'resolved', resolution = 'rejected' WHERE stage = 'rejected';
UPDATE roles SET stage = 'resolved', resolution = 'withdrew'  WHERE stage = 'withdrawn';
UPDATE roles SET stage = 'resolved', resolution = 'hired'     WHERE stage = 'hired';
UPDATE roles SET stage = 'offer' WHERE stage = 'offer';

-- Add industry/size to companies
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS industry       text,
  ADD COLUMN IF NOT EXISTS size           text CHECK (size IN ('startup', 'mid', 'enterprise', 'unknown')),
  ADD COLUMN IF NOT EXISTS times_applied  integer NOT NULL DEFAULT 0;

-- Add role_id index on role_events (already covered by renamed idx_role_events_role)
-- Add event_type update for renamed roles
ALTER TABLE role_events DROP CONSTRAINT IF EXISTS timeline_events_event_type_check;
ALTER TABLE role_events ADD CONSTRAINT role_events_event_type_check CHECK (event_type IN (
  'applied', 'screening_scheduled', 'screening_completed',
  'interview_scheduled', 'interview_completed',
  'technical_assessment', 'offer_received',
  'offer_accepted', 'offer_declined', 'offer_rescinded',
  'rejected', 'withdrew', 'ghosted', 'reference_check',
  'nda_signed', 'document_added', 'note_added', 'stage_changed',
  'follow_up_sent', 'reference_requested', 'meeting_scheduled', 'meeting_completed'
));

-- ─────────────────────────────────────────────────────────────
-- 3. CONTACTS (upgrade existing table)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS current_company   text,
  ADD COLUMN IF NOT EXISTS current_title     text,
  ADD COLUMN IF NOT EXISTS phone             text,
  ADD COLUMN IF NOT EXISTS last_contact_at   timestamptz;

DROP POLICY IF EXISTS "users own their contacts" ON contacts;
CREATE POLICY "contacts: owner all" ON contacts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- role_contacts (replaces application_contacts)
DROP TABLE IF EXISTS application_contacts;
CREATE TABLE IF NOT EXISTS role_contacts (
  role_id         uuid REFERENCES roles(id) ON DELETE CASCADE,
  contact_id      uuid REFERENCES contacts(id) ON DELETE CASCADE,
  role_in_process text CHECK (role_in_process IN ('recruiter','hiring_manager','interviewer','reference','other')),
  PRIMARY KEY (role_id, contact_id)
);
ALTER TABLE role_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_contacts: owner all" ON role_contacts FOR ALL
  USING (EXISTS (SELECT 1 FROM roles r WHERE r.id = role_id AND r.user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- 4. MEETINGS (new first-class entity)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meetings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id             uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  type                text NOT NULL CHECK (type IN (
                        'phone_screen', 'technical', 'system_design', 'behavioural',
                        'onsite', 'take_home', 'offer_call', 'reference_check',
                        'coffee_chat', 'other'
                      )),
  round_number        integer,
  scheduled_at        timestamptz NOT NULL,
  duration_minutes    integer,
  format              text CHECK (format IN ('video', 'phone', 'in_person', 'async')),
  platform            text,
  location            text,
  prep_notes          text,
  questions_to_ask    text,
  outcome             text CHECK (outcome IN ('passed', 'failed', 'unclear', 'cancelled', 'rescheduled', 'pending')),
  outcome_notes       text,
  follow_up_sent_at   timestamptz,
  calendar_event_id   text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_meetings_role    ON meetings(role_id, scheduled_at);
CREATE INDEX idx_meetings_user    ON meetings(user_id, scheduled_at);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meetings: owner all" ON meetings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_meetings_updated_at
  BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- meeting_contacts
CREATE TABLE IF NOT EXISTS meeting_contacts (
  meeting_id    uuid REFERENCES meetings(id) ON DELETE CASCADE,
  contact_id    uuid REFERENCES contacts(id) ON DELETE CASCADE,
  role          text CHECK (role IN ('interviewer', 'panel', 'shadow', 'recruiter', 'other')),
  PRIMARY KEY (meeting_id, contact_id)
);
ALTER TABLE meeting_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meeting_contacts: owner all" ON meeting_contacts FOR ALL
  USING (EXISTS (SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- 5. OFFERS (structured comp data)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id             uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  base_salary         integer,
  currency            text NOT NULL DEFAULT 'USD',
  signing_bonus       integer,
  target_bonus_pct    numeric(5,2),
  equity_amount       integer,
  equity_type         text CHECK (equity_type IN ('rsu', 'options', 'phantom', 'none')),
  equity_vesting_years integer,
  equity_cliff_months integer,
  equity_strike_price numeric(12,4),
  pto_days            integer,
  remote_type         text CHECK (remote_type IN ('remote', 'hybrid', 'onsite')),
  start_date          date,
  expiry_date         date,
  status              text NOT NULL DEFAULT 'pending' CHECK (status IN (
                        'pending', 'accepted', 'declined', 'expired', 'rescinded'
                      )),
  declined_reason     text CHECK (declined_reason IN (
                        'comp', 'role_fit', 'company', 'counter_offer', 'other'
                      )),
  notes               text,
  document_id         uuid REFERENCES documents(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_offers_role ON offers(role_id);
CREATE INDEX idx_offers_user ON offers(user_id);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offers: owner all" ON offers FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_offers_updated_at
  BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 6. RESUMES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  document_id  uuid REFERENCES documents(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resumes: owner all" ON resumes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS role_resumes (
  role_id    uuid REFERENCES roles(id) ON DELETE CASCADE,
  resume_id  uuid REFERENCES resumes(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, resume_id)
);
ALTER TABLE role_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_resumes: owner all" ON role_resumes FOR ALL
  USING (EXISTS (SELECT 1 FROM roles r WHERE r.id = role_id AND r.user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────
-- 7. UPDATE DOCUMENTS TABLE
-- ─────────────────────────────────────────────────────────────
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS meeting_id        uuid REFERENCES meetings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS offer_id          uuid REFERENCES offers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS suggested_action  text CHECK (suggested_action IN (
    'create_meeting', 'advance_stage', 'create_offer',
    'mark_rejected', 'create_role', 'none'
  )),
  ADD COLUMN IF NOT EXISTS action_taken      boolean NOT NULL DEFAULT false;

-- Extend doc_type enum
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_doc_type_check;
ALTER TABLE documents ADD CONSTRAINT documents_doc_type_check CHECK (doc_type IN (
  'offer_letter', 'rejection_email', 'interview_confirmation',
  'nda', 'screening_email', 'assessment', 'reference_request',
  'application_confirmation', 'resume', 'cover_letter',
  'prep_doc', 'comp_sheet', 'linkedin_message', 'other', 'unknown'
));

-- ─────────────────────────────────────────────────────────────
-- 8. ENABLE REALTIME ON NEW TABLES
-- ─────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE offers;
