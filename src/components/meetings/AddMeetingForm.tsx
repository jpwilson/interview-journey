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
      className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 space-y-4"
    >
      <input type="hidden" name="role_id" value={roleId} />

      <h3 className="text-sm font-semibold text-white">Add Meeting</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Meeting type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Type</label>
          <select
            name="meeting_type"
            required
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select type…</option>
            {MEETING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Platform */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Platform</label>
          <input
            type="text"
            name="platform"
            placeholder="Zoom, Teams, phone…"
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Scheduled at */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Date & Time</label>
          <input
            type="datetime-local"
            name="scheduled_at"
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
          />
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Duration (minutes)</label>
          <input
            type="number"
            name="duration_minutes"
            placeholder="60"
            min={1}
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Prep notes / questions to ask</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="What to prepare, questions to ask…"
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-400 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          {isPending ? 'Saving…' : 'Save meeting'}
        </Button>
      </div>
    </form>
  )
}
