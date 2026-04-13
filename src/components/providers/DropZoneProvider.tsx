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

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const MAX_WIDTH = 800
        const scale = Math.min(1, MAX_WIDTH / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return }
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
            console.log(`Compressed ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB`)
            resolve(compressed)
          },
          'image/jpeg',
          0.6
        )
      }
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
      img.src = url
    })
  }

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

    // Compress images before uploading
    const fileToUpload = file.type.startsWith('image/') ? await compressImage(file) : file

    const toastId = toast.loading(`Uploading ${fileToUpload.name}…`)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        toast.error('Not signed in', { id: toastId })
        return
      }

      const docId = crypto.randomUUID()
      const storagePath = `${userData.user.id}/${docId}/${fileToUpload.name}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, fileToUpload)

      if (uploadError) throw uploadError

      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: userData.user.id,
          storage_path: storagePath,
          file_name: fileToUpload.name,
          file_type: fileToUpload.type,
          file_size_bytes: fileToUpload.size,
          classification_status: 'pending',
        })
        .select()
        .single()

      if (dbError) throw dbError

      toast.loading(`Classifying ${fileToUpload.name}…`, { id: toastId })

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
                  : `${fileToUpload.name} classified`,
                { id: toastId }
              )
              supabase.removeChannel(channel)
            } else if (updated.classification_status === 'failed') {
              toast.error(`Could not classify ${fileToUpload.name}`, { id: toastId })
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
      toast.error(`Upload failed: ${file.name}`, { id: toastId })
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
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-sky-600/10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-sky-400 bg-white/90 px-16 py-12">
              <Upload className="h-12 w-12 text-sky-500" />
              <p className="text-xl font-semibold text-sky-700">Drop to classify</p>
              <p className="text-sm text-slate-500">PDF, image, or text — AI will figure it out</p>
            </div>
          </div>
        )}
      </div>
    </DropZoneContext.Provider>
  )
}
