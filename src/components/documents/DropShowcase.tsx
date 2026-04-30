'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Upload,
  FileText,
  Mail,
  Image as ImageIcon,
  Link2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clipboard,
} from 'lucide-react'

export type RecentDrop = {
  id: string
  filename: string
  routed: string
  status: 'attached' | 'pending' | 'processing' | 'failed'
  when: string
}

type ExtractionKind = 'advance' | 'reject' | 'offer' | 'nda' | 'outbound'

type WorkedExample = {
  id: string
  kind: ExtractionKind
  filename: string
  fileKind: 'email' | 'pdf' | 'image' | 'url'
  confidence: number
  screenshot: {
    from: string
    subject: string
    body: string[]
  }
  extracted: {
    type: string
    company: { name: string; matched: boolean }
    role: { name: string; matched: boolean }
    fromPerson?: string
    nextStep?: string
    ask?: string
    tone?: string
    action?: string
  }
  action: {
    kind: 'todo' | 'closed' | 'needs-review' | 'attached' | 'new-lead'
    header: string
    title: string
    body: string
    strikethrough?: boolean
    ctas: { label: string; primary?: boolean }[]
  }
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'ex-advance',
    kind: 'advance',
    filename: 'Vercel — HM call next steps.eml',
    fileKind: 'email',
    confidence: 96,
    screenshot: {
      from: 'Priya Desai · priya@vercel.com',
      subject: 'Next steps — HM call with Guillermo',
      body: [
        "Hi Maya — great news, the team loved you. We'd like to set up the hiring-manager",
        'call with Guillermo Rauch, 45 minutes, systems-design focused.',
        'Can you send over 2 weeks of availability, PT or ET? No prep needed — just come ready',
        "to talk about how you've built things at scale.",
      ],
    },
    extracted: {
      type: 'Screening follow-up · moving forward',
      company: { name: 'Vercel', matched: true },
      role: { name: 'Sr Frontend Engineer', matched: true },
      fromPerson: 'Priya Desai (recruiter)',
      nextStep: 'HM call · Guillermo Rauch · 45 min',
      ask: 'Send 2-week availability · PT/ET flexible',
    },
    action: {
      kind: 'todo',
      header: '✓ New to-do created',
      title: 'HM call with Guillermo Rauch',
      body: 'Added to Vercel · Sr Frontend Engineer. Due: send availability by Wednesday. Email is attached.',
      ctas: [{ label: 'Draft reply', primary: true }, { label: 'Open role' }],
    },
  },
  {
    id: 'ex-reject',
    kind: 'reject',
    filename: 'Figma — thanks for applying.eml',
    fileKind: 'email',
    confidence: 99,
    screenshot: {
      from: 'Figma Recruiting · no-reply@figma.com',
      subject: 'Regarding your Figma application',
      body: [
        'Hi Maya,',
        'Thank you for your interest in the Frontend Engineer role at Figma. After careful',
        "review, we've decided to move forward with other candidates.",
        'We appreciate the time you took to apply and wish you the best in your search.',
      ],
    },
    extracted: {
      type: 'Rejection · pre-screening',
      company: { name: 'Figma', matched: true },
      role: { name: 'Frontend Engineer', matched: true },
      fromPerson: 'Figma Recruiting (no-reply)',
      tone: 'Boilerplate · standard reject',
      action: 'Close role as rejected · archive doc',
    },
    action: {
      kind: 'closed',
      header: '✕ Role closed · rejected',
      title: 'Figma · Frontend Engineer',
      body: 'Auto-closed. Email attached to the role for history. Shows up in the Pipeline table under "Closed."',
      strikethrough: true,
      ctas: [{ label: 'Undo', primary: true }, { label: 'View in archive' }],
    },
  },
  {
    id: 'ex-offer',
    kind: 'offer',
    filename: 'Stripe — Offer Letter.pdf',
    fileKind: 'pdf',
    confidence: 98,
    screenshot: {
      from: 'Stripe People Ops',
      subject: 'Offer of Employment — Senior Software Engineer',
      body: [
        'Dear Maya,',
        "We're delighted to offer you the position of Senior Software Engineer at Stripe.",
        'Base salary: $245,000 · Signing bonus: $40,000 · Equity: 1,200 RSU over 4 years.',
        'This offer is valid through April 26, 2026.',
      ],
    },
    extracted: {
      type: 'Offer letter',
      company: { name: 'Stripe', matched: true },
      role: { name: 'Senior Software Engineer', matched: true },
      fromPerson: 'Stripe People Ops',
      nextStep: 'Decide by Apr 26 (5 days)',
      ask: 'Countersign or counter',
    },
    action: {
      kind: 'attached',
      header: '📎 Offer attached · decision due',
      title: 'Stripe offer — $245k + $40k sign-on + 1,200 RSU',
      body: 'Offer extracted and attached. Comp fields populated on the role. Decision deadline tracked.',
      ctas: [{ label: 'Open offer comparison', primary: true }, { label: 'Draft counter' }],
    },
  },
  {
    id: 'ex-nda',
    kind: 'nda',
    filename: 'Anthropic — NDA onsite.pdf',
    fileKind: 'pdf',
    confidence: 92,
    screenshot: {
      from: 'Anthropic Legal',
      subject: 'NDA for onsite interview',
      body: [
        'MUTUAL NON-DISCLOSURE AGREEMENT',
        'This agreement is entered into between Anthropic, PBC ("Company") and the',
        'undersigned candidate ("Recipient") as of the date signed below. The parties',
        'agree to maintain confidentiality regarding information disclosed during the',
        'interview process...',
      ],
    },
    extracted: {
      type: 'NDA · pre-onsite',
      company: { name: 'Anthropic', matched: true },
      role: { name: 'Staff Software Engineer', matched: true },
      fromPerson: 'Anthropic Legal',
      action: 'Attach to role · flag for signing',
    },
    action: {
      kind: 'attached',
      header: '📎 NDA attached · needs signature',
      title: 'Anthropic NDA — Staff SWE onsite',
      body: 'Filed under Anthropic · Staff Software Engineer. Reminder set for 24h before onsite to confirm signed.',
      ctas: [{ label: 'Sign now', primary: true }, { label: 'Open role' }],
    },
  },
  {
    id: 'ex-outbound',
    kind: 'outbound',
    filename: 'LinkedIn recruiter DM — Ramp.png',
    fileKind: 'image',
    confidence: 81,
    screenshot: {
      from: 'Alex Park (Ramp)',
      subject: 'LinkedIn message · inbound',
      body: [
        "Hi Maya! I'm a recruiter at Ramp. Loved your background in payments",
        "infrastructure — we're hiring a Staff Engineer on the core team and I think",
        "you'd be a great fit. Happy to share more if you're open to chat?",
      ],
    },
    extracted: {
      type: 'Inbound recruiter DM',
      company: { name: 'Ramp', matched: false },
      role: { name: 'Staff Engineer · core', matched: false },
      fromPerson: 'Alex Park (Ramp recruiter)',
      ask: 'Reply if interested',
    },
    action: {
      kind: 'needs-review',
      header: '⚠ Needs review · new lead',
      title: 'Ramp · Staff Engineer (inbound)',
      body: 'Below auto-route threshold (81% · needs ≥85%). Confirm to add as an exploring role, or archive if not interested.',
      ctas: [{ label: 'Add to pipeline', primary: true }, { label: 'Archive' }],
    },
  },
]

