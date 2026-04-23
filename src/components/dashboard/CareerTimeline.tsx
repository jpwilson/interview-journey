import type { CSSProperties } from 'react'

export type CareerRole = {
  id: string
  company: string
  title: string
  startISO: string
  endISO: string | null // null = current
  how?: 'referral' | 'cold' | 'recruiter' | 'intro' | string | null
}

export function CareerTimeline({ roles, height = 120 }: { roles: CareerRole[]; height?: number }) {
  const now = new Date()
  // Default span: 7 years ending now, unless user has older roles
  const earliestRole = roles.reduce<Date | null>((min, r) => {
    const d = new Date(r.startISO)
    return !min || d < min ? d : min
  }, null)
  const defaultStart = new Date()
  defaultStart.setFullYear(now.getFullYear() - 7)
  const start = earliestRole && earliestRole < defaultStart ? earliestRole : defaultStart
  const end = new Date(now.getFullYear() + 1, 0, 1)
  const span = end.getTime() - start.getTime()

  const W = 1000
  const pad = 20
  const innerW = W - pad * 2
  const xFor = (iso: string | Date) => {
    const t = typeof iso === 'string' ? new Date(iso).getTime() : iso.getTime()
    return pad + ((t - start.getTime()) / span) * innerW
  }
  const years = []
  for (let y = start.getFullYear() + 1; y <= end.getFullYear(); y++) years.push(y)

  const textStyle: CSSProperties = { fontFamily: 'var(--font-sans)' }

  if (roles.length === 0) {
    return (
      <div
        style={{
          padding: '28px 20px',
          textAlign: 'center',
          border: '1px dashed var(--paper-ink)',
          borderRadius: 6,
          color: 'var(--ink-4)',
          fontSize: 12,
        }}
      >
        No past or current roles yet.{' '}
        <a href="/settings" style={{ color: 'var(--accent-ij-ink)' }}>
          Add your current role →
        </a>
      </div>
    )
  }

  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" style={{ display: 'block', ...textStyle }}>
      {years.map((y) => (
        <g key={y}>
          <line
            x1={xFor(`${y}-01-01`)}
            y1={20}
            x2={xFor(`${y}-01-01`)}
            y2={height - 30}
            stroke="var(--paper-ink)"
            strokeDasharray="2 3"
          />
          <text
            x={xFor(`${y}-01-01`)}
            y={14}
            fontSize="9"
            fill="var(--ink-5)"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            {y}
          </text>
        </g>
      ))}

      <line
        x1={xFor(now)}
        y1={20}
        x2={xFor(now)}
        y2={height - 30}
        stroke="var(--accent-ij)"
        strokeWidth="1"
      />
      <text
        x={xFor(now)}
        y={height - 18}
        fontSize="8"
        fill="var(--accent-ij-ink)"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
        letterSpacing="1"
      >
        NOW
      </text>

      {roles.map((r) => {
        const x1 = xFor(r.startISO)
        const x2 = xFor(r.endISO ?? now)
        const y = 50
        const current = !r.endISO
        return (
          <g key={r.id}>
            <rect
              x={x1}
              y={y}
              width={Math.max(8, x2 - x1)}
              height={14}
              rx={3}
              fill={current ? 'var(--accent-ij)' : 'var(--ink-5)'}
              fillOpacity={current ? 1 : 0.55}
            />
            <text
              x={x1 + 6}
              y={y - 4}
              fontSize="10"
              fill="var(--ink)"
              fontFamily="var(--font-serif)"
              fontStyle="italic"
            >
              {r.company}
            </text>
            <text x={x1 + 6} y={y + 28} fontSize="9" fill="var(--ink-4)">
              {r.title}
            </text>
            {r.how && (
              <text
                x={x1 + 6}
                y={y + 40}
                fontSize="8"
                fill="var(--ink-5)"
                fontFamily="var(--font-mono)"
                letterSpacing=".08em"
              >
                {r.how.toUpperCase()}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
