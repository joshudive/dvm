'use client'

import { useState } from 'react'
import Image from 'next/image'
import { type Contestant } from '@/hooks/useLeaderboard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ShieldCheck, Mail, User, Info, Check, Gem, Star, Zap, Award, Flame, ChevronRight } from 'lucide-react'

interface VotePackage {
  id: string
  tag: string
  price: number
  votes: number
  icon: any
  color: string
}

const VOTE_PACKAGES: VotePackage[] = [
  { id: 'basic', tag: 'Basic', price: 500, votes: 1, icon: Zap, color: 'text-blue-500 bg-blue-50' },
  { id: 'bronze', tag: 'Bronze', price: 2000, votes: 5, icon: Award, color: 'text-amber-600 bg-amber-50' },
  { id: 'silver', tag: 'Silver', price: 5000, votes: 15, icon: Star, color: 'text-slate-400 bg-slate-50' },
  { id: 'gold', tag: 'Gold', price: 10000, votes: 35, icon: Gem, color: 'text-yellow-500 bg-yellow-50' },
  { id: 'diamond', tag: 'Diamond', price: 20000, votes: 75, icon: Flame, color: 'text-cyan-500 bg-cyan-50' },
  { id: 'platinum', tag: 'Platinum', price: 50000, votes: 200, icon: CrownIcon, color: 'text-indigo-600 bg-indigo-50' },
]

function CrownIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  )
}

interface VoteModalProps {
  contestant: Contestant | null
  open: boolean
  onOpenChange: (open: boolean) => void
  voteCost: number
  currency: string
}

export function VoteModal({
  contestant,
  open,
  onOpenChange,
  voteCost,
  currency,
}: VoteModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<VotePackage>(VOTE_PACKAGES[0])
  const [voterEmail, setVoterEmail] = useState('')
  const [voterName, setVoterName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contestant) {
      setError('Contestant not selected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/vote/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestantId: contestant.id,
          voterEmail: voterEmail || null, // Optional email
          voterName,
          packageId: selectedPackage.id,
          amount: selectedPackage.price,
          voteCount: selectedPackage.votes,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to initiate vote')
      }

      const data = await res.json()
      window.location.href = data.paymentUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="bg-primary px-8 py-10 text-white relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16" />
          
          <DialogHeader className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl relative">
                  {contestant?.image ? (
                    <Image
                      src={contestant.image}
                      alt={contestant.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/10">
                      <User className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center shadow-lg border-2 border-primary">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                </div>
              </div>
              
              <div className="flex-1">
                <DialogTitle className="text-3xl font-black tracking-tight leading-none mb-3 text-white">
                  Cast Your Vote
                </DialogTitle>
                <DialogDescription className="text-primary-foreground/90 text-base font-medium">
                  You are supporting <span className="text-white font-bold underline decoration-yellow-500/50 decoration-2 underline-offset-4">{contestant?.name}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-8 bg-card">
          {contestant && (
            <div className="space-y-8">
              {/* Package Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Select Voting Package
                </label>
                
                {/* Desktop Grid (Hidden on Mobile) */}
                <div className="hidden sm:grid grid-cols-3 gap-4">
                  {VOTE_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.id === pkg.id
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all border-2 text-center group ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                            : 'border-muted bg-muted/20 hover:border-primary/30'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                        <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${pkg.color} transition-transform group-hover:scale-110`}>
                          <pkg.icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{pkg.tag}</span>
                        <span className="text-sm font-black text-foreground mb-1">{pkg.votes} {pkg.votes === 1 ? 'Vote' : 'Votes'}</span>
                        <span className="text-lg font-black text-primary">#{pkg.price.toLocaleString()}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Mobile Dropdown (Hidden on Desktop) */}
                <div className="sm:hidden space-y-2">
                  <div className="relative">
                    <select
                      value={selectedPackage.id}
                      onChange={(e) => {
                        const pkg = VOTE_PACKAGES.find(p => p.id === e.target.value)
                        if (pkg) setSelectedPackage(pkg)
                      }}
                      className="w-full h-16 opacity-0 absolute inset-0 z-10 cursor-pointer"
                    >
                      {VOTE_PACKAGES.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.tag} - {pkg.votes} Votes (#{pkg.price.toLocaleString()})
                        </option>
                      ))}
                    </select>
                    
                    <div className="w-full h-16 rounded-2xl border-2 border-primary bg-primary/5 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPackage.color}`}>
                          <selectedPackage.icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">{selectedPackage.tag} Package</p>
                          <p className="text-sm font-black text-foreground">{selectedPackage.votes} Votes • <span className="text-primary">#{selectedPackage.price.toLocaleString()}</span></p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-primary rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Your Email <span className="opacity-50">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className="h-12 pl-11 rounded-xl bg-muted/20 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all"
                        value={voterEmail}
                        onChange={(e) => setVoterEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Full Name <span className="opacity-50">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="text"
                        placeholder="John Doe"
                        className="h-12 pl-11 rounded-xl bg-muted/20 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all"
                        value={voterName}
                        onChange={(e) => setVoterName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Info */}
                <div className="flex gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-primary/80 font-medium leading-tight">
                    <p className="mb-1">You are purchasing the <span className="font-bold text-primary">{selectedPackage.tag}</span> package.</p>
                    <p>Total to pay: <span className="font-bold text-primary">#{selectedPackage.price.toLocaleString()}</span> for <span className="font-bold text-primary">{selectedPackage.votes} votes</span>.</p>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm font-bold animate-in fade-in zoom-in-95">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        Proceed to Payment
                      </div>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="h-12 font-bold text-muted-foreground hover:bg-muted/50 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
