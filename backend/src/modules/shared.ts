import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Import split modules
export * from './shared/configLoaders'
export * from './shared/aiClients'
export * from './shared/types'
export { addHealthCheck } from './shared/appRoutes'

// Re-export auth functions and types
export {
  authenticateUser, 
  optionalAuth, 
  generateToken, 
  hashPassword, 
  comparePassword, 
  calculateTokenCost, 
  deductTokens,
  FREE_TIER,
  AuthRequest
} from '../auth'

// Re-export database
export { db } from '../database'

// Re-export billing functions and types
export {
  TOKEN_PACKAGES,
  PREMIUM_PLANS,
  TokenPackage,
  PremiumPlan
} from './billing/types'

export { StripeService } from './billing/services/stripe'

// Initialize environment
dotenv.config()

// Import cors options
import { corsOptions } from './shared/types'

// Utility function to create and configure Express app
export function createApp() {
  const app = express()
  
  app.use(cors(corsOptions))
  app.use(express.json())
  
  // Raw body parsing for Stripe webhooks
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }))
  
  return app
} 