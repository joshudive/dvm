'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { CheckCircle2, XCircle, Loader2, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your payment...')

  useEffect(() => {
    const verifyPayment = async () => {
      const txRef = searchParams.get('tx_ref')
      const transactionId = searchParams.get('transaction_id')
      const fwStatus = searchParams.get('status')

      if (fwStatus === 'cancelled') {
        setStatus('error')
        setMessage('Payment was cancelled.')
        return
      }

      if (!txRef || !transactionId) {
        setStatus('error')
        setMessage('Missing transaction details.')
        return
      }

      try {
        const res = await fetch(`/api/vote/verify?transaction_id=${transactionId}&tx_ref=${txRef}`)
        if (res.ok) {
          setStatus('success')
          setMessage('Thank you! Your vote has been recorded.')
        } else {
          const data = await res.json()
          throw new Error(data.error || 'Verification failed')
        }
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Failed to verify payment. Please contact support if you were charged.')
      }
    }

    verifyPayment()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 rounded-[2.5rem] shadow-2xl border-none ring-1 ring-black/5 dark:ring-white/5 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h1 className="text-2xl font-black text-foreground">Confirming Vote</h1>
            <p className="text-muted-foreground font-medium">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-foreground">Victory!</h1>
            <p className="text-muted-foreground font-medium">{message}</p>
            <Button size="lg" className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20" asChild>
              <Link href="/">Back to Leaderboard</Link>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 animate-in zoom-in duration-500">
            <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-destructive/20">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Payment Issue</h1>
            <p className="text-muted-foreground font-medium">{message}</p>
            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full h-14 rounded-2xl font-bold" asChild>
                <Link href="/">Try Again</Link>
              </Button>
              <Button variant="ghost" className="font-bold text-muted-foreground" onClick={() => window.location.reload()}>
                Retry Verification
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default function VoteVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
