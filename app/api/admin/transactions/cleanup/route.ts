import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/db'

async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    // Delete pending transactions older than 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const result = await prisma.transaction.deleteMany({
      where: {
        status: 'pending',
        createdAt: {
          lt: yesterday
        }
      }
    })

    return NextResponse.json({
      message: `Cleaned up ${result.count} pending transactions.`,
      count: result.count
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to perform cleanup' },
      { status: 500 }
    )
  }
}
