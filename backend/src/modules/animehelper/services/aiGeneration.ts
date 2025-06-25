// AI generation utilities for anime character creation
import { OpenAI } from 'openai'
import { ProgressAnalysis, StructuredPrompt, AIGenerationSettings, GeneratedImage } from '../types'
import { ImageGenerationError, ImageGenerationErrorType, withRetry, isRetryableError } from './errorHandling'
import { chargeUserCredits } from '../../billing'
import { processImage } from '../../shared/imageProcessing'
import { HfInference } from '@huggingface/inference'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN)
const MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"

// Default post-processing options
const defaultPostProcessingOptions = {
  upscale: false,
  denoise: false,
  lineArtCleanup: false,
  colorCorrection: {
    contrast: 1,
    saturation: 1,
    bloom: 0
  }
}

// Convert AIGenerationSettings to PostProcessingOptions
function convertSettings(settings: AIGenerationSettings): any {
  return {
    upscale: settings.postProcessing?.upscale || false,
    denoise: settings.postProcessing?.denoise || false,
    lineArtCleanup: settings.postProcessing?.lineArtCleanup || false,
    colorCorrection: settings.postProcessing?.colorCorrection || {
      contrast: 1,
      saturation: 1,
      bloom: 0
    }
  }
}

// Generate clarification questions for character design
export async function generateClarifyingQuestions(
  description: string,
  existingAnswers: Record<string, string> = {}
): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates clarifying questions for anime character design. Focus on visual aspects that need to be specified."
        },
        {
          role: "user",
          content: `Given this character description: "${description}", and these existing answers: ${JSON.stringify(existingAnswers)}, what are 3 important clarifying questions about the character's visual design that haven't been addressed yet?`
        }
      ]
    })

    const questions = completion.choices[0].message.content?.split('\n').filter(q => q.trim().length > 0) || []
    return questions.slice(0, 3)

  } catch (error) {
    console.error('Error generating questions:', error)
    throw new ImageGenerationError(
      ImageGenerationErrorType.API_ERROR,
      'Failed to generate clarifying questions',
      true
    )
  }
}

// Analyze drawing progress
export async function analyzeDrawingProgress(
  currentImage: string,
  targetDescription: string
): Promise<ProgressAnalysis> {
  try {
    // Convert image URL to base64 if it's not already
    let imageContent: string
    if (currentImage.startsWith('data:')) {
      imageContent = currentImage
    } else {
      // Read the file and convert to base64
      const buffer = await require('fs').promises.readFile(currentImage)
      const base64 = buffer.toString('base64')
      imageContent = `data:image/png;base64,${base64}`
    }

    // Process the image with default options before analysis
    const processedImageUrl = await processImage(currentImage, defaultPostProcessingOptions)

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are an art teacher specializing in anime character design. Analyze the current drawing progress and provide constructive feedback."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Compare this drawing to the target description: "${targetDescription}". What's good and what needs improvement?`
            },
            {
              type: "image_url",
              image_url: {
                url: imageContent
              }
            }
          ]
        }
      ],
      max_tokens: 500
    })

    const analysis = completion.choices[0].message.content || ''
    
    // Extract completion percentage and areas from analysis
    const completionMatch = analysis.match(/(\d+)%/)
    const completionPercentage = completionMatch ? parseInt(completionMatch[1], 10) : 0

    // Extract suggested next steps
    const suggestedNextSteps = analysis
      .split('\n')
      .filter(line => line.includes('- '))
      .map(line => line.replace('- ', '').trim())

    // Analyze specific areas
    const areas = {
      anatomy: analysis.toLowerCase().includes('anatomy') ? 50 : 0,
      proportions: analysis.toLowerCase().includes('proportion') ? 50 : 0,
      details: analysis.toLowerCase().includes('detail') ? 50 : 0,
      style: analysis.toLowerCase().includes('style') ? 50 : 0
    }

    return {
      status: completionPercentage >= 90 ? 'completed' : 'in_progress',
      completionPercentage,
      areas,
      suggestedNextSteps,
      analysis
    }

  } catch (error) {
    console.error('Error analyzing progress:', error)
    throw new ImageGenerationError(
      ImageGenerationErrorType.API_ERROR,
      'Failed to analyze drawing progress',
      true
    )
  }
}

