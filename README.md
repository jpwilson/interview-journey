# Interview Journey

> Your employment lifetime, organised. Track every application, interview, and career milestone.

**Live demo:** [interview.46-225-235-124.sslip.io](https://interview.46-225-235-124.sslip.io)

> _Hosted on [Hetzner Cloud](https://www.hetzner.com/cloud) (ARM CAX21, Nuremberg) via [Coolify](https://coolify.io), with self-hosted Supabase on the same box. Migrated off Vercel + Supabase Cloud (prior URL: `interview-journey.vercel.app`) to cut demo hosting costs._

---

## Quick Start

```bash
git clone <repo>
cd interview-journey
cp .env.example .env.local
# fill in env vars (see Environment Variables below)
npm install
npm run dev
```

---

## Architecture

```
Browser (Next.js 16 App Router on Vercel)
  ├── Supabase Auth (email + Google OAuth)
  ├── Supabase Realtime (live classification status)
  ├── Supabase Storage (document files)
  ├── Direct Supabase DB (server components + server actions)
  ├── /api/documents/classify  →  OpenRouter (Gemini 2.0 Flash)  →  Langfuse
  ├── /api/stripe/create-checkout  →  Stripe Checkout
  └── /api/webhooks/stripe  →  subscription tier sync
```

## Technology Stack

| Tech | Purpose | Why |
|------|---------|-----|
| Next.js 16 (App Router) | Frontend + backend | Server components, server actions, proxy.ts auth |
| Supabase | Auth, PostgreSQL, Storage, Realtime | All-in-one, RLS, realtime subscriptions |
| Vercel AI SDK v6 + OpenRouter | AI classification | `generateObject` with Zod schema validation |
| Gemini 2.0 Flash (via OpenRouter) | Document parsing | Natively multimodal, handles PDFs and images |
| @dnd-kit | Kanban drag-and-drop | Best-maintained, accessible |
| react-dropzone | OS file drop | Separate from UI DnD |
| Stripe | Payments | Hosted checkout, webhook tier sync |
| Langfuse | AI tracing | Token costs, latency, model observability |
| Vitest | Unit tests | Fast, compatible with Node 20+ |
| Playwright | E2E tests | Auth flows, navigation |

## Key Features

- **Drop anything, anywhere** — drag a file from your desktop anywhere in the app. AI reads it (offer letter, rejection email, NDA, screenshot) and routes it automatically
- **Kanban pipeline** — all applications in a drag-and-drop stage board
- **Application timeline** — per-company event log (screening, interviews, offers, documents)
- **Career timeline** — all companies on one axis (Pro tier)
- **Floating hub** — career chatbot, analytics stats, changelog
- **Realtime feedback** — Supabase Realtime shows classification progress live

## Tiers

| Feature | Free | Pro ($12/mo) |
|---------|------|-------------|
| Active applications | 10 | Unlimited |
| Document uploads | 25 total | Unlimited |
| AI classifications/month | 20 | Unlimited |
| Career timeline | No | Yes |
| Multi-company view | No | Yes |
| Export | No | Yes |

## Database

Run the migration to set up Supabase:
```bash
supabase db push  # or paste supabase/migrations/001_initial_schema.sql into SQL editor
```

Tables: `profiles`, `subscriptions`, `companies`, `applications`, `timeline_events`, `documents`, `analytics_events`

RLS enabled on every table. Storage bucket: `documents` (private, path = `{user_id}/{doc_id}/{filename}`).

## Environment Variables

See `.env.example`. Required:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_WEBHOOK_SECRET` + `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
- `LANGFUSE_PUBLIC_KEY` + `LANGFUSE_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL`

## Testing

```bash
npm run test           # unit tests (28 cases)
npm run test:coverage  # with coverage report
npm run e2e            # Playwright E2E (requires running dev server)
```

## CI/CD

GitHub Actions runs on every PR: format check, lint, type-check, unit tests, build, E2E.
Vercel auto-deploys from `main`. Connect repo in Vercel dashboard, add env vars via `vercel env`.

## Project Structure

```
src/
  app/
    (marketing)/     # landing page, pricing
    (auth)/          # login, signup, callback
    (app)/           # dashboard, pipeline, applications, timeline, documents, settings
    api/             # classify, stripe, hub chat
  components/
    pipeline/        # KanbanBoard, KanbanColumn, ApplicationCard
    timeline/        # ApplicationTimeline, CareerTimeline, AddEventForm
    documents/       # DocumentVault
    hub/             # FloatingHub, HubChatbot, HubAnalytics, HubChangelog
    providers/       # QueryProvider, DropZoneProvider
  lib/
    supabase/        # client.ts, server.ts, types.ts
    ai/              # classify.ts, prompts.ts
    actions/         # server actions
    limits.ts        # tier enforcement
supabase/
  migrations/        # 001_initial_schema.sql
e2e/                 # Playwright specs
```
