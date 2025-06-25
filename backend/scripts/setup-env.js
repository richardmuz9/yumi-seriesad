#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 Yumi-Series Backend Environment Setup')
console.log('========================================')

const envPath = path.join(__dirname, '..', '.env')
const envSamplePath = path.join(__dirname, '..', '.envsample')

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️ .env file already exists. Please remove it first if you want to regenerate it.')
  console.log('Current .env file location:', envPath)
  process.exit(1)
}

// Read the sample file
let envContent = ''
if (fs.existsSync(envSamplePath)) {
  console.log('📋 Reading .envsample file...')
  envContent = fs.readFileSync(envSamplePath, 'utf8')
} else {
  console.log('📝 Creating minimal .env configuration...')
  envContent = `# Minimal configuration for Yumi-Series Backend
DATABASE_URL=file:./database.sqlite
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long_12345
PORT=3001
NODE_ENV=development

# Optional API keys (set these for full functionality)
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# CLAUDE_API_KEY=your_claude_api_key_here

# Optional payment providers
# STRIPE_SECRET_KEY=your_stripe_secret_key_here
# ALIPAY_APP_ID=your_alipay_app_id_here

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8080
`
}

// Generate a random JWT secret
const crypto = require('crypto')
const jwtSecret = crypto.randomBytes(32).toString('hex')

// Replace template values with actual values
envContent = envContent.replace(/JWT_SECRET=.*/, `JWT_SECRET=${jwtSecret}`)

// Ensure required variables are uncommented and set
const requiredVars = {
  'DATABASE_URL': 'file:./database.sqlite',
  'JWT_SECRET': jwtSecret,
  'PORT': '3001',
  'NODE_ENV': 'development',
  'FRONTEND_URL': 'http://localhost:3000'
}

let lines = envContent.split('\n')
for (const [key, defaultValue] of Object.entries(requiredVars)) {
  let found = false
  lines = lines.map(line => {
    if (line.startsWith(`#${key}=`) || line.startsWith(`${key}=`)) {
      found = true
      return `${key}=${defaultValue}`
    }
    return line
  })
  
  if (!found) {
    lines.push(`${key}=${defaultValue}`)
  }
}

envContent = lines.join('\n')

// Write the .env file
try {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env file created successfully!')
  console.log('📍 Location:', envPath)
  
  console.log('\n🔐 Generated Configuration:')
  console.log('- DATABASE_URL: file:./database.sqlite')
  console.log('- JWT_SECRET: [GENERATED RANDOMLY]')
  console.log('- PORT: 3001')
  console.log('- NODE_ENV: development')
  
  console.log('\n⚠️ Important Notes:')
  console.log('1. For production, set proper API keys for OpenAI, Anthropic, etc.')
  console.log('2. For payment features, configure Stripe and Alipay keys')
  console.log('3. The database will be created automatically as SQLite file')
  console.log('4. Make sure to add .env to your .gitignore file')
  
  console.log('\n🚀 Next Steps:')
  console.log('1. Run: npm run build')
  console.log('2. Run: npm start')
  console.log('3. Check: http://localhost:3001/api/health')
  
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message)
  process.exit(1)
} 