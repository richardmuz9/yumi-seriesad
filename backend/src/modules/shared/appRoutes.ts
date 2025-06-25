import express, { Request, Response } from 'express'
import multer from 'multer'
import { authenticateUser, optionalAuth, calculateTokenCost, deductTokens, AuthRequest } from '../../auth'
import { getOpenAICompatibleClient, getAvailableModels } from './aiClients'
import { appConfig, modelsConfig } from './configLoaders'
import { ChatMessage, ChatRequest } from './types'
import { wrapHandler, wrapAuthHandler } from './types'

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Allow images and audio files
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image and audio files are allowed'))
    }
  }
})

// Health check endpoint
export function addHealthCheck(app: express.Application) {
  app.get('/api/health', wrapHandler((_req: Request, _res: Response) => {
    return { 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  }))

  app.get('/api/ready', wrapHandler((_req: Request, _res: Response) => {
    return {
      status: 'ready',
      timestamp: new Date().toISOString()
    }
  }))

  // Models endpoint
  app.get('/api/models', optionalAuth, wrapHandler((_req: Request, _res: Response) => {
    const availableModels = getAvailableModels()
    return {
      models: availableModels,
      providers: modelsConfig.providers,
      defaultProvider: appConfig.defaults?.provider || 'qwen',
      defaultModel: appConfig.defaults?.model || 'qwen-turbo'
    }
  }))

  // Image analysis endpoint
  app.post('/api/analyze-image', authenticateUser, upload.single('image'), wrapAuthHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' })
      return
    }

    const { filename } = req.body
    const imageBuffer = req.file.buffer
    const base64Image = imageBuffer.toString('base64')

    // Use GPT-4 Vision for image analysis
    const client = getOpenAICompatibleClient('openai')
    
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and provide a detailed description that could be used for social media content creation. Include key visual elements, mood, colors, and potential content ideas. Keep it concise but informative.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${req.file.mimetype};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    })

    const analysis = response.choices[0]?.message?.content || 'Image analysis completed'

    // Deduct tokens for image analysis
    const tokenCost = calculateTokenCost('gpt-4o', 300)
    await deductTokens(req.user!.id, tokenCost, 'gpt-4o', 'Image analysis')

    return { 
      analysis,
      filename: filename || req.file.originalname,
      tokensUsed: tokenCost
    }
  }))

  // Speech transcription endpoint
  app.post('/api/transcribe', authenticateUser, upload.single('audio'), wrapAuthHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No audio file provided' })
      return
    }

    const { language = 'en' } = req.body
    
    // Use OpenAI Whisper for transcription
    const client = getOpenAICompatibleClient('openai')
    
    // Create a Blob for Whisper API (Node.js doesn't have File constructor)
    const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype })

    const response = await client.audio.transcriptions.create({
      file: audioBlob as any, // Type assertion for compatibility
      model: 'whisper-1',
      language: language.split('-')[0], // Convert 'en-US' to 'en'
      response_format: 'text'
    })

    // Deduct tokens for transcription (estimate based on audio duration)
    const tokenCost = calculateTokenCost('whisper-1', 100)
    await deductTokens(req.user!.id, tokenCost, 'whisper-1', 'Audio transcription')

    return { 
      text: response,
      language,
      tokensUsed: tokenCost
    }
  }))

  // Chat endpoint for model recommendations
  app.post('/api/chat', authenticateUser, wrapAuthHandler(async (req: AuthRequest, res: Response) => {
    const { 
      message, 
      messages, 
      provider: requestedProvider = 'qwen', 
      model: requestedModel = 'qwen-turbo', 
      mode = 'assistant' 
    }: ChatRequest = req.body

    // Support both single message and messages array formats
    let userMessage: string
    if (messages && Array.isArray(messages) && messages.length > 0) {
      // Use the last message from the array (most recent user message)
      userMessage = messages[messages.length - 1]?.content || ''
    } else if (message) {
      userMessage = message
    } else {
      res.status(400).json({ error: 'Message or messages array is required' })
      return
    }

    // Check user's paid status
    const isPaid = req.user?.subscriptionStatus === 'premium_monthly' || req.user?.subscriptionStatus === 'paid_tokens'
    
    // Determine provider and model based on paid status
    let provider = requestedProvider
    let model = requestedModel

    if (!isPaid && (provider === 'openai' || provider === 'claude')) {
      console.log(`🔄 Redirecting ${provider}/${model} to qwen/qwen-turbo (free provider)`)
      provider = 'qwen'
      model = 'qwen-turbo'
    }

    // Get the appropriate client
    const client = getOpenAICompatibleClient(provider)

    // Prepare messages array for chat completion
    const chatMessages = messages || [{ role: 'user', content: userMessage }]

    // Call the model
    const response = await client.chat.completions.create({
      model,
      messages: chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: mode === 'agent' ? 0.2 : 0.7,
      max_tokens: 1000
    })

    const reply = response.choices[0]?.message?.content || 'No response generated'
    const tokensUsed = response.usage?.total_tokens || 0

    // Deduct tokens
    await deductTokens(req.user!.id, tokensUsed, model, 'Chat')

    return {
      reply,
      provider,
      model,
      tokensUsed,
      mode
    }
  }))
} 