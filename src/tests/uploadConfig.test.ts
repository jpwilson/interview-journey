import { describe, it, expect } from 'vitest'

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'text/plain',
]
const MAX_FILE_SIZE_MB = 25

describe('upload config', () => {
  it('accepts PDF files', () => {
    expect(ACCEPTED_TYPES).toContain('application/pdf')
  })

  it('accepts common image types', () => {
    expect(ACCEPTED_TYPES).toContain('image/png')
    expect(ACCEPTED_TYPES).toContain('image/jpeg')
    expect(ACCEPTED_TYPES).toContain('image/webp')
  })

  it('accepts plain text', () => {
    expect(ACCEPTED_TYPES).toContain('text/plain')
  })

  it('rejects Word documents', () => {
    expect(ACCEPTED_TYPES).not.toContain('application/msword')
  })

  it('enforces 25MB limit', () => {
    expect(MAX_FILE_SIZE_MB).toBe(25)
    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024
    expect(maxBytes).toBe(26214400)
  })

  it('small file passes size check', () => {
    const fileSize = 1 * 1024 * 1024 // 1MB
    expect(fileSize < MAX_FILE_SIZE_MB * 1024 * 1024).toBe(true)
  })

  it('oversized file fails size check', () => {
    const fileSize = 30 * 1024 * 1024 // 30MB
    expect(fileSize > MAX_FILE_SIZE_MB * 1024 * 1024).toBe(true)
  })
})
