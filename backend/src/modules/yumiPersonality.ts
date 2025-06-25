import * as path from 'path'
import * as fs from 'fs'
import { 
  YumiPersonality, 
  PersonalityConfig, 
  PersonalityAnalysis, 
  PersonalityMood, 
  ContextualInfo 
} from './yumiPersonality/types'
import { PersonalityAnalyzer } from './yumiPersonality/analyzer'
import { PersonalityGenerator } from './yumiPersonality/generator'

export class YumiPersonalityManager {
  private personalities: PersonalityConfig
  private analyzer: PersonalityAnalyzer
  private generator: PersonalityGenerator

  constructor() {
    // Load personality configurations
    const configPath = path.join(__dirname, '../config/yumi-personalities.json')
    this.personalities = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    
    // Initialize analyzers and generators
    this.analyzer = new PersonalityAnalyzer()
    this.generator = new PersonalityGenerator()
  }

  /**
   * Get available personality types
   */
  getAvailablePersonalities(): string[] {
    return Object.keys(this.personalities.personalities)
  }

  /**
   * Get personality details
   */
  getPersonalityDetails(personalityType: string): YumiPersonality | null {
    return this.personalities.personalities[personalityType] || null
  }

  /**
   * Generate response with specific personality
   */
  async generatePersonalityResponse(
    personalityType: string,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    contextualInfo?: ContextualInfo
  ): Promise<string> {
    const personality = this.getPersonalityDetails(personalityType)
    if (!personality) {
      throw new Error(`Personality type '${personalityType}' not found`)
    }

    return this.generator.generatePersonalityResponse(
      personality, 
      userMessage, 
      conversationHistory, 
      contextualInfo
    )
  }

  /**
   * Analyze user message for personality-relevant topics
   */
  async analyzeMessageForPersonality(
    personalityType: string,
    userMessage: string
  ): Promise<PersonalityAnalysis> {
    const personality = this.getPersonalityDetails(personalityType)
    if (!personality) {
      throw new Error(`Personality type '${personalityType}' not found`)
    }

    return this.analyzer.analyzeMessageForPersonality(personality, userMessage)
  }

  /**
   * Get personality-based mood from contextual information
   */
  getPersonalityMood(
    personalityType: string,
    contextualInfo: {
      weather?: string;
      timeOfDay?: string;
      recentTopics?: string[];
    }
  ): PersonalityMood {
    const personality = this.getPersonalityDetails(personalityType)
    if (!personality) {
      return { moodLevel: 5, moodDescription: 'neutral', reasoning: ['Unknown personality type'] }
    }

    return this.analyzer.getPersonalityMood(personality, contextualInfo)
  }

  /**
   * Switch personality mid-conversation with explanation
   */
  async switchPersonality(
    fromPersonality: string,
    toPersonality: string,
    reason?: string
  ): Promise<string> {
    const oldPersonality = this.getPersonalityDetails(fromPersonality)
    const newPersonality = this.getPersonalityDetails(toPersonality)

    if (!oldPersonality || !newPersonality) {
      throw new Error('Invalid personality types for switching')
    }

    return this.generator.switchPersonality(oldPersonality, newPersonality, reason)
  }

  /**
   * Process website editing instructions and generate implementation guidance
   */
  async processWebsiteEditingInstructions(instructions: string): Promise<string> {
    return this.generator.processWebsiteEditingInstructions(instructions)
  }
}

export default YumiPersonalityManager
