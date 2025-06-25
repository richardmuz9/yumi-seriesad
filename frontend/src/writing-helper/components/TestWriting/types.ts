export type ExamType = 'TOEFL' | 'EJU' | 'COMMON';

export interface TestPrompt {
  id: string;
  title: string;
  context?: string;
  question: string;
  instructions?: string[];
  timeLimit: number; // in minutes
  wordLimit: number;
  type: ExamType;
}

export interface GrammarError {
  context: string;
  suggestion: string;
}

export interface ScoreBreakdown {
  content: number;
  organization: number;
  languageUse: number;
  vocabulary: number;
}

export interface FeedbackReport {
  score: number;
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  grammarErrors: GrammarError[];
  scores: ScoreBreakdown;
  sampleResponse: string;
}

export interface EssaySubmission {
  examType: ExamType;
  promptId: string;
  essay: string;
  timeSpent: number; // in seconds
} 