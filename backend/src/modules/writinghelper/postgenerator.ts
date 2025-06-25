import express, { Request, Response } from 'express'
import { AuthRequest } from '../../auth'
import { authenticateUser, optionalAuth } from '../../auth'
import { wrapHandler, wrapAuthHandler } from '../shared/types'
import { postTemplatesConfig, animePersonasConfig, contentBlocksConfig, userPreferencesConfig } from '../shared/configLoaders'
import { generateContentVariations } from './services'
import { WritingVariation } from './types'

export interface UserFeedback {
  postId: string
  rating?: number
  thumbs?: 'up' | 'down'
  selectedVariation?: string
  engagementMetrics?: {
    likes: number
    comments: number
    shares: number
    clicks?: number
  }
}

interface GeneratedResponse {
  success: boolean
  post: string
  platform: string
  provider: string
  model: string
  tokensUsed: number
  variations?: WritingVariation[]
  variationCount?: number
}

export function setupPostGeneratorRoutes(app: express.Application) {
  // Get post templates
  app.get('/api/post-generator/templates', optionalAuth, wrapHandler(() => {
    return postTemplatesConfig
  }))

  // Get anime personas
  app.get('/api/post-generator/anime-personas', optionalAuth, wrapHandler(() => {
    return animePersonasConfig
  }))

  // Get content blocks
  app.get('/api/post-generator/content-blocks', optionalAuth, wrapHandler(() => {
    return contentBlocksConfig
  }))

  // Generate post
  app.post('/api/post-generator/generate', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }

    const {
      platform,
      provider,
      model: selectedModel,
      generateVariations,
      variationCount = 3,
      contentType = 'social-media'
    } = req.body

    const generatedPost = "Example post" // Replace with actual generation logic

    let response: GeneratedResponse = {
      success: true,
      post: generatedPost,
      platform,
      provider,
      model: selectedModel,
      tokensUsed: 0 // Replace with actual token cost
    }

    // Generate variations if requested
    if (generateVariations) {
      const variations = generateContentVariations(generatedPost, contentType, variationCount)
      response = {
        ...response,
        variations,
        variationCount: variations.length
      }
    }

    return response
  }))

  // Get user preferences
  app.get('/api/post-generator/preferences', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }
    return userPreferencesConfig
  }))

  // Submit feedback
  app.post('/api/post-generator/feedback', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }
    
    // Process feedback...
    return { success: true }
  }))

  // Get recommendations
  app.get('/api/post-generator/recommendations', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' })
      return
    }
    // Get recommendations...
    return { recommendations: [] }
  }))
} 