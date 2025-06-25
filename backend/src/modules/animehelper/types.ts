// AnimeHelper Module Types and Interfaces

export interface CharacterTemplate {
  id: string
  name: string
  style?: string
  description: string
  thumbnail?: string
  tags?: string[]
  previewImage?: string
  proportions?: {
    headRatio: number
    bodyRatio: number
    limbRatio: number
  }
  characteristics?: string[]
  basePrompt?: StructuredPrompt
  suggestedSettings?: AIGenerationSettings
}

export interface DesignBrief {
  character: {
    name?: string
    age?: number | string
    gender?: string
    personality?: string | string[]
  }
  appearance: {
    height?: string
    build?: string
    hairStyle?: string
    hairColor?: string
    eyeColor?: string
    skinTone?: string
    hair?: {
      style?: string
      color?: string
      length?: string
    }
    eyes?: {
      color?: string
      shape?: string
      size?: string
      expression?: string
    }
    body?: {
      height?: string
      build?: string
      skinTone?: string
    }
    outfit: {
      style: string
      colors: string[]
      accessories?: string[]
    }
  }
  pose?: string
  mood?: string
  background?: string
  colorPalette?: string[]
  specialFeatures: string[]
  references?: string[]
}

export interface CharacterGenerationRequest {
  description: string
  templateId?: string
  style?: string
  colorPalette?: string[]
  pose?: string
  background?: string
  enableChatMode?: boolean
}

export interface CharacterGenerationResponse {
  imageUrl: string
  designBrief: DesignBrief
  template: CharacterTemplate
  promptUsed: string
  clarificationQuestions?: string[]
  suggestions?: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export interface CharacterChatRequest {
  message: string
  chatHistory?: ChatMessage[]
  currentCharacter?: DesignBrief
}

export interface RegenerateRequest {
  originalImage: string
  maskData: string
  region: 'face' | 'hair' | 'outfit' | 'background' | 'full'
  designBrief: DesignBrief
  templateId: string
  style?: string
}

export interface ProgressAnalysis {
  status: 'not_started' | 'in_progress' | 'completed'
  completionPercentage: number
  areas: {
    anatomy: number
    proportions: number
    details: number
    style: number
  }
  suggestedNextSteps: string[]
  analysis: string
}

export interface StructuredPrompt {
  subject: string
  pose: string
  expression: string
  clothingAndAccessories: string
  hairAndColorPalette: string
  lightingAndMood: string
  artStyleAndDetail: string
  finishAndPostProcess: string
  negativePrompt?: string
}

export interface AIGenerationSettings {
  useCustomModel: boolean
  iterations: number
  referenceImage?: string
  postProcessing: {
    upscale: boolean
    denoise: boolean
    lineArtCleanup: boolean
    colorCorrection: {
      contrast: number
      saturation: number
      bloom: number
    }
  }
}

export interface GeneratedImage {
  url: string
  prompt: StructuredPrompt
  settings: AIGenerationSettings
  metadata: {
    referenceImageId?: string
    modelUsed: string
    timestamp: number
  }
}

export interface CuratedPrompt {
  id: string;
  theme: 'swimsuit' | 'maid' | 'seifuku';
  title: string;
  prompt: string;
  negativePrompt: string;
  baseCharacter: {
    hairColor: string;
    eyeColor: string;
    name: string;
  };
} 