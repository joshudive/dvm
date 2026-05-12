import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Middleware to check auth
async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

const CreateContestantSchema = z.object({
  name: z.string().min(1).max(100),
  image: z.string().optional().nullable().or(z.literal('')),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const excludeImages = searchParams.get('excludeImages') === 'true'

    const contestants = await prisma.contestant.findMany({
      orderBy: { voteCount: 'desc' },
      select: excludeImages ? {
        id: true,
        name: true,
        voteCount: true,
        createdAt: true,
        updatedAt: true,
      } : undefined
    })
    return NextResponse.json(contestants, {
      headers: {
        'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=10'
      }
    })
  } catch (error) {
    console.error('Get contestants error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const body = await request.json()
    const { name, image } = CreateContestantSchema.parse(body)

    const contestant = await prisma.contestant.create({
      data: {
        name,
        image: image || null,
        voteCount: 0,
      },
    })

    return NextResponse.json(contestant, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create contestant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
