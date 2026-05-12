'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminHeader } from '@/components/AdminHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Settings as SettingsIcon, Coins, Globe, Power, Save, RefreshCcw, History, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'
import { AdminProfile } from '@/components/AdminProfile'

interface Settings {
  id: string
  voteCost: number
  currency: string
  votingActive: boolean
}

export default function AdminSettings() {
  const router = useRouter()
  const { status } = useSession()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings()
    }
  }, [status])

  if (status === 'unauthenticated') {
    router.push('/admin/login')
    return null
  }

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (err) {
      setError('Failed to fetch settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setError(null)
    setSuccess(false)

    try {
      setIsSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voteCost: settings.voteCost,
          currency: settings.currency,
          votingActive: settings.votingActive,
        }),
      })

      if (!res.ok) throw new Error('Failed to save settings')

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Global Settings</h2>
          </div>
          <p className="text-muted-foreground font-medium">Configure core parameters for your voting platform</p>
        </div>

        <div className="grid gap-8">
          <Card className="rounded-[2.5rem] p-8 border-none ring-1 ring-black/5 dark:ring-white/5 shadow-xl bg-card overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <form onSubmit={handleSaveSettings} className="space-y-10 relative z-10">
              {/* Vote Cost & Currency Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-4 h-4 text-primary" />
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vote Cost</label>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-14 rounded-2xl bg-muted/20 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all text-lg font-black"
                    value={settings?.voteCost}
                    onChange={(e) => setSettings(s => s ? ({ ...s, voteCost: parseFloat(e.target.value) }) : null)}
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground font-medium px-1">Amount charged per single vote</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-primary" />
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Currency Code</label>
                  </div>
                  <Input
                    type="text"
                    maxLength={3}
                    className="h-14 rounded-2xl bg-muted/20 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all text-lg font-black uppercase"
                    value={settings?.currency}
                    onChange={(e) => setSettings(s => s ? ({ ...s, currency: e.target.value.toUpperCase() }) : null)}
                    placeholder="NGN"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground font-medium px-1">ISO code (e.g. NGN, USD, GBP)</p>
                </div>
              </div>

              {/* Voting Active Toggle */}
              <div className="p-6 rounded-3xl bg-muted/20 border border-muted/50 group transition-all hover:bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${settings?.votingActive ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                      <Power className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Platform Status</h4>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {settings?.votingActive ? 'System Live' : 'System Paused'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings?.votingActive}
                    onClick={() => setSettings(s => s ? ({ ...s, votingActive: !s.votingActive }) : null)}
                    className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${settings?.votingActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform ${settings?.votingActive ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm font-bold animate-in fade-in zoom-in-95">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-4 text-green-600 text-sm font-bold animate-in fade-in zoom-in-95">
                  Settings synchronized successfully!
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => fetchSettings()}
                  disabled={isSaving}
                  className="flex-1 h-14 rounded-2xl font-bold gap-2 hover:bg-muted/50"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Discard Changes
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 h-14 rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Apply Settings
                </Button>
              </div>
            </form>
          </Card>

          <div className="mt-8 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-foreground">Admin Account</h2>
            </div>
            <p className="text-muted-foreground font-medium">Update your administrative credentials and profile</p>
          </div>

          <AdminProfile />

          {/* Activity Log Callout */}
          <Card className="rounded-[2.5rem] p-8 bg-muted/20 border-dashed border-2 border-muted flex items-center justify-between group hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-card shadow-sm flex items-center justify-center">
                <History className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Transaction History</h4>
                <p className="text-sm text-muted-foreground">Audit and monitor all voting activities</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl h-12 px-6 font-bold gap-2 border-muted bg-card shadow-sm group-hover:border-primary/20 group-hover:text-primary transition-all" asChild>
              <Link href="/admin/transactions">
                Open Logs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </main>
    </div>
  )
}
