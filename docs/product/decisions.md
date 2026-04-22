# Product decisions (pinned)

> Every entry is a commitment. If it needs to change, edit here first — don't
> quietly drift. When we disagree with an old entry, replace it (with reason
> in the `Changed` block) rather than deleting.
>
> Source for most of these: `docs/research/launch-brief.md`.

---

## D-001 · Target persona

**Decision:** Primary persona is the **employed professional who is open to better opportunities** — not the active job-seeker. Active seekers are a subset we serve in `active` mode.

**Why:** 87% of employees say they're open to new opportunities; only 38% plan to actively search in H1 2026 (Robert Half survey). Every competitor fights for the 38%. Only OpenJobRadar touches the 87%, and it does one thin thing.

**How to apply:** Dashboard copy, onboarding flow, empty states, and retention loops default to the "employed-open" persona. Active-seeker surfaces (kanban, daily digest) are a mode, not the whole product.

---

## D-002 · Positioning

**Decision:** "A career companion, not a job-search tracker." Public slogan: **"Keep receipts for your whole career."** Elevator pitch: *Strava for your career.*

**Why:** Positions the product continuously (vs. episodically useful during a search), creates natural lock-in (multi-year data accumulation), and differentiates from Huntr/Teal/Simplify who all pitch as "job tracker."

**How to apply:** Landing copy leads with this. The product doesn't call itself a "CRM" or a "tracker" in first-person copy. Internally: dashboard answers "who am I?" not "what's in my pipeline?"

---

## D-003 · Pricing model

**Decision:** Free tier is **unlimited** in the organizing layer (roles, timeline, pipeline). Pro paywalls the **intelligence layer** (AI classifications, doc storage limits, exports, share-links).

- Free: unlimited active roles, unlimited career timeline, 30 AI classifications/month, 100 documents total storage.
- Pro: **$19/mo monthly · $144/year ($12/mo effective)** — unlimited AI, unlimited storage, export, share-links, priority AI, monthly market pulse.
- Launch: **$99 founding-member lifetime**, capped at first 500 signups.

**Why:** Teal does 10× Huntr's revenue ($52.9M vs $1M ARR) by making the tracker free and monetizing the intelligence layer. A $12/mo monthly price reads as "cheap/lesser product" against Huntr $40 and Teal $29; a $19 anchor with $12 annual reads as "smart to commit." JibberJobber proves the lifetime segment converts.

**Changed:** Previously $12/mo flat + Free capped at 10 active roles (2026-04-21). Data from launch-brief convinced us the 10-role cap punishes the passive-open persona and the flat $12 reads as budget.

**How to apply:** Pricing page shows Free first, Pro second, founding-member drop with a countdown. Stripe configured with three SKUs. Don't launch a "Career" tier or "Pay-when-hired" — they've been considered and rejected.

---

## D-004 · IA (information architecture)

**Decision:** Sidebar order is `Dashboard · Pipeline · Companies · Career Timeline · Offers · Analytics · Documents (with nested drop zone) · — · Archive · Settings`. **Offers is conditional** — hidden unless the user has ≥1 active offer.

**Why:** Dashboard is the answer to "who am I." Pipeline is the working surface. Offers is high-signal but low-volume — hide the nav item when empty so it doesn't read as "you have nothing." Archive belongs in the secondary nav.

**How to apply:** Implemented in `src/components/AppSidebar.tsx`. The drop-zone is nested as a child of Documents so drops are always one tap away, from any page.

---

## D-005 · Employment is separate from Roles

**Decision:** A user's **current employer** is stored on `profiles` (`current_employer_id`, `current_title`, `employment_start_date`). The `roles` table remains for the job-search pipeline. "Hired" outcomes on a role do NOT automatically mutate the profile — that's a user action.

**Why:** An application is a process (it has a stage, events, documents). An employment is a state (it persists, has tenure). They share a company but are different objects. Merging them makes the schema dirty and the dashboard confusing.

