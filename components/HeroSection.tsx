'use client'

import { ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  voteCost: number
  currency: string
}

export function HeroSection({ voteCost, currency }: HeroSectionProps) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="w-3 h-3" />
            <span>THE ANNUAL VOTE IS NOW LIVE</span>
          </div>

          <h2 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
            Help Choose the <br />
            <span className="text-gradient">Next Champion</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700">
            Empower your favorite contestant with your support. Every vote brings them
            one step closer to victory. Each vote costs only <span className="text-foreground font-bold">{currency} {voteCost}</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700">
            <Button size="lg" className="h-14 px-8 rounded-2xl text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95" asChild>
              <a href="#leaderboard">Cast Your Vote Now</a>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-6 py-3 rounded-2xl bg-muted/50 border">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Secure Voting Process
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
