import { YumiPersonalityGuide } from '../types/creativeModes'

// This will be loaded from the backend config
let yumiPersonalities: any = null

export const loadYumiPersonalities = async () => {
  try {
    const response = await fetch('/api/config/yumi-personalities')
    yumiPersonalities = await response.json()
    return yumiPersonalities
  } catch (error) {
    console.error('Failed to load Yumi personalities:', error)
    // Fallback to local data if needed
    return getDefaultPersonalities()
  }
}

export const getYumiPersonalities = () => {
  if (!yumiPersonalities) {
    return getDefaultPersonalities()
  }
  return yumiPersonalities
}

export const getAvailablePersonalities = (): string[] => {
  const personalities = getYumiPersonalities()
  return Object.keys(personalities.personalities || {})
}

export const getPersonalityGuide = (personalityKey: string): YumiPersonalityGuide | null => {
  const personalities = getYumiPersonalities()
  const personality = personalities.personalities?.[personalityKey]
  
  if (!personality) return null

  return {
    name: personality.name,
    creativeSuggestions: {
      writing: generateWritingSuggestions(personality),
      visual: generateVisualSuggestions(personality),
      mood: generateMoodSuggestions(personality)
    },
    feedbackStyle: determineFeedbackStyle(personalityKey),
    refinementApproach: generateRefinementApproach(personality)
  }
}

const generateWritingSuggestions = (personality: any): string[] => {
  const suggestions = []
  
  // Base on personality traits
  if (personality.traits) {
    personality.traits.forEach((trait: string) => {
      if (trait.includes('energetic')) suggestions.push('Use exclamation marks')
      if (trait.includes('calm')) suggestions.push('Use measured tone')
      if (trait.includes('curious')) suggestions.push('Ask engaging questions')
      if (trait.includes('caring')) suggestions.push('Add emotional depth')
    })
  }

  // Base on speech patterns
  if (personality.speechPatterns) {
    personality.speechPatterns.forEach((pattern: string) => {
      if (pattern.includes('exclamation')) suggestions.push('Enthusiastic expressions')
      if (pattern.includes('formal')) suggestions.push('Structured writing')
      if (pattern.includes('casual')) suggestions.push('Conversational style')
    })
  }

  // Add personality-specific suggestions
  switch (personality.name?.toLowerCase()) {
    case 'yumi (otaku)':
      suggestions.push('Include anime references', 'Use Japanese terms', 'Express passion')
      break
    case 'yumi (tsundere)':
      suggestions.push('Show hidden feelings', 'Use contrasting emotions', 'Add stutters when flustered')
      break
    case 'yumi-sensei':
      suggestions.push('Explain clearly', 'Encourage learning', 'Use examples')
      break
    case 'yumi-chan (little sister)':
      suggestions.push('Use cute expressions', 'Show curiosity', 'Add playful elements')
      break
    case 'yumi (classmate)':
      suggestions.push('Friendly tone', 'Collaborative language', 'Include others')
      break
    case 'yumi (kuudere)':
      suggestions.push('Precise language', 'Subtle emotions', 'Logical structure')
      break
    case 'yumi (genki girl)':
      suggestions.push('High energy', 'Positive outlook', 'Action-oriented')
      break
  }

  return suggestions.slice(0, 5) // Limit to top 5
}

const generateVisualSuggestions = (personality: any): string[] => {
  const suggestions = []
  
  // Base on likes (visual preferences)
  if (personality.likes?.weather) {
    personality.likes.weather.forEach((weather: string) => {
      if (weather.includes('sunny')) suggestions.push('Bright, cheerful colors')
      if (weather.includes('rain')) suggestions.push('Soft, moody lighting')
      if (weather.includes('snow')) suggestions.push('Cool, crisp aesthetics')
      if (weather.includes('autumn')) suggestions.push('Warm, golden tones')
    })
  }

  if (personality.likes?.activities) {
    personality.likes.activities.forEach((activity: string) => {
      if (activity.includes('reading')) suggestions.push('Cozy, indoor settings')
      if (activity.includes('sports')) suggestions.push('Dynamic, action poses')
      if (activity.includes('crafts')) suggestions.push('Detailed, handmade elements')
    })
  }

  // Personality-specific visual styles
  switch (personality.name?.toLowerCase()) {
    case 'yumi (otaku)':
      suggestions.push('Anime-style expressions', 'Colorful backgrounds', 'Japanese aesthetics')
      break
    case 'yumi (tsundere)':
      suggestions.push('Contrasting colors', 'Dramatic lighting', 'Expressive poses')
      break
    case 'yumi-sensei':
      suggestions.push('Professional attire', 'Clean compositions', 'Educational props')
      break
    case 'yumi-chan (little sister)':
      suggestions.push('Cute accessories', 'Pastel colors', 'Playful poses')
      break
    case 'yumi (classmate)':
      suggestions.push('School settings', 'Friendly expressions', 'Group compositions')
      break
    case 'yumi (kuudere)':
      suggestions.push('Cool color palette', 'Minimalist style', 'Subtle expressions')
      break
    case 'yumi (genki girl)':
      suggestions.push('Vibrant colors', 'Energetic poses', 'Outdoor settings')
      break
  }

  return suggestions.slice(0, 5)
}

