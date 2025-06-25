import axios from 'axios'
import * as dotenv from 'dotenv'

dotenv.config()

const API_URL = process.env.API_URL || 'http://localhost:3001'
let authToken: string | undefined

async function testEndpoint(method: string, endpoint: string, data?: any) {
  try {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {}
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers
    })
    console.log(`✅ ${method.toUpperCase()} ${endpoint} succeeded:`, response.data)
    return response.data
  } catch (error: any) {
    console.error(`❌ ${method.toUpperCase()} ${endpoint} failed:`, error.response?.data || error.message)
    return null
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n')

  // Test health endpoint
  await testEndpoint('get', '/api/health')

  // Test auth endpoints
  console.log('\n📝 Testing auth endpoints...')
  const authData = await testEndpoint('post', '/api/auth/login', {
    email: 'test@example.com',
    password: 'testpass123'
  })

  if (authData?.token) {
    authToken = authData.token
    console.log('✅ Got auth token:', authToken)
  } else {
    console.error('❌ Failed to get auth token')
    return
  }

  // Test writing helper endpoints
  console.log('\n📝 Testing writing helper endpoints...')
  await testEndpoint('post', '/api/writing-helper/generate', {
    contentType: 'social-media',
    platform: 'twitter',
    topic: 'AI and creativity',
    keyPoints: ['AI enhances creativity', 'Human input still essential'],
    generateVariations: true,
    variationCount: 2
  })

  await testEndpoint('post', '/api/writing-helper/analyze', {
    content: 'This is a test post about AI and creativity. #AI #Tech',
    platform: 'twitter'
  })

  // Test anime character helper endpoints
  console.log('\n🎨 Testing anime character helper endpoints...')
  await testEndpoint('post', '/api/anime-chara/start-session', {
    style: 'anime',
    theme: 'fantasy'
  })

  await testEndpoint('post', '/api/anime-chara/generate-outline', {
    character: {
      name: 'Sakura',
      type: 'protagonist',
      personality: 'cheerful',
      features: ['pink hair', 'green eyes']
    }
  })

  await testEndpoint('get', '/api/anime-chara/marketplace/styles')

  // Test billing endpoints
  console.log('\n💰 Testing billing endpoints...')
  await testEndpoint('post', '/api/billing/create-checkout-session', {
    packageId: 'basic',
    successUrl: 'http://localhost:3000/success',
    cancelUrl: 'http://localhost:3000/cancel'
  })

  await testEndpoint('get', '/api/billing/packages')

  console.log('\n✨ All tests completed!')
}

runTests().catch(console.error) 