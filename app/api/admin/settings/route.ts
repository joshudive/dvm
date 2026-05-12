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

const UpdateSettingsSchema = z.object({
  voteCost: z.number().positive().optional(),
  currency: z.string().min(1).optional(),
  votingActive: z.boolean().optional(),
})

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 'singleton' },
    })
    
    if (!settings) {
      // Fallback if not initialized (though seed should handle this)
      const defaultSettings = await prisma.settings.create({
        data: {
          id: 'singleton',
          voteCost: 100,
          currency: 'NGN',
          votingActive: true,
        },
      })
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const body = await request.json()
    const updates = UpdateSettingsSchema.parse(body)

    const settings = await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: updates,
      create: {
        id: 'singleton',
        voteCost: updates.voteCost ?? 100,
        currency: updates.currency ?? 'NGN',
        votingActive: updates.votingActive ?? true,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
