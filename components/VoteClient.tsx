'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  ShieldCheck, 
  Mail, 
  User, 
  Info, 
  Check, 
  Gem, 
  Star, 
  Zap, 
  Award, 
  Flame, 
  ChevronRight, 
  ChevronLeft,
  Trophy
} from 'lucide-react'

interface Contestant {
  id: string
  name: string
  image?: string
  voteCount: number
}

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

export function VoteClient({ initialContestant }: { initialContestant: Contestant }) {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<VotePackage>(VOTE_PACKAGES[0])
  const [voterEmail, setVoterEmail] = useState('')
  const [voterName, setVoterName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/vote/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestantId: initialContestant.id,
          voterEmail: voterEmail || null,
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
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background font-sans selection:bg-primary/10">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm hidden sm:inline">Back to Leaderboard</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <Trophy className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Divine<span className="text-primary">Mercy</span>
            </h1>
          </div>
          <div className="w-10 h-10 sm:w-32" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <Card className="p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
                <div className="aspect-[4/5] relative bg-muted">
                  {initialContestant.image ? (
                    <Image src={initialContestant.image} alt={initialContestant.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <User className="w-16 h-16 text-primary/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Voting for</p>
                    <h2 className="text-2xl font-black">{initialContestant.name}</h2>
                  </div>
                </div>
                <div className="p-6 bg-card text-center">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Current Votes</p>
                  <p className="text-3xl font-black text-foreground tabular-nums">{initialContestant.voteCount.toLocaleString()}</p>
                </div>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Choose Your Package</h3>
                    <p className="text-muted-foreground font-medium">Select how many votes you'd like to cast</p>
                  </div>
                </div>

                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {VOTE_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.id === pkg.id
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative flex flex-col items-center justify-center p-6 rounded-3xl transition-all border-2 text-center group ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-xl scale-[1.02]' 
                            : 'border-muted bg-muted/20 hover:border-primary/30'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                          </div>
                        )}
                        <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center ${pkg.color} transition-transform group-hover:scale-110`}>
                          <pkg.icon className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{pkg.tag}</span>
                        <span className="text-lg font-black text-foreground mb-1">{pkg.votes} Votes</span>
                        <span className="text-xl font-black text-primary">#{pkg.price.toLocaleString()}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="sm:hidden space-y-3">
                  {VOTE_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.id === pkg.id
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`w-full p-4 rounded-2xl transition-all border-2 flex items-center justify-between gap-4 ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : 'border-muted bg-muted/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pkg.color}`}>
                            <pkg.icon className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-foreground">{pkg.tag} ({pkg.votes} Votes)</p>
                            <p className="text-lg font-black text-primary leading-none">#{pkg.price.toLocaleString()}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>

              <hr className="border-muted" />

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Your Information</h3>
                    <p className="text-muted-foreground font-medium">Details for the payment receipt</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address (Optional)</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          className="h-14 pl-11 rounded-2xl bg-muted/20 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                          value={voterEmail}
                          onChange={(e) => setVoterEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name (Optional)</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="text"
                          placeholder="John Doe"
                          className="h-14 pl-11 rounded-2xl bg-muted/20 border-muted focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                          value={voterName}
                          onChange={(e) => setVoterName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex gap-4">
                    <Info className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-primary/80 font-medium leading-relaxed">
                      You are purchasing the <span className="text-primary font-bold">{selectedPackage.tag}</span> package 
                      for <span className="text-primary font-bold">#{selectedPackage.price.toLocaleString()}</span>. 
                      This will add <span className="text-primary font-bold">{selectedPackage.votes} votes</span> to {initialContestant.name}'s total standings.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold animate-in shake">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full h-16 rounded-[1.5rem] text-xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-6 h-6" />
                        Proceed to Checkout
                        <ChevronRight className="w-6 h-6" />
                      </>
                    )}
                  </Button>
                </form>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
