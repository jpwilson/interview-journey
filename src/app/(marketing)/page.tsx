'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

type Company = { name: string; mark: string; tint: string }

const COMPANIES: Company[] = [
  { name: 'Linear', mark: 'L', tint: 'oklch(72% 0.12 290)' },
  { name: 'Anthropic', mark: 'A', tint: 'oklch(72% 0.10 35)' },
  { name: 'Vercel', mark: 'V', tint: 'oklch(24% 0.02 60)' },
  { name: 'Notion', mark: 'N', tint: 'oklch(70% 0.03 60)' },
  { name: 'Stripe', mark: 'S', tint: 'oklch(62% 0.15 280)' },
  { name: 'Airbnb', mark: 'A', tint: 'oklch(64% 0.16 10)' },
  { name: 'Figma', mark: 'F', tint: 'oklch(66% 0.16 30)' },
  { name: 'Coinbase', mark: 'C', tint: 'oklch(58% 0.14 250)' },
  { name: 'Lyft', mark: 'L', tint: 'oklch(64% 0.18 340)' },
  { name: 'OpenAI', mark: 'O', tint: 'oklch(55% 0.08 160)' },
]

// Palette tokens live in globals.css. Styles here reference them via CSS vars.
const FONT_SERIF = 'var(--font-serif)'
const FONT_SANS = 'var(--font-sans)'
const FONT_MONO = 'var(--font-mono)'
const ACCENT = 'var(--accent-ij)'
const ACCENT_INK = 'var(--accent-ij-ink)'
const ACCENT_WASH = 'var(--accent-ij-wash)'

function Wordmark({ size = 16 }: { size?: number }) {
  return (
    <span
      style={{
        fontFamily: FONT_SERIF,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: -0.3,
        color: 'var(--ink)',
      }}
    >
      Interview <em style={{ fontStyle: 'italic', color: ACCENT_INK }}>Journey</em>
    </span>
  )
}

function RotatingWord({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % words.length), interval)
    return () => clearInterval(t)
  }, [words.length, interval])
  const widest = words.reduce((a, b) => (b.length > a.length ? b : a), '')
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'baseline',
        whiteSpace: 'nowrap',
      }}
    >
      <em style={{ fontStyle: 'italic', fontWeight: 400, visibility: 'hidden' }}>{widest}</em>
      {words.map((w, j) => {
        const nextIdx = (j + 1) % words.length
        return (
          <em
            key={w}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              fontStyle: 'italic',
              fontWeight: 400,
              color: ACCENT_INK,
              whiteSpace: 'nowrap',
              opacity: i === j ? 1 : 0,
              transform:
                i === j
                  ? 'translateY(0)'
                  : i === nextIdx
                    ? 'translateY(-18px)'
                    : 'translateY(18px)',
              transition:
                'opacity .7s cubic-bezier(.2,.7,.3,1), transform .7s cubic-bezier(.2,.7,.3,1)',
              filter: i === j ? 'blur(0)' : 'blur(4px)',
            }}
          >
            {w}
          </em>
        )
      })}
    </span>
  )
}

