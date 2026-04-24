import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy · Interview Journey',
  description: 'How Interview Journey handles your data.',
}

export default function PrivacyPage() {
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
          Interview{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--accent-ij-ink)' }}>Journey</em>
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
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--ink-4)', fontSize: 13 }}>Last updated: April 24, 2026</p>

        <section style={{ marginTop: 32 }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--ink)' }}>
            The short version: your pipeline, your documents, your timeline, your career — they
            belong to you. We store them for you, we don&apos;t sell them, and we don&apos;t train
            AI on them.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>What we collect</h2>
          <ul style={listStyle()}>
            <li>
              <strong>Account</strong> — email, display name, password hash (via Supabase Auth), and
              — if you choose Google Sign-in — a Google account ID.
            </li>
            <li>
              <strong>Profile</strong> — current employer, title, start date, search status, and
              preferences you provide during onboarding or in settings.
            </li>
            <li>
              <strong>Career data</strong> — the roles, companies, interviews, offers, timeline
              events, meetings, and documents you add.
            </li>
            <li>
              <strong>Usage</strong> — basic event logs (page views, feature usage) for product
              improvement. No third-party analytics SDKs that track you across the web.
            </li>
            <li>
              <strong>Billing</strong> — if you subscribe, Stripe stores your payment details. We
              receive your subscription tier and status, not your card number.
            </li>
          </ul>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>How your documents are processed</h2>
          <p>
            Drop a PDF, email, or screenshot and we send the file content to an AI provider
            (OpenRouter routing to Gemini) to classify it — is this an offer, a rejection, an
            invitation to an interview, an NDA, etc. The AI response is stored on the document
            record so you can see what the classification said.
          </p>
          <p style={{ marginTop: 8 }}>
            We request zero-retention processing from AI providers. We do not use your documents
            to train any model, and we do not share them with recruiters, employers, or any third
            party.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>Who we share with</h2>
          <ul style={listStyle()}>
            <li>
              <strong>Supabase</strong> — our database and storage provider.
            </li>
            <li>
              <strong>OpenRouter / Google (Gemini)</strong> — for document classification. Zero-
              retention where available.
            </li>
            <li>
              <strong>Stripe</strong> — payment processing for Pro subscriptions.
            </li>
            <li>
              <strong>Vercel</strong> — hosting + edge network.
            </li>
            <li>
              <strong>Postmark</strong> (when configured) — inbound email ingestion for forwarded
              recruiter messages, and outbound transactional email.
            </li>
          </ul>
          <p style={{ marginTop: 8 }}>
            We don&apos;t share with advertisers. We don&apos;t sell data. Ever.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>How long we keep it</h2>
          <p>
            We keep your data for as long as your account is active. When you delete your account,
            we delete your profile, career data, documents, and AI classifications within 30 days.
            Backups are purged within 60 days.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>Your rights</h2>
          <p>
            You can access, export, correct, or delete your data at any time from the Settings
            page, or by emailing{' '}
            <a href="mailto:privacy@interviewjourney.app" style={linkStyle()}>
              privacy@interviewjourney.app
            </a>
            . If you&apos;re in the EU, UK, or California, applicable laws (GDPR, CCPA) give you
            specific rights — we honor all of them.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>Cookies</h2>
          <p>
            We use strictly-necessary cookies for authentication and session management. We
            don&apos;t use advertising cookies or cross-site trackers.
          </p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>Children</h2>
          <p>Interview Journey is not intended for users under 16.</p>
        </section>

        <section style={sectionStyle()}>
          <h2 style={sectionTitle()}>Getting in touch</h2>
          <p>
            Questions about privacy?{' '}
            <a href="mailto:privacy@interviewjourney.app" style={linkStyle()}>
              privacy@interviewjourney.app
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
          See also: <Link href="/terms" style={linkStyle()}>Terms of Service</Link>
          {' · '}
          <Link href="/" style={linkStyle()}>Back to home</Link>
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
