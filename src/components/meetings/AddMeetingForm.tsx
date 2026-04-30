'use client'

import { useRef, useState } from 'react'
import { addMeeting } from '@/lib/actions/meetings'
import { Button } from '@/components/ui/button'

const MEETING_TYPES = [
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'recruiter_call', label: 'Recruiter Call' },
  { value: 'hiring_manager', label: 'Hiring Manager' },
  { value: 'technical', label: 'Technical Interview' },
  { value: 'system_design', label: 'System Design' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'panel', label: 'Panel Interview' },
  { value: 'final_round', label: 'Final Round' },
  { value: 'offer_call', label: 'Offer Call' },
  { value: 'other', label: 'Other' },
]

interface AddMeetingFormProps {
  roleId: string
  onCancel: () => void
}

export function AddMeetingForm({ roleId, onCancel }: AddMeetingFormProps) {
  const [isPending, setIsPending] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    try {
      await addMeeting(formData)
      formRef.current?.reset()
      onCancel()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
    >
      <input type="hidden" name="role_id" value={roleId} />

      <h3 className="text-sm font-semibold text-slate-900">Add Meeting</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Meeting type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Type</label>
          <select
            name="type"
            required
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[var(--accent-ij)] focus:ring-2 focus:ring-[var(--accent-ij)] focus:outline-none"
          >
            <option value="">Select type…</option>
            {MEETING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Platform */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Platform</label>
          <input
            type="text"
            name="platform"
            placeholder="Zoom, Teams, phone…"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent-ij)] focus:ring-2 focus:ring-[var(--accent-ij)] focus:outline-none"
          />
        </div>

        {/* Scheduled at */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Date & Time</label>
          <input
            type="datetime-local"
            name="scheduled_at"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[var(--accent-ij)] focus:ring-2 focus:ring-[var(--accent-ij)] focus:outline-none"
          />
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Duration (minutes)</label>
          <input
            type="number"
            name="duration_minutes"
            placeholder="60"
            min={1}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent-ij)] focus:ring-2 focus:ring-[var(--accent-ij)] focus:outline-none"
          />
        </div>
      </div>

      {/* Prep notes */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">Prep notes</label>
        <textarea
          name="prep_notes"
          rows={2}
          placeholder="What to research, how to prepare…"
          className="resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent-ij)] focus:ring-2 focus:ring-[var(--accent-ij)] focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="rounded-full border-0 bg-gradient-to-br from-[var(--accent-ij)] to-[var(--accent-ij-ink)] px-5 font-semibold text-white shadow-[var(--accent-ij-glow-a)] shadow-md transition-opacity hover:opacity-90"
        >
          {isPending ? 'Saving…' : 'Save meeting'}
        </Button>
      </div>
    </form>
  )
}
