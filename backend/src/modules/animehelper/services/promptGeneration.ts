// Prompt generation and character analysis utilities
import { DesignBrief, CharacterTemplate, ProgressAnalysis } from '../types'

// Create image prompt from design brief and template
export function createImagePrompt(designBrief: DesignBrief, template: CharacterTemplate): string {
  const { character, appearance, mood, background } = designBrief
  const { style, tags } = template

  let prompt = `${style || 'anime character'}, `
  
  // Character basics
  if (character.age) prompt += `${character.age}-year-old, `
  if (character.gender) prompt += `${character.gender}, `
  if (character.personality) prompt += `${character.personality} personality, `
  
  // Physical appearance
  if (appearance.hair) {
    prompt += `${appearance.hair.color} ${appearance.hair.style} hair, `
  }
  if (appearance.eyes) {
    prompt += `${appearance.eyes.color} eyes, `
  }
  if (appearance.outfit) {
    prompt += `wearing ${appearance.outfit.style} outfit, `
  }
  
  // Setting and mood
  if (background) prompt += `${background}, `
  if (mood) prompt += `${mood} atmosphere, `
  
  // Quality and style tags
  if (tags) {
    prompt += tags.join(', ')
  }
  
  // Add default quality tags
  prompt += ', masterpiece, best quality, detailed'
  
  return prompt
}

// Parse description to structured design brief
export function parseDescriptionToDesignBrief(description: string): DesignBrief {
  // Simple keyword extraction - in production, this would use NLP
  const lowerDesc = description.toLowerCase()
  
  // Age detection
  let age = 'young adult'
  if (lowerDesc.includes('child') || lowerDesc.includes('kid')) age = 'child'
  if (lowerDesc.includes('teen') || lowerDesc.includes('adolescent')) age = 'teenager'
  if (lowerDesc.includes('adult') || lowerDesc.includes('mature')) age = 'adult'
  if (lowerDesc.includes('elderly') || lowerDesc.includes('old')) age = 'elderly'
  
  // Gender detection
  let gender = 'unknown'
  if (lowerDesc.includes('girl') || lowerDesc.includes('female') || lowerDesc.includes('woman')) gender = 'female'
  if (lowerDesc.includes('boy') || lowerDesc.includes('male') || lowerDesc.includes('man')) gender = 'male'
  
  // Hair color detection
  const hairColors = ['black', 'brown', 'blonde', 'red', 'white', 'silver', 'blue', 'green', 'pink', 'purple']
  let hairColor = 'brown'
  for (const color of hairColors) {
    if (lowerDesc.includes(color + ' hair') || lowerDesc.includes(color + '-haired')) {
      hairColor = color
      break
    }
  }
  
  // Hair style detection
  const hairStyles = ['long', 'short', 'curly', 'straight', 'wavy', 'braided', 'ponytail', 'twintails']
  let hairStyle = 'medium'
  for (const style of hairStyles) {
    if (lowerDesc.includes(style)) {
      hairStyle = style
      break
    }
  }
  
  // Eye color detection
  const eyeColors = ['blue', 'green', 'brown', 'hazel', 'amber', 'gray', 'violet', 'red']
  let eyeColor = 'brown'
  for (const color of eyeColors) {
    if (lowerDesc.includes(color + ' eyes')) {
      eyeColor = color
      break
    }
  }
  
  // Personality traits extraction
  const personalities = ['cheerful', 'shy', 'confident', 'mysterious', 'energetic', 'calm', 'serious', 'playful']
  let personality = 'friendly'
  for (const trait of personalities) {
    if (lowerDesc.includes(trait)) {
      personality = trait
      break
    }
  }
  
  // Clothing style detection
  const clothingStyles = ['casual', 'formal', 'uniform', 'traditional', 'fantasy', 'modern', 'vintage']
  let clothingStyle = 'casual'
  for (const style of clothingStyles) {
    if (lowerDesc.includes(style)) {
      clothingStyle = style
      break
    }
  }
  
  // Setting/environment detection
  const environments = ['school', 'home', 'outdoors', 'city', 'forest', 'beach', 'mountains', 'fantasy world']
  let environment = 'neutral'
  for (const env of environments) {
    if (lowerDesc.includes(env)) {
      environment = env
      break
    }
  }
  
  return {
    character: {
      age,
      gender,
      personality
    },
    appearance: {
      hair: {
        color: hairColor,
        style: hairStyle,
        length: hairStyle.includes('long') ? 'long' : hairStyle.includes('short') ? 'short' : 'medium'
      },
      eyes: {
        color: eyeColor,
        shape: 'normal'
      },
      outfit: {
        style: clothingStyle,
        colors: ['default'],
        accessories: []
      },
      body: {
        height: 'average',
        build: 'normal'
      }
    },
    background: environment,
    mood: 'neutral',
    specialFeatures: []
  }
}

// Generate character variations
export function generateCharacterVariations(baseDesignBrief: DesignBrief): DesignBrief[] {
  const variations: DesignBrief[] = []
  
  // Hair color variations
  const hairColors = ['black', 'brown', 'blonde', 'red', 'silver', 'blue', 'pink']
  for (const color of hairColors.slice(0, 3)) {
    if (baseDesignBrief.appearance.hair && color !== baseDesignBrief.appearance.hair.color) {
      variations.push({
        ...baseDesignBrief,
        appearance: {
          ...baseDesignBrief.appearance,
          hair: {
            ...baseDesignBrief.appearance.hair,
            color
          }
        }
      })
    }
  }
  
  // Outfit style variations
  const outfitStyles = ['casual', 'formal', 'uniform', 'fantasy']
  for (const style of outfitStyles.slice(0, 2)) {
    if (style !== baseDesignBrief.appearance.outfit.style) {
      variations.push({
        ...baseDesignBrief,
        appearance: {
          ...baseDesignBrief.appearance,
          outfit: {
            ...baseDesignBrief.appearance.outfit,
            style
          }
        }
      })
    }
  }
  
  return variations.slice(0, 5) // Return max 5 variations
}

// Analyze progress based on generation history
export function analyzeProgress(generationHistory: any[]): ProgressAnalysis {
  if (generationHistory.length === 0) {
    return {
      status: 'not_started',
      completionPercentage: 0,
      areas: {
        anatomy: 0,
        proportions: 0,
        details: 0,
        style: 0
      },
      suggestedNextSteps: ['Start with basic character outline'],
      analysis: 'Ready to begin character generation'
    }
  }
  
  // Simple progress calculation based on iteration count
  const iterationCount = generationHistory.length
  const completionPercentage = Math.min(iterationCount * 25, 100)
  
  const areas = {
    anatomy: Math.min(iterationCount * 20, 100),
    proportions: Math.min(iterationCount * 15, 100),
    details: Math.min(iterationCount * 10, 100),
    style: Math.min(iterationCount * 30, 100)
  }
  
  const suggestedNextSteps = []
  if (areas.anatomy < 80) suggestedNextSteps.push('Refine anatomical accuracy')
  if (areas.proportions < 80) suggestedNextSteps.push('Adjust proportions')
  if (areas.details < 60) suggestedNextSteps.push('Add more details')
  if (areas.style < 70) suggestedNextSteps.push('Enhance art style consistency')
  
  return {
    status: completionPercentage >= 90 ? 'completed' : 'in_progress',
    completionPercentage,
    areas,
    suggestedNextSteps,
    analysis: `Character generation is ${completionPercentage}% complete. ${suggestedNextSteps.length} areas need attention.`
  }
} 