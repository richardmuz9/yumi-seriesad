import express, { Response } from 'express'
import {
  qwen,
  modelsConfig,
  appConfig,
  authenticateUser,
  calculateTokenCost,
  deductTokens,
  AuthRequest
} from '../../shared'
import { generateWritingContent, optimizeForPlatform } from '../services'
import { WritingRequest, WritingVariation, WritingResponse } from '../types'
import { contentTypePrompts, platformLimits, animePersonaPrompts } from '../data'
import { wrapAuthHandler } from '../../shared/types'

// Enhanced variation generation for different content types
function generateContentVariations(baseContent: string, contentType: string, count: number): WritingVariation[] {
  const variations: WritingVariation[] = []
  
  const variationStrategies = {
    'social-media': [
      { name: 'Emoji enhancement', apply: (text: string) => text.replace(/\./g, ' ✨').replace(/!/g, ' 🚀') },
      { name: 'Question addition', apply: (text: string) => text + '\n\nWhat are your thoughts? 💭' },
      { name: 'Call-to-action', apply: (text: string) => text + '\n\nShare if you agree! 👇' }
    ],
    'creative-writing': [
      { name: 'Sensory details', apply: (text: string) => text.replace(/\./g, ', with vivid details.') },
      { name: 'Emotional depth', apply: (text: string) => text.replace(/said/g, 'whispered') },
      { name: 'Pacing variation', apply: (text: string) => text.replace(/\. /g, '.\n\n') }
    ],
    'blog-article': [
      { name: 'Subheading structure', apply: (text: string) => text.replace(/\n\n/g, '\n\n## ') },
      { name: 'Data inclusion', apply: (text: string) => text + '\n\n*According to recent studies...*' },
      { name: 'Reader engagement', apply: (text: string) => text + '\n\nWhat has your experience been?' }
    ],
    'script': [
      { name: 'Character emotion', apply: (text: string) => text.replace(/:/g, ' (smiling):') },
      { name: 'Scene direction', apply: (text: string) => '[Scene: ' + text + ']' },
      { name: 'Dialogue variation', apply: (text: string) => text.replace(/\./g, '...') }
    ]
  }

  const strategies = variationStrategies[contentType as keyof typeof variationStrategies] || variationStrategies['social-media']
  
  for (let i = 0; i < Math.min(count, strategies.length); i++) {
    const strategy = strategies[i]
    const variationContent = strategy.apply(baseContent)
    
    variations.push({
      id: `var_${i + 1}`,
      content: variationContent,
      changes: [strategy.name],
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    })
  }
  
  return variations
}

const generateContent = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id // We can use non-null assertion because this is wrapped with wrapAuthHandler

  const {
    contentType = 'social-media',
    platform,
    audience,
    objective,
    tone,
    stylePack,
    animePersona,
    topic,
    keyPoints = [],
    pastPost,
    trendingHashtags,
    customInstructions,
    generateVariations = false,
    variationCount = 3,
    model,
    provider = appConfig.defaults.provider
  }: WritingRequest = req.body

  // Get content type configuration
  const contentConfig = contentTypePrompts[contentType]
  if (!contentConfig) {
    res.status(400).json({ error: 'Invalid content type' })
    return
  }

  // Build the enhanced prompt
  let prompt = contentConfig.basePrompt(req.body)
  
  prompt += `\n\nTopic: ${topic}`
  
  if (keyPoints.length > 0) {
    prompt += `\nKey Points: ${keyPoints.join(', ')}`
  }

  if (stylePack) {
    prompt += `\nStyle Pack: ${stylePack}`
  }

  // Add anime persona influence
  if (animePersona && animePersonaPrompts[animePersona as keyof typeof animePersonaPrompts]) {
    prompt += `\n\nPersonality Influence: ${animePersonaPrompts[animePersona as keyof typeof animePersonaPrompts]}`
  }

  if (pastPost) {
    prompt += `\nReference style from this past content: ${pastPost}`
  }

  if (trendingHashtags && trendingHashtags.length > 0 && contentType === 'social-media') {
    prompt += `\nInclude relevant hashtags: ${trendingHashtags.join(', ')}`
  }

  if (customInstructions) {
    prompt += `\nAdditional instructions: ${customInstructions}`
  }

  // Content type specific instructions
  switch (contentType) {
    case 'social-media':
      if (platform) {
        prompt += `\nPlatform: ${platform} - follow ${platform} best practices and formatting`
      }
      prompt += `\nMake it engaging, authentic, and valuable to the audience.`
      break
    case 'creative-writing':
      prompt += `\nFocus on vivid imagery, character development, and emotional resonance. Use creative language and storytelling techniques.`
      break
    case 'blog-article':
      prompt += `\nStructure as a well-organized article with clear sections, informative content, and actionable insights. Include introduction, body, and conclusion.`
      break
    case 'script':
      prompt += `\nFormat as a visual novel script with character names, dialogue, and scene directions. Make it engaging and true to the visual novel format.`
      break
  }

  // Select AI client
  let aiClient = qwen
  let selectedModel = model || modelsConfig.providers.qwen.defaultModel

  // Calculate token cost
  const tokenCost = calculateTokenCost(selectedModel, prompt.length)

  // Check and deduct tokens
  const deductionResult = await deductTokens(userId, tokenCost, selectedModel, 'Content generation')
  if (!deductionResult.success) {
    res.status(402).json({ 
      error: 'Insufficient tokens', 
      required: tokenCost,
      available: deductionResult.remainingTokens || 0
    })
    return
  }

  // Generate the content
  const completion = await aiClient.chat.completions.create({
    model: selectedModel,
    messages: [
      { role: 'system', content: contentConfig.systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_tokens: contentType === 'blog-article' ? 4000 : appConfig.chat.maxTokens,
    temperature: contentType === 'creative-writing' ? 0.9 : 0.8
  })

  const generatedContent = completion.choices[0]?.message?.content || 'Failed to generate content.'

  // Determine content limits
  const maxLengths = {
    'social-media': platform === 'twitter' ? 280 : 3000,
    'creative-writing': 10000,
    'blog-article': 20000,
    'script': 5000,
    'research-paper': 20000
  }

  const maxLength = maxLengths[contentType as keyof typeof maxLengths] || 3000
  const characterCount = generatedContent.length
  const withinLimit = characterCount <= maxLength

  let response: WritingResponse = {
    content: generatedContent,
    contentType,
    platform,
    characterCount,
    maxLength,
    withinLimit,
    provider,
    model: selectedModel,
    tokensUsed: tokenCost
  }

  // Generate variations if requested
  if (generateVariations) {
    const variations = generateContentVariations(generatedContent, contentType, variationCount)
    response.variations = variations
    response.variationCount = variations.length
  }

  return response
}

export const setupGenerationRoutes = (app: express.Application): void => {
  app.post('/api/writing-helper/generate', authenticateUser, wrapAuthHandler(generateContent))
} 