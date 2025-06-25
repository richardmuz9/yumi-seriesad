// Core billing functionality
import { PrismaClient } from '@prisma/client';
import { 
  UserBillingInfo, 
  FREE_TOKEN_LIMITS, 
  TokenUsage,
  getPremiumPlanById
} from '../types';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Helper functions to convert between JSON and objects
function parseTokenUsage(json: string): TokenUsage {
  try {
    return JSON.parse(json);
  } catch {
    return { openai: 0, claude: 0, qwen: 0 };
  }
}

function stringifyTokenUsage(usage: TokenUsage): string {
  return JSON.stringify(usage);
}

// Convert Prisma UserBilling to UserBillingInfo
function convertToUserBillingInfo(billing: any): UserBillingInfo {
  return {
    id: billing.id,
    userId: billing.userId,
    premiumPlanId: billing.subscriptionStatus !== 'free' ? billing.subscriptionStatus : undefined,
    premiumPlanExpiresAt: undefined, // This would need to be added to schema
    dailyTokensRemaining: billing.availableTokens,
    lastTokenResetDate: billing.lastTokenResetDate,
    stripeCustomerId: billing.stripeCustomerId || undefined,
    hasAccessToImageGen: billing.hasAccessToImageGen,
    totalAmountSpent: billing.totalAmountSpent,
    totalTokensUsed: parseTokenUsage(billing.totalTokensUsedJson),
    freeTokensRemaining: parseTokenUsage(billing.freeTokensRemainingJson),
    contributionRewards: billing.contributionRewards || 0,
    artworkContributions: billing.artworkContributions || 0,
    createdAt: billing.createdAt,
    updatedAt: billing.updatedAt
  };
}

export class CoreBillingService {
  async getUserBillingInfo(userId: string): Promise<UserBillingInfo> {
    const info = await prisma.userBilling.findUnique({
      where: { userId }
    });

    if (!info) {
      return this.initializeUserBilling(userId);
    }

    // Check if daily tokens need to be reset (for Yumi Blessing subscribers)
    if (info.subscriptionStatus !== 'free' && this.shouldResetDailyTokens(info.lastTokenResetDate)) {
      return this.resetDailyTokens(convertToUserBillingInfo(info));
    }

    return convertToUserBillingInfo(info);
  }

  private shouldResetDailyTokens(lastResetDate: Date): boolean {
    const now = new Date();
    const lastReset = new Date(lastResetDate);
    return now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth();
  }

  private async resetDailyTokens(info: UserBillingInfo): Promise<UserBillingInfo> {
    // Get daily token amount based on premium plan
    const plan = info.premiumPlanId ? getPremiumPlanById(info.premiumPlanId) : null;
    const dailyTokens = plan ? plan.dailyTokens : 0;

    const updatedInfo = await prisma.userBilling.update({
      where: { id: info.id },
      data: {
        availableTokens: dailyTokens,
        lastTokenResetDate: new Date()
      }
    });
    return convertToUserBillingInfo(updatedInfo);
  }

  private async initializeUserBilling(userId: string): Promise<UserBillingInfo> {
    const newBilling = await prisma.userBilling.create({
      data: {
        id: uuidv4(),
        userId,
        availableTokens: 0,
        lastTokenResetDate: new Date(),
        hasAccessToImageGen: false,
        totalAmountSpent: 0,
        totalTokensUsedJson: stringifyTokenUsage({
          openai: 0,
          claude: 0,
          qwen: 0
        }),
        freeTokensRemainingJson: stringifyTokenUsage({
          openai: FREE_TOKEN_LIMITS.openai,
          claude: FREE_TOKEN_LIMITS.claude,
          qwen: FREE_TOKEN_LIMITS.qwen
        })
      }
    });
    return convertToUserBillingInfo(newBilling);
  }

  async updateTokenUsage(
    userId: string,
    model: 'openai' | 'claude' | 'qwen',
    tokensUsed: number
  ): Promise<void> {
    const billing = await prisma.userBilling.findUnique({
      where: { userId }
    });

    if (!billing) {
      throw new Error('User billing info not found');
    }

    const totalTokensUsed = parseTokenUsage(billing.totalTokensUsedJson);
    const freeTokensRemaining = parseTokenUsage(billing.freeTokensRemainingJson);

    // Update usage counters
    totalTokensUsed[model] += tokensUsed;

    // Deduct from free tokens first, then paid tokens
    let remainingToDeduct = tokensUsed;

    if (freeTokensRemaining[model] > 0) {
      const deductFromFree = Math.min(freeTokensRemaining[model], remainingToDeduct);
      freeTokensRemaining[model] -= deductFromFree;
      remainingToDeduct -= deductFromFree;
    }

    if (remainingToDeduct > 0) {
      // Deduct from paid tokens
      await prisma.userBilling.update({
        where: { userId },
        data: {
          availableTokens: Math.max(0, billing.availableTokens - remainingToDeduct),
          totalTokensUsedJson: stringifyTokenUsage(totalTokensUsed),
          freeTokensRemainingJson: stringifyTokenUsage(freeTokensRemaining)
        }
      });
    } else {
      // Only update usage tracking
      await prisma.userBilling.update({
        where: { userId },
        data: {
          totalTokensUsedJson: stringifyTokenUsage(totalTokensUsed),
          freeTokensRemainingJson: stringifyTokenUsage(freeTokensRemaining)
        }
      });
    }
  }

  async getTokenUsage(userId: string) {
    const billing = await prisma.userBilling.findUnique({
      where: { userId }
    });

    if (!billing) {
      return {
        totalUsed: { openai: 0, claude: 0, qwen: 0 },
        freeRemaining: { openai: FREE_TOKEN_LIMITS.openai, claude: FREE_TOKEN_LIMITS.claude, qwen: FREE_TOKEN_LIMITS.qwen },
        paidRemaining: 0
      };
    }

    return {
      totalUsed: parseTokenUsage(billing.totalTokensUsedJson),
      freeRemaining: parseTokenUsage(billing.freeTokensRemainingJson),
      paidRemaining: billing.availableTokens
    };
  }

  async checkPaidModelAccess(userId: string, model: 'openai' | 'claude'): Promise<boolean> {
    const billing = await this.getUserBillingInfo(userId);
    return billing.dailyTokensRemaining > 0 || billing.premiumPlanId !== undefined;
  }

  async checkImageGenerationAccess(userId: string): Promise<boolean> {
    const billing = await this.getUserBillingInfo(userId);
    return billing.hasAccessToImageGen;
  }
} 