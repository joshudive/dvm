import { prisma } from '@/lib/db'
import { Leaderboard } from '@/components/Leaderboard'
import { HeroSection } from '@/components/HeroSection'

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
    </main>
  )
}
