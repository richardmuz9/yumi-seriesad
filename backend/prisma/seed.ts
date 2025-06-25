import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/auth'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })

    if (existingUser) {
      console.log('Test user already exists:', existingUser.email)
      return
    }

    // Create test user 
    const hashedPassword = await hashPassword('testpass123')
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: hashedPassword,
        role: 'user',
        tokensRemaining: 10000,
        billing: {
          create: {
            subscriptionStatus: 'free',
            availableTokens: 10000,
            tokenSource: 'free_monthly',
            totalTokensUsedJson: JSON.stringify({ openai: 0, claude: 0, qwen: 0 }),
            freeTokensRemainingJson: JSON.stringify({ openai: 10000, claude: 10000, qwen: 1000000 })
          }
        }
      }
    })

    console.log('Created test user:', user)
  } catch (error) {
    console.error('Error in seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 