**How to apply:** Onboarding modal asks for current employer up front. Settings lets users edit. When a role resolves as `hired`, offer the user a one-tap "make this my current employer" button — but don't do it automatically.

**Follow-up:** A separate `employments` table is cleaner but not launch-critical. Migrate within 30 days.

---

## D-006 · Search status is a first-class field

**Decision:** Every user has a `search_status` of `happy | open | active`. Default: `open`. Drives dashboard behavior, email frequency, and empty-state copy.

**Why:** Three-state is the minimum that matches reality. "Open to better" is the retention unlock — it gives a reason to log one thing per quarter without demanding full-time engagement. Binary fails the 87%.

**How to apply:**
- `happy` users get a quarterly market-pulse email. Dashboard deprioritizes the pipeline section (collapsed by default). Empty states pitch "keep receipts."
- `open` users get a monthly digest. Dashboard balances career + pipeline.
- `active` users get daily digest. Dashboard leads with the pipeline and hot cards.

---

## D-007 · Doc-routing confidence threshold

**Decision:** Documents route automatically at **≥85% AI confidence**. Below that → "Needs review" queue where the user confirms the routing.

**Why:** Too eager at 70% = wrong roles and frustration. Too strict at 95% = user drowns in review work. 85% is the Goldilocks number the design handoff calls out; we'll tune based on per-user accuracy.

**How to apply:** Configured per-user in `profiles.prefs.docConfidenceThreshold`. Default 85. Surfaced in Settings > Document parsing.

---

## D-008 · Silent auto-close at 30 days

**Decision:** Applications (stage `applied` or `exploring`) with no contact for 30+ days auto-transition to a `silent` sub-state. They are **not deleted**, remain searchable in Archive, and are not surfaced on Today.

**Why:** Users don't want to manually close out cold leads. The psychological pain of "did I apply to this?" is real. Silent-not-deleted preserves the receipt without adding to the morning-coffee noise.

**How to apply:** Configurable via `profiles.prefs.autoCloseDays` (default 30). Runs as a cron job on Vercel or a Supabase trigger. Surfaces on the Pipeline page as a `silent` stage filter.

---

## D-009 · Funnel default window

**Decision:** Dashboard funnel block defaults to **90 days**. User can toggle 30 / 90 / 180 / all-time. Choice persists per-user.

**Why:** 90 days captures a real job search without being so long that stale data dominates. Short enough to see week-over-week movement.

**How to apply:** `profiles.prefs.funnelRange`. Default `90d`. Component is `src/components/dashboard/FunnelBlock.tsx`.

---

## D-010 · The doc-drop inbox is the growth loop

**Decision:** `track@interviewjourney.app` is our Simplify-extension equivalent. Users forward any job email to that address; AI classifies and files it. If sender is unknown → sign them up using the recipient email as intent signal.

**Why:** Every forward chain hits colleagues and friends who ask "wait, how did that auto-file?" That's a native referral surface nobody in this category has built. Cheaper to run than autofill (no browser automation).

**How to apply:** Ship in launch week. Use Postmark or Resend inbound, webhook to existing `/api/documents/classify` endpoint. Reply to every forward with "Added to your pipeline" + a view link.

**Status:** Not yet built. Scheduled for the launch-runbook day-1 must-ship list.

---

## Roadmap

### v1 — launch
- StatusBar + dashboard ("Today") redesign ✅
- Profile migration (employment + search status) ✅
- Updated sidebar IA ✅
- Moss token set aligned with handoff ✅
- `track@` email magic-moment (pending)
- $99 lifetime tier in Stripe (pending)
- Onboarding modal (pending)

### v1.1 — week 1-2
- Pipeline table view (replaces kanban as primary; kanban archived at `/pipeline/board`)
- Document Drop 3-step flow (`/documents/drop`)
- Silent auto-close cron
- Public share-link ("share your timeline")

### v2 — month 2-3
- `employments` table migration
- Monthly market-pulse email
- Analytics page (only visible after N applications)
- Mentor mode for career coaches
- Job-offer share cards
