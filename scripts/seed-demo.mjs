#!/usr/bin/env node
/**
 * Seed a demo user with realistic job-search data.
 *
 * Usage:
 *   node scripts/seed-demo.mjs [--reset]
 *
 * Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * With --reset, deletes the existing demo user (and all their data via FK
 * cascade) before re-creating. Safe to run multiple times.
 *
 * Creates:
 *   - auth user demo@interviewjourney.app / DemoJourney2026!
 *   - Upgrades subscription tier to 'pro' so every feature is unlocked.
 *   - 7 companies, 7 roles spanning every stage (applied, screening,
 *     interviewing, offer, resolved:rejected, resolved:withdrew), 25+
 *     role_events, 3 meetings, 1 offer.
 */

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const envFile = readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_EMAIL = 'demo@interviewjourney.app'
const DEMO_PASSWORD = 'DemoJourney2026!'
const reset = process.argv.includes('--reset')

async function findUserByEmail(email) {
  let page = 1
  while (page < 10) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const hit = data.users.find((u) => u.email === email)
    if (hit) return hit
    if (data.users.length < 200) return null
    page++
  }
  return null
}

async function ensureDemoUser() {
  let user = await findUserByEmail(DEMO_EMAIL)
  if (user && reset) {
    console.log(`→ resetting existing demo user ${user.id}`)
    const { error } = await sb.auth.admin.deleteUser(user.id)
    if (error) throw error
    user = null
  }
  if (!user) {
    const { data, error } = await sb.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Maya Lin (Demo)' },
    })
    if (error) throw error
    user = data.user
    console.log(`→ created demo user ${user.id}`)
  } else {
    // Make sure password works even if previously rotated
    await sb.auth.admin.updateUserById(user.id, { password: DEMO_PASSWORD, email_confirm: true })
    console.log(`→ reusing demo user ${user.id}`)
  }
  return user
}

async function ensurePro(userId) {
  const { error } = await sb
    .from('subscriptions')
    .upsert({ user_id: userId, tier: 'pro', status: 'active' }, { onConflict: 'user_id' })
  if (error) throw error
}

// Update profile with v2 employment + search status fields. Swallow errors
// gracefully if migration 003 hasn't been applied yet.
async function setProfileEmployment(userId, stripeCompanyId) {
  const { error } = await sb
    .from('profiles')
    .update({
      display_name: 'Maya Lin',
      current_employer_id: stripeCompanyId,
      current_title: 'Senior Software Engineer',
      employment_start_date: '2024-11-04',
      search_status: 'open',
      prefs: {
        funnelRange: '90d',
        autoCloseDays: 30,
        docConfidenceThreshold: 85,
        onboardedAt: new Date().toISOString(),
      },
    })
    .eq('id', userId)
  if (error) {
    console.warn(`! profile update partial (migration 003 maybe not applied): ${error.message}`)
    // Fall back to basics
    await sb.from('profiles').update({ display_name: 'Maya Lin' }).eq('id', userId)
  }
}

async function clearDemoData(userId) {
  // Delete order respects FKs (children first).
  for (const table of ['role_events', 'meetings', 'offers', 'documents', 'roles', 'companies']) {
    const { error } = await sb.from(table).delete().eq('user_id', userId)
    if (error) throw new Error(`clearing ${table}: ${error.message}`)
  }
}

const COMPANIES = [
  // Current + pipeline targets
  { slug: 'anthropic', name: 'Anthropic', domain: 'anthropic.com', industry: 'AI research' },
  { slug: 'stripe', name: 'Stripe', domain: 'stripe.com', industry: 'Payments' },
  { slug: 'vercel', name: 'Vercel', domain: 'vercel.com', industry: 'Developer tools' },
  { slug: 'notion', name: 'Notion', domain: 'notion.so', industry: 'Productivity' },
  { slug: 'linear', name: 'Linear', domain: 'linear.app', industry: 'Developer tools' },
  { slug: 'figma', name: 'Figma', domain: 'figma.com', industry: 'Design tools' },
  { slug: 'airbnb', name: 'Airbnb', domain: 'airbnb.com', industry: 'Travel' },
  // Past employers (for career timeline)
  { slug: 'acme', name: 'Acme Systems', domain: 'acme.example', industry: 'Enterprise SaaS' },
  { slug: 'globex', name: 'Globex', domain: 'globex.example', industry: 'Fintech' },
  { slug: 'initech', name: 'Initech', domain: 'initech.example', industry: 'Consumer' },
]

// Past employment history for the career timeline. These insert as
// resolved:hired roles with applied_at/resolved_at spanning the job tenure.
// Semantically imperfect (they weren't tracked through this app at the time)
// but renders correctly in the Career Timeline component.
const PAST_EMPLOYMENTS = [
  { companySlug: 'acme',    role_title: 'Junior Software Engineer', start: '2019-06-03', end: '2021-09-10', source: 'referral' },
  { companySlug: 'globex',  role_title: 'Software Engineer II',     start: '2021-09-20', end: '2023-05-12', source: 'cold application' },
  { companySlug: 'initech', role_title: 'Senior Engineer',          start: '2023-05-22', end: '2024-10-18', source: 'recruiter' },
]

