import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service · Interview Journey',
  description: 'The terms that govern your use of Interview Journey.',
}

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      <nav
        style={{
          padding: '18px 40px',
          borderBottom: '1px solid var(--paper-ink)',
          background: 'var(--card)',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 500,
            fontSize: 16,
            color: 'var(--ink)',
            textDecoration: 'none',
            letterSpacing: -0.3,
          }}
        >
          Interview <em style={{ fontStyle: 'italic', color: 'var(--accent-ij-ink)' }}>Journey</em>
        </Link>
      </nav>

      <article
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '48px 24px 96px',
          fontFamily: 'var(--font-sans)',
          color: 'var(--ink-2)',
          lineHeight: 1.7,
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
          Legal
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: -0.5,
            color: 'var(--ink)',
            margin: '6px 0 8px',
          }}
        >
          Terms of Service
        </h1>
        <p style={{ color: 'var(--ink-4)', fontSize: 13 }}>Last updated: April 24, 2026</p>

        <section style={{ marginTop: 32 }}>
          <h2 style={sectionTitle()}>1. What this is</h2>
          <p>
            These terms govern your use of Interview Journey (the &ldquo;Service&rdquo;), a personal
            CRM for tracking your career — applications, interviews, offers, documents, and the
            companies you engage. By creating an account or using any part of the Service, you agree
            to these terms.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>2. Your account</h2>
          <p>
            You&apos;re responsible for keeping your credentials secure. You&apos;re also
            responsible for the accuracy of what you put into the Service. If you let someone else
            use your account, their actions are treated as yours.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>3. Your data belongs to you</h2>
          <p>
            The applications, documents, notes, timeline, and career history you add to Interview
            Journey are yours. We store them on your behalf and give you export tools (CSV on Free,
            CSV + PDF on Pro). You can delete your account at any time — we delete all personal data
            within 30 days.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>4. What we don&apos;t do</h2>
          <ul style={listStyle()}>
            <li>We don&apos;t sell your data. Ever.</li>
            <li>We don&apos;t share your documents, pipeline, or timeline with recruiters.</li>
            <li>
              We don&apos;t train AI models on your content. Third-party AI providers (OpenRouter →
              Gemini) process documents to classify them; we require providers to honor
              zero-retention terms wherever available.
            </li>
            <li>
              We don&apos;t run you through auto-apply bots or blast applications on your behalf.
            </li>
          </ul>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>5. AI and automation</h2>
          <p>
            Interview Journey uses AI to classify documents you drop into the app. Classifications
            are probabilistic — we aim for &ge;85% confidence before auto-routing and send lower-
            confidence items to a review queue. You are always the final arbiter of what lands
            where. We are not responsible for decisions you make based on AI suggestions.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>6. Pro subscriptions</h2>
          <p>
            Pro plans auto-renew until canceled. You can cancel at any time; cancellation stops the
            next renewal but doesn&apos;t refund the current billing period unless required by law.
            Refunds for annual plans within the first 14 days are processed on request.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>7. Changes to the Service</h2>
          <p>
            We&apos;re a new product and we iterate often. We may add, change, or remove features.
            If we make a material change to these terms, we&apos;ll email you first.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>8. The legal fine print</h2>
          <p>
            The Service is provided &ldquo;as is.&rdquo; To the maximum extent permitted by law, we
            disclaim all warranties and aren&apos;t liable for indirect or consequential damages.
            Our total liability is limited to the amount you paid us in the 12 months preceding the
            claim. Disputes are governed by the laws of the State of California, USA, and will be
            resolved in the courts of San Francisco County.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>9. Getting in touch</h2>
          <p>
            Questions about these terms?{' '}
            <a href="mailto:hello@interviewjourney.app" style={linkStyle()}>
              hello@interviewjourney.app
            </a>
            .
          </p>
        </section>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid var(--paper-ink)',
            fontSize: 13,
            color: 'var(--ink-4)',
          }}
        >
          See also:{' '}
          <Link href="/privacy" style={linkStyle()}>
            Privacy Policy
          </Link>
          {' · '}
          <Link href="/" style={linkStyle()}>
            Back to home
          </Link>
        </div>
      </article>
    </div>
  )
}

function sectionStyle(): React.CSSProperties {
  return { marginTop: 24 }
}
function sectionTitle(): React.CSSProperties {
  return {
    fontFamily: 'var(--font-serif)',
    fontSize: 20,
    fontWeight: 500,
    letterSpacing: -0.2,
    color: 'var(--ink)',
    margin: '0 0 8px',
  }
}
function listStyle(): React.CSSProperties {
  return { paddingLeft: 20, margin: '8px 0' }
}
function linkStyle(): React.CSSProperties {
  return { color: 'var(--accent-ij-ink)', textDecoration: 'none', fontWeight: 500 }
}
