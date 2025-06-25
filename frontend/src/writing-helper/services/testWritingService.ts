import { ExamType, TestPrompt, EssaySubmission, FeedbackReport } from '../components/TestWriting/types';
import { api } from '../../services/api';

export const getPrompt = async (examType: ExamType): Promise<TestPrompt> => {
  try {
    const response = await api.get(`/api/test-writing/prompts/${examType}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch prompt:', error);
    throw error;
  }
};

export const submitEssay = async (submission: EssaySubmission): Promise<FeedbackReport> => {
  try {
    const response = await api.post('/api/test-writing/submit', submission);
    return response.data;
  } catch (error) {
    console.error('Failed to submit essay:', error);
    throw error;
  }
}; 