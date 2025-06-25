import { 
  CreativeControlSettings, 
  CreativeSession, 
  SmartPromptEngine, 
  PromptReconstruction,
  CreativeFeedback,
  UserCreativeHistory 
} from '../types/creativeModes'
import { getPersonalityGuide, generatePersonalityInfluencedPrompt } from './yumiPersonalityService'

class SmartPromptEngineImpl implements SmartPromptEngine {
  
  generateBasePrompt(userInput: string, settings: CreativeControlSettings): string {
    const personalityGuide = getPersonalityGuide(settings.yumiPersonality)
    let prompt = userInput

    switch (settings.level) {
      case 'precise':
        // Minimal AI intervention, follow instructions exactly
        prompt = this.addPreciseInstructions(userInput)
        break
        
      case 'balanced':
        // Enhanced with personality and smart suggestions
        prompt = this.addBalancedEnhancements(userInput, settings, personalityGuide)
        break
        
      case 'freestyle':
        // Maximum creative freedom with personality influence
        prompt = this.addFreestyleCreativity(userInput, settings, personalityGuide)
        break
    }

    return prompt
  }

  private addPreciseInstructions(userInput: string): string {
    return `${userInput}

PRECISE MODE: Follow these instructions exactly as written. Do not add creative interpretations or variations unless explicitly requested. Maintain strict adherence to the specified details.`
  }

  private addBalancedEnhancements(
    userInput: string, 
    settings: CreativeControlSettings, 
    personalityGuide: any
  ): string {
    let enhanced = userInput

    if (personalityGuide) {
      enhanced += `\n\nCreative guidance from ${personalityGuide.name}:`
      
      // Add relevant suggestions based on mode
      const suggestions = personalityGuide.creativeSuggestions
      if (suggestions.mood.length > 0) {
        enhanced += `\nMood suggestions: ${suggestions.mood.slice(0, 2).join(', ')}`
      }
    }

    enhanced += `\n\nBALANCED MODE: Enhance the creative output while staying true to the user's intent. Add tasteful improvements and refinements. If any aspect is unclear, make intelligent assumptions based on context.`

    return enhanced
  }

  private addFreestyleCreativity(
    userInput: string, 
    settings: CreativeControlSettings, 
    personalityGuide: any
  ): string {
    let creative = userInput

    if (personalityGuide) {
      creative += `\n\nCreative freedom guided by ${personalityGuide.name}:`
      creative += `\n${personalityGuide.refinementApproach}`
      
      // Add all personality suggestions for maximum creativity
      const suggestions = personalityGuide.creativeSuggestions
      creative += `\nVisual inspiration: ${suggestions.visual.join(', ')}`
      creative += `\nMood palette: ${suggestions.mood.join(', ')}`
    }

    creative += `\n\nFREESTYLE MODE: Use the user input as inspiration and create something amazing! Add creative elements, interesting details, and surprise the user with thoughtful enhancements. Let your creativity shine while maintaining the core theme.`

    return creative
  }

  suggestRefinements(content: any, feedback: CreativeFeedback[]): string[] {
    const suggestions: string[] = []
    
    feedback.forEach(fb => {
      switch (fb.type) {
        case 'mood':
          suggestions.push('Adjust emotional tone')
          suggestions.push('Enhance atmosphere')
          break
        case 'style':
          suggestions.push('Try different artistic approach')
          suggestions.push('Modify visual style')
          break
        case 'detail':
          suggestions.push('Add more specific elements')
          suggestions.push('Simplify composition')
          break
        case 'theme':
          suggestions.push('Explore theme variations')
          suggestions.push('Add thematic elements')
          break
        case 'personality':
          suggestions.push('Increase personality influence')
          suggestions.push('Adjust character traits')
          break
      }
    })

    return [...new Set(suggestions)] // Remove duplicates
  }