function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode
  delay?: number
  style?: CSSProperties
}) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSeen(true), 30)
    return () => clearTimeout(t)
  }, [])
  return (
    <div
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity .9s cubic-bezier(.2,.7,.3,1) ${delay}ms, transform .9s cubic-bezier(.2,.7,.3,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function AmbientBg() {
  const blob = (pos: CSSProperties, size: number, glow: string, anim: string): CSSProperties => ({
    position: 'absolute',
    width: size,
    height: size,
    background: `radial-gradient(circle, ${glow}, transparent 70%)`,
    filter: 'blur(20px)',
    animation: `${anim} ease-in-out infinite`,
    ...pos,
  })
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <div
        style={blob({ left: '10%', top: '8%' }, 520, 'var(--accent-ij-glow-a)', 'ij-drift1 22s')}
      />
      <div
        style={blob({ right: '-8%', top: '30%' }, 620, 'var(--accent-ij-glow-b)', 'ij-drift2 28s')}
      />
      <div
        style={blob(
          { left: '25%', bottom: '-10%' },
          680,
          'var(--accent-ij-glow-c)',
          'ij-drift3 34s'
        )}
      />
    </div>
  )
}

function FlyingDocsDemo() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 3400)
    return () => clearInterval(t)
  }, [])
  const docs = [
    { label: 'Stripe offer.pdf', color: 'var(--s-offer)', target: 0.88, row: 2 },
    { label: 'Anthropic invite.eml', color: 'var(--s-interview)', target: 0.78, row: 0 },
    { label: 'Figma NDA.pdf', color: 'var(--s-rejected)', target: 0.42, row: 4 },
    { label: 'Notion reply.eml', color: 'var(--s-screening)', target: 0.58, row: 3 },
    { label: 'Vercel reschedule', color: 'var(--s-applied)', target: 0.68, row: 1 },
  ]
  const d = docs[tick % docs.length]
  const rows = 5
  const W = 560
  const H = 240
  const padL = 70
  const padR = 24
  const rowY = (r: number) => 30 + r * ((H - 50) / (rows - 1))
  const targetX = padL + (W - padL - padR) * d.target
  const targetY = rowY(d.row)
  const rowColors = [
    'var(--s-interview)',
    'var(--s-applied)',
    'var(--s-offer)',
    'var(--s-screening)',
    'var(--s-rejected)',
  ]
  const rowNames = ['Anthropic', 'Vercel', 'Stripe', 'Notion', 'Figma']

  return (
    <div style={{ position: 'relative', width: W, height: H, margin: '0 auto', maxWidth: '100%' }}>
      <div
        key={tick}
        style={{
          position: 'absolute',
          left: targetX - 70,
          top: targetY - 42,
          background: '#fff',
          border: '1px solid var(--paper-ink)',
          borderRadius: 3,
          padding: '6px 10px',
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: 'var(--ink-2)',
          boxShadow: '0 8px 24px rgba(60,40,10,.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          animation: 'ij-drop-in 3.2s cubic-bezier(.2,.7,.3,1) forwards',
          transformOrigin: 'center bottom',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color }} />
        {d.label}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: 'absolute', inset: 0, maxWidth: '100%' }}
      >
        {[0, 1, 2, 3, 4].map((r) => {
          const y = rowY(r)
          const firstX = padL + 10 + ((r * 13) % 40)
          const endX = W - padR - (r === 4 ? 40 : r === 3 ? 20 : r * 8)
          const color = rowColors[r]
          return (
            <g key={r}>
              <text
                x={padL - 8}
                y={y + 3}
                textAnchor="end"
                fontFamily={FONT_SANS}
                fontSize="10"
                fill="var(--ink-3)"
              >
                {rowNames[r]}
              </text>
              <line
                x1={firstX}
                y1={y}
                x2={endX}
                y2={y}
                stroke={color}
                strokeWidth="1.6"
                opacity="0.75"
                strokeLinecap="round"
              />
              {[0, 1, 2].map((j) => (
                <circle
                  key={j}
                  cx={firstX + (j * (endX - firstX)) / 3}
                  cy={y}
                  r="2.4"
                  fill="var(--paper)"
                  stroke={color}
                  strokeWidth="1.2"
                />
              ))}
              {r === d.row && (
                <circle
                  cx={targetX}
                  cy={y}
                  r="5"
                  fill={d.color}
                  style={{ animation: 'ij-ping 3.2s 2.6s forwards' }}
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function CompanyMarquee() {
  const doubled = [...COMPANIES, ...COMPANIES, ...COMPANIES]
  const mask = 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
  return (
    <div
      style={{
        overflow: 'hidden',
        padding: '18px 0',
        position: 'relative',
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 48,
          width: 'max-content',
          animation: 'ij-marquee 40s linear infinite',
        }}
      >
        {doubled.map((c, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: FONT_SERIF,
              fontStyle: 'italic',
              fontSize: 20,
              color: 'var(--ink-3)',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 5,
                background: c.tint,
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT_SANS,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {c.mark}
            </span>
            {c.name}
          </div>
        ))}
      </div>
    </div>
  )
}

function DropVisual() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 90,
            height: 110,
            background: '#fff',
            border: '1px solid var(--paper-ink)',
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(60,40,10,.1)',
            transformOrigin: 'bottom center',
            animation: `ij-drop${i} 4s ${i * 0.8}s ease-in-out infinite`,
          }}
        >
          <div
            style={{
              height: 8,
              width: 50,
              background: 'var(--paper-3)',
              margin: '14px 10px 8px',
              borderRadius: 1,
            }}
          />
          <div
            style={{ height: 4, width: 60, background: 'var(--paper-3)', margin: '0 10px 4px' }}
          />
          <div
            style={{ height: 4, width: 40, background: 'var(--paper-3)', margin: '0 10px 4px' }}
          />
          <div
            style={{ height: 4, width: 55, background: 'var(--paper-3)', margin: '0 10px 4px' }}
          />
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: ACCENT_INK,
          letterSpacing: '.15em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ background: ACCENT_WASH, padding: '3px 8px', borderRadius: 999 }}>
          classifying…
        </span>
      </div>
    </div>
  )
}

function RiverVisual() {
  const colors = [
    'var(--s-interview)',
    'var(--s-applied)',
    'var(--s-offer)',
    'var(--s-screening)',
    'var(--s-rejected)',
  ]
  const lengths = [220, 180, 240, 140, 100]
  return (
    <svg viewBox="0 0 300 180" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 28 + i * 30
        const len = lengths[i]
        return (
          <g key={i}>
            <line
              x1={20}
              y1={y}
              x2={20 + len}
              y2={y}
              stroke={colors[i]}
              strokeWidth="1.6"
              opacity="0.75"
              strokeLinecap="round"
              style={{
                strokeDasharray: 400,
                strokeDashoffset: 400,
                animation: `ij-draw 2.5s ${i * 0.15}s ease-out forwards`,
              }}
            />
            {[0, 1, 2].map((j) => (
              <circle
                key={j}
                cx={20 + ((j + 1) * len) / 4}
                cy={y}
                r="2.2"
                fill="var(--paper)"
                stroke={colors[i]}
                strokeWidth="1.2"
                style={{
                  opacity: 0,
                  animation: `ij-fade-in .3s ${i * 0.15 + 1.2 + j * 0.15}s forwards`,
                }}
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M12 4l-2 2M6 10l-2 2" />
    </svg>
  )
}

function CoachVisual() {
  return (
    <div
      style={{
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        height: '100%',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          background: 'var(--ink)',
          color: 'var(--paper)',
          borderRadius: 8,
          alignSelf: 'flex-end',
          maxWidth: '80%',
          fontSize: 11,
          fontFamily: FONT_SANS,
        }}
      >
        Should I counter Stripe&apos;s offer?
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            background: ACCENT_WASH,
            color: ACCENT_INK,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <SparkleIcon />
        </div>
        <div
          style={{
            padding: '8px 12px',
            background: 'var(--paper)',
            border: '1px solid var(--paper-ink)',
            borderRadius: 8,
            fontFamily: FONT_SERIF,
            fontStyle: 'italic',
            fontSize: 12,
            color: 'var(--ink)',
            lineHeight: 1.45,
          }}
        >
          Yes — your Anthropic onsite is Tuesday. Counter at $275k and buy yourself a week.
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 12,
              background: ACCENT,
              marginLeft: 3,
              verticalAlign: 'middle',
              animation: 'ij-blink 1s infinite',
            }}
          />
        </div>
      </div>
    </div>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M2 7h10M8 3l4 4-4 4" />
    </svg>
  )
}

const navLinkStyle: CSSProperties = { color: 'inherit', textDecoration: 'none' }

const ctaPrimary: CSSProperties = {
  padding: '14px 22px',
  fontSize: 14,
  fontWeight: 500,
  background: 'var(--ink)',
  color: 'var(--paper)',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontFamily: FONT_SANS,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  boxShadow: '0 4px 16px rgba(60,40,10,.15)',
  transition: 'transform .18s, box-shadow .18s',
  textDecoration: 'none',
}

const navCta: CSSProperties = {
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 500,
  background: 'var(--ink)',
  color: 'var(--paper)',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontFamily: FONT_SANS,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  textDecoration: 'none',
  lineHeight: 1.2,
}

export default function LandingPage() {
  const heroRef = useRef<HTMLElement | null>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const r = heroRef.current.getBoundingClientRect()
      setMouse({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      style={{
        background: 'var(--paper)',
        fontFamily: FONT_SANS,
        overflowX: 'hidden',
        color: 'var(--ink)',
      }}
    >
      {/* Top nav */}
      <nav
        style={{
          padding: '18px 40px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--paper-ink)',
          position: 'sticky',
          top: 0,
          background: 'color-mix(in oklch, var(--paper) 92%, transparent)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 20,
        }}
      >
        <Wordmark size={16} />
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: 'flex',
            gap: 22,
            fontSize: 13,
            color: 'var(--ink-2)',
            alignItems: 'center',
          }}
        >
          <a href="#how-it-works" style={navLinkStyle}>
            How it works
          </a>
          <a href="#timeline" style={navLinkStyle}>
            The timeline
          </a>
          <Link href="/pricing" style={navLinkStyle}>
            Pricing
          </Link>
          <Link href="/login" style={navLinkStyle}>
            Sign in
          </Link>
        </div>
        <Link href="/signup" style={{ ...navCta, marginLeft: 18 }}>
          Start your journey
        </Link>
      </nav>

      {/* Hero */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          padding: '100px 40px 20px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <AmbientBg />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Reveal delay={120}>
            <h1
              style={{
                margin: 0,
                fontFamily: FONT_SERIF,
                fontWeight: 300,
                fontSize: 'clamp(56px, 10vw, 104px)',
                lineHeight: 0.96,
                letterSpacing: -3,
                color: 'var(--ink)',
                transform: `translate(${mouse.x * -6}px, ${mouse.y * -4}px)`,
                transition: 'transform .6s cubic-bezier(.2,.7,.3,1)',
              }}
            >
              A quiet place
              <br />
              for the <RotatingWord words={['hardest', 'bravest', 'loneliest', 'most hopeful']} />
              <br />
              chapter of your career.
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p
              style={{
                marginTop: 40,
                fontFamily: FONT_SERIF,
                fontSize: 21,
                lineHeight: 1.55,
                color: 'var(--ink-2)',
                maxWidth: 640,
                fontWeight: 300,
              }}
            >
              Drop any email, offer, NDA, or rejection into{' '}
              <em style={{ color: ACCENT_INK }}>Interview Journey</em>. It reads it, files it, and
              plots every thread of your search on one living timeline. No spreadsheets. No lost
              threads. Just the story of your career, as it unfolds.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div
              style={{
                marginTop: 40,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link href="/signup" style={ctaPrimary}>
                Begin your journey — free
                <ArrowRightIcon />
              </Link>
              <button
                type="button"
                style={{
                  padding: '14px 18px',
                  background: 'transparent',
                  border: '1px solid var(--paper-ink)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  color: 'var(--ink-2)',
                  fontFamily: FONT_SANS,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: ACCENT_WASH,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="9" height="9" viewBox="0 0 9 9" fill={ACCENT_INK}>
                    <path d="M0 0l9 4.5L0 9z" />
                  </svg>
                </span>
                Watch the 90-second tour
              </button>
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 12,
                  color: 'var(--ink-4)',
                  fontFamily: FONT_MONO,
                }}
              >
                used by 11,000+ candidates · no card required
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Live demo */}
      <Reveal delay={500}>
        <section
          id="timeline"
          style={{ padding: '40px 40px 60px', maxWidth: 1200, margin: '0 auto' }}
        >
          <div
            style={{
              position: 'relative',
              background: 'linear-gradient(180deg, var(--paper-2), var(--paper))',
              border: '1px solid var(--paper-ink)',
              borderRadius: 12,
              padding: '40px 24px 36px',
              boxShadow: '0 20px 60px rgba(80,60,30,.08), 0 2px 8px rgba(80,60,30,.04)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: 'var(--ink-4)',
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                marginBottom: 4,
                textAlign: 'center',
              }}
            >
              Drop a document. Watch.
            </div>
            <div
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: 'italic',
                fontSize: 16,
                color: 'var(--ink-3)',
                textAlign: 'center',
                marginBottom: 18,
              }}
            >
              Every file finds its place on the river.
            </div>
            <FlyingDocsDemo />
          </div>
        </section>
      </Reveal>

      {/* Marquee */}
      <Reveal>
        <section
          style={{
            padding: '20px 0 40px',
            borderTop: '1px solid var(--paper-ink)',
            borderBottom: '1px solid var(--paper-ink)',
            background: 'var(--paper-2)',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: 'var(--ink-4)',
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            People track journeys to
          </div>
          <CompanyMarquee />
        </section>
      </Reveal>

      {/* Three promises */}
      <section
        id="how-it-works"
        style={{ padding: '100px 40px 100px', maxWidth: 1180, margin: '0 auto' }}
      >
        <Reveal>
          <div style={{ marginBottom: 60, maxWidth: 720 }}>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 11,
                color: ACCENT_INK,
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              The three promises
            </div>
            <h2
              style={{
                margin: 0,
                fontFamily: FONT_SERIF,
                fontWeight: 300,
                fontSize: 'clamp(36px, 5vw, 52px)',
                letterSpacing: -1,
                lineHeight: 1.05,
              }}
            >
              A job search doesn&apos;t have to
              <br />
              feel like <em style={{ color: ACCENT_INK }}>drowning</em>.
            </h2>
          </div>
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 44,
          }}
        >
          {[
            {
              k: '01',
              t: 'Drop, don’t type',
              body: 'Forward an email. Drag a PDF. Paste a screenshot. It figures out which role it belongs to, what stage, what the next move is.',
              visual: <DropVisual />,
            },
            {
              k: '02',
              t: 'See the whole river',
              body: 'Every role you’ve opened, plotted together in one living timeline. The pattern of your career, visible at a glance. Zoom in to any moment.',
              visual: <RiverVisual />,
            },
            {
              k: '03',
              t: 'A coach who remembers',
              body: 'Not a generic chatbot. It knows your offers, your rejections, your stalled threads — and uses all of it when you ask.',
              visual: <CoachVisual />,
            },
          ].map((p, i) => (
            <Reveal key={p.k} delay={i * 150}>
              <div
                style={{
                  height: 180,
                  borderRadius: 8,
                  background: 'var(--paper-2)',
                  border: '1px solid var(--paper-ink)',
                  marginBottom: 22,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {p.visual}
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontStyle: 'italic',
                  fontSize: 13,
                  color: ACCENT_INK,
                  marginBottom: 10,
                }}
              >
                — {p.k}
              </div>
              <h3
                style={{
                  margin: 0,
                  fontFamily: FONT_SERIF,
                  fontSize: 28,
                  fontWeight: 400,
                  lineHeight: 1.15,
                  letterSpacing: -0.4,
                  color: 'var(--ink)',
                }}
              >
                {p.t}
              </h3>
              <p
                style={{
                  marginTop: 12,
                  fontFamily: FONT_SERIF,
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: 'var(--ink-2)',
                }}
              >
                {p.body}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stat band */}
      <Reveal>
        <section
          style={{
            padding: '80px 40px',
            background: 'var(--ink)',
            color: 'var(--paper)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at top left, color-mix(in oklch, var(--accent-ij) 30%, transparent), transparent 60%)',
              opacity: 0.5,
            }}
          />
          <div
            style={{
              maxWidth: 1080,
              margin: '0 auto',
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 20,
            }}
          >
            {[
              { v: '11,240', k: 'Active searches' },
              { v: '184k', k: 'Documents classified' },
              { v: '97%', k: 'Classification accuracy' },
              { v: '2.3×', k: 'Faster replies' },
            ].map((s, i) => (
              <Reveal key={s.k} delay={i * 100}>
                <div
                  style={{
                    fontFamily: FONT_SERIF,
                    fontSize: 'clamp(40px, 5vw, 56px)',
                    fontWeight: 300,
                    letterSpacing: -1.2,
                    lineHeight: 1,
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 10,
                    letterSpacing: '.15em',
                    textTransform: 'uppercase',
                    color: 'color-mix(in oklch, var(--paper) 60%, transparent)',
                    marginTop: 10,
                  }}
                >
                  {s.k}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Pull quote */}
      <section
        style={{
          padding: '110px 40px',
          background: 'var(--paper-2)',
          borderBottom: '1px solid var(--paper-ink)',
        }}
      >
        <Reveal>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div
              style={{
                fontFamily: FONT_SERIF,
                fontSize: 140,
                color: ACCENT,
                opacity: 0.35,
                lineHeight: 0.5,
                height: 60,
                fontWeight: 300,
              }}
            >
              &ldquo;
            </div>
            <div
              style={{
                fontFamily: FONT_SERIF,
                fontStyle: 'italic',
                fontSize: 'clamp(28px, 4vw, 42px)',
                lineHeight: 1.28,
                letterSpacing: -0.5,
                color: 'var(--ink)',
                fontWeight: 300,
              }}
            >
              It&apos;s the first thing I&apos;ve used that makes a job search feel less like
              drowning. The timeline alone is worth it — I can finally{' '}
              <em style={{ color: ACCENT_INK }}>see my own effort</em>.
            </div>
            <div
              style={{
                marginTop: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontSize: 13,
                color: 'var(--ink-3)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${ACCENT}, oklch(58% 0.10 30))`,
                }}
              />
              <div>
                <div style={{ color: 'var(--ink)', fontWeight: 500, fontSize: 14 }}>
                  Riley Okonkwo
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 11 }}>
                  Staff Engineer · 3 offers in 9 weeks
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '140px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <AmbientBg />
        <Reveal>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: FONT_SERIF,
                fontWeight: 300,
                fontSize: 'clamp(44px, 6.5vw, 78px)',
                letterSpacing: -1.8,
                lineHeight: 1.02,
                color: 'var(--ink)',
              }}
            >
              Your next chapter
              <br />
              deserves a <em style={{ fontStyle: 'italic', color: ACCENT_INK }}>better notebook</em>
              .
            </h2>
            <div style={{ marginTop: 44 }}>
              <Link
                href="/signup"
                style={{
                  padding: '15px 28px',
                  fontSize: 15,
                  fontWeight: 500,
                  background: 'var(--ink)',
                  color: 'var(--paper)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: FONT_SANS,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 8px 32px rgba(60,40,10,.2)',
                  textDecoration: 'none',
                }}
              >
                Begin — it&apos;s free
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer
        style={{
          padding: '40px',
          borderTop: '1px solid var(--paper-ink)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 11,
          color: 'var(--ink-4)',
          fontFamily: FONT_MONO,
        }}
      >
        <Wordmark size={13} />
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <Link href="/terms" style={{ color: 'var(--ink-4)', textDecoration: 'none' }}>
            Terms
          </Link>
          <Link href="/privacy" style={{ color: 'var(--ink-4)', textDecoration: 'none' }}>
            Privacy
          </Link>
          <span>&copy; {new Date().getFullYear()} · built quietly in sf</span>
        </div>
      </footer>
    </div>
  )
}
