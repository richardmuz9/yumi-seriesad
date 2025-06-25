import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import { BillingService } from '../billing/services';
import { authenticateUser, AuthRequest } from '../../auth';
import { wrapAuthHandler } from '../shared/types';
import { User } from '../../database';
import { db } from '../../database';

// Extend AuthRequest to include the required user fields
interface AdminAuthRequest extends AuthRequest {
  user: User & { role: string };
}

const router = express.Router();
const billingService = new BillingService();

// File upload configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/artwork/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `artwork-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
      const error = new Error('Only image files are allowed!');
      cb(error);
    }
  }
});

// Artwork contribution routes
router.post('/upload', authenticateUser, upload.single('artwork'), wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const contribution = await billingService.submitArtworkContribution(
    req.user!.id,
    req.file.filename,
    req.file.originalname,
    req.file.size,
    req.file.mimetype
  );

  return {
    success: true,
    contribution: {
      id: contribution.id,
      status: contribution.status,
      rewardAmount: contribution.rewardAmount,
      submittedAt: contribution.submittedAt
    },
    message: 'Artwork submitted successfully! You will receive timeshards once approved.'
  };
}));

router.get('/contributions', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  const contributions = await billingService.getUserContributions(req.user!.id);
  const stats = await billingService.getUserContributionStats(req.user!.id);
  
  return {
    contributions,
    stats
  };
}));

// Admin middleware
const requireAdmin = (req: AuthRequest, res: Response, next: Function) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

// Admin routes
router.post('/admin/approve/:contributionId', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  const { user } = req;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { contributionId } = req.params;
  const { reward } = req.body;

  const contribution = await db.getArtworkContribution(contributionId);
  if (!contribution) {
    res.status(404).json({ error: 'Contribution not found' });
    return;
  }

  // Approve contribution and give reward
  const result = await db.approveArtworkContribution(contributionId, reward);
  return {
    success: true,
    contribution: result.contribution,
    reward: result.reward,
    message: 'Contribution approved and reward given'
  };
}));

router.post('/admin/reject/:contributionId', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  const { user } = req;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const { contributionId } = req.params;
  const { reason } = req.body;

  const contribution = await db.getArtworkContribution(contributionId);
  if (!contribution) {
    res.status(404).json({ error: 'Contribution not found' });
    return;
  }

  // Reject contribution
  const result = await db.rejectArtworkContribution(contributionId, reason);
  return {
    success: true,
    contribution: result,
    message: 'Contribution rejected'
  };
}));

export default router; 