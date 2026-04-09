'use client'

import { addRoleEvent } from '@/lib/actions/roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

const EVENT_TYPES = [
  { value: 'screening_scheduled', label: 'Screening scheduled' },
  { value: 'screening_completed', label: 'Screening completed' },
  { value: 'interview_scheduled', label: 'Interview scheduled' },
  { value: 'interview_completed', label: 'Interview completed' },
  { value: 'technical_assessment', label: 'Technical assessment' },
  { value: 'offer_received', label: 'Offer received' },
  { value: 'offer_accepted', label: 'Offer accepted' },
  { value: 'offer_declined', label: 'Offer declined' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrew' },
  { value: 'reference_check', label: 'Reference check' },
  { value: 'nda_signed', label: 'NDA signed' },
  { value: 'note_added', label: 'Note' },
]

export function AddEventForm({ roleId }: { roleId: string }) {
  const [eventType, setEventType] = useState('')

  return (
    <form action={addRoleEvent} className="space-y-4 rounded-lg border border-slate-700 bg-slate-800 p-6">
      <input type="hidden" name="role_id" value={roleId} />
      <input type="hidden" name="event_type" value={eventType} />

      <div className="space-y-2">
        <Label className="text-slate-300">Event type</Label>
        <Select onValueChange={(v: string | null) => setEventType(v ?? '')} required>
          <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
            <SelectValue placeholder="Select event type..." />
          </SelectTrigger>
          <SelectContent className="border-slate-600 bg-slate-800">
            {EVENT_TYPES.map((et) => (
              <SelectItem key={et.value} value={et.value} className="text-white focus:bg-slate-700">
                {et.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-slate-300">Title *</Label>
        <Input id="title" name="title" required placeholder="e.g. Phone screen with Sarah"
          className="border-slate-600 bg-slate-700 text-white" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-300">Notes</Label>
        <Textarea id="description" name="description" placeholder="Any details..."
          className="border-slate-600 bg-slate-700 text-white" rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event_date" className="text-slate-300">Date</Label>
        <Input id="event_date" name="event_date" type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="border-slate-600 bg-slate-700 text-white" />
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={!eventType}>
        Add event
      </Button>
    </form>
  )
}
