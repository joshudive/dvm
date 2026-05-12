import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { broadcastUpdate } from '../../leaderboard/stream/route'

export async function GET(request: NextRequest) {
  try {
    const transactionId = request.nextUrl.searchParams.get('transaction_id')
    const txRef = request.nextUrl.searchParams.get('tx_ref')

    if (!transactionId || !txRef) {
      return NextResponse.json(
        { error: 'Transaction ID and reference are required' },
        { status: 400 }
      )
    }

    // 1. Verify with Flutterwave
    const rawSecretKey = process.env.FLUTTERWAVE_SECRET_KEY
    const secretKey = rawSecretKey?.trim().replace(/^["']|["']$/g, '')

    const fwRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    })

    const fwData = await fwRes.json()

    if (fwData.status !== 'success' || fwData.data.status !== 'successful') {
       return NextResponse.json(
        { error: 'Payment verification failed or payment was not successful' },
        { status: 400 }
      )
    }

    // 2. Validate transaction in our database
    const transaction = await prisma.transaction.findUnique({
      where: { flutterRef: txRef },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // 3. Verify amount and currency
    if (fwData.data.amount !== transaction.amount || fwData.data.currency !== transaction.currency) {
        return NextResponse.json({ error: 'Transaction data mismatch' }, { status: 400 })
    }

    // 4. Update database and apply votes if not already done
    if (transaction.status !== 'completed') {
        await prisma.$transaction(async (tx) => {
            await tx.transaction.update({
                where: { id: transaction.id },
                data: { status: 'completed', voteApplied: true },
            })

            await tx.contestant.update({
                where: { id: transaction.contestantId },
                data: { voteCount: { increment: transaction.voteCount } },
            })
        })
        broadcastUpdate()
    }

    return NextResponse.json({
      id: transaction.id,
      status: 'completed',
      voteApplied: true,
    })
  } catch (error) {
    console.error('Verify vote error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
