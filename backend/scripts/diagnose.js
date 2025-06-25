#!/usr/bin/env node

console.log('🔍 Yumi-Series Backend Diagnostic Tool')
console.log('=====================================')

// Basic environment check
console.log('\n📍 Environment Information:')
console.log(`Node.js version: ${process.version}`)
console.log(`Platform: ${process.platform}`)
console.log(`Architecture: ${process.arch}`)
console.log(`Current working directory: ${process.cwd()}`)
console.log(`Process ID: ${process.pid}`)
console.log(`Memory usage:`, process.memoryUsage())

// Check if in container
console.log('\n🐳 Container Detection:')
const fs = require('fs')
const path = require('path')

try {
  const cgroup = fs.readFileSync('/proc/1/cgroup', 'utf8')
  if (cgroup.includes('docker') || cgroup.includes('lxc')) {
    console.log('✅ Running in Docker container')
  } else {
    console.log('❌ Not running in Docker container')
  }
} catch (e) {
  console.log('❓ Container detection failed (probably not Linux/not in container)')
}

// Check for Railway/platform-specific environment
console.log('\n🚂 Platform Detection:')
if (process.env.RAILWAY_ENVIRONMENT) {
  console.log('✅ Running on Railway')
  console.log(`   Environment: ${process.env.RAILWAY_ENVIRONMENT}`)
  console.log(`   Service ID: ${process.env.RAILWAY_SERVICE_ID || 'unknown'}`)
} else if (process.env.VERCEL) {
  console.log('✅ Running on Vercel')
} else if (process.env.HEROKU_APP_ID) {
  console.log('✅ Running on Heroku')
} else {
  console.log('❓ Platform not detected or running locally')
}

// Environment variables check
console.log('\n🔐 Environment Variables:')
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT']
const recommendedVars = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'CLAUDE_API_KEY']

for (const varName of requiredVars) {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '[REDACTED]' : process.env[varName]}`)
  } else {
    console.log(`❌ ${varName}: NOT SET`)
  }
}

for (const varName of recommendedVars) {
  if (process.env[varName]) {
    console.log(`⚠️ ${varName}: [REDACTED]`)
  } else {
    console.log(`⚠️ ${varName}: NOT SET`)
  }
}

// File system checks
console.log('\n📁 File System Checks:')
const filesToCheck = [
  'package.json',
  'dist/index.js',
  'prisma/schema.prisma',
  '.env'
]

for (const file of filesToCheck) {
  try {
    const stats = fs.statSync(file)
    console.log(`✅ ${file}: ${stats.size} bytes, modified ${stats.mtime}`)
  } catch (e) {
    console.log(`❌ ${file}: NOT FOUND`)
  }
}

// Database file check (for SQLite)
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
  const dbPath = process.env.DATABASE_URL.replace('file:', '')
  try {
    const stats = fs.statSync(dbPath)
    console.log(`✅ Database file: ${stats.size} bytes, modified ${stats.mtime}`)
  } catch (e) {
    console.log(`❌ Database file ${dbPath}: NOT FOUND`)
  }
}

// Test basic Node.js functionality
console.log('\n🧪 Basic Functionality Tests:')

// Test setTimeout
console.log('Testing setTimeout...')
const timeoutTest = new Promise((resolve) => {
  setTimeout(() => {
    console.log('✅ setTimeout works')
    resolve()
  }, 100)
})

// Test file operations
console.log('Testing file operations...')
try {
  const testFile = '/tmp/test.txt'
  fs.writeFileSync(testFile, 'test')
  fs.readFileSync(testFile)
  fs.unlinkSync(testFile)
  console.log('✅ File operations work')
} catch (e) {
  console.log('❌ File operations failed:', e.message)
}

// Test network capabilities
console.log('Testing network capabilities...')
const http = require('http')
const testServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('test')
})

testServer.listen(0, () => {
  const { port } = testServer.address()
  console.log(`✅ Network test server started on port ${port}`)
  testServer.close(() => {
    console.log('✅ Network test server closed')
  })
})

// Test database connection (if we can import our modules)
console.log('\n📊 Database Connection Test:')
async function testDatabase() {
  try {
    // Try to require the database module
    const { db } = require('../dist/database.js')
    console.log('✅ Database module loaded')
    
    // Try to initialize
    await db.initialize()
    console.log('✅ Database connection successful')
    
    // Try to close
    await db.close()
    console.log('✅ Database closed successfully')
  } catch (error) {
    console.log('❌ Database test failed:', error.message)
    console.log('Stack trace:', error.stack)
  }
}

// Test Express app loading
console.log('\n🌐 Express App Test:')
async function testExpressApp() {
  try {
    // Try to require the main app
    console.log('Loading Express app...')
    require('../dist/index.js')
    console.log('✅ Express app loaded without throwing errors')
  } catch (error) {
    console.log('❌ Express app loading failed:', error.message)
    console.log('Stack trace:', error.stack)
  }
}

// Run tests
async function runDiagnostics() {
  await timeoutTest
  await testDatabase()
  
  console.log('\n🎯 Diagnostic Summary:')
  console.log('======================')
  console.log('If you see any ❌ errors above, those are likely causing your SIGTERM issue.')
  console.log('Common fixes:')
  console.log('1. Set missing environment variables in your .env file or deployment platform')
  console.log('2. Ensure the database file exists and is accessible')
  console.log('3. Check that all dependencies are installed: npm install')
  console.log('4. Rebuild the project: npm run build')
  console.log('5. If running in production, ensure the PORT environment variable is set correctly')
}

runDiagnostics().catch(console.error) 