import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { ResearchService } from './services/research';
import { EquationsService } from './services/equations';
import { FiguresService } from './services/figures';
import { authenticateUser, AuthRequest } from '../../auth';
import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { User } from '../../database';
import { wrapHandler, wrapAuthHandler } from '../shared/types';

const router = Router();
const researchService = new ResearchService();
const equationsService = new EquationsService();
const figuresService = new FiguresService();
const prisma = new PrismaClient();

// Type guard to ensure user is authenticated
function isAuthenticatedRequest(req: AuthRequest): req is AuthRequest & { user: User } {
  return req.user !== undefined;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Search literature
router.post('/search', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const { query, source } = req.body;

  if (!query || !source) {
    res.status(400).json({
      error: 'Query and source are required'
    });
    return;
  }

  const citations = await researchService.searchLiterature(query, source);
  return { citations };
}));

// Extract citations from file
router.post('/extract-citations', authenticateUser, upload.single('file'), wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  if (!req.file) {
    res.status(400).json({
      error: 'No file uploaded'
    });
    return;
  }

  const citations = await researchService.extractCitationsFromFile(req.file);
  return { citations };
}));

// Save citation
router.post('/citations', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const userId = req.user.id.toString();
  const citation = await researchService.saveCitation(userId, req.body);
  return citation;
}));

// Get user's citations
router.get('/citations', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const userId = req.user.id.toString();
  const citations = await researchService.getCitations(userId);
  return citations;
}));

// Delete citation
router.delete('/citations/:id', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const userId = req.user.id.toString();
  await researchService.deleteCitation(userId, req.params.id);
  res.sendStatus(204);
}));

// Update citation style
router.post('/citations/style', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const { style, citations } = req.body;

  if (!style || !citations) {
    res.status(400).json({
      error: 'Style and citations are required'
    });
    return;
  }

  const updatedCitations = await researchService.updateCitationStyle(citations, style);
  return updatedCitations;
}));

// Generate bibliography
router.post('/bibliography', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const { style, citations } = req.body;

  if (!style || !citations) {
    res.status(400).json({
      error: 'Style and citations are required'
    });
    return;
  }

  const bibliography = await researchService.generateBibliography(citations, style);
  return bibliography;
}));

// Check plagiarism
router.post('/plagiarism', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const { text } = req.body;

  if (!text) {
    res.status(400).json({
      error: 'Text is required'
    });
    return;
  }

  const result = await researchService.checkPlagiarism(text);
  return result;
}));

// Save equation
router.post('/equations', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const userId = req.user.id.toString();
  const equation = await equationsService.saveEquation(userId, req.body);
  return equation;
}));

// Get user's equations
router.get('/equations', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const userId = req.user.id.toString();
  const equations = await equationsService.getEquations(userId);
  return equations;
}));

// Delete equation
router.delete('/equations/:id', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const userId = req.user.id.toString();
  await equationsService.deleteEquation(userId, req.params.id);
  res.sendStatus(204);
}));

// Save figure
router.post('/figures', authenticateUser, upload.single('file'), wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const userId = req.user.id.toString();
  const figure = {
    ...req.body,
    source: req.file ? `/uploads/${req.file.filename}` : undefined
  };
  const savedFigure = await figuresService.saveFigure(userId, figure);
  return savedFigure;
}));

// Get user's figures
router.get('/figures', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const userId = req.user.id.toString();
  const figures = await figuresService.getFigures(userId);
  return figures;
}));

// Delete figure
router.delete('/figures/:id', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
  if (!isAuthenticatedRequest(req)) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const userId = req.user.id.toString();
  await figuresService.deleteFigure(userId, req.params.id);
  res.sendStatus(204);
}));

export default router; 