  reconstructPrompt(session: CreativeSession): PromptReconstruction {
    const settings = session.controlSettings
    const personalityGuide = getPersonalityGuide(settings.yumiPersonality)
    
    // Analyze current context to reconstruct what the AI understood
    const theme = this.extractTheme(session.currentContext)
    const style = this.extractStyle(session.currentContext)
    const mood = this.extractMood(session.currentContext, personalityGuide)
    const details = this.extractDetails(session.currentContext)
    
    return {
      theme,
      style,
      mood,
      details,
      personalityInfluence: personalityGuide?.name || 'None',
      confidence: this.calculateConfidence(session)
    }
  }

  private extractTheme(context: any): string {
    // Analyze context to determine main theme
    if (typeof context === 'string') {
      const keywords = ['beach', 'school', 'fantasy', 'modern', 'traditional', 'cyberpunk']
      const found = keywords.find(keyword => 
        context.toLowerCase().includes(keyword)
      )
      return found || 'General'
    }
    return 'Mixed'
  }

  private extractStyle(context: any): string {
    if (typeof context === 'string') {
      const styles = ['anime', 'realistic', 'chibi', 'manga', 'western', 'minimalist']
      const found = styles.find(style => 
        context.toLowerCase().includes(style)
      )
      return found || 'Anime'
    }
    return 'Default'
  }

  private extractMood(context: any, personalityGuide: any): string {
    if (personalityGuide && personalityGuide.creativeSuggestions.mood.length > 0) {
      return personalityGuide.creativeSuggestions.mood[0]
    }
    
    if (typeof context === 'string') {
      const moods = ['happy', 'sad', 'excited', 'calm', 'energetic', 'mysterious']
      const found = moods.find(mood => 
        context.toLowerCase().includes(mood)
      )
      return found || 'Neutral'
    }
    return 'Adaptive'
  }

  private extractDetails(context: any): string[] {
    const details: string[] = []
    
    if (typeof context === 'string') {
      const detailKeywords = [
        'outfit', 'pose', 'expression', 'background', 'lighting', 
        'color', 'hair', 'eyes', 'accessories', 'environment'
      ]
      
      detailKeywords.forEach(keyword => {
        if (context.toLowerCase().includes(keyword)) {
          details.push(keyword)
        }
      })
    }
    
    return details.length > 0 ? details : ['Basic composition']
  }

  private calculateConfidence(session: CreativeSession): number {
    let confidence = 0.5 // Base confidence
    
    // Increase confidence based on settings clarity
    if (session.controlSettings.level === 'precise') confidence += 0.3
    if (session.controlSettings.level === 'balanced') confidence += 0.2
    
    // Increase confidence if personality guide is active
    if (session.controlSettings.yumiPersonality !== 'none') confidence += 0.1
    
    // Increase confidence based on user history richness
    if (session.userHistory.recentThemes.length > 0) confidence += 0.1
    if (session.userHistory.favoriteStyles.length > 0) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }

  // Memory-aware prompting
  generateMemoryInfluencedPrompt(
    basePrompt: string, 
    userHistory: UserCreativeHistory,
    settings: CreativeControlSettings
  ): string {
    let enhanced = basePrompt

    if (settings.memoryNudges && userHistory.recentThemes.length > 0) {
      enhanced += `\n\nContext from recent work: User has been exploring ${userHistory.recentThemes.slice(0, 2).join(' and ')} themes.`
    }

    if (userHistory.favoriteStyles.length > 0) {
      enhanced += `\nPreferred styles: ${userHistory.favoriteStyles.slice(0, 2).join(', ')}`
    }

    if (userHistory.preferredMoods.length > 0) {
      enhanced += `\nFavored moods: ${userHistory.preferredMoods.slice(0, 2).join(', ')}`
    }

    return enhanced
  }

