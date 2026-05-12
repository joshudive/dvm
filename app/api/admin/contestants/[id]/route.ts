import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/db'
import { z } from 'zod'

async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

const UpdateContestantSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().optional().nullable().or(z.literal('')),
  voteCount: z.number().int().min(0).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const contestant = await prisma.contestant.findUnique({
      where: { id },
    })

    if (!contestant) {
      return NextResponse.json(
        { error: 'Contestant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(contestant)
  } catch (error) {
    console.error('Get contestant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const { id } = await params
    const body = await request.json()
    const updates = UpdateContestantSchema.parse(body)

    const contestant = await prisma.contestant.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json(contestant)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update contestant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const { id } = await params
    await prisma.contestant.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Contestant deleted successfully' })
  } catch (error) {
    console.error('Delete contestant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
