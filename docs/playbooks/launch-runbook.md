# Launch runbook

> Day-1 launch is 90 minutes of posting + DMs. This doc is the exact script.
> Open it when you're ready to go. Each block has copy you can paste.
>
> Source strategy: `docs/research/launch-brief.md` · decisions: `docs/product/decisions.md`

---

## Pre-launch checklist (24 hours before)

**Product**
- [ ] `/dashboard` shows the StatusBar for the logged-in user
- [ ] Career timeline renders (at least the current employer)
- [ ] Funnel block shows real numbers for the demo user
- [ ] `/pipeline` renders without errors (kanban fallback OK)
- [ ] `/documents` upload + classify round-trips (test with one real PDF)
- [ ] Signup → onboarding → dashboard works end-to-end with a fresh email
- [ ] Google OAuth redirect URL matches `https://interview-journey.vercel.app/auth/callback`
- [ ] Password reset email arrives (check spam)

**Pricing**
- [ ] Free tier has NO 10-role cap
- [ ] Pro: $19/mo + $144/year (annual toggle visible)
- [ ] $99 lifetime founding-member tier live, with visible counter "X of 500"
- [ ] Stripe test: all three SKUs complete checkout in test mode
- [ ] Webhook: lifetime purchase marks `subscriptions.tier = pro` permanently

