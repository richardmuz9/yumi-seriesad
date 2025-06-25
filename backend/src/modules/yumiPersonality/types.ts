export interface PersonalityLikes {
  anime: string[];
  food: string[];
  weather: string[];
  activities: string[];
}

export interface PersonalityDislikes {
  anime: string[];
  food: string[];
  weather: string[];
  activities: string[];
}

export interface YumiPersonality {
  name: string;
  basePersonality: string;
  traits: string[];
  speechPatterns: string[];
  likes: PersonalityLikes;
  dislikes: PersonalityDislikes;
}

export interface PersonalityConfig {
  personalities: Record<string, YumiPersonality>;
}

export interface PersonalityMood {
  moodLevel: number; // 1-10 scale
  moodDescription: string;
  reasoning: string[];
}

export interface PersonalityAnalysis {
  matchingLikes: string[];
  matchingDislikes: string[];
  suggestedTopics: string[];
}

export interface ContextualInfo {
  weather?: string;
  timeOfDay?: string;
  userInterests?: string[];
  recentTopics?: string[];
} 