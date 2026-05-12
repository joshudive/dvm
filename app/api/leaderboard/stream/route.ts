import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Simple SSE client management
const clients = new Set<ReadableStreamDefaultController<string>>()

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      clients.add(controller)

      // Send initial data from real DB
      try {
        const contestants = await prisma.contestant.findMany({
          orderBy: { voteCount: 'desc' },
        })

        if (!request.signal.aborted) {
          controller.enqueue(
            `data: ${JSON.stringify({
              type: 'initial',
              contestants,
            })}\n\n`
          )
        }
      } catch (error) {
        // Only log if it's not a "closed controller" error which is expected on disconnect
        if (!(error instanceof TypeError && error.message.includes('closed'))) {
          console.error('SSE Initial data error:', error)
        }
      }

      // Heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`: heartbeat\n\n`)
        } catch (error) {
          clearInterval(heartbeat)
          clients.delete(controller)
          try { controller.close() } catch (e) {}
        }
      }, 30000)

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        clients.delete(controller)
        try { controller.close() } catch (error) {}
      })
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

// Broadcast update to all connected clients
export async function broadcastUpdate() {
  try {
    // Only select essential fields for updates to keep the payload tiny
    const contestants = await prisma.contestant.findMany({
      select: {
        id: true,
        voteCount: true,
      },
      orderBy: { voteCount: 'desc' },
    })
    
    const message = `data: ${JSON.stringify({ type: 'update', contestants })}\n\n`
    
    clients.forEach((controller) => {
      try {
        controller.enqueue(message)
      } catch (error) {
        clients.delete(controller)
      }
    })
  } catch (error) {
    console.error('SSE Broadcast error:', error)
  }
}
