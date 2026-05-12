import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { VoteClient } from '@/components/VoteClient'

export const revalidate = 60 // Cache for 1 minute

export default async function VotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const contestant = await prisma.contestant.findUnique({
    where: { id },
  })

  if (!contestant) {
    notFound()
  }

  // Convert dates to strings for client component if needed
  const initialContestant = {
    id: contestant.id,
    name: contestant.name,
    image: contestant.image || undefined,
    voteCount: contestant.voteCount,
  }

  return <VoteClient initialContestant={initialContestant} />
}
