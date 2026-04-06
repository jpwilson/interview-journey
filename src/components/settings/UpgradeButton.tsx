'use client'

import { Button } from '@/components/ui/button'
import { Crown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function UpgradeButton() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      toast.error('Could not start checkout. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      className="bg-purple-600 hover:bg-purple-500"
      onClick={handleUpgrade}
      disabled={loading}
    >
      <Crown className="mr-2 h-4 w-4" />
      {loading ? 'Loading...' : 'Upgrade to Pro — $12/mo'}
    </Button>
  )
}
