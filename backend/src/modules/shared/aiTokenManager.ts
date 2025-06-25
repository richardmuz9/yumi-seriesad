import { Redis } from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface TokenUsage {
  qwen: number;
  claude: number;
  openai: number;
}

interface ProviderLimits {
  qwen: number;
  claude: number;
  openai: number;
}

const PROVIDER_LIMITS: ProviderLimits = {
  qwen: 1000000,    // 1M tokens for Qwen
  claude: 10000,    // 10K tokens for Claude
  openai: 10000     // 10K tokens for OpenAI
};

// Rate limiting configuration
const rateLimiters = {
  qwen: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'ratelimit_qwen',
    points: 100,        // Number of requests
    duration: 60,       // Per minute
  }),
  claude: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'ratelimit_claude',
    points: 50,         // Number of requests
    duration: 60,       // Per minute
  }),
  openai: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'ratelimit_openai',
    points: 50,         // Number of requests
    duration: 60,       // Per minute
  })
};

// Cache configuration
const CACHE_TTL = 3600; // 1 hour in seconds

export class AITokenManager {
  private static instance: AITokenManager;

  private constructor() {}

  static getInstance(): AITokenManager {
    if (!AITokenManager.instance) {
      AITokenManager.instance = new AITokenManager();
    }
    return AITokenManager.instance;
  }

  async getTokenUsage(userId: string): Promise<TokenUsage> {
    const usage = await redis.hgetall(`token_usage:${userId}`);
    return {
      qwen: parseInt(usage.qwen || '0'),
      claude: parseInt(usage.claude || '0'),
      openai: parseInt(usage.openai || '0')
    };
  }

  async updateTokenUsage(userId: string, provider: keyof TokenUsage, tokens: number): Promise<void> {
    await redis.hincrby(`token_usage:${userId}`, provider, tokens);
  }

  async checkRateLimit(userId: string, provider: keyof TokenUsage): Promise<boolean> {
    try {
      await rateLimiters[provider].consume(userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async selectProvider(userId: string, preferredProvider?: keyof TokenUsage): Promise<keyof TokenUsage> {
    const usage = await this.getTokenUsage(userId);

    // If preferred provider is specified and has available tokens, use it
    if (preferredProvider && usage[preferredProvider] < PROVIDER_LIMITS[preferredProvider]) {
      const hasQuota = await this.checkRateLimit(userId, preferredProvider);
      if (hasQuota) return preferredProvider;
    }

    // Prioritize Qwen due to higher token limit
    if (usage.qwen < PROVIDER_LIMITS.qwen) {
      const hasQuota = await this.checkRateLimit(userId, 'qwen');
      if (hasQuota) return 'qwen';
    }

    // Try other providers if Qwen is not available
    for (const provider of ['claude', 'openai'] as Array<keyof TokenUsage>) {
      if (usage[provider] < PROVIDER_LIMITS[provider]) {
        const hasQuota = await this.checkRateLimit(userId, provider);
        if (hasQuota) return provider;
      }
    }

    throw new Error('No available AI providers or rate limit exceeded');
  }

  async getCachedResponse(key: string): Promise<string | null> {
    return redis.get(`ai_cache:${key}`);
  }

  async setCachedResponse(key: string, response: string): Promise<void> {
    await redis.setex(`ai_cache:${key}`, CACHE_TTL, response);
  }

  async clearCache(): Promise<void> {
    const keys = await redis.keys('ai_cache:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export const tokenManager = AITokenManager.getInstance(); 