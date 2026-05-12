import 'dotenv/config'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/hash'

async function main() {
  console.log('🌱 Starting database seed...')

  // 1. Initialize Settings (from init-db.ts:L9)
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 'singleton' },
    })

    if (!settings) {
      await prisma.settings.create({
        data: {
          id: 'singleton',
          voteCost: 100,
          currency: 'NGN',
          votingActive: true,
        },
      })
      console.log('✅ Settings initialized')
    } else {
      console.log('ℹ️ Settings already exist, skipping...')
    }
  } catch (error) {
    console.error('Error initializing settings:', error)
  }

  const email = process.env.Email
  const password = process.env.Password

  // 2. Initialize Admin User (from init-db.ts:L30)
  try {
    const adminCount = await prisma.adminUser.count()

    if (adminCount === 0) {
      const hashedPassword = await hashPassword(password!)
      await prisma.adminUser.create({
        data: {
          email: email!,
          passwordHash: hashedPassword,
          name: 'Administrator',
        },
      })
      console.log('✅ Default admin user created')
      console.log('   Email: ', email)
      console.log('   Password: ', password)
    } else {
      console.log('ℹ️ Admin user already exists, skipping...')
    }
  } catch (error) {
    console.error('Error creating admin user:', error)
  }

  // 3. Initialize Sample Contestants
  try {
    const contestantCount = await prisma.contestant.count()
    if (contestantCount === 0) {
      const sampleContestants = [
        {
          name: 'Alice Johnson',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
          voteCount: 0,
        },
        {
          name: 'Bob Smith',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          voteCount: 0,
        },
        {
          name: 'Carol White',
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
          voteCount: 0,
        },
        {
          name: 'David Brown',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
          voteCount: 0,
        },
        {
          name: 'Emma Davis',
          image: 'https://images.unsplash.com/photo-1507375341519-d6575cb41cbb?w=400&h=400&fit=crop',
          voteCount: 0,
        },
      ]

      for (const contestant of sampleContestants) {
        await prisma.contestant.create({
          data: contestant,
        })
      }
      console.log(`✅ ${sampleContestants.length} sample contestants initialized`)
    } else {
      console.log('ℹ️ Contestants already exist, skipping...')
    }
  } catch (error) {
    console.error('Error initializing contestants:', error)
  }

  console.log('🌱 Database seed completed!')
  console.log('\n📝 Admin Credentials:')
  console.log('   Email: ', email)
  console.log('   Password: ', password)
  console.log('   ⚠️  Change this password in production!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
