'use client'

import { useEffect, useState, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { MessageSquare, BarChart3, Clock, X, Minus, Briefcase } from 'lucide-react'
import { HubChatbot } from './HubChatbot'
import { HubAnalytics } from './HubAnalytics'
import { HubChangelog } from './HubChangelog'
import { cn } from '@/lib/utils'

export function FloatingHub() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimised, setIsMinimised] = useState(false)
  const [position, setPosition] = useState({ x: 24, y: 24 })
  const [isDesktop, setIsDesktop] = useState(false)
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  function handleMouseDown(e: React.MouseEvent) {
    if (!isDesktop) return
    dragStart.current = { mx: e.clientX, my: e.clientY, px: position.x, py: position.y }

    function onMove(ev: MouseEvent) {
      if (!dragStart.current) return
      setPosition({
        x: Math.max(0, dragStart.current.px + (ev.clientX - dragStart.current.mx)),
        y: Math.max(0, dragStart.current.py - (ev.clientY - dragStart.current.my)),
      })
    }
    function onUp() {
      dragStart.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 focus-visible:outline-none"
        aria-label="Open hub"
        style={{
          background: 'linear-gradient(135deg, var(--accent-ij), var(--accent-ij-ink))',
          boxShadow: '0 8px 28px var(--accent-ij-glow-a), 0 2px 6px rgba(28,25,23,0.08)',
          border: '2px solid color-mix(in srgb, var(--accent-ij-wash) 70%, transparent)',
        }}
      >
        <Briefcase className="h-6 w-6" style={{ color: '#fff' }} />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed z-50 rounded-xl border border-slate-200 bg-white shadow-xl',
        'inset-x-4 bottom-4 sm:inset-x-auto sm:w-96',
        isMinimised ? 'h-12' : 'h-[min(520px,calc(100vh-2rem))] sm:h-[520px]'
      )}
      style={isDesktop ? { bottom: position.y, right: position.x } : undefined}
    >
      {/* Header / drag handle */}
      <div
        className={cn(
          'flex items-center justify-between rounded-t-xl border-b border-slate-100 bg-white px-4 py-3',
          isDesktop && 'cursor-move'
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" style={{ color: 'var(--accent-ij-ink)' }} />
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--ink)',
              letterSpacing: -0.2,
            }}
          >
            Interview{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--accent-ij-ink)' }}>Journey</em> Hub
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
            onClick={() => setIsMinimised((m) => !m)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimised && (
        <Tabs defaultValue="chat" className="flex h-[calc(100%-48px)] flex-col">
          <TabsList className="mx-3 mt-3 border border-slate-200 bg-slate-100">
            <TabsTrigger
              value="chat"
              className="flex-1 gap-1 text-slate-600 data-[state=active]:bg-[var(--accent-ij-ink)] data-[state=active]:text-white"
            >
              <MessageSquare className="h-3 w-3" /> Chat
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex-1 gap-1 text-slate-600 data-[state=active]:bg-[var(--accent-ij-ink)] data-[state=active]:text-white"
            >
              <BarChart3 className="h-3 w-3" /> Stats
            </TabsTrigger>
            <TabsTrigger
              value="changelog"
              className="flex-1 gap-1 text-slate-600 data-[state=active]:bg-[var(--accent-ij-ink)] data-[state=active]:text-white"
            >
              <Clock className="h-3 w-3" /> Changelog
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-hidden p-3">
            <TabsContent value="chat" className="mt-0 h-full">
              <HubChatbot />
            </TabsContent>
            <TabsContent value="analytics" className="mt-0 h-full overflow-y-auto">
              <HubAnalytics />
            </TabsContent>
            <TabsContent value="changelog" className="mt-0 h-full overflow-y-auto">
              <HubChangelog />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  )
}
