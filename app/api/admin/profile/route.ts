import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/hash'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
})

export async function PUT(request: NextRequest) {
  const session = await getServerSession()
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, password } = UpdateProfileSchema.parse(body)

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (password) {
      updateData.passwordHash = await hashPassword(password)
    }

    const updatedUser = await prisma.adminUser.update({
      where: { email: session.user.email },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
