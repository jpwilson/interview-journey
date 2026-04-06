import { createClient } from '@/lib/supabase/server'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://interviewjourney.app',
    'X-Title': 'Interview Journey',
  },
})

const SYSTEM_PROMPT = `You are a career coach assistant inside Interview Journey, an employment management tool.
You help users with job searching, interview preparation, salary negotiation, resume tips, and career strategy.

You ONLY discuss career and employment topics. If asked about anything unrelated, politely redirect.

Be concise, practical, and encouraging. Use markdown for lists and emphasis when helpful.`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = await request.json()

  const result = streamText({
    model: openrouter('anthropic/claude-3-5-haiku'),
    system: SYSTEM_PROMPT,
    messages,
    maxOutputTokens: 1024,
  })

  return result.toUIMessageStreamResponse()
}