export function DropShowcase({ recent = [] }: { recent?: RecentDrop[] }) {
  return (
    <div style={{ minHeight: '100%', background: 'var(--paper)' }}>
      <Header />
      <div style={{ padding: '22px 22px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <StepOne recent={recent} />
        <StepTwo />
        <StepThree />
        <SettingsFooter />
      </div>
    </div>
  )
}

function Header() {
  return (
    <div
      style={{
        padding: '20px 22px 16px',
        borderBottom: '1px solid var(--paper-ink)',
        background: 'var(--card)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-4)',
        }}
      >
        Document drop
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 26,
          fontWeight: 500,
          color: 'var(--ink)',
          marginTop: 4,
          letterSpacing: -0.3,
        }}
      >
        Drop anything. Watch it route itself.
      </h1>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4, maxWidth: 760 }}>
        Forward a recruiter email. Drag a PDF offer. Paste a screenshot of a LinkedIn DM. The AI
        reads it, figures out which role it belongs to, and takes the next action.
      </div>
    </div>
  )
}

function SectionLabel({ n, title }: { n: number; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--accent-ij-ink)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-serif)',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {n}
      </div>
      <div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-4)',
          }}
        >
          Step {n}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            fontWeight: 500,
            color: 'var(--ink)',
            marginTop: 2,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  )
}