**Infrastructure**
- [ ] OpenRouter key present in Vercel production env (test a real classification)
- [ ] Email sending works (signup confirm + password reset + weekly digest drafts)
- [ ] `track@interviewjourney.app` webhook wired (Postmark/Resend inbound → `/api/email/inbound`)
- [ ] Error page exists for 404 and 500 (don't ship the Next default)

**Content**
- [ ] Landing page copy final
- [ ] Blog post live: **"The job-search stack I wish I'd had"** (see outline §4)
- [ ] Notion template public with "upgrade to app" CTA (see §5)
- [ ] Timeline GIF captured (60 seconds of building + doc-drop animation)
- [ ] Screen-recording for LinkedIn (60s max, captioned)

---

## The 90-minute launch sequence

**Start at 7:00 AM US-Pacific (= 10:00 AM Eastern). Tuesday, Wednesday, or Thursday only.**

### T+0 · Post to your own LinkedIn

```
I spent my last job search filing rejection emails into a Notion doc.

This time I built what I wish I'd had.

Interview Journey — a companion for the hardest chapter of your career.

Drop any document — offer, NDA, rejection email, screenshot — and AI files
it to the right role. See your whole career on one timeline. Works whether
you're actively looking or just keeping receipts for later.

Launching today. First 500 get lifetime access for $99.

Link in comments.
```

**First comment (where the link goes):** `interview-journey.vercel.app · founder here, happy to answer anything.`

**Image:** 60-second screen recording of the dashboard + timeline + doc-drop demo. 16:9, captioned (LinkedIn auto-plays muted).

---

### T+10 · Show HN

**URL:** `https://news.ycombinator.com/submit`

**Title:** `Show HN: Interview Journey – a personal CRM for your whole career`

**URL field:** `https://interview-journey.vercel.app`

**Text field (description):**

```
Hey HN — I built this after my last job search collapsed into a Notion doc
I stopped updating at application #37.

Interview Journey is a career CRM. Three core things:

1. Drop any document — recruiter email, offer PDF, NDA, rejection — and
   Gemini classifies it and files it to the right role, at the right
   stage. Drop zone is persistent, every page.
2. A career timeline that spans your whole career. Past employers,
   applications, offers you declined, all on one horizontal axis.
3. A dashboard built for the 87% of professionals who are open to new
   opportunities without actively searching — not just the 38% actively
   applying.

Free tier is unlimited (no per-role cap). Pro is $19/mo or $144/year for
unlimited AI classifications + exports. First 500 signups get lifetime
access for $99.

Built on Next.js 16 + Supabase + OpenRouter (Gemini 2.0 Flash) + Vercel
AI SDK v6.

Would love feedback on the doc-drop UX specifically — it's the thing I'm
most excited about and least sure is doing what I want.
```

**What to do after submitting:** Don't upvote yourself. Refresh /newest to confirm it's there. Reply to every comment in the first 2 hours. If you hit front page, expect 2-10k visits.

---

### T+20 · r/SideProject

**URL:** `https://www.reddit.com/r/SideProject/submit`

**Title:** `I built Interview Journey: drop any job email, AI files it to the right role. First 500 get $99 lifetime.`

**Text:**

```
Solo founder, just launched. Here's the short version:

**Problem:** every job-tracker (Huntr, Teal, spreadsheets, Notion templates)
collapses when you hit ~30 applications. Manual entry kills you.

**My solution:** drop ANY document into it — email, PDF, screenshot — and
AI classifies it into the right role + stage. Offer letter lands on the
Stripe row, NDA lands as an attachment, rejection auto-closes the role.

**Who it's for:** job-searchers, yes, but also the 87% of employees who
just want to keep career receipts without treating it like a second job.

**Tech:** Next.js 16 + Supabase + Gemini 2.0 Flash via OpenRouter.

**Pricing:** Free unlimited tracker (no per-role cap). Pro $19/mo. First
500 signups get $99 lifetime.

Demo: [link]
Feedback welcome, especially on the doc-drop flow.
```

---

### T+30 · Post on IndieHackers

**URL:** `https://www.indiehackers.com/new`

Frame for founder audience. Lead with the tech stack + the pricing reasoning. Same content as r/SideProject but reframe: "Teal does 10× Huntr's revenue by making the tracker free. I copied that insight." Founders love contrarian pricing stories.

---

### T+45 · BetaList submission

**URL:** `https://betalist.com/submit`

Fill the form. It processes in 2-4 weeks; submit today so it lands mid-month-2. Expect 200-500 visitors when featured.

Fields:
- Name: `Interview Journey`
- URL: `https://interview-journey.vercel.app`
- Tagline: `A career companion, not a job-search tracker. Drop any document — AI files it.`
- Description: paste the Show HN text above, trimmed.

---

### T+60 · r/cscareerquestions Friday thread (only if Friday)

**If NOT Friday, skip this block.**

Find the pinned "What Are You Working On Friday" thread. Comment (don't post):

```
Built Interview Journey — a career CRM with AI document classification.
Big wedge: drop any email / offer / NDA / rejection and it files itself
to the right role. Career timeline view spans your whole career, not just
the current search.

Free tier is actually unlimited. Pro is $19/mo; launching with $99
lifetime for first 500. Would love feedback.

https://interview-journey.vercel.app
```

Don't post a direct submission to r/cscareerquestions — it will be removed.

---

### T+75 · DM 20 LinkedIn creators

**Target tier:** 20-100k followers. Austin-Belcak-sized, not Erin-McGoff-sized (she ignores cold DMs without budget).

**Template:**

```
Hey [name] —

Saw your [specific recent post — rotate per creator]. Loved the take on
[specific point].

Quick ask: I just launched Interview Journey, a career companion built
for people like your audience — not the frantic job-seeker, the
thoughtful-professional-keeping-receipts kind. Drop any document, AI
files it. Timeline spans your whole career.

Giving you free lifetime Pro + a personalized share-link timeline you
can show your audience if you want. No ask beyond "share if it
resonates" — if not, no worries.

[your share link, generated from your own demo account]

— [your name]
```

**20 names to DM (from launch-brief.md §5):**

1. Austin Belcak (LinkedIn)
2. Jennifer Tardy (LinkedIn)
3. Jasmin Alić (LinkedIn)
4. Liz Ryan (LinkedIn)
5. JT O'Donnell (LinkedIn + X)
6. Anna Papalia (LinkedIn) — larger, may ignore
7. Kathy Caprino (LinkedIn) — larger, may ignore
8. Ashley Stahl (X)
9. Corporate Natalie (X)
10. Adam Grant (X) — he's 4M+, will ignore cold, skip unless mutual
11-20. Search LinkedIn for `#jobsearch 20K..100K followers` — pull the active ones posting weekly.

**Expected:** 3 replies, 1-2 actual posts. 100-200k impressions.

---

### T+90 · Tweet + link to the blog post

```
Show HN is live.

Built Interview Journey — a personal CRM for your whole career. Drop any
job email or PDF, AI files it.

Here's why the employed-but-open market (87% of employees) is 15× bigger
than the active-search market (38%) — and why nobody's building for it:

[link to blog post]
```

Link goes to the pre-written blog post (see §4).

---

## §4 · Blog post: "The job-search stack I wish I'd had"

**URL:** `interview-journey.vercel.app/blog/the-job-search-stack-i-wish-id-had`

### Outline

1. **Hook** — personal story. "I stopped updating my Notion at application 37."
2. **The five tools people actually use** — with honest ratings:
   - **Spreadsheets** — collapse at 30 applications. Cite Reztune data.
   - **Notion templates** — better UI, same manual-entry death spiral.
   - **Huntr** — kanban + Chrome clipping. $40/mo. Rennie Haylock built it alone; great product, bootcamp-funded.
   - **Teal** — free tracker, $29/mo for resume AI. $52.9M revenue in 2025 by monetizing resumes, not tracking.
   - **Simplify.jobs** — killer autofill extension. 1M installs. Tracker is an afterthought.
3. **What I wanted instead** — three things:
   - Drop any document, AI files it. No forms.
   - My whole career on one axis. Not just this search.
   - Works whether I'm actively looking or just keeping receipts.
4. **What I built** — 3-paragraph product description + screenshots.
5. **Honest comparison table** — Huntr / Teal / Simplify / Spreadsheet / Interview Journey, 6 rows, Interview Journey loses on 2 (no autofill, new/no track record) and wins on 3 (doc classification, career timeline, employed-open persona).
6. **Pricing** — launching with $99 lifetime for first 500. Pricing rationale: Teal's lesson.
7. **CTA** — "Try the free tier — no credit card. Or grab the lifetime before 500 spots go."

Length: 1200-1800 words. Target a reader who's 6 months into a search and losing faith.

---

## §5 · Notion template

**URL on launch:** public Notion page at `notion.so/interviewjourney/tracker`.

Structure:
- Kanban view (stages: Exploring → Applied → Screening → Interviewing → Offer → Resolved)
- Table view (all fields)
- One "outgrow this? → upgrade to the app" banner at the top with a link + 10% off Pro for 3 months.

Why this matters: "notion job tracker template" is 3-6K searches/mo and competitors missed it. Good organic traffic source with a direct upgrade path.

---

## §6 · Post-launch day 2-7

**Day 2 (Wednesday):**
- Reply to all HN / Reddit / LinkedIn comments from day 1. Target: every comment gets a reply within 4 hours.
- Tweet a thread of 3-5 lessons from launch day.

**Day 3 (Thursday):**
- Post on r/ExperiencedDevs with a different angle: "How I'd track a job search as a Staff engineer (Notion template + app)"
- Check analytics: signups, activation (docs dropped or past employers added), Pro conversion.

**Day 4 (Friday):**
- r/cscareerquestions Friday thread (if you missed it day 1).
- Send the weekly digest to the first batch of signups.
- Fix the #1 bug reported so far.

**Day 5-6 (weekend):**
- Write the ProductHunt launch page. Schedule for next Tuesday.
- Personal outreach to 10 career coaches offering affiliate (15% recurring).
- Ship one requested feature (pick by votes).

**Day 7 (Monday):**
- Activation retrospective: % of signups who dropped a doc OR added a past employer. Target >30%. If below, fix onboarding before more acquisition spend.
- Email every signup with a personal note from founder. This works better than you think.

---

## §7 · Metrics to watch

Daily for the first week:

| Metric | Target (conservative) | Target (ambitious) |
|---|---|---|
| Total signups | 300 | 1,000 |
| Activation rate (doc dropped OR past employer added) | 30% | 50% |
| Pro conversions | 15 | 50 |
| Lifetime sales | 20 | 100 |
| Revenue week 1 | $2,500 | $10,000 |
| Press mentions | 0 | 2-3 |

**The one metric I'd protect obsessively:** activation rate. If <30%, the product isn't demonstrating value in the first 10 minutes. Don't spend on acquisition until it's above 40%.

---

## §8 · What to do if it goes sideways

**"HN flamed it"** → Read every comment, pick the three most valid criticisms, fix one within 48 hours, tweet the fix with credit to the commenter. HN respects velocity.

**"No one clicked"** → You probably led with features instead of pain. Rewrite the landing hero to lead with "I stopped updating my Notion at application 37" instead of "A career companion."

**"Signups but no activation"** → Onboarding is too long or the empty-state dashboard is too confusing. Rip out anything that's not the drop zone + the timeline on first login.

**"Stripe checkout broken"** → Disable the lifetime tier immediately and post a visible banner. Don't try to retroactively honor pricing if you discover a bug — announce the issue, offer refunds, fix it.

**"Viral on TikTok"** → Unlikely but possible. If it happens: upgrade Supabase plan, turn on rate-limiting on `/api/documents/classify`, have a credit-card ready for OpenRouter spikes. Don't panic; let the wave run.
