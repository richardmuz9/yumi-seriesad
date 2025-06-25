import express from 'express'
import { authenticateUser, AuthRequest } from '../../auth'
import { getTemplates } from './routes/templates'
import { startSession } from './routes/sessions'
import { generateImage, generateOutline, generateCharacter } from './routes/generation'
import { getStyles, downloadStyle } from './routes/marketplace'
import { wrapHandler, wrapAuthHandler } from '../shared/types'

const router = express.Router();

export function setupAnimeCharaHelperRoutes(app: express.Application) {
  
  // Template routes
  app.get('/api/anime-chara/templates', wrapHandler(getTemplates))

  // Session routes
  app.post('/api/anime-chara/start-session', authenticateUser, wrapHandler(startSession))

  // Generation routes
  app.post('/api/anime-chara/generate-image', authenticateUser, wrapHandler(generateImage))
  app.post('/api/anime-chara/generate-outline', authenticateUser, wrapAuthHandler(generateOutline))
  router.post('/generate', authenticateUser, wrapAuthHandler(generateCharacter));

  // Analysis and regeneration routes
  app.post('/api/anime-chara/analyze-progress', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: express.Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Simplified progress analysis - in production this would be more complex
    return {
      success: true,
      analysis: {
        completionRate: 75,
        suggestedImprovements: ['Add more detail to hair', 'Enhance facial features'],
        nextSteps: ['refine_features', 'add_details']
      }
    };
  }));

  app.post('/api/anime-chara/regenerate-region', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: express.Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Simplified region regeneration - in production this would use AI
    return {
      success: true,
      regeneratedImageUrl: 'https://example.com/regenerated.png',
      sessionId: req.body.sessionId
    };
  }));

  // Marketplace routes
  app.get('/api/anime-chara/marketplace/styles', authenticateUser, wrapAuthHandler(getStyles))
  app.post('/api/anime-chara/marketplace/download/:styleId', authenticateUser, wrapAuthHandler(downloadStyle))
}

export default router; 