// Generate structured prompt from description
async function generateStructuredPrompt(description: string): Promise<StructuredPrompt> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert at creating detailed anime character prompts. Break down character descriptions into structured components.`
        },
        {
          role: "user",
          content: `Please analyze this character description and extract structured information: "${description}"`
        }
      ],
      functions: [
        {
          name: "structure_character_prompt",
          description: "Structure a character description into components",
          parameters: {
            type: "object",
            properties: {
              subject: { type: "string" },
              pose: { type: "string" },
              expression: { type: "string" },
              clothingAndAccessories: { type: "string" },
              hairAndColorPalette: { type: "string" },
              lightingAndMood: { type: "string" },
              artStyleAndDetail: { type: "string" },
              finishAndPostProcess: { type: "string" },
              negativePrompt: { type: "string" }
            },
            required: ["subject", "finishAndPostProcess"]
          }
        }
      ],
      function_call: { name: "structure_character_prompt" }
    })

    const functionCall = completion.choices[0].message.function_call
    if (functionCall?.arguments) {
      const parsedPrompt = JSON.parse(functionCall.arguments)
      return {
        subject: parsedPrompt.subject,
        pose: parsedPrompt.pose || "",
        expression: parsedPrompt.expression || "",
        clothingAndAccessories: parsedPrompt.clothingAndAccessories || "",
        hairAndColorPalette: parsedPrompt.hairAndColorPalette || "",
        lightingAndMood: parsedPrompt.lightingAndMood || "",
        artStyleAndDetail: parsedPrompt.artStyleAndDetail || "",
        finishAndPostProcess: parsedPrompt.finishAndPostProcess || "masterpiece, best quality, ultra-detailed",
        negativePrompt: parsedPrompt.negativePrompt || ""
      }
    }

    throw new Error('Failed to structure prompt')
  } catch (error) {
    console.error('Error generating structured prompt:', error)
    throw new ImageGenerationError(
      ImageGenerationErrorType.API_ERROR,
      'Failed to generate structured prompt',
      true
    )
  }
}

// Assemble final prompt from structured components
async function assemblePrompt(structuredPrompt: StructuredPrompt): Promise<string> {
  let prompt = "anime character, high quality, detailed, "
  
  if (structuredPrompt.subject) prompt += `${structuredPrompt.subject}, `
  if (structuredPrompt.pose) prompt += `${structuredPrompt.pose}, `
  if (structuredPrompt.expression) prompt += `${structuredPrompt.expression}, `
  if (structuredPrompt.clothingAndAccessories) prompt += `${structuredPrompt.clothingAndAccessories}, `
  if (structuredPrompt.hairAndColorPalette) prompt += `${structuredPrompt.hairAndColorPalette}, `
  if (structuredPrompt.lightingAndMood) prompt += `${structuredPrompt.lightingAndMood}, `
  if (structuredPrompt.artStyleAndDetail) prompt += `${structuredPrompt.artStyleAndDetail}, `
  if (structuredPrompt.finishAndPostProcess) prompt += `${structuredPrompt.finishAndPostProcess}`
  
  return prompt
}

// Generate image using Hugging Face
async function generateImage(structuredPrompt: StructuredPrompt, settings: AIGenerationSettings): Promise<string> {
  try {
    const prompt = await assemblePrompt(structuredPrompt)
    
    const response = await withRetry(async () => {
      return await hf.textToImage({
        inputs: prompt,
        model: MODEL_ID,
        parameters: {
          negative_prompt: structuredPrompt.negativePrompt || "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
          num_inference_steps: 50,
          guidance_scale: 7.5
        }
      })
    }, isRetryableError)

    // Save the generated image to a temporary file
    const outputFilename = `generated_${Date.now()}.png`
    const outputPath = `./uploads/${outputFilename}`
    
    // Convert response to buffer
    let buffer: Buffer
    if (Buffer.isBuffer(response)) {
      buffer = response
    } else if (typeof response === 'string') {
      if (response.startsWith('data:')) {
        buffer = Buffer.from(response.split(',')[1], 'base64')
      } else {
        buffer = Buffer.from(response, 'base64')
      }
    } else {
      buffer = Buffer.from(await (response as any).arrayBuffer())
    }
    
    // Write the buffer to a file
    await require('fs').promises.writeFile(outputPath, buffer)
    
    // Process the image with the specified settings
    const processedImageUrl = await processImage(outputPath, convertSettings(settings))
    return processedImageUrl
  } catch (error) {
    console.error('Error generating image:', error)
    throw new ImageGenerationError(
      ImageGenerationErrorType.API_ERROR,
      'Failed to generate image',
      isRetryableError(error)
    )
  }
}

// Main character generation function
export async function generateAnimeCharacter(
  userId: string,
  description: string,
  settings: AIGenerationSettings
): Promise<GeneratedImage> {
  try {
    // Charge credits before generation
    const cost = estimateGenerationCost(settings)
    await chargeUserCredits(userId, cost)

    // Generate structured prompt
    const structuredPrompt = await generateStructuredPrompt(description)
    
    // Generate image
    const imageUrl = await generateImage(structuredPrompt, settings)

    return {
      url: imageUrl,
      prompt: structuredPrompt,
      settings,
      metadata: {
        modelUsed: MODEL_ID,
        timestamp: Date.now()
      }
    }
  } catch (error) {
    console.error('Error in character generation:', error)
    throw error
  }
}

// Estimate token cost based on settings
function estimateGenerationCost(settings: AIGenerationSettings): number {
  let cost = 1000 // Base cost

  if (settings.useCustomModel) cost += 500
  if (settings.postProcessing?.upscale) cost += 200
  if (settings.postProcessing?.denoise) cost += 100
  if (settings.postProcessing?.lineArtCleanup) cost += 150

  return cost * (settings.iterations || 1)
} 