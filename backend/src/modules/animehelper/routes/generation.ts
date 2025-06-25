import { Response } from 'express'
import { AuthRequest } from '../../../auth'
import { BillingService } from '../../billing/services'
import { generateAnimeCharacter } from '../services'
import { CharacterTemplate, DesignBrief, AIGenerationSettings, GeneratedImage } from '../types'

const billingService = new BillingService();

// Generate character image
export const generateImage = async (req: AuthRequest, res: Response): Promise<GeneratedImage | undefined> => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'User not authenticated' })
    return
  }

  const { sessionId, designBrief, template, settings } = req.body as {
    sessionId: string
    designBrief: DesignBrief
    template: CharacterTemplate
    settings: AIGenerationSettings
  }

  if (!sessionId || !designBrief || !template || !settings) {
    res.status(400).json({ error: 'Missing required parameters' })
    return
  }

  // Check if user has access to image generation
  const hasAccess = await billingService.checkImageGenerationAccess(userId.toString())
  if (!hasAccess) {
    res.status(402).json({ error: 'No access to image generation. Please upgrade your plan.' })
    return
  }

  // Convert design brief to a description string
  const personality = Array.isArray(designBrief.character.personality) ? designBrief.character.personality.join(', ') : designBrief.character.personality || 'friendly'
  const colors = Array.isArray(designBrief.appearance.outfit.colors) ? designBrief.appearance.outfit.colors.join(' and ') : designBrief.appearance.outfit.colors || 'neutral'
  const accessories = Array.isArray(designBrief.appearance.outfit.accessories) && designBrief.appearance.outfit.accessories.length ? ', with ' + designBrief.appearance.outfit.accessories.join(', ') : ''
  const features = Array.isArray(designBrief.specialFeatures) ? designBrief.specialFeatures.join(', ') : designBrief.specialFeatures || ''
  
  const description = `${designBrief.character.gender}, ${designBrief.character.age} years old, ${personality} personality, ${designBrief.mood} expression, ${designBrief.appearance.hairStyle} ${designBrief.appearance.hairColor} hair, ${designBrief.appearance.eyeColor} eyes, ${designBrief.appearance.height} height, ${designBrief.appearance.build} build, wearing ${designBrief.appearance.outfit.style} outfit in ${colors} colors${accessories}, ${features}, ${designBrief.background || 'simple background'}`

  const imageResult = await generateAnimeCharacter(userId.toString(), description, settings)
  
  // Update token usage for image generation
  await billingService.updateTokenUsage(userId.toString(), 'openai', 1000) // Example token cost for image generation

  return imageResult;
}

// Generate character outline
export const generateOutline = async (req: AuthRequest, res: Response): Promise<{ success: boolean; outlineUrl: string; sessionId: string } | undefined> => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'User not authenticated' })
    return
  }

  // Check if user has access to image generation
  const hasAccess = await billingService.checkImageGenerationAccess(userId.toString())
  if (!hasAccess) {
    res.status(403).json({ 
      error: 'Image generation requires a minimum purchase of $1. Please visit the billing page to make a purchase.',
      code: 'REQUIRES_PURCHASE'
    })
    return
  }

  const { sessionId, designBrief, templateId } = req.body

  if (!sessionId || !designBrief || !templateId) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  // Here you would implement the actual outline generation logic
  // For now, we'll return a mock response
  return {
    success: true,
    outlineUrl: 'https://example.com/outline.png',
    sessionId
  };
}

// AI Character Generation
export const generateCharacter = async (req: AuthRequest, res: Response): Promise<GeneratedImage | undefined> => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const result = await generateAnimeCharacter(
    req.user.id.toString(),
    req.body.description,
    req.body.settings
  );
  return result;
} 