# Interview Journey — Launch Brief

> What to build, what to call it, and how to get our first 1,000 users.
> Drafted April 21, 2026 for a ~1-day-to-launch timeline.

---

## TL;DR

1. **Reposition from "job-search tracker" to "career companion."** Serve the 87% of employees who are open to opportunities, not just the 38% actively searching. Every competitor (Huntr, Teal, Simplify, Careerflow) fights for the active seeker; only OpenJobRadar touches the passive-open segment, and they do one thin thing. This is the single highest-leverage decision in the brief.
2. **Learn from Teal, not Huntr.** Teal does 10× Huntr's revenue ($52.9M vs ~$1M ARR) by making the tracker *free* and monetizing the intelligence layer (resume AI). Our equivalent: free unlimited tracker + free timeline, paid = unlimited document classification. **Remove the 10-active-role cap from Free.** It's the single most important pricing change.
3. **Launch with a capped $99 lifetime founding-member offer.** First 500 signups only. Puts ~$50k of committed revenue on the table in week 1, works as a Show HN / ProductHunt wedge far better than "$12/mo," and caps itself so you don't cannibalize future ARR.
4. **Ship three things for launch**: the employment + search-status bar, the career timeline as the dashboard hero, and the document-drop inbox surfaced everywhere (not buried at `/documents`). Cut Analytics, standalone Offers nav, and the duplicate Career Timeline nav item.
5. **Get first 500 users from three channels in week 1**: (a) Show HN post anchored on the timeline visual + the lifetime drop, (b) value-first Reddit placements in r/cscareerquestions and r/ExperiencedDevs with a Notion-template giveaway that converts, (c) DMs to ~20 LinkedIn "career voice" creators offering founding-member lifetime + a share-link demo.

The rest of this doc defends those five claims and hands you a 7-day and 30-day playbook.

---

## 1. Market, reframed

### The "employed but open" market is 15× the active market

Current product framing targets active job-seekers. That's a shrinking market in a crowded category. The larger and more defensible market is the passive-open employed professional.

Hard numbers from April 2026 data:

- **38% of US workers plan to look for a new job in H1 2026** — Robert Half, Dec 2025 survey. That's the *active* group.
- **87% of employees are open to new opportunities** regardless of whether they're actively looking — Rally Recruitment Marketing, 2025.
- **70% of the global workforce** is classified as passive candidates by ERE. Workable's US figure is 37.3% passively open, which combined with the 42% actively open puts total "would consider" near 80%.
- **220 million people have LinkedIn's "Open to Work" feature enabled.** LinkedIn serves this market; nobody else does.
- **58% of job seekers say finding work will be harder in 2026.** The pain is at a generational high.

The implication is not "also serve employed people." The implication is: **the employed-open person is the primary persona**, and the active seeker is a subset who happens to be in a particularly hot phase.

### What this does to the product

Everything that assumes the user is frantically chasing offers breaks. The active-search pipeline becomes *one mode* of the app, not *the* app. The things that don't change:
- Document classification stays the killer feature — recruiter DMs and exploratory emails need filing whether you're actively searching or not.
- The timeline stays the emotional hook — it's even more powerful for a 10-year-career professional than a 3-month job hunter.

The things that do change:
- The dashboard leads with "who you are" (current employer + tenure + search status), not "what's in your pipeline."
- Empty states assume most users won't have active roles. They pitch value for that state instead of nagging.
- The product pulls you back every 4-6 weeks for a "market pulse," not every day for "what's next."

---

## 2. Positioning

### The slogan test

| Version | Reads like |
|---|---|
| "The CRM for your job search" (current copy on some surfaces) | Salesforce for candidates. Admin. |
| "A quiet place for the hardest chapter of your career" (v2 landing) | Companion. Journal. |
| **"Keep receipts for your whole career."** (proposed one-liner) | Own your story. For life. |

The landing page copy is already on the emotional track. The product chrome isn't. Align them.

### Category

There is no established category for this. A few adjacent reference points:

- **Personal CRMs** (Clay, Folk, Dex, Monica) — $35M raised by Monaco in 2026, real category. *Tracking your relationships.* Interview Journey is the same idea for your **career**.
- **Second-brain / PKM** (Readwise, Craft, Obsidian) — editorial, companion-feeling products with high willingness-to-pay.
- **Running/habit trackers** (Strava, Whoop) — the "receipts for a hard thing" metaphor. People pay indefinitely for receipts they can look back on.

I'd pitch to investors and users as: **"Strava for your career."** Short. Memorable. Makes the timeline make sense. Makes the retention case ("you don't delete your Strava when you finish a race") self-evident.

### What this is NOT

