import { prisma } from '@/lib/db'
import { Leaderboard } from '@/components/Leaderboard'
import { HeroSection } from '@/components/HeroSection'
import Link from 'next/link'
import { Trophy } from 'lucide-react'

export const revalidate = 10

export default async function Home() {
  let settings = null
  let contestants: any[] = []

  try {
    const [s, c] = await Promise.all([
      prisma.settings.findFirst(),
      prisma.contestant.findMany({
        orderBy: { voteCount: 'desc' },
        select: {
          id: true,
          name: true,
          voteCount: true,
          createdAt: true,
          updatedAt: true,
        }
      })
    ])
    settings = s
    contestants = c
  } catch (error) {
    console.error('Failed to fetch data from DB:', error)
    // Continue with empty contestants and default settings
  }

  const voteCost = settings?.voteCost ?? 500
  const currency = settings?.currency ?? 'NGN'

  return (
    <main className="min-h-screen bg-background font-sans selection:bg-primary/10">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <HeroSection voteCost={voteCost} currency={currency} />

      {/* Leaderboard Section */}
      <section id="leaderboard" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="text-3xl font-bold text-foreground mb-2">Live Standings</h3>
            <p className="text-muted-foreground">Real-time voting results for all contestants</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/30 px-4 py-2 rounded-xl border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Updates Enabled
          </div>
        </div>

        <Leaderboard initialContestants={contestants} />
      </section>

      {/* Footer */}
      <footer className="bg-white/50 dark:bg-black/20 border-t py-12 mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b pb-12 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Trophy className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-xl tracking-tight">DivineMercy</span>
            </div>

            <div className="flex gap-12">
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Platform</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
                  <li><Link href="#how-it-works" className="hover:text-primary transition-colors">Terms of Voting</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Admin</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/admin/login" className="hover:text-primary transition-colors">Login</Link></li>
                  <li><Link href="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
            <p>© 2024 DivineMercy Voting Platform. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
