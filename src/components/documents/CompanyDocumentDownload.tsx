'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  storagePath: string
}

export function CompanyDocumentDownload({ storagePath }: Props) {
  const supabase = createClient()

  async function handleDownload() {
    const { data } = await supabase.storage.from('documents').createSignedUrl(storagePath, 60)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    } else {
      toast.error('Could not generate download link')
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="shrink-0 text-slate-400 hover:text-white"
      onClick={handleDownload}
    >
      <Download className="h-4 w-4" />
    </Button>
  )
}
