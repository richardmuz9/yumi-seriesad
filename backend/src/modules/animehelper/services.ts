// AnimeHelper Module Services and Business Logic
import { DesignBrief, CharacterTemplate, AIGenerationSettings } from './types'

// Import from split service modules
export { ImageGenerationError, ImageGenerationErrorType, withRetry, isRetryableError, handleServiceError } from './services/errorHandling'
export { generateClarifyingQuestions, analyzeDrawingProgress, generateAnimeCharacter } from './services/aiGeneration'
export { createImagePrompt, parseDescriptionToDesignBrief, generateCharacterVariations, analyzeProgress } from './services/promptGeneration'

// Regenerate specific region of character
export async function regenerateCharacterRegion(
  originalImage: string
): Promise<string> {
  try {
    // In a real implementation, this would use inpainting
    // For now, return a placeholder
    return originalImage + '?regenerated=' + Date.now()
  } catch (error) {
    console.error('Error regenerating region:', error)
    throw error
  }
}

// Handle image generation with custom prompt
export async function handleImageGeneration(userId: string, customPrompt?: string) {
  try {
    const { generateAnimeCharacter } = await import('./services/aiGeneration')
    
    const settings: AIGenerationSettings = {
      useCustomModel: false,
      iterations: 1,
      postProcessing: {
        upscale: false,
        denoise: true,
        lineArtCleanup: false,
        colorCorrection: {
          contrast: 1,
          saturation: 1,
          bloom: 0
        }
      }
    }

    const description = customPrompt || 'anime character with detailed features'

    return await generateAnimeCharacter(userId, description, settings)
  } catch (error) {
    console.error('Error in image generation:', error)
    throw error
  }
} 