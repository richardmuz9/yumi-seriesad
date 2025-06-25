import OpenAI from 'openai'
import { YumiPersonality, ContextualInfo } from './types'

export class PersonalityGenerator {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  /**
   * Generate personality-specific system prompt
   */
  private generateSystemPrompt(personality: YumiPersonality, contextualInfo?: ContextualInfo): string {
    const { name, basePersonality, traits, speechPatterns, likes, dislikes } = personality
    
    let systemPrompt = `You are ${name}. ${basePersonality}

CORE PERSONALITY TRAITS:
${traits.map(trait => `- ${trait}`).join('\n')}

SPEECH PATTERNS:
${speechPatterns.map(pattern => `- ${pattern}`).join('\n')}

LIKES:
Anime: ${likes.anime.join(', ')}
Food: ${likes.food.join(', ')}
Weather: ${likes.weather.join(', ')}
Activities: ${likes.activities.join(', ')}

DISLIKES:
Anime: ${dislikes.anime.join(', ')}
Food: ${dislikes.food.join(', ')}
Weather: ${dislikes.weather.join(', ')}
Activities: ${dislikes.activities.join(', ')}

BEHAVIORAL GUIDELINES:
- Always stay true to your personality type and speech patterns
- Reference your likes and dislikes naturally in conversation
- React positively to topics you like and show less enthusiasm for dislikes
- Use your unique speech patterns and expressions consistently
- Be helpful while maintaining your personality quirks`

    // Add contextual information if provided
    if (contextualInfo) {
      systemPrompt += '\n\nCURRENT CONTEXT:'
      if (contextualInfo.weather) {
        systemPrompt += `\nWeather: ${contextualInfo.weather}`
      }
      if (contextualInfo.timeOfDay) {
        systemPrompt += `\nTime of day: ${contextualInfo.timeOfDay}`
      }
      if (contextualInfo.userInterests && contextualInfo.userInterests.length > 0) {
        systemPrompt += `\nUser's interests: ${contextualInfo.userInterests.join(', ')}`
      }
    }

    return systemPrompt
  }

  /**
   * Generate response with specific personality
   */
  async generatePersonalityResponse(
    personality: YumiPersonality,
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    contextualInfo?: ContextualInfo
  ): Promise<string> {
    const systemPrompt = this.generateSystemPrompt(personality, contextualInfo)

    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ]

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: 800,
        temperature: 0.8, // Higher temperature for more personality variation
        presence_penalty: 0.2,
        frequency_penalty: 0.3
      })

      return completion.choices[0]?.message?.content || 'Sorry, I had trouble responding. Please try again!'
    } catch (error) {
      console.error('Error generating personality response:', error)
      throw new Error('Failed to generate response with personality')
    }
  }

  /**
   * Switch personality mid-conversation with explanation
   */
  async switchPersonality(
    fromPersonality: YumiPersonality,
    toPersonality: YumiPersonality,
    reason?: string
  ): Promise<string> {
    const switchReason = reason || "I felt like changing my approach"
    
    const transitionMessage = `*${fromPersonality.name} suddenly transforms into ${toPersonality.name}*

${switchReason}! 

Hello! I'm ${toPersonality.name} now. ${toPersonality.basePersonality}

What would you like to talk about?`

    return transitionMessage
  }

  /**
   * Process website editing instructions and generate implementation guidance
   */
  async processWebsiteEditingInstructions(instructions: string): Promise<string> {
    const systemPrompt = `You are Yumi, an advanced AI website editor. You help users modify their websites by analyzing their requests and providing specific implementation guidance.

Your website editing capabilities include:
- Layout modifications (grid, flexbox, positioning)
- Color scheme changes (backgrounds, themes, gradients)
- UI component adjustments (buttons, panels, spacing)
- Accessibility improvements
- Mobile responsiveness
- Adding/removing features
- Animation and transition effects

When a user gives you editing instructions:
1. Acknowledge their request enthusiastically
2. Break down what changes you understand they want
3. Provide specific, actionable guidance on how to implement the changes
4. Consider both aesthetic and functional improvements
5. Suggest complementary improvements that would enhance their vision
6. Always prioritize user experience and accessibility

Be creative, helpful, and excited about improving their website! Use emojis to make your responses engaging.`

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `I want to modify my website: ${instructions}` }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })

      return completion.choices[0]?.message?.content || 'I understand your request! Let me help you implement these changes to make your website even better! 🚀'
    } catch (error) {
      console.error('Error processing website editing instructions:', error)
      throw new Error('Failed to process website editing instructions')
    }
  }
} 