# Interview Journey — Changelog

## [0.3.0] — 2026-04-10

### Added
- **Client-side image compression** — screenshots compressed to 800px wide, JPEG 60% quality before upload. Typical 2MB screenshot → ~80KB. Zero extra cost.
- **Company detail page** (`/companies/[id]`) — four tabs: Roles (all pursuits at this company with mini timelines), Documents (grouped by role), People (recruiters, HMs, interviewers), Notes (saved to DB)
- **Companies list page** (`/companies`) — all companies with status (Active / Alumni / Previously applied), times applied, last activity
- **Clickable company labels on career timeline** → navigate to company detail page
- **Meetings tab on role detail page** — schedule interviews/screens, add prep notes, questions to ask, record outcome. First-class meeting entity not just a timeline event.
- **Add meeting form** — type, date/time, duration, format (video/phone/in-person), platform, prep notes, questions
- **Offer comparison page** (`/offers`) — pending offers side by side with total cash comp calculation (base + signing), equity breakdown, accept/decline actions
- **Ghosting alerts on dashboard** — surfaces roles with no contact in 14+ days and offers expiring within 3 days, with one-click "follow up sent" button
- **Analytics page** (`/analytics`) — application funnel with conversion rates, response rate vs 3-5% benchmark, source performance table (referral vs LinkedIn vs cold apply), ghost rate
- **Email forward parsing** (`/api/email/inbound`) — POST endpoint accepting Postmark inbound webhooks. Forward job emails to `parse+{userId}@interviewjourney.app`, auto-classify and update roles
- **Email forwarding address in Settings** — shows user's personal forwarding address with copy button
- **Follow-up action** — marks `last_contact_at`, creates `follow_up_sent` role event
- Sidebar: added Companies, Offers, Analytics nav items

---

## [0.2.0] — 2026-04-09

### Changed
- **Renamed `applications` → `roles`** across entire codebase (DB, types, routes, components)
- **Renamed `timeline_events` → `role_events`** with updated `role_id` column
- Updated stage arc: `exploring → applied → screening → interviewing → offer → negotiating → resolved`
- Added `resolution` field to roles: `hired | rejected | withdrew | offer_declined | ghosted | on_hold`
- Demo user upgraded to Pro tier

### Added
- `meetings` table — first-class entity for interviews, screens, calls
- `offers` table — structured comp data (base, equity, signing, PTO, start date)
- `contacts` table — people you encounter (recruiters, HMs, interviewers)
- `role_contacts`, `meeting_contacts`, `role_resumes` join tables
- `resumes` table — track which resume version was used per role
- Routes: `/roles` and `/roles/[id]` (replaces `/applications`)

---

## [0.1.0] — 2026-04-06

### Added
- Initial MVP launch
- Next.js 16 App Router on Vercel
- Supabase auth (email/password), PostgreSQL schema, Storage bucket
- Global drag-and-drop document upload with AI classification (Gemini 2.0 Flash via OpenRouter)
- Supabase Realtime live classification status updates
- Kanban pipeline board with @dnd-kit drag-and-drop
- Per-role application timeline
- Career timeline view (Pro)
- Floating hub: career chatbot, analytics, changelog
- Stripe Free/Pro tiers ($15/mo)
- Demo account with seeded data (5 companies: Stripe offer, Anthropic/Vercel interviewing, Notion screening, Figma rejected)
- GitHub repo: https://github.com/jpwilson/interview-journey
- Live: https://interview-journey.vercel.app
