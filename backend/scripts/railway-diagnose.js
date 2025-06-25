#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const https = require('https')

console.log('🚂 Railway Deployment Diagnostic Tool')
console.log('====================================')

// Basic environment check
console.log('\n📍 Environment Information:')
console.log(`Node.js version: ${process.version}`)
console.log(`Platform: ${process.platform}`)
console.log(`Architecture: ${process.arch}`)
console.log(`Current working directory: ${process.cwd()}`)
console.log(`Process ID: ${process.pid}`)
console.log(`Memory usage:`, process.memoryUsage())

// Railway-specific checks
console.log('\n🚂 Railway Environment Detection:')
console.log(`Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'Not detected'}`)
console.log(`Railway Service: ${process.env.RAILWAY_SERVICE_NAME || 'Not detected'}`)
console.log(`Railway Static URL: ${process.env.RAILWAY_STATIC_URL || 'Not detected'}`)

// Environment variables check
console.log('\n🔐 Environment Variables Check:')

const criticalVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT',
  'NODE_ENV'
]

const apiKeys = [
  'OPENAI_API_KEY',
  'OPENROUTER_API_KEY',
  'QWEN_API_KEY',
  'CLAUDE_API_KEY',
  'HF_TOKENS',
  'UNSPLASH_ACCESS_KEY',
  'PCHECK_API_TOKEN',
  'EDENAI_PLAG_KEY'
]

const paymentVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'ALIPAY_PUBLIC_KEY',
  'ALIPAY_PRIVATE_KEY',
  'ALIPAY_APP_ID'
]

const urlVars = [
  'FRONTEND_URL',
  'YOUR_DOMAIN',
  'API_URL',
  'BACKEND_URL',
  'CORS_ORIGINS'
]

console.log('\n📌 Critical Variables:')
criticalVars.forEach(varName => {
  if (process.env[varName]) {
    const value = varName.includes('SECRET') || varName.includes('KEY') ? '[REDACTED]' : process.env[varName]
    console.log(`✅ ${varName}: ${value}`)
  } else {
    console.log(`❌ ${varName}: NOT SET`)
  }
})

console.log('\n🔑 API Keys:')
apiKeys.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: [REDACTED]`)
    // Basic format validation
    const key = process.env[varName]
    if (key.length < 20) {
      console.log(`⚠️  ${varName} seems too short for an API key`)
    }
  } else {
    console.log(`❌ ${varName}: NOT SET`)
  }
})

console.log('\n💳 Payment Configuration:')
paymentVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: [REDACTED]`)
  } else {
    console.log(`❌ ${varName}: NOT SET`)
  }
})

console.log('\n🌐 URL Configuration:')
urlVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: ${process.env[varName]}`)
    // URL validation
    try {
      new URL(process.env[varName])
    } catch (e) {
      if (!varName.includes('CORS')) { // CORS can have multiple URLs
        console.log(`⚠️  ${varName} is not a valid URL`)
      }
    }
  } else {
    console.log(`❌ ${varName}: NOT SET`)
  }
})

// Database checks
console.log('\n📊 Database Configuration Check:')
const dbUrl = process.env.DATABASE_URL
if (dbUrl) {
  console.log('Database URL format:', dbUrl.split(':')[0])
  if (dbUrl.startsWith('file:')) {
    const dbPath = dbUrl.replace('file:', '')
    try {
      // Check if database directory exists
      const dbDir = path.dirname(dbPath)
      if (fs.existsSync(dbDir)) {
        console.log(`✅ Database directory exists: ${dbDir}`)
        // Check if directory is writable
        try {
          const testFile = path.join(dbDir, '.write_test')
          fs.writeFileSync(testFile, 'test')
          fs.unlinkSync(testFile)
          console.log('✅ Database directory is writable')
        } catch (e) {
          console.log('❌ Database directory is not writable:', e.message)
        }
      } else {
        console.log(`❌ Database directory does not exist: ${dbDir}`)
      }
      
      // Check if database file exists
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath)
        console.log(`✅ Database file exists: ${stats.size} bytes`)
      } else {
        console.log('❌ Database file does not exist')
      }
    } catch (e) {
      console.log('❌ Error checking database file:', e.message)
    }
  }
}

// CORS configuration check
console.log('\n🔒 CORS Configuration Check:')
const corsOrigins = process.env.CORS_ORIGINS
if (corsOrigins) {
  const origins = corsOrigins.split(',')
  console.log('Configured CORS origins:')
  origins.forEach(origin => {
    try {
      new URL(origin.trim())
      console.log(`✅ ${origin.trim()}`)
    } catch (e) {
      console.log(`❌ Invalid origin: ${origin.trim()}`)
    }
  })
  
  // Check if frontend URL is in CORS origins
  const frontendUrl = process.env.FRONTEND_URL
  if (frontendUrl && !origins.includes(frontendUrl)) {
    console.log(`⚠️  FRONTEND_URL (${frontendUrl}) is not in CORS origins`)
  }
}

// Endpoint connectivity test
console.log('\n🔌 API Endpoint Tests:')
async function testEndpoint(url) {
  return new Promise((resolve) => {
    try {
      const req = https.get(url, {
        timeout: 5000,
        headers: { 'User-Agent': 'Railway-Diagnostic-Tool/1.0' }
      }, (res) => {
        console.log(`✅ ${url}: ${res.statusCode}`)
        resolve(true)
      })
      
      req.on('error', (e) => {
        console.log(`❌ ${url}: ${e.message}`)
        resolve(false)
      })
      
      req.on('timeout', () => {
        console.log(`⚠️  ${url}: Timeout`)
        req.destroy()
        resolve(false)
      })
    } catch (e) {
      console.log(`❌ ${url}: ${e.message}`)
      resolve(false)
    }
  })
}

// Test all URLs
async function runUrlTests() {
  const urlsToTest = [
    process.env.FRONTEND_URL,
    process.env.API_URL,
    process.env.BACKEND_URL
  ].filter(Boolean)
  
  for (const url of urlsToTest) {
    await testEndpoint(url)
  }
}

// Memory usage warning
const memoryUsage = process.memoryUsage()
const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
if (memoryUsageMB > 500) {
  console.log(`\n⚠️  High memory usage detected: ${memoryUsageMB}MB`)
}

// Summary and recommendations
console.log('\n📋 Diagnostic Summary:')
console.log('1. Check that DATABASE_URL points to the correct location in Railway')
console.log('2. Verify all API keys are valid and not expired')
console.log('3. Ensure CORS_ORIGINS includes your frontend domain')
console.log('4. Confirm PORT matches Railway\'s requirements')
console.log('5. Verify SSL certificates if using custom domains')

// Run async tests
runUrlTests().then(() => {
  console.log('\n✨ Diagnostic complete!')
}) 