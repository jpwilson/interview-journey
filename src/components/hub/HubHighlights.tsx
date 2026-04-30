'use client'

import { useEffect, useState } from 'react'
import { Award, Briefcase, TrendingUp, Sparkles, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Highlight = {
  icon: React.ComponentType<{ size?: number }>
  kicker: string
  title: string
  sub: string
}

export function HubHighlights() {
  const [highlights, setHighlights] = useState<Highlight[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const [rolesRes, offersRes, profileRes] = await Promise.all([
        supabase.from('roles').select('*, company:companies(name)').eq('user_id', user.id),
        supabase.from('offers').select('*').eq('user_id', user.id),
        supabase
          .from('profiles')
          .select('current_employer_id, current_title, employment_start_date')
          .eq('id', user.id)
          .maybeSingle(),
      ])

      type RoleLite = {
        stage: string
        resolution: string | null
        company: { name: string } | null
      }
      type OfferLite = { status: string; base_salary: number | null; signing_bonus: number | null }
      const roles = (rolesRes.data ?? []) as RoleLite[]
      const offers = (offersRes.data ?? []) as OfferLite[]
      const profile = profileRes.data

      const list: Highlight[] = []

      // Current employment highlight
      if (profile?.employment_start_date) {
        const tenure = fmtTenure(profile.employment_start_date)
        list.push({
          icon: Briefcase,
          kicker: 'You are here',
          title: profile.current_title ?? 'Current role',
          sub: `${tenure} at your current employer`,
        })
      }

      // Offers on the table
      const pendingOffers = offers.filter((o) => o.status === 'pending')
      if (pendingOffers.length > 0) {
        const best = pendingOffers.reduce<number>(
          (max, o) => Math.max(max, (o.base_salary ?? 0) + (o.signing_bonus ?? 0)),
          0
        )
        list.push({
          icon: Sparkles,
          kicker: 'Active offer' + (pendingOffers.length > 1 ? 's' : ''),
          title:
            best > 0
              ? `${pendingOffers.length} offer${pendingOffers.length > 1 ? 's' : ''} · up to $${Math.round(best / 1000)}k`
              : `${pendingOffers.length} offers pending`,
          sub: 'Open the Offers page to compare',
        })
      }

      // Total applications
      if (roles.length > 0) {
        const active = roles.filter((r) => r.stage !== 'resolved').length
        list.push({
          icon: TrendingUp,
          kicker: 'This search',
          title: `${roles.length} applications tracked`,
          sub: `${active} active · ${roles.length - active} resolved`,
        })
      }

      // Past hired roles (career wins)
      const pastHires = roles.filter((r) => r.stage === 'resolved' && r.resolution === 'hired')
      if (pastHires.length > 0) {
        list.push({
          icon: Award,
          kicker: 'Career wins',
          title: `${pastHires.length} role${pastHires.length > 1 ? 's' : ''} landed`,
          sub: pastHires
            .slice(0, 3)
            .map((r) => r.company?.name ?? 'Unknown')
            .join(' · '),
        })
      }

      // Latest interview
      const advancedRoles = roles.filter((r) =>
        ['interviewing', 'offer', 'negotiating'].includes(r.stage)
      )
      if (advancedRoles.length > 0) {
        list.push({
          icon: Clock,
          kicker: 'In diligence',
          title: `${advancedRoles.length} role${advancedRoles.length > 1 ? 's' : ''} past screening`,
          sub: advancedRoles
            .slice(0, 3)
            .map((r) => r.company?.name ?? 'Unknown')
            .join(' · '),
        })
      }

      if (!cancelled) setHighlights(list)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (highlights == null) {
    return (
      <div style={{ fontSize: 12, color: 'var(--ink-4)', padding: '8px 2px' }}>
        Loading highlights…
      </div>
    )
  }

  if (highlights.length === 0) {
    return (
      <div style={{ fontSize: 12, color: 'var(--ink-4)', padding: '8px 2px', lineHeight: 1.5 }}>
        Your highlights appear here as you log roles, interviews, and offers. Add your first role to
        get started.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {highlights.map((h, i) => {
        const Icon = h.icon
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: 10,
              border: '1px solid var(--paper-ink)',
              borderRadius: 4,
              background: 'var(--card)',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                background: 'var(--accent-ij-wash)',
                color: 'var(--accent-ij-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={14} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-4)',
                }}
              >
                {h.kicker}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  marginTop: 2,
                }}
              >
                {h.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{h.sub}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function fmtTenure(iso: string) {
  const s = new Date(iso)
  const n = new Date()
  const m = (n.getFullYear() - s.getFullYear()) * 12 + (n.getMonth() - s.getMonth())
  if (m < 0) return ''
  const y = Math.floor(m / 12)
  const mm = m % 12
  return [y && `${y}y`, mm && `${mm}mo`].filter(Boolean).join(' ') || '0mo'
}
