import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken, hashPassword, comparePassword } from '../../auth';
import { wrapHandler } from '../shared/types';
import { User } from '../../database';

const router = Router();
const prisma = new PrismaClient();

// Register endpoint
router.post('/register', wrapHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    res.status(400).json({ error: 'Email, username, and password are required' });
    return;
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email or username already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    
    // Create user with billing info
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        role: 'user',
        tokensRemaining: 0,
        billing: {
          create: {
            subscriptionStatus: 'free',
            availableTokens: 10000,
            tokenSource: 'free_monthly',
            totalTokensUsedJson: JSON.stringify({ openai: 0, claude: 0, qwen: 0 }),
            freeTokensRemainingJson: JSON.stringify({ openai: 10000, claude: 10000, qwen: 1000000 })
          }
        }
      },
      include: {
        billing: true
      }
    });

    // Generate token with combined user and billing info
    const userWithBilling = {
      ...user,
      totalTokensUsed: JSON.parse(user.billing?.totalTokensUsedJson || '{}').openai || 0,
      freeTokensUsedThisMonth: 0,
      freeTokensResetDate: user.billing?.lastTokenResetDate || new Date(),
      subscriptionStatus: (user.billing?.subscriptionStatus || 'free') as User['subscriptionStatus']
    };

    const token = generateToken(userWithBilling);
    return { token };
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
    return;
  }
}));

// Login endpoint
router.post('/login', wrapHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        billing: true
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Combine user and billing info for token
    const userWithBilling = {
      ...user,
      totalTokensUsed: JSON.parse(user.billing?.totalTokensUsedJson || '{}').openai || 0,
      freeTokensUsedThisMonth: 0,
      freeTokensResetDate: user.billing?.lastTokenResetDate || new Date(),
      subscriptionStatus: (user.billing?.subscriptionStatus || 'free') as User['subscriptionStatus']
    };

    const token = generateToken(userWithBilling);
    return { token };
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
    return;
  }
}));

export default router; 