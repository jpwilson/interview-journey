import { describe, it, expect } from 'vitest'
import { inferStageAdvance, docTypeToEventType } from '@/lib/ai/classify'

describe('inferStageAdvance', () => {
  it('advances from applied to screening on screening_email', () => {
    expect(inferStageAdvance('applied', 'screening_email')).toBe('screening')
  })

  it('advances from screening to interviewing on interview_confirmation', () => {
    expect(inferStageAdvance('screening', 'interview_confirmation')).toBe('interviewing')
  })

  it('advances to offer on offer_letter from interviewing', () => {
    expect(inferStageAdvance('interviewing', 'offer_letter')).toBe('offer')
  })

  it('advances to resolved on rejection_email', () => {
    expect(inferStageAdvance('interviewing', 'rejection_email')).toBe('resolved')
  })

  it('advances to offer from applied on offer_letter', () => {
    expect(inferStageAdvance('applied', 'offer_letter')).toBe('offer')
  })

  it('does NOT re-apply screening if already at interviewing', () => {
    expect(inferStageAdvance('interviewing', 'screening_email')).toBeNull()
  })

  it('returns null for resume — not a stage-advancing doc', () => {
    expect(inferStageAdvance('applied', 'resume')).toBeNull()
  })

  it('returns null for cover_letter', () => {
    expect(inferStageAdvance('applied', 'cover_letter')).toBeNull()
  })

  it('returns null for unknown doc type', () => {
    expect(inferStageAdvance('applied', 'unknown')).toBeNull()
  })

  it('does not advance past resolved', () => {
    expect(inferStageAdvance('resolved', 'offer_letter')).toBeNull()
  })
})

describe('docTypeToEventType', () => {
  it('maps offer_letter to offer_received', () => {
    expect(docTypeToEventType('offer_letter')).toBe('offer_received')
  })

  it('maps rejection_email to rejected', () => {
    expect(docTypeToEventType('rejection_email')).toBe('rejected')
  })

  it('maps interview_confirmation to interview_scheduled', () => {
    expect(docTypeToEventType('interview_confirmation')).toBe('interview_scheduled')
  })

  it('maps nda to nda_signed', () => {
    expect(docTypeToEventType('nda')).toBe('nda_signed')
  })

  it('maps unknown types to document_added', () => {
    expect(docTypeToEventType('resume')).toBe('document_added')
    expect(docTypeToEventType('other')).toBe('document_added')
    expect(docTypeToEventType('unknown')).toBe('document_added')
  })
})
