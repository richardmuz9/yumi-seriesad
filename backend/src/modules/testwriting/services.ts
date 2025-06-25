import { ExamType, TestPrompt, EssaySubmission, FeedbackReport, FeedbackCriterion, TextAnnotation } from './types';
import { prisma } from '../../database';
import { processAIRequest } from '../shared/aiController';
import { Response } from 'express';

export const getRandomPrompt = async (examType: ExamType): Promise<TestPrompt> => {
  const prompt = await prisma.testPrompt.findFirst({
    where: {
      type: examType,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!prompt) {
    throw new Error(`No prompts available for exam type: ${examType}`);
  }

  return {
    id: prompt.id,
    examType: prompt.type as ExamType,
    title: prompt.question,
    instructions: prompt.instructions,
    readingPassage: prompt.readingPassage || undefined,
    listeningTranscript: prompt.listeningTranscript || undefined,
    question: prompt.question,
    timeLimit: prompt.timeLimit,
    wordLimit: prompt.wordLimit,
    sampleAnswer: prompt.sampleAnswer || undefined,
    rubric: prompt.rubric || 'Standard rubric criteria will be applied',
  };
};

export const submitEssay = async (
  userId: string,
  submission: EssaySubmission
): Promise<FeedbackReport> => {
  // Get the prompt to access rubric and sample answer
  const prompt = await prisma.testPrompt.findUnique({
    where: { id: submission.promptId },
  });

  if (!prompt) {
    throw new Error('Invalid prompt ID');
  }

  // Create a mock request object for the AI controller
  const mockRequest = {
    user: { id: userId },
    body: {
      content: submission.essay,
      action: 'analyze',
      options: {
        prompt: prompt.question,
        examType: submission.examType,
        rubric: prompt.rubric,
        sampleAnswer: prompt.sampleAnswer
      }
    }
  };

  // Create a simple response object that captures the data
  let responseData: any;
  const captureResponse = (data: any) => {
    responseData = data;
  };

  // Use AI to analyze the essay
  await processAIRequest(mockRequest as any, {
    json: captureResponse,
    status: () => ({ json: captureResponse })
  } as unknown as Response);

  if (!responseData) {
    throw new Error('Failed to analyze essay');
  }

  // Parse AI response if needed
  const analysis = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
  
  // Transform AI response into FeedbackReport format
  const feedback: FeedbackReport = {
    overallScore: analysis.overallScore || 0,
    maxScore: 100,
    criteria: analysis.criteria?.map((c: FeedbackCriterion) => ({
      name: c.name,
      score: c.score,
      maxScore: c.maxScore || 10,
      comments: c.comments || []
    })) || [],
    annotations: analysis.annotations?.map((a: TextAnnotation) => ({
      startIndex: a.startIndex,
      endIndex: a.endIndex,
      type: a.type,
      suggestion: a.suggestion,
      explanation: a.explanation
    })) || [],
    generalComments: analysis.generalComments || [],
    strengths: analysis.strengths || [],
    improvements: analysis.improvements || [],
    sampleAnswer: prompt.sampleAnswer ?? undefined
  };

  // Store the submission and feedback
  await prisma.testSubmission.create({
    data: {
      userId,
      promptId: submission.promptId,
      essay: submission.essay,
      overallScore: feedback.overallScore,
      feedbackReportJson: JSON.stringify(feedback),
    },
  });

  return feedback;
};

interface TestSubmissionWithPrompt {
  id: string;
  userId: string;
  promptId: string;
  essay: string;
  overallScore: number;
  feedbackReportJson: string;
  createdAt: Date;
  prompt: {
    type: string;
    question: string;
  };
}

interface SubmissionHistoryItem {
  id: string;
  userId: string;
  promptId: string;
  essay: string;
  overallScore: number;
  feedbackReportJson: string;
  createdAt: Date;
  prompt: {
    examType: string;
    title: string;
  };
}

export const getSubmissionHistory = async (userId: string): Promise<SubmissionHistoryItem[]> => {
  const submissions = await prisma.testSubmission.findMany({
    where: { userId },
    include: {
      prompt: {
        select: {
          type: true,
          question: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return submissions.map((submission: TestSubmissionWithPrompt) => ({
    ...submission,
    prompt: {
      examType: submission.prompt.type,
      title: submission.prompt.question
    }
  }));
}; 