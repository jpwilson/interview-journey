import type { CSSProperties } from 'react'

export function PageHeader({
  kicker,
  title,
  subtitle,
  right,
  style,
}: {
  kicker: string
  title: string
  subtitle?: string
  right?: React.ReactNode
  style?: CSSProperties
}) {
  return (
    <header
      style={{
        padding: '24px 22px 18px',
        borderBottom: '1px solid var(--paper-ink)',
        background: 'var(--card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        flexWrap: 'wrap',
        ...style,
      }}
    >
      <div style={{ flex: '1 1 480px', minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-4)',
          }}
        >
          {kicker}
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
          {title}
        </h1>
        {subtitle && (
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4, maxWidth: 720 }}>
            {subtitle}
          </div>
        )}
      </div>
      {right && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{right}</div>}
    </header>
  )
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100%', background: 'var(--paper)' }}>
      {children}
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </div>
  )
}

export function EditorialCard({
  children,
  style,
  className,
}: {
  children: React.ReactNode
  style?: CSSProperties
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--paper-ink)',
        borderRadius: 6,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
