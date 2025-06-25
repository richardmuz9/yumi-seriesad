import { YumiPersonality, PersonalityAnalysis, PersonalityMood } from './types'

export class PersonalityAnalyzer {
  /**
   * Analyze user message for personality-relevant topics
   */
  analyzeMessageForPersonality(
    personality: YumiPersonality,
    userMessage: string
  ): PersonalityAnalysis {
    const { likes, dislikes } = personality;
    const allLikes = [...likes.anime, ...likes.food, ...likes.weather, ...likes.activities];
    const allDislikes = [...dislikes.anime, ...dislikes.food, ...dislikes.weather, ...dislikes.activities];

    const lowerMessage = userMessage.toLowerCase();
    
    const matchingLikes = allLikes.filter(like => 
      lowerMessage.includes(like.toLowerCase()) ||
      like.toLowerCase().includes(lowerMessage)
    );

    const matchingDislikes = allDislikes.filter(dislike => 
      lowerMessage.includes(dislike.toLowerCase()) ||
      dislike.toLowerCase().includes(lowerMessage)
    );

    // Generate topic suggestions based on personality
    const suggestedTopics = this.generateSuggestedTopics(personality);

    return {
      matchingLikes,
      matchingDislikes,
      suggestedTopics
    };
  }

  /**
   * Generate conversation starter suggestions based on personality
   */
  private generateSuggestedTopics(personality: YumiPersonality): string[] {
    const suggestions: string[] = [];
    const { likes } = personality;

    // Sample from different categories
    if (likes.anime.length > 0) {
      suggestions.push(`Ask me about ${likes.anime[0]}!`);
    }
    if (likes.food.length > 0) {
      suggestions.push(`I love talking about ${likes.food[0]}`);
    }
    if (likes.weather.length > 0) {
      suggestions.push(`${likes.weather[0]} is perfect for...`);
    }
    if (likes.activities.length > 0) {
      suggestions.push(`Have you tried ${likes.activities[0]}?`);
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Get personality-based mood from contextual information
   */
  getPersonalityMood(
    personality: YumiPersonality,
    contextualInfo: {
      weather?: string;
      timeOfDay?: string;
      recentTopics?: string[];
    }
  ): PersonalityMood {
    let moodLevel = 5; // Base neutral mood
    const reasoning: string[] = [];
    const { likes, dislikes } = personality;

    // Weather influence
    if (contextualInfo.weather) {
      const weatherLikes = likes.weather.some(w => 
        contextualInfo.weather!.toLowerCase().includes(w.toLowerCase())
      );
      const weatherDislikes = dislikes.weather.some(w => 
        contextualInfo.weather!.toLowerCase().includes(w.toLowerCase())
      );

      if (weatherLikes) {
        moodLevel += 2;
        reasoning.push(`Love this ${contextualInfo.weather}!`);
      } else if (weatherDislikes) {
        moodLevel -= 2;
        reasoning.push(`Not a fan of ${contextualInfo.weather}...`);
      }
    }

    // Recent topics influence
    if (contextualInfo.recentTopics) {
      const topicString = contextualInfo.recentTopics.join(' ').toLowerCase();
      const allLikes = [...likes.anime, ...likes.food, ...likes.activities];
      const allDislikes = [...dislikes.anime, ...dislikes.food, ...dislikes.activities];

      const likedTopicsCount = allLikes.filter(like => 
        topicString.includes(like.toLowerCase())
      ).length;

      const dislikedTopicsCount = allDislikes.filter(dislike => 
        topicString.includes(dislike.toLowerCase())
      ).length;

      if (likedTopicsCount > 0) {
        moodLevel += likedTopicsCount;
        reasoning.push(`Excited about our conversation topics!`);
      }
      if (dislikedTopicsCount > 0) {
        moodLevel -= dislikedTopicsCount;
        reasoning.push(`Some topics aren't my favorite...`);
      }
    }

    // Clamp mood level between 1-10
    moodLevel = Math.max(1, Math.min(10, moodLevel));

    let moodDescription = 'neutral';
    if (moodLevel >= 8) moodDescription = 'very happy';
    else if (moodLevel >= 6) moodDescription = 'happy';
    else if (moodLevel >= 4) moodDescription = 'neutral';
    else if (moodLevel >= 2) moodDescription = 'sad';
    else moodDescription = 'very sad';

    return { moodLevel, moodDescription, reasoning };
  }
} 