Do not let this drift toward any of these. They're all bigger markets you can't win:
- Resume builder (Teal, Rezi own it)
- Auto-apply / application blaster (Simplify.jobs owns it, and it's a race to the bottom)
- Recruiter CRM / ATS (huge SaaS, completely different buyer)
- Interview prep content (LeetCode / Pramp / Exponent own it)

---

## 3. Competitive landscape

### The grid

| Product | Price | Revenue / scale | Wedge | Weakness |
|---|---|---|---|---|
| **Huntr** | $40/mo · $160/6mo · free ≤40 jobs | 500K users · $1M ARR · 5-person Dubai team · ~$120K raised | Kanban + Chrome extension job-clipping + AI resume tailoring | High monthly price, AI credits don't roll over, dated templates, slow support |
| **Teal** | Tracker free, Teal+ $29/mo ($15/mo annual) | **$52.9M revenue 2025** · $19M raised (incl. $7.5M Series A Jan 2025) · acquired Ramped Dec 2025 | Free tracker, monetize resume builder + AI | Tracker is intentionally under-invested; real value gate is resume tools |
| **Simplify.jobs** | Free autofill, Simplify+ $39.99/mo | **1M+ Chrome installs** · 100M+ autofills claimed | Autofill on 100+ ATS (Workday, Greenhouse, iCIMS, Lever) | Tracker is an afterthought; autofill reliability on custom Workday is hit-or-miss |
| **Careerflow.ai** | $23.99/mo Premium · $44.99/mo Premium+ | — | All-in-one: tracker + LinkedIn optimizer + autofill + cover letters | Jack-of-all-trades; no single feature is best in class |
| **Jobscan** | $49.95/mo · $299/year | — | Resume keyword match + ATS detection | Adjacent, not direct; 3.6/5 Sitejabber rating — users say overpriced |
| **JibberJobber** | $60/yr · **$99 lifetime** | Active since 2006 | Email2Log (forward emails), unlimited contacts/companies | 2010-era UX, no AI, no modern doc handling; audience is 40+ career-changers |
| **JobShinobi / G-Track** | Free/low tier | Tiny | AI parses forwarded emails into Kanban | Email-only, no brand, no timeline — closest direct AI threat but narrow |
| **Wonsulting Premium** | $19.99/mo | Creator-led (Jerry Lee / Jonathan Javier) | Free Gmail-sync tracker bundled | Creator-reach moat; product is generic |
| **Eztrackr** | $18.99/mo · $8.99/wk | — | Kanban + Chrome extension + skill match | Competent; no differentiator |
| **LinkedIn "My Jobs"** | Free | 220M+ OpenToWork | Default zero-effort option | LinkedIn-only, no notes, no stages, no doc storage |
| **Notion / Airtable templates** | $5–$25 | Dominant by *volume* | Total customization, zero lock-in | **Most users abandon within 2 weeks** — manual upkeep kills it |
| **OpenJobRadar** | Free | Tiny | Monitors 5–15 dream-company career pages with ATS-level scraping | The only tool targeting "passively employed." No tracking/docs — it's a radar, not a CRM |
| **Kondo** | $30/mo | — | "Superhuman for LinkedIn DMs" — recruiter DM triage | Adjacent; could be integration partner |

### The five-line summary

1. **Huntr is the category name.** Reddit mindshare, but a lean 5-person shop.
2. **Teal is the real revenue leader** — $52.9M in 2025, achieved by making the tracker free and paywalling the resume/AI layer. **This is the pricing model we should study carefully** (see §7).
3. **Simplify has 1M users with almost no monetization** — a latent audience of people who've shown intent but don't have a CRM.
4. **The DIY Notion/Airtable template stack is the real incumbent by volume, and it reliably fails at ~30 applications.** That failure is our entry point.
5. **Only OpenJobRadar targets the passively-employed persona.** They do one thing (scrape company career pages), have no paid tier, and have set no price anchor. The whole "employed but open" segment has zero CRM options. This is the strategic gap.

### Whitespace — where Interview Journey can win

1. **"Drop any document and it routes itself" is genuinely unoccupied.** JobShinobi / G-Track do email parsing only. Nobody does the full-document UX where a PDF offer, a screenshot NDA, or a forwarded rejection lands on the right role/stage. It's demoable in 15 seconds. Cheaper to run than autofill (no browser automation). Harder to commoditize than a Gmail integration.
2. **The career timeline as an emotional hook is unclaimed.** Every competitor is pipeline/kanban-first. Timelines exist only in design tools (Canva, Office Timeline) and aren't job-search aware. A horizontal career narrative — past jobs, applications, interviews, offers, rejections, all on one axis — is *continuously valuable*, not just during a search. Pairs perfectly with the "employed but open" pivot.
3. **The passively-employed segment is essentially open.** OpenJobRadar monitors company pages; nothing handles recruiter inbound, offer letters, NDAs, or career receipts for this persona. Retention economics here are much better than active-seeker tools (which churn on hire). This is the defensible positioning play.
4. **Nobody treats the document as a first-class object.** Huntr/Teal/Simplify all treat documents as attachments on an application record. For someone 5 years into their career with 20 NDAs, 3 old offer letters, recruiter-DM screenshots, referral emails — *there is no single archive*. "Your career receipts" is an unmet need that creates natural switching costs over years.
5. **Pricing disruption at $12 is real.** Every AI-first modern competitor sits $19–$45/mo. Only JibberJobber ($5/mo, $99 lifetime) is lower, and it's ancient/un-AI. There's a clean gap at $9–$15/mo for a modern, AI-first, editorial-feeling tool.

### Things that surprised me in the data

- **Teal is 10× Huntr by revenue.** Reddit mindshare (Huntr) vs. revenue (Teal) diverge wildly. Monetizing something other than "rows of a kanban" is the lesson.
- **Simplify has 1M installs and barely monetizes.** If we can integrate with Simplify's export, we inherit their user base.
- **Jobscan charges $299/year for a keyword-diff tool and people pay it.** Willingness-to-pay in this space is much higher than $12/mo *when under active pressure*. The constraint isn't price — it's perceived value.
- **"Career receipts" as a phrase is claimed by wrkreceipts.com / Jayla AI** — but they're positioned for HR-dispute documentation, not career growth. We can own it for the job-search-and-growth use case before they pivot.
- **The winning emotional insight from Reddit is not "more features." It's "I gave up on tracking."** Every feature has to pass the test: *does this make users update the tracker less, or more?* Document drop: less. Kanban drag-and-drop: more. Auto-parsing emails: less. Onboarding wizards asking for current employer: more (but cheap — one-time).

---

## 4. Product direction — what to build, in what order

### The three things that make or break v1

1. **Employment + status bar (missing today; must ship for launch).**
   The first thing a user sees should be *who they are*: current employer, tenure, search status (happy / open / actively looking). Everything else on the dashboard is secondary. Without this, the employed-open persona has nothing to relate to on login.

2. **Career timeline as the dashboard hero (exists today; currently buried).**
   The landing page sells the timeline. The product barely shows it. The first pixel below the status bar on the dashboard should be a horizontal career timeline with past employers plotted, tenures rendered, and the current role extending open-ended to the right. Click any dot → drill into that employer's history. This is the emotional hook. It's also the screenshot that goes viral on LinkedIn.

3. **Doc-drop inbox (exists today; currently invisible).**
   The "drop anything" magic has to be visible on every screen, not hidden at `/documents`. A persistent drop zone (border highlight on drag), plus an Inbox view where the user sees "AI classified 3 things since yesterday — confirm?" in a scannable list. This is the wedge that pulls users back daily/weekly.

### What to cut from v1

- **Analytics page** — nobody wants funnel stats about their own job search.
- **Offers page as a separate top-level nav** — roll offers into the role detail page.
- **Share-link / public read-only timeline** — great for v2 virality (see §6), not launch.
- **Separate "Career Timeline" nav item** — it's the dashboard now. Don't duplicate.

Sidebar after the cut: *Today · Inbox · Pipeline · Roles · Documents · Coach · Settings.* Seven items. Maps cleanly to the v2 design direction already in progress.

### Data-model changes required

The smallest change that supports the positioning shift:

- Add to `profiles`: `current_employer_id` (fk → companies), `current_title`, `employment_start_date`, `search_status` (enum: `happy` | `open` | `active`).
- Keep `roles` as-is for application pipeline. A `role` that hits `resolved:hired` can optionally auto-set the three fields above via trigger.

Defer: a separate `employments` table. Cleaner model, but not launch-critical. We can migrate within 30 days without disruption.

### Onboarding (new; critical)

First-time signup must capture current employer + title + start date + search status in under 60 seconds. Otherwise the dashboard has nothing to render for employed users, and the entire pitch falls flat. A three-question modal:

1. "Where do you work now?" → company autocomplete, with `not currently employed` option.
2. "What's your title and start date?" → free text + date.
3. "How would you describe your search right now?" → three cards, not a dropdown:
   - *Happy where I am* — keeps receipts, quarterly nudge.
   - *Open to better* — logs recruiter convos, sends monthly market pulse.
   - *Actively looking* — full pipeline mode.

All three unlock the full app. The status is editable later. Default selection: **Open to better** (the biggest persona).

---

## 5. GTM — first 500 users in 7 days

### What the competition actually did

Worth stealing from — this is how Huntr, Teal, and Simplify really got their traction:

- **Huntr's real first wedge was B2B, not consumer.** Founder Rennie Haylock did **cold outbound to ~1,000 coding bootcamps** via Apollo.io, hit a **20% reply rate and 7% interested rate**, and captured **10% of that TAM**. That bootcamp revenue funded the consumer play. Huntr now has 500K users but the bootcamp contracts came first.
- **Teal was built on Bubble.io no-code** with a $5M seed. Growth is mostly organic SEO on long-tail job terms (`/resume-example/[job-title]`, `/tools/job-tracker`) + founder Dave Fano's personal LinkedIn presence.
- **Simplify's wedge was autofill, not tracking.** The Chrome extension delivered "I just saved 20 minutes on a Workday application" in one use. Referral looped through YC W21 amplification + r/cscareerquestions word-of-mouth.
- **Resume Worded** was a side-project built over 5+ years using SEO + a weekly newsletter (The Career Supplement) → **1M+ subscribers**. Patient compound play, not a launch spike.

The lesson: **the sharpest wedge is "I just saved time right now."** Our equivalent is the doc-classify magic moment — specifically, making "forward any job email to `track@interviewjourney.com`" the first interaction someone has with us.

### The launch-day sequence (90 minutes)

Based on Product Hunt 2026 benchmarks (300-600 upvotes to win the day, 150+ for top-5), and Reddit self-promo rules, **skip ProductHunt on day 1**. Schedule PH for day 8-10 after we've collected testimonials and timeline screenshots from real users. The day-1 sequence:

Minute 0: **Own LinkedIn post** with 60-second screen recording of the timeline being built + a doc being dropped and classified. Caption: "I spent my last job search filing rejection emails into a Notion doc. This time I built the thing I wish I'd had. Interview Journey — a companion for the hardest chapter of your career. Lifetime access for the first 500 · link in comments."

Minute 10: **Show HN** — "Show HN: Interview Journey — a personal CRM for your whole career." Lead with the timeline GIF. Sub-headline: "Drop any document — offer, NDA, rejection — and AI files it. Built for the 87% of professionals open to opportunities, not just the 38% actively searching." Mention lifetime pricing in the comment, not the headline.

Minute 20: **r/SideProject** — "I built Interview Journey: drop any job email, AI files it to the right role. First 500 get lifetime access for $99." Self-promo welcome here.

Minute 30: **r/indiehackers** on the IndieHackers site — same post, framed for the founder audience (tech stack: Next + Supabase + OpenRouter; pricing reasoning; first-500 lifetime deal).

Minute 45: **BetaList submission** — they process in 2-4 weeks, but submit today so it lands mid-month-2. Historical conversion: $0.50-$1.40 CPA, 15-20% signup-to-visit, 200-500 visitors typical.

Minute 60: **r/cscareerquestions Friday "What Are You Working On"** thread (if Friday). DO NOT post directly — the subreddit auto-removes self-promo. This thread is the only accepted venue.

Minute 75: **Email 20 career creators** (list in §5.3 below). Single email, personalized opening sentence, offer: lifetime Pro + personalized share-link demo. No ask beyond "share if it resonates."

Minute 90: **Tweet/post** an asymmetric line: "Show HN is live. Here's what I learned about why 87% of job-search tools fail the employed-but-open user." Link to brief blog post (see §5.2) that we pre-wrote.

### The content asset pre-written for launch day

One blog post on our site, titled **"The job-search stack I wish I'd had."** Honest comparison: Huntr (strong kanban, pricey), Teal (great resume builder, weak tracker), Simplify (killer autofill, weak tracker), spreadsheets/Notion (they collapse at 30 applications — this is cited). Interview Journey ranks last in some categories (no autofill) and first in others (doc-drop AI, career timeline, employed-open positioning). Honesty wins trust. It also ranks for `huntr vs teal`, `job tracker comparison`, and adjacent terms over time.

### Creators to DM (reachable tier: 20-100K followers)

| Creator | Platform | Followers | Notes |
|---|---|---|---|
| Austin Belcak | LinkedIn + X | 50K LinkedIn, 20M views/yr | Job-search specific, actionable content, goes viral. *Highest priority.* |
| Anna Papalia | LinkedIn | 1.5M | Interviewing expert — too big, save for month 2 |
| Kathy Caprino | LinkedIn | 850K | Executive-focused; may not convert |
| Jennifer Tardy | LinkedIn | — | Recruiter/coach, DEI angle |
| Jasmin Alić | LinkedIn | — | Personal branding, viral carousel style |
| Liz Ryan | LinkedIn | — | Human Workplace founder |
| JT O'Donnell (@JTODonnell) | X | — | Strong engagement on X |
| Ashley Stahl (@AshleyStahl) | X | — | Career humor + advice |
| Corporate Natalie | X | — | Humor angle |

**Don't waste a DM on Erin McGoff (7M followers) — she charges or ignores.** Austin Belcak-sized creators are where realistic outreach lands. Target 20 DMs → expect 3 replies → 1-2 posts → 100-200K impressions.

### Reddit rules (critical — don't get banned)

| Sub | Members | Self-promo? |
|---|---|---|
| r/SideProject | 200K+ | **Yes, welcome** |
| r/indiehackers | Small but engaged | **Yes, welcome** |
| r/EntrepreneurRideAlong | — | **Yes, welcome** |
| r/cscareerquestions | 800K-2.3M | Only in Friday "What Are You Working On" thread — posts get auto-removed otherwise |
| r/jobs | 2.5M | Very strict — posts get removed |
| r/ExperiencedDevs | 321K | Quality bar is high, no ads |
| r/recruitinghell | 1.2M | Medium — shareable content works, direct promo doesn't. The rejection-email decoder (§6) is the hook here. |
| r/jobhunt | 480K | Medium |
| r/Layoffs | small | Strict — emotional space, don't sell |

### Content wedges for weeks 2-8

Ranked by cheapest-to-ship / highest compound:

1. **Free Notion template: "Interview Journey"** — looks like our app, minus the AI. Graduation CTA: "Outgrew Notion? Import to the app in 10 seconds." Notion templates rank for "notion job tracker template" (3-6K/mo searches). Teal and Huntr both missed this angle.
2. **Rejection-email decoder (free tool, no signup)** — paste a rejection, AI tells you if it's a canned no, a soft-hold, or a "keep in touch." Perfect for r/recruitinghell virality. Every output has a watermark.
3. **Gmail/Outlook "classify my job inbox" scanner** — one-click OAuth, show the user their pipeline from their inbox, prompt signup. Same product as paid, lower-friction entry.
4. **Spreadsheet → auto-import wizard** — landing page: "Stuck in a spreadsheet? We import it in 10 seconds." Targets the `job search spreadsheet` keyword (2-5K/mo).
5. **"How I tracked 287 applications" personal essay** — Patrick McKenzie / Patio11 style data + screenshots. Has backlink + share potential.
6. **Interactive salary negotiation script generator** — output a personalized script from company/role/current offer. High shareability, high intent.
7. **Annual "State of Tech Hiring" report** — January release, scrape LinkedIn/Indeed trends. Gets linked by TechCrunch-tier outlets for evergreen SEO.

### SEO keyword territory (concrete targets)

Don't fight Huntr / Teal on "job application tracker" (KD 40-60, paid ads dominate). Instead own:

- **"AI job application email classifier"** — near-zero competition, exactly our wedge
- **"career timeline tracker"** — unclaimed, matches our hero
- **"job application tracker with AI"** — long-tail, mid-intent
- **"best job tracker for software engineers"** — niche vertical, high commercial intent
- **"notion job tracker template"** — the upgrade wedge (own via our free template)
- **"rejection email decoder"** — fresh, viral, brings traffic
- **"huntr alternative"** / **"teal alternative"** / **"simplify.jobs alternative"** — classic comparison-page SEO

### Expected funnel (refined)

| Channel | Reasonable week-1 signups | Signup → Pro conv. | Revenue |
|---|---|---|---|
| LinkedIn post + creator DMs | 80-200 | 3-5% | 3-8 Pro |
| Show HN (realistic: top-20 not top-5) | 100-300 | 5-8% | 6-24 Pro |
| r/SideProject + r/indiehackers | 50-150 | 2-4% | 1-5 Pro |
| Creator posts (1-2 pickups) | 100-500 | 2-4% | 3-20 Pro |
| BetaList (delayed 2 wks) | 0 week 1; 200-500 week 3 | 3-5% | 6-25 Pro (later) |
| **Week-1 total** | **330-1,150** | | **13-57 paying users** |

Plus **$99 lifetime wedge**: realistic 30-100 buyers in launch week × $99 = **$3k-$10k one-time revenue**.

### Activation metric to watch

The critical event is **drop first document within 10 minutes of signup** OR **add first past employer to the career timeline**. Either one proves the user got it. If <30% of signups hit either, kill acquisition spend and fix onboarding before scaling.

---

## 6. Growth loops (the retention story)

A one-shot job hunt gives you one use. A career companion gives you ten years. The loops that make this work:

### Loop A: `track@interviewjourney.com` — the viral magic moment
**This is the Simplify-extension equivalent of our product.** Forward any email — a recruiter DM, an offer PDF, a rejection — to `track@interviewjourney.com`. We auto-classify it, auto-sign-the-user-up if unknown (using the sender address as intent signal), and reply with "Added to your pipeline." The email's forward chain inevitably hits colleagues and friends who ask "wait, how did that auto-file?" → direct referral.

Ship this in week 1. Cheaper than autofill, more magical than any feature we have, and it turns every user into a mouth.

### Loop B: "Share your timeline" with a mentor or recruiter
Public read-only URL: `interviewjourney.com/@maya-lin` or `.../t/abc123`. User picks what to show (anonymized companies, compensation hidden, etc.). Every page has a "Claim your own timeline" CTA. Receiver is often a recruiter (paid lead) or mentor (potential partner).

K-factor > 1 because the most common recipient — a hiring manager — has the highest incentive to become a user themselves (they're recruiting, they think about the job market daily).

### Loop C: Employed-happy → monthly market pulse
Once a month, email: "How's the market for [Staff SWE in SF]?" One-click opens a pre-filled "market check" flow — log a recruiter DM, paste a Glassdoor salary, note a friend's offer. Takes <2 minutes. Rewards with a tiny chart: "Staff eng comp in your zip: ↑ 4% since last check."

Retention hook, not a sales pitch. Every friend mentioned in a market-pulse entry becomes a candidate for invite.

### Loop D: "Open to offers" public profile
Think Linktree for job seekers. Hosted profile page at `interviewjourney.com/@name` with anonymized metrics ("7 active processes · 2 final rounds · seeking Staff eng · SF or remote"). Shareable on Twitter / LinkedIn. Every view is an acquisition surface.

Ship in week 2-3. This is the natural evolution of the timeline share.

### Loop E: Mentor mode — coach distribution
Free account type for career coaches who invite clients. Coach sees the client's pipeline (read-only), client owns the data. Coaches become a distribution channel: one coach onboarding 10 clients = 10 users, and the coach has strong incentive to keep the client on the platform for coaching continuity.

Pair with a 15% recurring affiliate commission (industry standard per A Life After Layoff / JobStars / Resume to Referral). Combine with free lifetime access for the coach (cost: nothing) = strong conversion.

### Loop F: "Market-check me" — friend invite unlock
User wants to see salary benchmark for their role. Gate it: "unlock when one friend with the same role joins." Viral loop built on passive-employed salary-anxiety. The unlock is real data (scraped from LinkedIn's public comp-share), so the incentive is earned.

### Loop G: Job-offer share cards (Strava-style)
Auto-generate an Instagram/LinkedIn-sized graphic when a user marks a role as `hired` or `offer received`. Watermarked. "Maya took 14 interviews and got offer #2 in 47 days. Her timeline →"

Ship in month 2. This is Strava's moment — a run summary people voluntarily post. Every card = acquisition impression.

### Loop H: Anti-recruiter features — tribal positioning
Purposeful us-vs-them content: "Redact this company from my public timeline," "Ghost-risk score" on processes, "Recruiter radar" (estimate how likely they ghost based on company data). Tribal content gets shared in r/recruitinghell where our other tactics struggle.

---

## 7. Pricing

### The competitive benchmark

| Product | Monthly | Annual-equiv | Notes |
|---|---|---|---|
| Jobscan | $49.95 | $24.95 | Keyword tool, highest in adjacent space |
| Careerflow Premium+ | $44.99 | — | All-in-one |
| Huntr Pro | $40 | ~$26 | Kanban + resume AI |
| Simplify+ | $39.99 | — | Autofill + AI cover letters |
| Teal+ | $29 | ~$15 | Resume builder; **tracker is free** |
| Careerflow Premium | $23.99 | — | |
| Wonsulting Premium | $19.99 | — | Creator-led |
| Eztrackr | $18.99 | — | Kanban + extension |
| JibberJobber | $5 | ($99 lifetime) | Ancient, no AI |
| **Interview Journey (current plan)** | **$12** | **—** | AI-first |

At $12/mo we're the cheapest modern AI-first option by a wide margin. That's a problem *and* an opportunity.

### The Teal lesson

Teal makes **10× the revenue of Huntr** by making the tracker free and monetizing the *intelligence layer* (resume AI, match scores). That's the lesson: the organizing surface is a commodity; the intelligence is what pays. And in our product, **document classification is the intelligence layer.**

This reshapes the tier split.

### Recommended tier structure

**Free — "Keeper"**
- Unlimited active roles (remove the 10-role cap — it punishes the passive-open user)
- Career timeline (unlimited past employers)
- 30 AI classifications/month
- 100 documents total storage
- Pipeline kanban
- Single-role share links

The promise: *your career, organized, forever free.* This is what Teal figured out — the organizing layer should be free so everyone builds their career on your app. Lock-in compounds.

**Pro — "Companion"** · $19/mo or **$144/year ($12/mo)**
- Unlimited AI classifications
- Unlimited document storage
- Export (CSV, PDF career portfolio)
- Full share-link customization
- Priority AI (lower latency)
- Market-pulse monthly digest
- Coach access

The promise: *intelligence, delivered continuously.* Monthly anchor of $19 positions us below Teal+ ($29) and Careerflow Premium ($24) but above the "cheap/budget" perception zone. **$12/mo appearing as the annual price feels like a discount, not a bottom.** Critical: a $12 monthly anchor reads as "worse than $29 Teal" to a first-time visitor; a $19 monthly with $12 annual reads as "smart to commit."

**Lifetime — "Founding member"** · $149 one-time (launch offer $99)
- Everything in Pro, forever
- "Founding member" badge on share-links
- Cap at 1,000 users, then retire the tier

Why this exists:
- JibberJobber proves the lifetime segment converts ($99 lifetime is their most-purchased tier).
- It's a *killer* Show HN / ProductHunt launch wedge. "Lifetime for $99" gets front-paged more than any $12/mo pitch.
- It turns launch buzz into $100k of committed revenue in week 1 rather than trickle MRR. 1,000 users × $99 = $99,000 — realistic for a strong Show HN.
- Caps it so you don't permanently cannibalize future pricing.

### Don't launch

- ~~"Career" tier at $48/year for passive users~~ — the data shows passive users' #1 pain is updating the tracker, not price. A $5/mo tier with friction reduction wins over a $48/year tier with compromises.
- ~~"Pay once you get hired" schemes~~ (5% of first paycheck, etc.) — emotionally appealing, operationally miserable. Don't.
- Enterprise / team tier. Don't distract yourself pre-10K users.

### What I'd actually ship tomorrow

- **Free tier: remove the 10-role cap.** This is the single most important pricing decision. It signals "your career, your archive" — not "a job-hunt trial with a limit."
- **Reprice Pro to $19/mo monthly · $144/year (effective $12/mo).** The annual is where we want everyone. Monthly exists so people can try before committing.
- **Launch with the $99 founding-member lifetime offer as a limited drop** — capped at the first 500 users who sign up in launch week. Visible countdown on the pricing page. This is the Show HN wedge.
- Skip all other tier complexity for 30 days. Add a one-time "Search Pass" ($99 for 6 months) in month 2 if we see layoff-moment conversion signal.

---

## 8. Day-1 launch checklist

Not everything needs to be perfect. These DO need to be working:

**Product must-haves**
- [ ] Onboarding 3-question modal (current employer + title + search status)
- [ ] Dashboard status bar (name + current employer + tenure + status pills)
- [ ] Career timeline on dashboard (horizontal, past employers)
- [ ] Doc-drop working on every page, not just `/documents`
- [ ] Inbox view with pending classifications
- [ ] Pipeline kanban working (already functional — light polish)
- [ ] Single role detail page (already functional — light polish)

**Pricing must-haves**
- [ ] Free tier 10-role cap removed
- [ ] Pro repriced: $19/mo monthly, $144/year annual
- [ ] "Founding member" lifetime at $99 tier live on pricing page
- [ ] Visible counter: "X of 500 lifetime spots remaining"
- [ ] Stripe: lifetime tier configured as one-time payment (not subscription)

**Infrastructure must-haves**
- [ ] Signup flow works against production Supabase (verified via demo account today)
- [ ] Google OAuth redirect URL matches Vercel production URL
- [ ] Stripe checkout not broken
- [ ] OpenRouter key set in Vercel env (test a real doc classification end-to-end)
- [ ] Email sending works (transactional — signup confirmation, weekly digest)
- [ ] `track@interviewjourney.com` email endpoint wired (use Postmark/Resend inbound, webhook to classify API)
- [ ] At least one error path has a sensible empty state

**Content must-haves**
- [ ] Landing page (already shipped v2)
- [ ] Blog post: "The Job Search Stack I Wish I'd Had" (honest Huntr/Teal/Simplify/Notion/IJ comparison)
- [ ] Free Notion template that opts into email list
- [ ] Show HN draft post, timeline GIF captured
- [ ] LinkedIn + Twitter post drafted with timeline screenshot
- [ ] List of 20 creator DMs composed + scheduled

**The 90-minute launch sequence (see §5)**
- [ ] Minute 0: Own LinkedIn post
- [ ] Minute 10: Show HN
- [ ] Minute 20: r/SideProject
- [ ] Minute 30: r/indiehackers (site)
- [ ] Minute 45: BetaList submission
- [ ] Minute 60: r/cscareerquestions WAYWO (if Friday)
- [ ] Minute 75: Creator DMs x20
- [ ] Minute 90: Tweet + blog post link

**Optional / nice-to-haves (defer if tight)**
- [ ] Public share-link timeline — week 2
- [ ] Analytics page — cut from v1
- [ ] Offers page separate nav — cut from v1
- [ ] Career coach chat — keep as-is; don't redesign for launch
- [ ] ProductHunt — schedule for day 8-10, not day 1

---

## 9. 30/60/90 milestones

### 30 days
- 500+ signups
- 25% activation (dropped a doc OR added past employer)
- 5% Pro conversion (25 paying users = ~$300 MRR)
- One organic piece of content ranking top-10 on Google for "[job search tracker] alternatives"
- One viral LinkedIn post (1k+ reactions) from a creator partnership

### 60 days
- 2,000 signups
- Ship public share-link feature (viral loop)
- Ship monthly market-pulse email
- Launch "Career" tier at $48/year
- First career coach affiliate partnership closed

### 90 days
- 5,000 signups, $1k MRR
- Reach decision point: double down (more acquisition, raise) OR step back (refine, bootstrap)
- Cohort analysis on retention: passive-open vs active cohort — which sticks?

---

## 10. Surprising things I found

- **220 million LinkedIn "Open to Work" users** is the actual TAM. LinkedIn serves them poorly — a green banner and some saved jobs. Nobody else serves them at all.
- **73% of top-performing professionals are open to new roles** (SignalHire 2026). Your best users are not desperate — they're already winning and want to keep winning.
- **Teal is 10× Huntr by revenue** ($52.9M vs ~$1M ARR) by making the tracker free and monetizing the intelligence layer. This is the single most important strategic lesson in the brief.
- **Huntr's original growth was B2B**, not consumer. Cold outbound to bootcamps funded the consumer play. 20% reply rate, 7% interested, 10% market saturation of ~1,000 bootcamps.
- **Simplify has 1M+ Chrome extension users and barely monetizes.** There's a million-person audience with demonstrated intent and no CRM. A "bring your Simplify data" import feature is a potential wedge.
- **Product Hunt 2026 is crowded** — winning the day requires 300-600 upvotes, top-5 requires 150+. Most job-tracker launches get 50-200. Plan for a measured ProductHunt launch week-2, not day-1.
- **Reddit self-promo is dead in r/cscareerquestions / r/jobs.** The only accepted venue is r/cscareerquestions Friday "What Are You Working On" thread. Don't try the front door. r/SideProject and r/indiehackers explicitly welcome launches.
- **Austin Belcak (50K LinkedIn) is reachable, Erin McGoff (7M) is not.** Target 20-100K creator tier for DM outreach.
- **Jobscan charges $299/year for a keyword-match tool and it converts.** Willingness-to-pay in this category is much higher than $12/mo under job-search pressure.
- **JibberJobber's $99 lifetime is their most-purchased tier** — lifetime deals work in this segment. Launching with a capped lifetime drop is a proven wedge.
- **The winning Reddit insight is not "more features" — it's "I gave up on tracking."** The product that wins is the one that makes users update it *less*. Document drop makes them update less. Kanban drag-and-drop makes them update more.
- **"Career receipts" as a phrase has one competitor (wrkreceipts.com / Jayla AI)** but they're positioning for HR-disputes, not career growth. Land-grab the phrase for our use case.
- **Huntr is a 5-person operation in Dubai with ~$120K raised.** The market moves slowly enough that a lean product can catch up — and Huntr has massive margins to drop price if threatened.

---

## Sources

### Market sizing
- [Robert Half — 38% of US workers plan job search in H1 2026](https://press.roberthalf.com/2025-12-11-Survey-Nearly-4-in-10-Professionals-Plan-to-Search-for-a-New-Job-in-2026)
- [Rally Recruitment Marketing — The Hidden 75%: Passive Talent Majority (2025)](https://rallyrecruitmentmarketing.com/2025/04/hidden-75-percent-recruit-the-passive-talent-majority/)
- [SignalHire 2026 Passive Candidate Report — 73% of top performers open](https://techrseries.com/amp/recruitment-and-on-boarding/signalhire-publishes-2026-passive-candidate-report-73-of-top-performing-professionals-are-open-to-new-roles/)
- [Workable — 37% of US workers are passive candidates](https://resources.workable.com/stories-and-insights/infographic-passive-candidates-who-are-they-us)
- [ERE — 74% of workers are passive job seekers](https://www.ere.net/articles/survey-74-of-workers-are-passive-job-seekers-ready-to-consider-a-move)
- [LinkedIn OpenToWork: 220M users, 3× recruiter response](https://careery.pro/blog/networking/linkedin-open-to-work-pros-cons)
- [58% of job seekers say finding work will be harder in 2026](https://www.prnewswire.com/news-releases/58-of-us-job-seekers-say-finding-work-will-be-harder-in-2026--yet-42-are-already-on-the-hunt-302659888.html)

### Competitive landscape
- [Huntr Pricing](https://huntr.co/pricing)
- [Huntr Tracxn profile (funding data)](https://tracxn.com/d/companies/huntr/__BbxRzw-1_kn7atnIBMRjUttAs-SO4AsYGdDNuiV_H9A)
- [Apollo — Huntr $1M ARR case study (bootcamp B2B outbound)](https://www.apollo.io/magazine/huntr-customer-story)
- [Baremetrics — How Huntr Doubled Revenue 4 Years Straight](https://baremetrics.com/customers/how-huntr-doubled-revenue-4-years-straight-while-pivoting-twice)
- [Huntr on Product Hunt (5 launches, upvote history)](https://www.producthunt.com/products/huntr)
- [Rennie Haylock founder interview — Authority Magazine](https://medium.com/authority-magazine/startup-revolution-rennie-haylock-of-huntr-on-how-their-emerging-startup-is-changing-the-game-957387d4aed4)
- [Huntr Review 2026 (ResumeHog — user complaints)](https://resumehog.com/blog/posts/huntr-review-2026-is-this-job-tracker-worth-it.html)
- [Huntr Trustpilot reviews](https://www.trustpilot.com/review/huntr.co)
- [Teal+ Pricing](https://www.tealhq.com/pricing)
- [Teal no-code origin — Bubble.io case study](https://bubble.io/blog/teal-bubble-no-code/)
- [Teal Series A $7.5M news](https://www.thesaasnews.com/news/teal-raises-7-5-million-in-series-a)
- [Teal revenue on GetLatka ($52.9M)](https://getlatka.com/companies/tealhq.com)
- [Teal seed round — Refresh Miami](https://refreshmiami.com/news/teal-raises-6-3m-seed-round-to-grow-career-platform-empowering-job-seekers/)
- [Teal review — remotejobassistant](https://www.remotejobassistant.com/blog/teal-resume-review)
- [Simplify Copilot homepage](https://simplify.jobs/copilot)
- [Simplify Chrome Web Store (1M+ installs)](https://chromewebstore.google.com/detail/simplify-copilot-autofill/pbanhockgagggenencehbnadejlgchfc?hl=en)
- [Simplify on TechCrunch](https://techcrunch.com/2024/02/07/simplify-looks-to-ai-to-help-with-job-searches-and-applications/)
- [Simplify review — jobright.ai](https://jobright.ai/blog/simplify-copilot-review-2026-features-pricing-and-top-alternatives/)
- [JibberJobber Pricing ($99 lifetime)](https://www.jibberjobber.com/pricing.php)
- [Huntr vs Teal vs JibberJobber comparison](https://bestjobsearchapps.com/articles/en/huntr-vs-teal-vs-jibberjobber-best-job-application-tracker-for-2026-full-comparison)
- [Notion: Job Application Tracking templates](https://www.notion.com/templates/category/job-application-tracking)
- [7 Best Job Application Tracker Notion Templates 2026](https://www.notionland.co/post/job-application-tracker-notion)
- [Jobscan Pricing](https://www.jobscan.co)
- [Jobscan Review — ResumeHog](https://resumehog.com/blog/posts/jobscan-review-2026-the-ats-tool-every-job-seeker-needs.html)
- [Careerflow Review — jobright.ai](https://jobright.ai/blog/careerflow-review-2026-features-pricing-and-user-experience/)
- [Wonsulting JobTrackerAI](https://www.wonsulting.com/jobtrackerai)
- [Eztrackr Pro](https://www.eztrackr.app/pro)
- [JobShinobi email parser (closest AI competitor)](https://www.jobshinobi.com/tools/job-application-email-parser-tool)
- [OpenJobRadar passive seekers page](https://openjobradar.com/use-cases/passive-job-seekers)
- [Wrk Receipts — career receipts category](https://www.wrkreceipts.com/good)
- [Folk — Best personal CRMs 2026](https://www.folk.app/articles/best-personal-crm)

### Spreadsheet abandonment / user pain
- [Resumly — spreadsheet limitations](https://www.resumly.ai/blog/job-application-trackers)
- [Reztune — Google Sheets tracker stats](https://www.reztune.com/blog/tracking-spreadsheet/)
- [r/recruitinghell overview — Yello](https://yello.co/blog/5-of-junes-hottest-posts-from-reddits-recruiting-hell/)
- [Kondo blog — Job application tracking tips](https://www.trykondo.com/blog/job-application-tracking-tips)

### Launch / GTM / growth
- [Resume Worded founder interview — HackerNoon](https://hackernoon.com/founder-interviews-rohan-mahtani-of-resume-worded-657757344c21)
- [Resume Worded Beehiiv case study (1M+ subs)](https://blog.beehiiv.com/p/case-study-rohan-mahtani)
- [BetaList 2025 conversion benchmarks](https://awesome-directories.com/blog/betalist-launch-strategy-guide-2025/)
- [Product Hunt Launch Playbook — Arc](https://arc.dev/employer-blog/product-hunt-launch-playbook/)
- [Show HN search index for job products](https://bestofshowhn.com/search?q=jobs)
- [Rands Leadership Slack](https://randsinrepose.com/welcome-to-rands-leadership-slack/)
- [Indie Hackers — First 100 Users posts](https://www.indiehackers.com/post/how-i-got-my-first-100-users-2fc9d71c34)
- [Austin Belcak viral LinkedIn framework](https://austin-belcak.medium.com/going-viral-on-linkedin-how-i-got-40-000-views-in-24-hours-8e46f22654cf)
- [Pragmatic Engineer subscribers](https://www.lennysnewsletter.com/p/leaving-big-tech-to-build-the-1-technology)
- [Reddit self-promotion rules 2026](https://redship.io/blog/reddit-self-promotion-rules-2026)
- [Job Board Consulting — seeker willingness to pay](https://www.jobboardsecrets.com/2025/12/22/the-price-of-an-edge-why-job-seekers-are-starting-to-pay-and-when-its-worth-it/)
- [A Life After Layoff affiliate (15%)](https://www.alifeafterlayoff.com/career-coaching-affiliate-program/)
- [Resume to Referral affiliate (15%)](https://www.resumetoreferral.com/affiliate-program/)
- [Prentus — Best Job Trackers 2026](https://prentus.com/blog/we-found-the-5-best-job-tracker-tools-on-the-market)
- [Scale.jobs pricing (done-for-you $199-$399)](https://scale.jobs/pricing)
- [Scale.jobs review of Teal](https://scale.jobs/blog/is-tealhq-worth-the-price-scale-jobs-review)
- [r/cscareerquestions subredditstats](https://subredditstats.com/r/cscareerquestions)
- [r/recruitinghell subredditstats](https://subredditstats.com/r/recruitinghell)
- [r/ExperiencedDevs subredditstats](https://subredditstats.com/r/ExperiencedDevs)
