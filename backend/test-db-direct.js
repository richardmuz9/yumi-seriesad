const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('🗄️  Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Check if test user exists
    console.log('\n👤 Looking for test user...')
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        billing: true
      }
    })
    
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        username: user.username,
        hasPasswordHash: !!user.passwordHash,
        createdAt: user.createdAt,
        billing: user.billing ? 'exists' : 'missing'
      })
    } else {
      console.log('❌ User not found!')
      
      // List all users
      console.log('\n📋 All users in database:')
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true
        }
      })
      console.log(allUsers)
    }
    
  } catch (error) {
    console.error('❌ Database error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase() 