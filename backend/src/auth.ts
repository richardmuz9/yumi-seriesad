import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Request, Response, NextFunction, RequestHandler } from 'express'
import { db, User } from './database'

const JWT_SECRET = process.env.JWT_SECRET || 'yumi-website-builder-secret-key'
const JWT_EXPIRES_IN = '7d'

export interface AuthRequest extends Request {
  user?: User
}

// Free tier constants
export const FREE_TIER = {
  MONTHLY_TOKENS: 10000,
  RESET_DAY: 1 // Reset on 1st of each month
} as const

// Model costs in tokens
const MODEL_COSTS = {
  'gpt-4': 8,
  'gpt-3.5-turbo': 2,
  'claude-2': 8,
  'claude-instant': 2,
  'qwen-turbo': 1,
  'qwen-plus': 2,
  'whisper-1': 1
} as const

export function calculateTokenCost(model: string, inputTokens: number = 100): number {
  const baseCost = MODEL_COSTS[model as keyof typeof MODEL_COSTS] || 2
  // Base cost per message + small factor for input length
  return Math.max(baseCost, Math.ceil(baseCost * (inputTokens / 100)))
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function verifyToken(token: string): { id: string; email: string; role?: string } {
  return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role?: string }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Authentication middleware
export const authenticateUser: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = await db.getUserById(decoded.id);
    
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
};

// Optional authentication (for endpoints that work with or without auth)
export const optionalAuth: RequestHandler = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token && req.cookies) {
      token = req.cookies.authToken;
    }

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await db.getUserById(decoded.id);
        if (user) {
          (req as AuthRequest).user = user;
        }
      }
    }

    next();
  } catch {
    // Ignore token errors for optional auth
    next();
  }
};

// Check and reset free tier tokens if needed
export async function checkAndResetFreeTier(user: User): Promise<User> {
  const now = new Date()
  const resetDate = new Date(user.freeTokensResetDate)
  
  if (now >= resetDate) {
    // Reset free tier tokens
    const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, FREE_TIER.RESET_DAY)
    
    await db.runRawSQL(
      'UPDATE users SET freeTokensUsedThisMonth = 0, freeTokensResetDate = ? WHERE id = ?',
      [nextResetDate.toISOString(), user.id]
    )
    
    // Return updated user
    const updatedUser = await db.getUserById(user.id)
    return updatedUser || user
  }
  
  return user
}

// Check daily token limit for premium users
export async function checkDailyLimit(user: User): Promise<{ canUse: boolean; tokensAvailable: number }> {
  const now = new Date()
  const lastReset = user.lastDailyReset ? new Date(user.lastDailyReset) : new Date(0)
  
  // Reset if it's a new day
  if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth()) {
    await db.runRawSQL(
      'UPDATE users SET dailyTokenLimit = 30000, lastDailyReset = ? WHERE id = ?',
      [now.toISOString(), user.id]
    )
    return { canUse: true, tokensAvailable: 30000 }
  }
  
  return { 
    canUse: (user.dailyTokenLimit || 0) > 0,
    tokensAvailable: user.dailyTokenLimit || 0
  }
}

// Enhanced token deduction function with free tier and subscription support
export async function deductTokens(
  userId: string,
  tokensToDeduct: number,
  model: string,
  description: string
): Promise<{ success: boolean; remainingTokens?: number; freeTokensLeft?: number; error?: string; tokenSource?: string }> {
  try {
    let user = await db.getUserById(userId)
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Check and reset free tier if needed
    user = await checkAndResetFreeTier(user)
    
    // For premium monthly users, check daily limits
    if (user.subscriptionStatus === 'premium_monthly') {
      const dailyCheck = await checkDailyLimit(user)
      if (!dailyCheck.canUse) {
        return { success: false, error: 'Daily token limit reached. Resets tomorrow!' }
      }
      
      if (tokensToDeduct > dailyCheck.tokensAvailable) {
        return { success: false, error: `Daily limit exceeded. ${dailyCheck.tokensAvailable} tokens available today.` }
      }
      
      // Deduct from daily limit
      const newDailyLimit = dailyCheck.tokensAvailable - tokensToDeduct
      await db.runRawSQL(
        'UPDATE users SET dailyTokenLimit = ? WHERE id = ?',
        [newDailyLimit, userId]
      )
      
      await db.addTokenTransaction(
        userId,
        'usage',
        -tokensToDeduct,
        description,
        model
      )
      
      return { 
        success: true, 
        remainingTokens: newDailyLimit,
        tokenSource: 'premium_daily'
      }
    }
    
    // For free tier users, try to use free tokens first
    if (user.subscriptionStatus === 'free') {
      const freeTokensLeft = FREE_TIER.MONTHLY_TOKENS - user.freeTokensUsedThisMonth
      
      if (freeTokensLeft >= tokensToDeduct) {
        // Use free tokens
        const newFreeUsed = user.freeTokensUsedThisMonth + tokensToDeduct
        await db.runRawSQL(
          'UPDATE users SET freeTokensUsedThisMonth = ? WHERE id = ?',
          [newFreeUsed, userId]
        )
        
        await db.addTokenTransaction(
          userId,
          'usage',
          -tokensToDeduct,
          `${description} (Free Tier)`,
          model
        )
        
        return { 
          success: true, 
          freeTokensLeft: FREE_TIER.MONTHLY_TOKENS - newFreeUsed,
          tokenSource: 'free_monthly'
        }
      } else if (freeTokensLeft > 0) {
        return { 
          success: false, 
          error: `Only ${freeTokensLeft} free tokens left this month. Upgrade for more!`,
          freeTokensLeft 
        }
      } else {
        return { 
          success: false, 
          error: 'Free monthly limit reached. Upgrade for more tokens!',
          freeTokensLeft: 0 
        }
      }
    }

    // For paid token users, use purchased tokens
    if (user.tokensRemaining < tokensToDeduct) {
      return { success: false, error: 'Insufficient purchased tokens' }
    }

    const newTokensRemaining = user.tokensRemaining - tokensToDeduct
    const newTotalUsed = user.totalTokensUsed + tokensToDeduct

    await db.updateUserTokens(userId, newTokensRemaining, newTotalUsed)
    
    await db.addTokenTransaction(
      userId,
      'usage',
      -tokensToDeduct,
      description,
      model
    )

    return { 
      success: true, 
      remainingTokens: newTokensRemaining,
      tokenSource: 'purchased'
    }
  } catch (error) {
    console.error('Token deduction error:', error)
    return { success: false, error: 'Failed to deduct tokens' }
  }
}

// Add tokens function (for purchases)
export async function addTokens(
  userId: string,
  tokensToAdd: number,
  description: string,
  stripePaymentId?: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const user = await db.getUserById(userId)
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const newTokensRemaining = user.tokensRemaining + tokensToAdd

    await db.updateUserTokens(userId, newTokensRemaining, user.totalTokensUsed)
    
    // Record the transaction
    await db.addTokenTransaction(
      userId,
      'purchase',
      tokensToAdd,
      description,
      undefined,
      stripePaymentId
    )

    return { success: true, newBalance: newTokensRemaining }
  } catch (error) {
    console.error('Token addition error:', error)
    return { success: false, error: 'Failed to add tokens' }
  }
} 