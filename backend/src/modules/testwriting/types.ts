export type ExamType = 'TOEFL' | 'EJU' | 'COMMON';

export interface TestPrompt {
  id: string;
  examType: ExamType;
  title: string;
  instructions: string;
  readingPassage?: string;
  listeningTranscript?: string;
  question: string;
  timeLimit: number;
  wordLimit: number;
  sampleAnswer?: string;
  rubric: string;
}

export interface EssaySubmission {
  examType: ExamType;
  promptId: string;
  essay: string;
  timeSpent: number;
}

export interface FeedbackCriterion {
  name: string;
  score: number;
  maxScore: number;
  comments: string[];
}

export interface TextAnnotation {
  startIndex: number;
  endIndex: number;
  type: 'grammar' | 'vocabulary' | 'structure' | 'content';
  suggestion: string;
  explanation: string;
}

export interface FeedbackReport {
  overallScore: number;
  maxScore: number;
  criteria: FeedbackCriterion[];
  annotations: TextAnnotation[];
  generalComments: string[];
  strengths: string[];
  improvements: string[];
  sampleAnswer?: string;
} 