const ROLE_SPECS = [
  {
    companySlug: 'anthropic',
    role_title: 'Staff Software Engineer',
    stage: 'interviewing',
    salary_min: 200000,
    salary_max: 250000,
    location: 'San Francisco, CA',
    remote_type: 'hybrid',
    source: 'referral — Jamie',
    applied_days_ago: 12,
    excitement_score: 5,
    events: [
      { days_ago: 12, event_type: 'applied', title: 'Applied via referral (Jamie)' },
      { days_ago: 9, event_type: 'screening_scheduled', title: 'Recruiter screen scheduled' },
      { days_ago: 6, event_type: 'screening_completed', title: 'Screen with Priya — went well' },
      { days_ago: 3, event_type: 'technical_assessment', title: 'Systems design round' },
      { days_ago: 0, event_type: 'interview_scheduled', title: 'Onsite loop — 4 rounds' },
    ],
    meetings: [
      { days_ago: -1, type: 'onsite_loop', round_number: 4, duration_minutes: 240, format: 'onsite', location: 'SF HQ', outcome: 'pending' },
    ],
  },
  {
    companySlug: 'stripe',
    role_title: 'Senior Software Engineer',
    stage: 'offer',
    salary_min: 200000,
    salary_max: 250000,
    location: 'San Francisco, CA',
    remote_type: 'hybrid',
    source: 'referral — Sarah',
    applied_days_ago: 56,
    excitement_score: 4,
    events: [
      { days_ago: 56, event_type: 'applied', title: 'Applied — Sarah referral' },
      { days_ago: 50, event_type: 'screening_completed', title: 'Recruiter screen' },
      { days_ago: 43, event_type: 'technical_assessment', title: 'Technical round' },
      { days_ago: 36, event_type: 'interview_completed', title: 'Onsite loop' },
      { days_ago: 19, event_type: 'offer_received', title: 'Offer: $245k + 0.08% + $40k sign-on' },
      { days_ago: 3, event_type: 'note_added', title: 'Negotiating start date' },
    ],
    offer: {
      base_salary: 245000,
      signing_bonus: 40000,
      equity_amount: 800,
      equity_type: 'RSU',
      equity_vesting_years: 4,
      equity_cliff_months: 12,
      pto_days: 20,
      status: 'pending',
    },
  },
  {
    companySlug: 'vercel',
    role_title: 'Senior Frontend Engineer',
    stage: 'interviewing',
    salary_min: 170000,
    salary_max: 200000,
    location: 'Remote',
    remote_type: 'remote',
    source: 'cold application',
    applied_days_ago: 13,
    excitement_score: 4,
    events: [
      { days_ago: 13, event_type: 'applied', title: 'Cold application' },
      { days_ago: 10, event_type: 'screening_scheduled', title: 'Recruiter response' },
      { days_ago: 5, event_type: 'screening_completed', title: 'Recruiter call' },
      { days_ago: 1, event_type: 'interview_completed', title: 'Technical interview' },
    ],
    meetings: [
      { days_ago: 1, type: 'technical', round_number: 2, duration_minutes: 60, format: 'video', platform: 'Zoom', outcome: 'passed' },
    ],
  },
  {
    companySlug: 'notion',
    role_title: 'Product Engineer',
    stage: 'screening',
    salary_min: 160000,
    salary_max: 190000,
    location: 'New York, NY',
    remote_type: 'hybrid',
    source: 'LinkedIn',
    applied_days_ago: 15,
    excitement_score: 3,
    events: [
      { days_ago: 15, event_type: 'applied', title: 'Applied via LinkedIn' },
      { days_ago: 8, event_type: 'technical_assessment', title: 'Take-home assessment assigned' },
      { days_ago: 4, event_type: 'document_added', title: 'Submitted take-home' },
    ],
  },
  {
    companySlug: 'linear',
    role_title: 'Founding Engineer',
    stage: 'exploring',
    salary_min: 170000,
    salary_max: 220000,
    location: 'Remote',
    remote_type: 'remote',
    source: 'friend intro',
    applied_days_ago: 10,
    excitement_score: 3,
    events: [
      { days_ago: 10, event_type: 'note_added', title: 'Added from friend intro' },
      { days_ago: 7, event_type: 'note_added', title: 'Reviewing their engineering blog' },
    ],
  },
  {
    companySlug: 'figma',
    role_title: 'Frontend Engineer',
    stage: 'resolved',
    resolution: 'rejected',
    salary_min: 170000,
    salary_max: 200000,
    location: 'San Francisco, CA',
    remote_type: 'hybrid',
    source: 'applied direct',
    applied_days_ago: 82,
    excitement_score: 3,
    resolved_days_ago: 61,
    events: [
      { days_ago: 82, event_type: 'applied', title: 'Applied direct' },
      { days_ago: 75, event_type: 'screening_completed', title: 'Recruiter screen' },
      { days_ago: 67, event_type: 'interview_completed', title: 'Technical round' },
      { days_ago: 61, event_type: 'rejected', title: 'Rejected after technical' },
    ],
  },
  {
    companySlug: 'airbnb',
    role_title: 'Senior Engineer',
    stage: 'resolved',
    resolution: 'withdrew',
    salary_min: 180000,
    salary_max: 210000,
    location: 'San Francisco, CA',
    remote_type: 'hybrid',
    source: 'cold application',
    applied_days_ago: 76,
    excitement_score: 2,
    resolved_days_ago: 60,
    events: [
      { days_ago: 76, event_type: 'applied', title: 'Applied' },
      { days_ago: 70, event_type: 'screening_completed', title: 'Phone screen' },
      { days_ago: 60, event_type: 'withdrew', title: 'Withdrew — focusing on Stripe' },
    ],
  },
]

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