const generateMoodSuggestions = (personality: any): string[] => {
  const moods: string[] = []
  
  if (personality.traits) {
    personality.traits.forEach((trait: string) => {
      if (trait.includes('energetic')) moods.push('excited', 'enthusiastic')
      if (trait.includes('calm')) moods.push('peaceful', 'serene')
      if (trait.includes('caring')) moods.push('warm', 'gentle')
      if (trait.includes('independent')) moods.push('confident', 'determined')
      if (trait.includes('curious')) moods.push('wonder', 'discovery')
    })
  }

  return [...new Set(moods)].slice(0, 4) // Remove duplicates and limit
}

const determineFeedbackStyle = (personalityKey: string): 'encouraging' | 'analytical' | 'playful' | 'professional' => {
  switch (personalityKey) {
    case 'teacher': return 'encouraging'
    case 'kuudere': return 'analytical'
    case 'genki':
    case 'imouto': return 'playful'
    case 'classmate': return 'professional'
    default: return 'encouraging'
  }
}

const generateRefinementApproach = (personality: any): string => {
  const name = personality.name?.toLowerCase() || ''
  
  if (name.includes('teacher')) {
    return 'Guides with patience and clear explanations'
  } else if (name.includes('tsundere')) {
    return 'Initially resistant but eventually helpful with suggestions'
  } else if (name.includes('genki')) {
    return 'Enthusiastically offers multiple exciting alternatives'
  } else if (name.includes('kuudere')) {
    return 'Provides logical, analytical feedback with minimal emotion'
  } else if (name.includes('imouto')) {
    return 'Asks cute questions and suggests fun improvements'
  } else if (name.includes('classmate')) {
    return 'Collaboratively suggests improvements as a peer'
  } else {
    return 'Shares passionate insights and creative alternatives'
  }
}

const getDefaultPersonalities = () => {
  return {
    personalities: {
      otaku: {
        name: "Yumi (Otaku)",
        traits: ["Passionate about anime", "Energetic", "Knowledgeable"],
        speechPatterns: ["Uses anime terminology", "Gets excited with exclamation marks"],
        likes: {
          weather: ["Cherry blossom season", "Cool autumn days"],
          activities: ["Watching anime", "Reading manga"]
        }
      },
      balanced: {
        name: "Yumi (Balanced)",
        traits: ["Helpful", "Adaptive", "Creative"],
        speechPatterns: ["Clear communication", "Supportive tone"],
        likes: {
          weather: ["Pleasant days", "Comfortable conditions"],
          activities: ["Creative projects", "Learning"]
        }
      }
    }
  }
}

// Prompt generation with personality influence
export const generatePersonalityInfluencedPrompt = (
  basePrompt: string,
  personalityKey: string,
  mode: 'writing' | 'image' | 'report'
): string => {
  const guide = getPersonalityGuide(personalityKey)
  if (!guide) return basePrompt

  let enhancedPrompt = basePrompt
  const suggestions = mode === 'writing' ? guide.creativeSuggestions.writing : guide.creativeSuggestions.visual

  // Add personality influence to prompt
  enhancedPrompt += `\n\nPersonality guidance from ${guide.name}:`
  suggestions.slice(0, 3).forEach(suggestion => {
    enhancedPrompt += `\n- ${suggestion}`
  })

  return enhancedPrompt
}

export default {
  loadYumiPersonalities,
  getYumiPersonalities,
  getAvailablePersonalities,
  getPersonalityGuide,
  generatePersonalityInfluencedPrompt
} 