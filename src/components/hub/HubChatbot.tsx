'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Bot } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function HubChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm your career coach. Ask me anything about job searching, interviews, salary negotiation, or your career strategy.",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    const assistantId = crypto.randomUUID()
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/hub/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })),
        }),
      })

      if (!res.ok) throw new Error('Chat error')
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // Parse SSE lines
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (line.startsWith('0:')) {
            // Text chunk: 0:"content"
            try {
              const chunk = JSON.parse(line.slice(2))
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + chunk } : m
                )
              )
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600">
                <Bot className="h-3 w-3 text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              {msg.content || (isLoading && msg.role === 'assistant' ? '…' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-slate-700">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your career coach…"
          disabled={isLoading}
          className="border-slate-600 bg-slate-700 text-white text-sm placeholder:text-slate-500"
        />
        <Button type="submit" size="sm" disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-500">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
