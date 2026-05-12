import { prisma } from './lib/db'

async function test() {
  try {
    console.log('Testing prisma.contestant.findMany()...')
    const contestants = await prisma.contestant.findMany()
    console.log('Contestants found:', contestants.length)
    console.log('Data:', contestants)
  } catch (error) {
    console.error('Prisma API test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

test()
