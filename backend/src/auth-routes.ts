import express, { Router, Request, Response } from 'express';
import { wrapHandler } from './modules/shared/types';
import { generateToken, hashPassword, comparePassword } from './auth';
import { db } from './database';
import { v4 as uuidv4 } from 'uuid';
import debug from 'debug';

const log = debug('app:auth');

// Create a new router
const router = Router();

// Debug middleware
router.use((req, _res, next) => {
  log(`${req.method} ${req.url}`);
  if (req.body) {
    log('Request body:', req.body);
  }
  next();
});

// Test route
router.get('/test', wrapHandler((_req: Request, res: Response) => {
  return { message: 'Auth routes are working' };
}));

// Register new user
router.post('/register', wrapHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    res.status(400).json({ error: 'Email, username, and password are required' });
    return;
  }

  try {
    // Check if user already exists
    const existingUserByEmail = await db.getUserByEmail(email);
    if (existingUserByEmail) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Check if username is taken
    const existingUserByUsername = await db.getUserByUsername(username);
    if (existingUserByUsername) {
      res.status(400).json({ error: 'Username already taken' });
      return;
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await db.createUser(email, username, hashedPassword);

    // Generate token
    const token = generateToken(user);
    return { token, user: { email: user.email, username: user.username } };
  } catch (error) {
    log('Error registering user:', error);
    // Check for Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      if (error.message.includes('(`email`)')) {
        res.status(400).json({ error: 'Email already registered' });
      } else if (error.message.includes('(`username`)')) {
        res.status(400).json({ error: 'Username already taken' });
      } else {
        res.status(400).json({ error: 'Email or username already in use' });
      }
    } else {
      res.status(500).json({ error: 'Internal server error during registration' });
    }
    return;
  }
}));

// Login user
router.post('/login', wrapHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    // Get user
    const user = await db.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken(user);
    return { 
      token, 
      user: { 
        email: user.email, 
        username: user.username,
        tokensRemaining: user.tokensRemaining,
        subscriptionStatus: user.subscriptionStatus
      } 
    };
  } catch (error) {
    log('Error logging in user:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error during login' });
    }
    return;
  }
}));

// Export the router
export default router; 