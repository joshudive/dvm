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

export async function GET(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const status = request.nextUrl.searchParams.get('status')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

    const where = status ? { status } : {}

    const [transactions, total, stats] = await Promise.all([
      prisma.transaction.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          contestant: {
            select: {
              name: true,
              image: true,
            }
          }
        }
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.aggregate({
        where: { status: 'completed' },
        _sum: {
          amount: true,
          voteCount: true,
        },
        _count: {
          id: true,
        }
      })
    ])

    return NextResponse.json({
      transactions,
      total,
      limit,
      offset,
      globalStats: {
        revenue: stats._sum.amount || 0,
        votes: stats._sum.voteCount || 0,
        successCount: stats._count.id || 0,
      }
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
