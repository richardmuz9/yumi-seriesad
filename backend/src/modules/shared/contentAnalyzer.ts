import { PrismaClient } from '@prisma/client';
import { aiController } from './aiController';
import Redis from 'ioredis';
import { Request, Response } from 'express';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL!);

interface ReadabilityMetrics {
  score: number;
  suggestions: string[];
}

interface SEOMetrics {
  keywords: string[];
  suggestions: string[];
}

interface ContentMetrics {
  readability: ReadabilityMetrics;
  seo: SEOMetrics;
  sentiment: string;
}

interface AIResponse {
  result: string;
  [key: string]: any;
}

interface AIUsageAnalytics {
  model: string;
  requestType: string;
  status: string;
  createdAt: Date;
}

export class ContentAnalyzer {
  async analyzeContent(userId: string, content: string): Promise<ContentMetrics> {
    // Check cache first
    const cached = await this.getCachedAnalysis(content);
    if (cached) {
      return cached;
    }

    // Get user preferences
    const userPrefs = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    // Create mock request and response objects for aiController
    const mockReq = {
      user: { id: userId },
      body: {
        provider: 'qwen',
        content: '',
        action: 'analyze'
      }
    } as unknown as Request;

    const mockRes = {
      json: (data: any) => data,
      status: () => ({ json: (data: any) => data })
    } as unknown as Response;

    // Analyze readability
    mockReq.body.content = `
      Analyze the following text for readability. Consider:
      1. Sentence complexity
      2. Word choice
      3. Text structure
      
      Provide:
      1. A score from 0-100
      2. Specific suggestions for improvement
      
      Text: ${content}
    `;

    const readabilityResponse = await aiController(mockReq, mockRes) as unknown as AIResponse;

    // Analyze SEO
    mockReq.body.content = `
      Analyze the following text for SEO optimization. Consider:
      1. Keyword density and placement
      2. Meta description potential
      3. Header structure
      4. Content relevance
      
      Provide:
      1. Key phrases and their frequency
      2. Specific optimization suggestions
      
      Text: ${content}
    `;

    const seoResponse = await aiController(mockReq, mockRes) as unknown as AIResponse;

    // Analyze sentiment
    mockReq.body.content = `
      Analyze the sentiment of the following text. Provide a single word response:
      positive, negative, or neutral.
      
      Text: ${content}
    `;

    const sentimentResponse = await aiController(mockReq, mockRes) as unknown as AIResponse;

    if (!readabilityResponse?.result || !seoResponse?.result || !sentimentResponse?.result) {
      throw new Error('Failed to get AI response');
    }

    // Parse AI responses
    const metrics: ContentMetrics = {
      readability: this.parseReadabilityResponse(readabilityResponse.result),
      seo: this.parseSEOResponse(seoResponse.result),
      sentiment: this.parseSentimentResponse(sentimentResponse.result)
    };

    // Save analysis to database
    await prisma.contentAnalysis.create({
      data: {
        userId,
        content,
        readability: metrics.readability.score,
        sentiment: metrics.sentiment,
        keywordsJson: JSON.stringify(metrics.seo.keywords),
        suggestionsJson: JSON.stringify({
          readability: metrics.readability.suggestions,
          seo: metrics.seo.suggestions
        })
      }
    });

    // Cache results
    await this.cacheAnalysis(content, metrics);

    return metrics;
  }

  private async getCachedAnalysis(content: string): Promise<ContentMetrics | null> {
    const cacheKey = `content-analysis:${Buffer.from(content).toString('base64')}`;
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  private async cacheAnalysis(content: string, metrics: ContentMetrics): Promise<void> {
    const cacheKey = `content-analysis:${Buffer.from(content).toString('base64')}`;
    await redis.set(cacheKey, JSON.stringify(metrics), 'EX', 3600); // Cache for 1 hour
  }

  private parseReadabilityResponse(response: string): ReadabilityMetrics {
    const lines = response.split('\n');
    const score = parseFloat(lines.find(l => l.includes('score'))?.split(':')[1] || '0');
    const suggestions = lines
      .filter(l => l.includes('- '))
      .map(l => l.replace('- ', '').trim());

    return {
      score,
      suggestions
    };
  }

  private parseSEOResponse(response: string): SEOMetrics {
    const lines = response.split('\n');
    const keywords = lines
      .filter(l => l.includes('keyword:'))
      .map(l => l.split(':')[1].trim());
    const suggestions = lines
      .filter(l => l.includes('- '))
      .map(l => l.replace('- ', '').trim());

    return {
      keywords,
      suggestions
    };
  }

  private parseSentimentResponse(response: string): string {
    return response.toLowerCase().trim();
  }

  async getAnalyticsForUser(userId: string): Promise<any> {
    const analytics = await prisma.contentAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const aiUsage = await prisma.aIUsageAnalytics.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return {
      totalAnalyses: analytics.length,
      averageReadability: this.calculateAverage(analytics.map((a: { readability: number | null }) => a.readability || 0)),
      aiUsageByProvider: this.groupByProvider(aiUsage),
      aiUsageByPurpose: this.groupByPurpose(aiUsage),
      successRate: this.calculateSuccessRate(aiUsage)
    };
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc: number, curr: number) => acc + curr, 0);
    return sum / numbers.length;
  }

  private groupByProvider(usage: AIUsageAnalytics[]): Record<string, number> {
    return usage.reduce((acc: Record<string, number>, curr: AIUsageAnalytics) => {
      acc[curr.model] = (acc[curr.model] || 0) + 1;
      return acc;
    }, {});
  }

  private groupByPurpose(usage: AIUsageAnalytics[]): Record<string, number> {
    return usage.reduce((acc: Record<string, number>, curr: AIUsageAnalytics) => {
      acc[curr.requestType] = (acc[curr.requestType] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateSuccessRate(usage: AIUsageAnalytics[]): number {
    if (usage.length === 0) return 0;
    const successful = usage.filter((u: AIUsageAnalytics) => u.status === 'success').length;
    return (successful / usage.length) * 100;
  }
} 