async function seedData(userId) {
  await clearDemoData(userId)

  // companies
  const companyRows = COMPANIES.map((c) => ({ user_id: userId, name: c.name, domain: c.domain, industry: c.industry }))
  const { data: createdCompanies, error: cErr } = await sb.from('companies').insert(companyRows).select()
  if (cErr) throw cErr
  const companyIdBySlug = Object.fromEntries(
    COMPANIES.map((c) => [c.slug, createdCompanies.find((r) => r.name === c.name).id]),
  )

  // roles
  const roleRows = ROLE_SPECS.map((r, i) => {
    const row = {
      user_id: userId,
      company_id: companyIdBySlug[r.companySlug],
      role_title: r.role_title,
      stage: r.stage,
      kanban_order: i,
      salary_min: r.salary_min,
      salary_max: r.salary_max,
      location: r.location,
      remote_type: r.remote_type,
      source: r.source,
      excitement_score: r.excitement_score,
      applied_at: r.applied_days_ago != null ? daysAgo(r.applied_days_ago) : null,
      engaged_at: r.applied_days_ago != null ? daysAgo(r.applied_days_ago) : null,
    }
    if (r.resolution) row.resolution = r.resolution
    if (r.resolved_days_ago != null) row.resolved_at = daysAgo(r.resolved_days_ago)
    return row
  })

  // Past-employment roles (resolved:hired) so the Career Timeline has data
  for (const emp of PAST_EMPLOYMENTS) {
    roleRows.push({
      user_id: userId,
      company_id: companyIdBySlug[emp.companySlug],
      role_title: emp.role_title,
      stage: 'resolved',
      kanban_order: 100,
      source: emp.source,
      applied_at: new Date(emp.start).toISOString(),
      engaged_at: new Date(emp.start).toISOString(),
      resolution: 'hired',
      resolved_at: new Date(emp.end).toISOString(),
    })
  }

  const { data: createdRoles, error: rErr } = await sb.from('roles').insert(roleRows).select()
  if (rErr) throw rErr
  const roleIdByIdx = createdRoles.map((r) => r.id)

  // events
  const events = []
  ROLE_SPECS.forEach((r, i) => {
    r.events.forEach((e) => {
      events.push({
        user_id: userId,
        role_id: roleIdByIdx[i],
        event_type: e.event_type,
        event_date: daysAgo(e.days_ago),
        title: e.title,
        source: 'manual',
      })
    })
  })
  const { error: eErr } = await sb.from('role_events').insert(events)
  if (eErr) throw eErr

  // meetings
  const meetings = []
  ROLE_SPECS.forEach((r, i) => {
    ;(r.meetings ?? []).forEach((m) => {
      meetings.push({
        user_id: userId,
        role_id: roleIdByIdx[i],
        type: m.type,
        round_number: m.round_number,
        scheduled_at: daysAgo(m.days_ago),
        duration_minutes: m.duration_minutes,
        format: m.format,
        platform: m.platform ?? null,
        location: m.location ?? null,
        outcome: m.outcome ?? 'pending',
      })
    })
  })
  if (meetings.length) {
    const { error: mErr } = await sb.from('meetings').insert(meetings)
    if (mErr) throw mErr
  }

  // offers
  const offers = []
  ROLE_SPECS.forEach((r, i) => {
    if (r.offer) {
      offers.push({ user_id: userId, role_id: roleIdByIdx[i], ...r.offer })
    }
  })
  if (offers.length) {
    const { error: oErr } = await sb.from('offers').insert(offers)
    if (oErr) throw oErr
  }

  return {
    companies: createdCompanies.length,
    roles: createdRoles.length,
    events: events.length,
    meetings: meetings.length,
    offers: offers.length,
  }
}

async function main() {
  const user = await ensureDemoUser()
  await ensurePro(user.id)
  const counts = await seedData(user.id)

  // Link Stripe as current employer in the profile
  const { data: stripeCo } = await sb
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', 'Stripe')
    .maybeSingle()
  if (stripeCo) {
    await setProfileEmployment(user.id, stripeCo.id)
  }

  console.log('\n✓ demo account ready')
  console.log('  email:    ', DEMO_EMAIL)
  console.log('  password: ', DEMO_PASSWORD)
  console.log('  user_id:  ', user.id)
  console.log('  seeded:   ', counts)
}

main().catch((err) => {
  console.error('✗ seed failed:', err)
  process.exit(1)
})
