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
      <div className="flex-1 overflow-y-auto pb-2" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: 8,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}
          >
            {msg.role === 'assistant' && (
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: 'var(--accent-ij-wash)',
                  color: 'var(--accent-ij-ink)',
                  marginTop: 2,
                }}
              >
                <Bot size={13} />
              </div>
            )}
            <div
              style={{
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 13,
                lineHeight: 1.5,
                background: msg.role === 'user' ? 'var(--accent-ij-ink)' : 'var(--paper-2)',
                color: msg.role === 'user' ? '#fff' : 'var(--ink)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--paper-ink)',
                fontFamily: msg.role === 'assistant' ? 'var(--font-serif)' : 'var(--font-sans)',
                fontStyle: msg.role === 'assistant' ? 'italic' : 'normal',
              }}
            >
              {msg.content || (isLoading && msg.role === 'assistant' ? '…' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: 8,
          paddingTop: 10,
          borderTop: '1px solid var(--paper-ink)',
          marginTop: 10,
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your career coach…"
          disabled={isLoading}
          style={{
            borderColor: 'var(--paper-ink)',
            background: 'var(--paper)',
            color: 'var(--ink)',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
          }}
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !input.trim()}
          className="border-0"
          style={{
            background: 'var(--accent-ij-ink)',
            color: '#fff',
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
