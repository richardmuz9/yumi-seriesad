import { apiClient } from './api';
import { AxiosResponse } from 'axios';

export interface AIRequest {
  content: string;
  provider?: 'openai' | 'claude' | 'qwen';
  action: 'enhance' | 'analyze' | 'suggest' | 'translate' | 'summarize';
  options?: {
    style?: string;
    tone?: string;
    length?: string;
    language?: string;
  };
}

export interface TokenUsage {
  qwen: number;
  claude: number;
  openai: number;
}

export interface AIResponse {
  result: string;
  suggestions?: Array<{
    type: string;
    message: string;
    replacement?: string;
  }>;
  analysis?: {
    tone: string;
    complexity: number;
    sentiment: number;
  };
  selectedProvider?: 'openai' | 'claude' | 'qwen';
  tokenUsage?: TokenUsage;
}

export const aiService = {
  async processContent(request: AIRequest): Promise<AIResponse> {
    try {
      const response: AxiosResponse<AIResponse> = await apiClient.post('/api/ai/process', request);
      return response.data;
    } catch (error) {
      console.error('AI processing error:', error);
      throw error;
    }
  },

  async getTokenUsage(): Promise<TokenUsage> {
    try {
      const response: AxiosResponse<TokenUsage> = await apiClient.get('/api/ai/token-usage');
      return response.data;
    } catch (error) {
      console.error('Error fetching token usage:', error);
      throw error;
    }
  },

  async analyzeContent(content: string): Promise<AIResponse> {
    return this.processContent({
      content,
      action: 'analyze'
    });
  },

  async getSuggestions(content: string): Promise<AIResponse> {
    return this.processContent({
      content,
      action: 'suggest'
    });
  },

  async enhanceContent(content: string, options?: AIRequest['options']): Promise<AIResponse> {
    return this.processContent({
      content,
      action: 'enhance',
      options
    });
  },

  async translateContent(content: string, language: string): Promise<AIResponse> {
    return this.processContent({
      content,
      action: 'translate',
      options: { language }
    });
  },

  async summarizeContent(content: string, length: string): Promise<AIResponse> {
    return this.processContent({
      content,
      action: 'summarize',
      options: { length }
    });
  }
}; 