import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { SYSTEM_PROMPT } from './prompts'

// OpenRouter is OpenAI-compatible — use createOpenAI with custom baseURL
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://interviewjourney.app',
    'X-Title': 'Interview Journey',
  },
})

export const ClassificationSchema = z.object({
  doc_type: z.enum([
    'offer_letter', 'rejection_email', 'interview_confirmation',
    'nda', 'screening_email', 'assessment', 'reference_request',
    'application_confirmation', 'resume', 'cover_letter', 'other', 'unknown',
  ]),
  confidence: z.number().min(0).max(1),
  company_name: z.string().nullable(),
  role_title: z.string().nullable(),
  event_date: z.string().nullable().describe('ISO 8601 date or null'),
  outcome: z.enum(['positive', 'negative', 'neutral']).nullable(),
  summary: z.string().describe('One sentence human-readable description'),
  interview_details: z.object({
    interview_type: z.string(),
    scheduled_at: z.string().nullable(),
    interviewer_names: z.array(z.string()),
    platform: z.string().nullable(),
    duration_minutes: z.number().nullable(),
  }).nullable(),
  offer_details: z.object({
    base_salary: z.number().nullable(),
    currency: z.string().nullable(),
    equity: z.string().nullable(),
    start_date: z.string().nullable(),
    deadline: z.string().nullable(),
    signing_bonus: z.number().nullable(),
  }).nullable(),
})

export type ClassificationResult = z.infer<typeof ClassificationSchema>

export async function classifyDocument(
  content: string,
  mimeType: string
): Promise<ClassificationResult> {
  const isImage = mimeType.startsWith('image/')

  const messages = isImage
    ? [
        {
          role: 'user' as const,
          content: [
            { type: 'text' as const, text: 'Classify this document image:' },
            {
              type: 'image' as const,
              image: content, // base64 data URL for images
            },
          ],
        },
      ]
    : [
        {
          role: 'user' as const,
          content: `Classify this document:\n\n${content}`,
        },
      ]

  const { object } = await generateObject({
    model: openrouter('google/gemini-2.0-flash-001'),
    schema: ClassificationSchema,
    system: SYSTEM_PROMPT,
    messages,
  })

  return object
}

/** Map AI doc_type to a timeline event_type */
export function docTypeToEventType(docType: string): string {
  const map: Record<string, string> = {
    offer_letter: 'offer_received',
    rejection_email: 'rejected',
    interview_confirmation: 'interview_scheduled',
    screening_email: 'screening_scheduled',
    nda: 'nda_signed',
    reference_request: 'reference_check',
    application_confirmation: 'applied',
  }
  return map[docType] ?? 'document_added'
}

/** Determine new stage from doc_type — only ever advance, never reverse */
export function inferStageAdvance(
  currentStage: string,
  docType: string
): string | null {
  const STAGES = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn']
  const currentIdx = STAGES.indexOf(currentStage)

  const docToStage: Record<string, string> = {
    application_confirmation: 'applied',
    screening_email: 'screening',
    interview_confirmation: 'interview',
    assessment: 'interview',
    offer_letter: 'offer',
    rejection_email: 'rejected',
  }

  const targetStage = docToStage[docType]
  if (!targetStage) return null

  const targetIdx = STAGES.indexOf(targetStage)
  // Only advance forward
  if (targetIdx > currentIdx) return targetStage
  return null
}
