const CHANGELOG = [
  {
    version: '0.1.0',
    date: 'April 2026',
    changes: [
      'AI document classification — drop any file, AI routes it automatically',
      'Kanban pipeline board with drag-and-drop stage management',
      'Per-application timeline with event history',
      'Career timeline view (Pro) — all companies on one axis',
      'Global drop zone — drop files anywhere in the app',
      'Supabase Realtime — live classification status updates',
      'Stripe billing — Free and Pro tiers',
      'Floating hub — career chatbot, analytics, changelog',
    ],
  },
]

export function HubChangelog() {
  return (
    <div className="space-y-4">
      {CHANGELOG.map((entry) => (
        <div key={entry.version}>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-blue-600 px-2 py-0.5 font-mono text-xs text-white">
              v{entry.version}
            </span>
            <span className="text-xs text-slate-500">{entry.date}</span>
          </div>
          <ul className="space-y-1.5">
            {entry.changes.map((change, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                {change}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
