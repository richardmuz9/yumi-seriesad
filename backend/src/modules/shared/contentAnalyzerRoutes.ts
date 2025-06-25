import { Router } from 'express';
import { ContentAnalyzer } from './contentAnalyzer';
import { authenticateUser, AuthRequest } from '../../auth';
import { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { wrapAuthHandler } from './types';
import { PrismaClient } from '@prisma/client';

const router = Router();
const contentAnalyzer = new ContentAnalyzer();
const prisma = new PrismaClient();

// Rate limiting for analysis endpoints
const analysisLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: 'Too many content analysis requests, please try again later.'
});

// Analyze content
router.post('/analyze', authenticateUser, analysisLimiter, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const { content } = req.body;

  if (!content) {
    res.status(400).json({ error: 'Content is required' });
    return;
  }

  if (content.length > 10000) {
    res.status(400).json({ error: 'Content length exceeds maximum limit of 10,000 characters' });
    return;
  }

  const analysis = await contentAnalyzer.analyzeContent(req.user.id.toString(), content);
  return analysis;
}));

// Get user's content analytics
router.get('/analytics', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const analytics = await contentAnalyzer.getAnalyticsForUser(req.user.id.toString());
  return analytics;
}));

// Update user preferences
router.put('/preferences', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const {
    language,
    theme,
    writingStyle,
    seoPreferences
  } = req.body;

  const preferences = await prisma.userPreferences.upsert({
    where: { userId: req.user.id.toString() },
    update: {
      language,
      theme,
      writingStyle,
      seoPreferencesJson: JSON.stringify(seoPreferences)
    },
    create: {
      userId: req.user.id.toString(),
      language,
      theme,
      writingStyle,
      seoPreferencesJson: JSON.stringify(seoPreferences)
    }
  });

  return preferences;
}));

export default router; 