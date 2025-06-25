import { Response } from 'express'
import OpenAI from 'openai'
import { db } from '../../../database'
import { AuthRequest } from '../../../auth'
import { characterTemplates as templateData } from '../data'
import { CharacterTemplate, DesignBrief } from '../types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const characterTemplates: CharacterTemplate[] = templateData;

// Start character design session
export const startSession = async (req: AuthRequest, res: Response): Promise<{ sessionId: string; template: CharacterTemplate; designBrief: DesignBrief; clarificationQuestions: string[] } | undefined> => {
  const userId = req.user?.id
  if (!userId) {
    res.status(401).json({ error: 'User not authenticated' })
    return
  }

  const { description, templateId } = req.body

  if (!description) {
    res.status(400).json({ error: 'Character description is required' })
    return
  }

  const template = characterTemplates.find(t => t.id === templateId)
  if (!template) {
    res.status(400).json({ error: 'Invalid template ID' })
    return
  }

  // Use GPT-4 to analyze the description and create a design brief
  const systemPrompt = `You are an expert anime character designer. Analyze the user's character description and create a detailed design brief in JSON format.

Focus on creating a design that works well with the ${template.name} style (${template.description}).

Return a JSON object with this exact structure:
{
  "character": {
    "name": "suggested name or null",
    "age": "numeric age",
    "gender": "gender identity",
    "personality": ["trait1", "trait2", "trait3"]
  },
  "appearance": {
    "height": "height description",
    "build": "body build description",
    "hairStyle": "hairstyle description",
    "hairColor": "hair color",
    "eyeColor": "eye color",
    "skinTone": "skin tone description",
    "outfit": {
      "style": "clothing style description",
      "colors": ["color1", "color2", "color3"],
      "accessories": ["accessory1", "accessory2"]
    }
  },
  "mood": "overall character mood",
  "background": "suggested background setting",
  "specialFeatures": ["unique feature1", "unique feature2"],
  "references": ["reference1", "reference2"]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create a design brief for this character: ${description}` }
    ],
    temperature: 0.8,
    max_tokens: 1500
  })

  let designBrief: DesignBrief
  try {
    designBrief = JSON.parse(response.choices[0].message.content || '{}')
  } catch (parseError) {
    res.status(500).json({ error: 'Failed to process character description' })
    return
  }

  // Generate session ID and store the design brief
  const sessionId = `session_${userId}_${Date.now().toString()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Store session data in database
  try {
    await db.runRawSQL(
      'INSERT INTO anime_sessions (session_id, user_id, template_id, design_brief, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [sessionId, userId.toString(), templateId, JSON.stringify(designBrief), 'active', new Date().toISOString()]
    )
  } catch (dbError) {
    console.log('Note: anime_sessions table not found, using in-memory storage')
  }

  return {
    sessionId,
    template,
    designBrief,
    clarificationQuestions: await generateClarificationQuestions(designBrief, description)
  };
}

// Helper function to generate clarifying questions
async function generateClarificationQuestions(designBrief: DesignBrief, originalDescription: string): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are an expert anime character designer. Generate 3-5 clarifying questions to help refine the character design.'
      },
      {
        role: 'user',
        content: `Original description: ${originalDescription}\n\nCurrent design brief: ${JSON.stringify(designBrief, null, 2)}`
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  })

  try {
    const questions = JSON.parse(response.choices[0].message.content || '[]')
    return Array.isArray(questions) ? questions : []
  } catch {
    // If parsing fails, try to extract questions from the raw text
    const text = response.choices[0].message.content || ''
    return text.split('\n').filter(line => line.trim().endsWith('?'))
  }
} 