  // Smart question generation
  generateSmartQuestions(
    context: any, 
    settings: CreativeControlSettings,
    mode: 'writing' | 'image' | 'report'
  ): CreativeFeedback[] {
    const questions: CreativeFeedback[] = []
    const personalityGuide = getPersonalityGuide(settings.yumiPersonality)

    if (settings.level === 'balanced' || settings.allowSuggestions) {
      // Mode-specific questions
      switch (mode) {
        case 'writing':
          questions.push({
            type: 'mood',
            question: 'What emotional tone should this writing have?',
            priority: 'high',
            options: [
              { id: 'formal', label: 'Formal', emoji: '📝' },
              { id: 'casual', label: 'Casual', emoji: '💬' },
              { id: 'emotional', label: 'Emotional', emoji: '💫' },
              { id: 'humorous', label: 'Humorous', emoji: '😄' }
            ]
          })
          break

        case 'image':
          questions.push({
            type: 'style',
            question: 'What visual style should we aim for?',
            priority: 'high',
            options: [
              { id: 'soft', label: 'Soft & Gentle', emoji: '🌸' },
              { id: 'bold', label: 'Bold & Dynamic', emoji: '⚡' },
              { id: 'elegant', label: 'Elegant & Refined', emoji: '✨' },
              { id: 'playful', label: 'Playful & Fun', emoji: '🎯' }
            ]
          })
          break

        case 'report':
          questions.push({
            type: 'detail',
            question: 'How detailed should the analysis be?',
            priority: 'medium',
            options: [
              { id: 'summary', label: 'High-level Summary', emoji: '📊' },
              { id: 'detailed', label: 'Detailed Analysis', emoji: '🔍' },
              { id: 'comprehensive', label: 'Comprehensive', emoji: '📋' }
            ]
          })
          break
      }

      // Personality-influenced questions
      if (personalityGuide) {
        questions.push({
          type: 'personality',
          question: `${personalityGuide.name} suggests focusing on what aspect?`,
          priority: 'medium',
          options: personalityGuide.creativeSuggestions[mode === 'image' ? 'visual' : 'writing']
            .slice(0, 4)
            .map(suggestion => ({
              id: suggestion.toLowerCase().replace(/\s+/g, '_'),
              label: suggestion,
              emoji: '🎭',
              personalityAlignment: [settings.yumiPersonality]
            }))
        })
      }
    }

    return questions
  }
}

// Create and export singleton instance
export const smartPromptEngine = new SmartPromptEngineImpl()

// Utility functions for integration
export const createCreativeSession = (
  mode: 'writing' | 'image' | 'animation' | 'report',
  initialSettings: Partial<CreativeControlSettings> = {}
): CreativeSession => {
  const defaultSettings: CreativeControlSettings = {
    level: 'balanced',
    yumiPersonality: 'otaku',
    allowSuggestions: true,
    memoryNudges: true,
    iterativeMode: true,
    ...initialSettings
  }

  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    mode,
    controlSettings: defaultSettings,
    userHistory: {
      recentThemes: [],
      favoriteStyles: [],
      commonElements: [],
      preferredMoods: [],
      lastUsedPersonality: defaultSettings.yumiPersonality
    },
    currentContext: null,
    generatedVersions: []
  }
}

export const updateUserHistory = (
  session: CreativeSession,
  newData: Partial<UserCreativeHistory>
): CreativeSession => {
  return {
    ...session,
    userHistory: {
      ...session.userHistory,
      ...newData,
      // Keep only recent items to avoid memory bloat
      recentThemes: [...(newData.recentThemes || []), ...session.userHistory.recentThemes].slice(0, 10),
      favoriteStyles: [...(newData.favoriteStyles || []), ...session.userHistory.favoriteStyles].slice(0, 10),
      commonElements: [...(newData.commonElements || []), ...session.userHistory.commonElements].slice(0, 10),
      preferredMoods: [...(newData.preferredMoods || []), ...session.userHistory.preferredMoods].slice(0, 10)
    }
  }
}

export default smartPromptEngine 