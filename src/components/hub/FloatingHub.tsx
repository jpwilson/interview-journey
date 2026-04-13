'use client'

import { useState, useRef } from 'react'
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
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)

  function handleMouseDown(e: React.MouseEvent) {
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
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#00658f] to-[#4ea5d9] shadow-lg ring-2 ring-sky-300/30 transition-transform hover:scale-110"
        aria-label="Open hub"
      >
        <Briefcase className="h-6 w-6 text-white" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed z-50 w-96 rounded-xl border border-slate-200 bg-white shadow-xl',
        isMinimised ? 'h-12' : 'h-[520px]'
      )}
      style={{ bottom: position.y, right: position.x }}
    >
      {/* Header / drag handle */}
      <div
        className="flex cursor-move items-center justify-between rounded-t-xl border-b border-slate-100 bg-white px-4 py-3"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-sky-600" />
          <span className="text-sm font-semibold text-slate-900">Interview Journey Hub</span>
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
          <TabsList className="mx-3 mt-3 bg-slate-100 border border-slate-200">
            <TabsTrigger
              value="chat"
              className="flex-1 gap-1 text-slate-600 data-[state=active]:bg-sky-600 data-[state=active]:text-white"
            >
              <MessageSquare className="h-3 w-3" /> Chat
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex-1 gap-1 text-slate-600 data-[state=active]:bg-sky-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-3 w-3" /> Stats
            </TabsTrigger>
            <TabsTrigger
              value="changelog"
              className="flex-1 gap-1 text-slate-600 data-[state=active]:bg-sky-600 data-[state=active]:text-white"
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
