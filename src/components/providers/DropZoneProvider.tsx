'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'

interface DropZoneContextValue {
  isDragging: boolean
}

const DropZoneContext = createContext<DropZoneContextValue>({ isDragging: false })

export function useDropZone() {
  return useContext(DropZoneContext)
}

export function DropZoneProvider({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)
  const supabase = createClient()

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.types.includes('Files')) {
      dragCounter.current++
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      dragCounter.current = 0
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (!files.length) return

      for (const file of files) {
        await uploadFile(file)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [supabase]
  )

  async function uploadFile(file: File) {
    const ACCEPTED = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'text/plain',
    ]
    if (!ACCEPTED.includes(file.type)) {
      toast.error(`Unsupported file type: ${file.type}`)
      return
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error(`${file.name} is too large (max 25MB)`)
      return
    }

    const toastId = toast.loading(`Uploading ${file.name}…`)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        toast.error('Not signed in', { id: toastId })
        return
      }

      const docId = crypto.randomUUID()
      const storagePath = `${userData.user.id}/${docId}/${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file)

      if (uploadError) throw uploadError

      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: userData.user.id,
          storage_path: storagePath,
          file_name: file.name,
          file_type: file.type,
          file_size_bytes: file.size,
          classification_status: 'pending',
        })
        .select()
        .single()

      if (dbError) throw dbError

      toast.loading(`Classifying ${file.name}…`, { id: toastId })

      // Fire-and-forget: trigger Edge Function
      fetch('/api/documents/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id }),
      }).catch(console.error)

      // Subscribe to realtime updates for this document
      const channel = supabase
        .channel(`doc:${doc.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'documents',
            filter: `id=eq.${doc.id}`,
          },
          (payload) => {
            const updated = payload.new as { classification_status: string; extracted_summary?: string; extracted_company?: string }
            if (updated.classification_status === 'classified') {
              const company = updated.extracted_company ? ` → ${updated.extracted_company}` : ''
              toast.success(
                updated.extracted_summary
                  ? `${updated.extracted_summary}${company}`
                  : `${file.name} classified`,
                { id: toastId }
              )
              supabase.removeChannel(channel)
            } else if (updated.classification_status === 'failed') {
              toast.error(`Could not classify ${file.name}`, { id: toastId })
              supabase.removeChannel(channel)
            }
          }
        )
        .subscribe()

      // Timeout safety: if no update in 60s, show generic success
      setTimeout(() => {
        supabase.removeChannel(channel)
        toast.dismiss(toastId)
      }, 60_000)
    } catch (err) {
      console.error(err)
      toast.error(`Upload failed: ${file instanceof File ? file.name : 'unknown'}`, { id: toastId })
    }
  }

  return (
    <DropZoneContext.Provider value={{ isDragging }}>
      <div
        className="relative h-full min-h-screen"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {children}

        {/* Full-screen drop overlay */}
        {isDragging && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-blue-600/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-blue-400 bg-slate-900/80 px-16 py-12">
              <Upload className="h-12 w-12 text-blue-400" />
              <p className="text-xl font-semibold text-blue-300">Drop to classify</p>
              <p className="text-sm text-slate-400">PDF, image, or text — AI will figure it out</p>
            </div>
          </div>
        )}
      </div>
    </DropZoneContext.Provider>
  )
}
