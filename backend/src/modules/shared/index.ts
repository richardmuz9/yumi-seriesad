import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { BillingService } from '../billing/services';

const billingService = new BillingService();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

// Middleware to check access to paid AI models
export const checkPaidModelAccess: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const model = req.body.model || req.query.model;
    if (!model || !['openai', 'claude'].includes(model)) {
      next(); // Skip check for non-paid models
      return;
    }

    const hasAccess = await billingService.checkPaidModelAccess(userId, model);
    if (!hasAccess) {
      res.status(403).json({
        error: `You have run out of tokens for the ${model} model. Please purchase more tokens to continue using this model.`,
        code: 'TOKEN_LIMIT_EXCEEDED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking model access:', error);
    next(error);
  }
};

// Middleware to update token usage after using paid models
export const updateTokenUsage: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      next();
      return;
    }

    const model = req.body.model || req.query.model;
    const tokensUsed = req.body.tokensUsed || 0;

    if (model && ['openai', 'claude', 'qwen'].includes(model) && tokensUsed > 0) {
      await billingService.updateTokenUsage(userId, model, tokensUsed);
    }

    next();
  } catch (error) {
    console.error('Error updating token usage:', error);
    next(error);
  }
};

// Create Express app with common middleware
export function createApp() {
  const app = express();
  
  // Add basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Add token check middleware for all AI model routes
  app.use('/api/*/generate', checkPaidModelAccess);
  app.use('/api/*/analyze', checkPaidModelAccess);
  app.use('/api/*/complete', checkPaidModelAccess);
  
  // Add token usage tracking after responses
  app.use((req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    res.send = function(body) {
      updateTokenUsage(req as AuthRequest, res, () => {});
      return originalSend.call(this, body);
    };
    next();
  });
  
  return app;
}

// Add health check endpoint
export function addHealthCheck(app: express.Application) {
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
} 