function StepOne({ recent }: { recent: RecentDrop[] }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <SectionLabel n={1} title="Drop" />
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
        <DropZone />
        <RecentDrops recent={recent} />
      </div>
    </section>
  )
}

function DropZone() {
  const [hovering, setHovering] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setHovering(true)
      }}
      onDragLeave={() => setHovering(false)}
      onDrop={(e) => {
        e.preventDefault()
        setHovering(false)
      }}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${hovering ? 'var(--accent-ij-ink)' : 'var(--accent-ij)'}`,
        borderRadius: 8,
        background: `color-mix(in srgb, var(--accent-ij-wash) ${hovering ? '70' : '40'}%, transparent)`,
        padding: '40px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 150ms ease',
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} />
      <Upload size={32} color="var(--accent-ij-ink)" />
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 20,
          color: 'var(--ink)',
          marginTop: 12,
        }}
      >
        Drop files here
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--ink-4)',
          marginTop: 4,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        or browse
        <span style={{ color: 'var(--ink-5)' }}>·</span>
        paste with
        <kbd
          style={{
            padding: '1px 6px',
            border: '1px solid var(--paper-ink)',
            borderRadius: 3,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            background: 'var(--paper)',
          }}
        >
          ⌘V
        </kbd>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 20,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <FormatTag icon={<ImageIcon size={12} />} label="Screenshot" />
        <FormatTag icon={<Mail size={12} />} label="Email (.eml)" />
        <FormatTag icon={<FileText size={12} />} label="PDF" />
        <FormatTag icon={<Link2 size={12} />} label="LinkedIn URL" />
      </div>
    </div>
  )
}

function FormatTag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 999,
        border: '1px solid var(--paper-ink)',
        background: 'var(--card)',
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        color: 'var(--ink-3)',
      }}
    >
      {icon}
      {label}
    </span>
  )
}

function RecentDrops({ recent }: { recent: RecentDrop[] }) {
  return (
    <div
      style={{
        border: '1px solid var(--paper-ink)',
        borderRadius: 6,
        background: 'var(--card)',
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-4)',
          marginBottom: 10,
        }}
      >
        Your recent drops
      </div>
      {recent.length === 0 ? (
        <div
          style={{
            flex: 1,
            fontSize: 12,
            color: 'var(--ink-4)',
            lineHeight: 1.5,
            padding: '14px 6px',
          }}
        >
          Nothing dropped yet. Try the zone on the left — or drag a file anywhere in the app.
        </div>
      ) : (
        recent.map((r, i) => (
          <Link
            key={r.id}
            href="/documents"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-soft)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <FileText size={14} color="var(--ink-4)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--ink)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {r.filename}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--ink-4)',
                  fontFamily: 'var(--font-mono)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                → {r.routed} · {r.when}
              </div>
            </div>
            <StatusPill status={r.status} />
          </Link>
        ))
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const style = {
    'to-do': { bg: 'var(--accent-ij-wash)', color: 'var(--accent-ij-ink)' },
    closed: { bg: 'var(--paper-2)', color: 'var(--ink-5)' },
    attached: { bg: 'var(--accent-ij-wash)', color: 'var(--accent-ij-ink)' },
    processing: {
      bg: 'color-mix(in srgb, var(--status-warn) 14%, var(--paper))',
      color: 'var(--status-warn)',
    },
    pending: { bg: 'var(--paper-2)', color: 'var(--ink-4)' },
    failed: {
      bg: 'color-mix(in srgb, var(--s-rejected) 14%, var(--paper))',
      color: 'var(--s-rejected)',
    },
  }[status] ?? { bg: 'var(--paper-2)', color: 'var(--ink-4)' }
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        padding: '2px 6px',
        borderRadius: 4,
        background: style.bg,
        color: style.color,
      }}
    >
      {status}
    </span>
  )
}

function StepTwo() {
  return (
    <section style={{ marginBottom: 40 }}>
      <SectionLabel n={2} title="Extract" />
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 10px',
          borderRadius: 999,
          background: 'var(--paper-2)',
          color: 'var(--ink-4)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        Examples · not your data
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 16 }}>
        Five walkthroughs of how the AI handles different document types. Your own drops land in the{' '}
        <Link href="/documents" style={{ color: 'var(--accent-ij-ink)' }}>
          Documents
        </Link>{' '}
        list — with the same extraction format applied to your data.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {EXAMPLES.map((ex) => (
          <ExtractCard key={ex.id} ex={ex} />
        ))}
      </div>
    </section>
  )
}

function ExtractCard({ ex }: { ex: WorkedExample }) {
  const lowConfidence = ex.confidence < 85
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        border: '1px solid var(--paper-ink)',
        borderRadius: 6,
        background: 'var(--card)',
        overflow: 'hidden',
      }}
    >
      {/* LEFT — screenshot mock */}
      <div
        style={{
          padding: 16,
          borderRight: '1px solid var(--border-soft)',
          background: 'var(--paper-2)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-4)',
            marginBottom: 8,
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}
        >
          {ex.fileKind === 'email' && <Mail size={11} />}
          {ex.fileKind === 'pdf' && <FileText size={11} />}
          {ex.fileKind === 'image' && <ImageIcon size={11} />}
          {ex.filename}
        </div>
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--paper-ink)',
            borderRadius: 4,
            padding: 14,
            fontSize: 12,
          }}
        >
          <div style={{ color: 'var(--ink-4)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            From: {ex.screenshot.from}
          </div>
          <div style={{ fontWeight: 500, color: 'var(--ink)', marginTop: 4, marginBottom: 8 }}>
            {ex.screenshot.subject}
          </div>
          <div style={{ color: 'var(--ink-3)', fontSize: 12, lineHeight: 1.5 }}>
            {ex.screenshot.body.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — extracted fields */}
      <div
        style={{
          padding: 16,
          border: `1.5px dashed ${lowConfidence ? 'var(--status-warn)' : 'var(--accent-ij)'}`,
          margin: 10,
          borderRadius: 4,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-4)',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--accent-ij-ink)',
            }}
          >
            <Sparkles size={11} /> Extracted · AI
          </span>
          <span
            style={{
              color: lowConfidence ? 'var(--status-warn)' : 'var(--ink-3)',
              fontWeight: 500,
            }}
          >
            {ex.confidence}% confidence
          </span>
        </div>
        <dl style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 8, fontSize: 12 }}>
          <Field
            label="Type"
            value={ex.extracted.type}
            emphasize={ex.kind === 'reject' || ex.kind === 'advance'}
          />
          <Field
            label="Company"
            value={
              <span>
                {ex.extracted.company.name}
                {ex.extracted.company.matched ? (
                  <MatchPill label="matched" />
                ) : (
                  <MatchPill label="new" warn />
                )}
              </span>
            }
          />
          <Field
            label="Role"
            value={
              <span>
                {ex.extracted.role.name}
                {ex.extracted.role.matched ? (
                  <MatchPill label="matched" />
                ) : (
                  <MatchPill label="new" warn />
                )}
              </span>
            }
            emphasize
          />
          {ex.extracted.fromPerson && <Field label="From" value={ex.extracted.fromPerson} />}
          {ex.extracted.nextStep && (
            <Field label="Next step" value={ex.extracted.nextStep} emphasize />
          )}
          {ex.extracted.ask && <Field label="Ask" value={ex.extracted.ask} />}
          {ex.extracted.tone && <Field label="Tone" value={ex.extracted.tone} />}
          {ex.extracted.action && <Field label="Action" value={ex.extracted.action} emphasize />}
        </dl>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  emphasize,
}: {
  label: string
  value: React.ReactNode
  emphasize?: boolean
}) {
  return (
    <>
      <dt
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink-4)',
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          color: emphasize ? 'var(--accent-ij-ink)' : 'var(--ink)',
          fontWeight: emphasize ? 500 : 400,
        }}
      >
        {value}
      </dd>
    </>
  )
}

function MatchPill({ label, warn }: { label: string; warn?: boolean }) {
  return (
    <span
      style={{
        marginLeft: 8,
        padding: '1px 6px',
        borderRadius: 999,
        fontSize: 9,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-mono)',
        background: warn
          ? 'color-mix(in srgb, var(--status-warn) 14%, var(--paper))'
          : 'var(--accent-ij-wash)',
        color: warn ? 'var(--status-warn)' : 'var(--accent-ij-ink)',
      }}
    >
      · {label}
    </span>
  )
}

function StepThree() {
  return (
    <section style={{ marginBottom: 40 }}>
      <SectionLabel n={3} title="Routed" />
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 10px',
          borderRadius: 999,
          background: 'var(--paper-2)',
          color: 'var(--ink-4)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        Examples · not your data
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 16 }}>
        For each classification, an outcome: a to-do created, a role closed, an offer attached. At
        &lt;85% confidence the route drops into Needs Review instead of auto-applying.
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
        }}
      >
        {EXAMPLES.map((ex) => (
          <ActionCard key={ex.id} ex={ex} />
        ))}
      </div>
    </section>
  )
}

function ActionCard({ ex }: { ex: WorkedExample }) {
  const color =
    ex.action.kind === 'closed'
      ? 'var(--s-rejected)'
      : ex.action.kind === 'needs-review'
        ? 'var(--status-warn)'
        : ex.action.kind === 'attached'
          ? 'var(--ink-3)'
          : 'var(--accent-ij-ink)'
  const icon =
    ex.action.kind === 'closed' ? (
      <XCircle size={13} />
    ) : ex.action.kind === 'needs-review' ? (
      <AlertCircle size={13} />
    ) : ex.action.kind === 'attached' ? (
      <Clipboard size={13} />
    ) : (
      <CheckCircle2 size={13} />
    )
  return (
    <div
      style={{
        border: '1px solid var(--paper-ink)',
        borderRadius: 6,
        background: 'var(--card)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: `color-mix(in srgb, ${color} 14%, var(--paper))`,
          color,
          padding: '6px 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {icon}
        {ex.action.header}
      </div>
      <div style={{ padding: 14 }}>
        <div
          style={{
            fontSize: 15,
            fontFamily: 'var(--font-serif)',
            fontWeight: 500,
            color: 'var(--ink)',
            textDecoration: ex.action.strikethrough ? 'line-through' : 'none',
            marginBottom: 6,
          }}
        >
          {ex.action.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 14 }}>
          {ex.action.body}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ex.action.ctas.map((c) => (
            <button
              key={c.label}
              type="button"
              style={{
                padding: '5px 11px',
                fontSize: 11,
                border: c.primary ? 'none' : '1px solid var(--paper-ink)',
                borderRadius: 4,
                background: c.primary ? 'var(--accent-ij-ink)' : 'var(--card)',
                color: c.primary ? '#fff' : 'var(--ink-2)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontWeight: c.primary ? 500 : 400,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SettingsFooter() {
  return (
    <div
      style={{
        marginTop: 20,
        border: '1px solid var(--paper-ink)',
        borderRadius: 6,
        background: 'var(--card)',
        padding: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-4)',
            marginBottom: 4,
          }}
        >
          Settings · document parsing
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          Auto-route confidence threshold:{' '}
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>85%</span>. Below that, drops land
          in a <em>Needs review</em> queue. Forwarding address:{' '}
          <code
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '1px 6px',
              background: 'var(--paper-2)',
              borderRadius: 3,
            }}
          >
            track@interviewjourney.app
          </code>
        </div>
      </div>
      <Link
        href="/settings"
        style={{
          padding: '6px 12px',
          fontSize: 12,
          border: '1px solid var(--paper-ink)',
          borderRadius: 4,
          background: 'var(--paper)',
          color: 'var(--ink-2)',
          textDecoration: 'none',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Configure →
      </Link>
    </div>
  )
}
