import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { broadcastUpdate } from '../../leaderboard/stream/route'

export async function POST(request: NextRequest) {
  try {
    // Professional Security: Verify the webhook signature
    const signature = request.headers.get('verif-hash')
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH
    
    if (secretHash && signature !== secretHash) {
      console.warn('Unauthorized webhook attempt blocked')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event, data } = body

    if (event !== 'charge.completed' || data.status !== 'successful') {
      return NextResponse.json({ status: 'ok' })
    }

    const reference = data.meta?.reference || data.tx_ref
    const customerEmail = data.customer?.email

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
    }

    // Use a transaction to ensure atomic update
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { flutterRef: reference },
      })

      if (transaction && transaction.status !== 'completed') {
        // 1. Update transaction (optionally update email if it was anonymous)
        const updateData: any = {
          status: 'completed',
          voteApplied: true,
          updatedAt: new Date(),
        }

        // If the transaction had an anonymous email and we got one from Flutterwave, update it
        if (transaction.voterEmail.endsWith('@divinemercy.voting') && customerEmail) {
          updateData.voterEmail = customerEmail
        }

        await tx.transaction.update({
          where: { id: transaction.id },
          data: updateData,
        })

        // 2. Increment vote count by the AMOUNT IN THE TRANSACTION
        await tx.contestant.update({
          where: { id: transaction.contestantId },
          data: {
            voteCount: { increment: transaction.voteCount },
          },
        })
      }
    })

    // Trigger SSE broadcast
    broadcastUpdate()

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

