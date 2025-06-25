// Template-related routes for writing helper
import express, { Express, Request, Response } from 'express'
import { optionalAuth, authenticateUser, AuthRequest } from '../../../auth'
import { wrapHandler, wrapAuthHandler } from '../../shared/types'
import { contentTypePrompts, platformLimits, animePersonaPrompts } from '../data'
import { db } from '../../../database'

const router = express.Router()

// Get writing templates and configuration
export function setupTemplatesRoutes(app: Express): void {
  app.get('/api/writing-helper/templates', authenticateUser, wrapAuthHandler(async (req: AuthRequest) => {
    // Get user's saved templates
    const userId = req.user!.id
    const templates = await db.getUserTemplates(userId)
    return templates
  }))

  app.post('/api/writing-helper/templates', authenticateUser, wrapAuthHandler(async (req: AuthRequest) => {
    // Save a new template
    const userId = req.user!.id
    const { name, content, type } = req.body
    const template = await db.saveTemplate(userId, name, content, type)
    return template
  }))

  app.put('/api/writing-helper/templates/:id', authenticateUser, wrapAuthHandler(async (req: AuthRequest) => {
    // Update an existing template
    const userId = req.user!.id
    const templateId = req.params.id
    const { name, content, type } = req.body
    const template = await db.updateTemplate(templateId, userId, name, content, type)
    return template
  }))

  app.delete('/api/writing-helper/templates/:id', authenticateUser, wrapAuthHandler(async (req: AuthRequest) => {
    // Delete a template
    const userId = req.user!.id
    const templateId = req.params.id
    await db.deleteTemplate(templateId, userId)
    return { success: true }
  }))

  // Get writing templates and configuration
  app.get('/api/writing-helper/templates', optionalAuth, wrapHandler((req: Request, res: Response) => {
    const templates = {
      contentTypes: {
        'social-media': {
          name: 'Social Media Posts',
          description: 'Engaging posts for social platforms',
          maxLength: 3000,
          templates: [
            {
              id: 'announcement',
              name: 'Product Announcement',
              objective: 'Introduce product',
              tone: 'Professional',
              template: 'Exciting news! We\'re launching {product}...'
            },
            {
              id: 'thought_leadership',
              name: 'Thought Leadership',
              objective: 'Share insights',
              tone: 'Authoritative',
              template: 'Here\'s what I\'ve learned about {topic}...'
            }
          ]
        },
        'creative-writing': {
          name: 'Creative Writing',
          description: 'Stories, poems, and creative narratives',
          maxLength: 10000,
          templates: [
            {
              id: 'short_story',
              name: 'Short Story',
              objective: 'Tell a story',
              tone: 'Narrative',
              template: 'In a world where {setting}, {character} discovers...'
            },
            {
              id: 'poem',
              name: 'Poetry',
              objective: 'Express emotion',
              tone: 'Lyrical',
              template: 'Like {metaphor}, the {subject} {action}...'
            }
          ]
        },
        'blog-article': {
          name: 'Blog Articles',
          description: 'Long-form informative content',
          maxLength: 20000,
          templates: [
            {
              id: 'how_to',
              name: 'How-To Guide',
              objective: 'Educate readers',
              tone: 'Instructional',
              template: 'Learn how to {skill} with these proven steps...'
            },
            {
              id: 'opinion',
              name: 'Opinion Piece',
              objective: 'Share perspective',
              tone: 'Persuasive',
              template: 'Why {topic} matters more than you think...'
            }
          ]
        },
        'script': {
          name: 'Galgame Scripts',
          description: 'Visual novel dialogues and scenes',
          maxLength: 5000,
          templates: [
            {
              id: 'character_intro',
              name: 'Character Introduction',
              objective: 'Introduce character',
              tone: 'Character-driven',
              template: '[Character enters scene]\n{Character}: "Hello, I\'m {name}..."'
            },
            {
              id: 'dramatic_scene',
              name: 'Dramatic Scene',
              objective: 'Create tension',
              tone: 'Dramatic',
              template: '[Music: Tense]\n{Character}: "I never thought it would come to this..."'
            }
          ]
        }
      },
      animePersonas: Object.keys(animePersonaPrompts)
    }
    
    return res.json(templates)
  }))

  // Get content type configurations
  app.get('/api/writing-helper/content-types', wrapHandler((req: Request, res: Response) => {
    const contentTypes = Object.keys(contentTypePrompts).map(type => ({
      id: type,
      name: type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: (contentTypePrompts as any)[type].description || `Generate ${type} content`,
      fields: (contentTypePrompts as any)[type].fields || []
    }))

    return res.json({ contentTypes })
  }))

  // Get platform limitations
  app.get('/api/writing-helper/platforms', wrapHandler((req: Request, res: Response) => {
    const platforms = Object.keys(platformLimits).map(platform => ({
      id: platform,
      name: platform.charAt(0).toUpperCase() + platform.slice(1),
      ...platformLimits[platform]
    }))

    return res.json({ platforms })
  }))
}

export default router 