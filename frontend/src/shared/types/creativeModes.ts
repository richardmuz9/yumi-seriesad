// Creative Control System Types
export type CreativeControlLevel = 'precise' | 'balanced' | 'freestyle'

export interface CreativeControlSettings {
  level: CreativeControlLevel
  yumiPersonality: string // References yumi-personalities.json
  allowSuggestions: boolean
  memoryNudges: boolean
  iterativeMode: boolean
}

export interface CreativeSession {
  id: string
  mode: 'writing' | 'image' | 'animation' | 'report'
  controlSettings: CreativeControlSettings
  userHistory: UserCreativeHistory
  currentContext: any
  generatedVersions: CreativeVersion[]
}

export interface UserCreativeHistory {
  recentThemes: string[]
  favoriteStyles: string[]
  commonElements: string[]
  preferredMoods: string[]
  lastUsedPersonality: string
}

export interface CreativeVersion {
  id: string
  type: 'main' | 'alternative' | 'user_edited'
  content: any // Could be text, image URL, or other content
  metadata: {
    aiConfidence: number
    userSatisfaction?: number
    refinementsSuggested: string[]
    personalityInfluence: string[]
  }
}

export interface CreativeFeedback {
  type: 'mood' | 'style' | 'detail' | 'theme' | 'personality'
  question: string
  options: CreativeFeedbackOption[]
  priority: 'high' | 'medium' | 'low'
}

export interface CreativeFeedbackOption {
  id: string
  label: string
  emoji?: string
  description?: string
  personalityAlignment?: string[]
}

// Yumi Personality Integration
export interface YumiPersonalityGuide {
  name: string
  creativeSuggestions: {
    writing: string[]
    visual: string[]
    mood: string[]
  }
  feedbackStyle: 'encouraging' | 'analytical' | 'playful' | 'professional'
  refinementApproach: string
}

// Smart Prompting System
export interface SmartPromptEngine {
  generateBasePrompt: (userInput: string, settings: CreativeControlSettings) => string
  suggestRefinements: (content: any, feedback: CreativeFeedback[]) => string[]
  reconstructPrompt: (session: CreativeSession) => PromptReconstruction
}

export interface PromptReconstruction {
  theme: string
  style: string
  mood: string
  details: string[]
  personalityInfluence: string
  confidence: number
}

// UI Component Props
export interface CreativeControlPanelProps {
  currentSettings: CreativeControlSettings
  onSettingsChange: (settings: CreativeControlSettings) => void
  userHistory: UserCreativeHistory
  availablePersonalities: string[]
  mode: 'writing' | 'image' | 'report'
}

export interface IterativeFeedbackProps {
  versions: CreativeVersion[]
  onVersionSelect: (versionId: string) => void
  onRequestRefinement: (feedback: CreativeFeedback) => void
  currentPersonality: string
  refinementSuggestions: string[]
}

// Memory Nudges
export interface MemoryNudge {
  type: 'theme_reuse' | 'style_suggestion' | 'mood_continuation' | 'personality_consistency'
  message: string
  action: string
  confidence: number
  relatedHistory: string[]
} 