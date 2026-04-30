import { PageHeader, PageShell } from '@/components/ui/PageHeader'
import { HubChatbot } from '@/components/hub/HubChatbot'

export default function CareerCoachPage() {
  return (
    <PageShell>
      <PageHeader
        kicker="Career Coach"
        title="A coach who remembers"
        subtitle="Not a generic chatbot — this one knows your pipeline, your offers, your stalled threads, your tenure. Ask anything about strategy, negotiation, or what to do next."
      />
      <div
        style={{
          padding: '22px 22px 80px',
          maxWidth: 860,
          margin: '0 auto',
          height: 'calc(100vh - 180px)',
          minHeight: 520,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            background: 'var(--card)',
            border: '1px solid var(--paper-ink)',
            borderRadius: 6,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <HubChatbot />
        </div>
      </div>
    </PageShell>
  )
}
