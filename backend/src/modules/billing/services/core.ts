import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { UserBillingInfo, TokenUsage, FREE_TOKEN_LIMITS } from '../types';
import { StripeService } from './stripe';
import { AlipayService } from './alipay';
import debug from 'debug';

const prisma = new PrismaClient();
const stripeService = new StripeService();
const alipayService = new AlipayService();
const log = debug('app:billing:service');

export class BillingService {
  async getUserBillingInfo(userId: string): Promise<UserBillingInfo> {
    const info = await prisma.userBilling.findUnique({
      where: { userId }
    });

    if (!info) {
      return this.initializeUserBilling(userId);
    }

    try {
      // Parse JSON fields with type safety
      const totalTokensUsed = this.parseTokenUsage(info.totalTokensUsedJson);
      const freeTokensRemaining = this.parseTokenUsage(info.freeTokensRemainingJson);

      // Check if daily tokens need to be reset
      if (this.shouldResetDailyTokens(info.lastTokenResetDate)) {
        return this.resetDailyTokens({
          id: info.id,
          userId: info.userId,
          dailyTokensRemaining: info.availableTokens,
          lastTokenResetDate: info.lastTokenResetDate,
          hasAccessToImageGen: info.hasAccessToImageGen,
          totalAmountSpent: info.totalAmountSpent,
          totalTokensUsed,
          freeTokensRemaining,
          contributionRewards: info.contributionRewards,
          artworkContributions: info.artworkContributions,
          createdAt: info.createdAt,
          updatedAt: info.updatedAt
        });
      }

      return {
        id: info.id,
        userId: info.userId,
        dailyTokensRemaining: info.availableTokens,
        lastTokenResetDate: info.lastTokenResetDate,
        hasAccessToImageGen: info.hasAccessToImageGen,
        totalAmountSpent: info.totalAmountSpent,
        totalTokensUsed,
        freeTokensRemaining,
        contributionRewards: info.contributionRewards,
        artworkContributions: info.artworkContributions,
        createdAt: info.createdAt,
        updatedAt: info.updatedAt
      };
    } catch (error) {
      log('Error parsing billing info:', error);
      // If JSON parsing fails, reinitialize the billing info
      return this.initializeUserBilling(userId);
    }
  }

  private parseTokenUsage(jsonStr: string): TokenUsage {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid token usage format');
      }
      
      // Ensure all required fields exist with correct types
      const usage: TokenUsage = {
        openai: typeof parsed.openai === 'number' ? parsed.openai : 0,
        claude: typeof parsed.claude === 'number' ? parsed.claude : 0,
        qwen: typeof parsed.qwen === 'number' ? parsed.qwen : 0
      };
      
      return usage;
    } catch (error) {
      log('Error parsing token usage:', error);
      return { openai: 0, claude: 0, qwen: 0 };
    }
  }

  private shouldResetDailyTokens(lastResetDate: Date): boolean {
    const now = new Date();
    const lastReset = new Date(lastResetDate);
    return now.getDate() !== lastReset.getDate() || 
           now.getMonth() !== lastReset.getMonth() ||
           now.getFullYear() !== lastReset.getFullYear();
  }

  private async resetDailyTokens(info: UserBillingInfo): Promise<UserBillingInfo> {
    const updatedInfo = await prisma.userBilling.update({
      where: { id: info.id },
      data: {
        availableTokens: 50000, // Default daily tokens for all users
        lastTokenResetDate: new Date()
      }
    });

    return {
      id: updatedInfo.id,
      userId: updatedInfo.userId,
      dailyTokensRemaining: updatedInfo.availableTokens,
      lastTokenResetDate: updatedInfo.lastTokenResetDate,
      hasAccessToImageGen: updatedInfo.hasAccessToImageGen,
      totalAmountSpent: updatedInfo.totalAmountSpent,
      totalTokensUsed: info.totalTokensUsed,
      freeTokensRemaining: info.freeTokensRemaining,
      contributionRewards: updatedInfo.contributionRewards,
      artworkContributions: updatedInfo.artworkContributions,
      createdAt: updatedInfo.createdAt,
      updatedAt: updatedInfo.updatedAt
    };
  }

  private async initializeUserBilling(userId: string): Promise<UserBillingInfo> {
    const initialTokensUsed: TokenUsage = {
      openai: 0,
      claude: 0,
      qwen: 0
    };

    const billing = await prisma.userBilling.create({
      data: {
        id: uuidv4(),
        userId,
        subscriptionStatus: 'free',
        availableTokens: 0,
        tokenSource: 'free_monthly',
        lastTokenResetDate: new Date(),
        hasAccessToImageGen: false,
        totalAmountSpent: 0,
        totalTokensUsedJson: JSON.stringify(initialTokensUsed),
        freeTokensRemainingJson: JSON.stringify(FREE_TOKEN_LIMITS)
      }
    });

    return {
      id: billing.id,
      userId: billing.userId,
      dailyTokensRemaining: billing.availableTokens,
      lastTokenResetDate: billing.lastTokenResetDate,
      hasAccessToImageGen: billing.hasAccessToImageGen,
      totalAmountSpent: billing.totalAmountSpent,
      totalTokensUsed: initialTokensUsed,
      freeTokensRemaining: FREE_TOKEN_LIMITS,
      contributionRewards: billing.contributionRewards,
      artworkContributions: billing.artworkContributions,
      createdAt: billing.createdAt,
      updatedAt: billing.updatedAt
    };
  }

  async createCheckoutSession(
    userId: string,
    packageId?: string,
    planId?: string,
    provider: 'stripe' | 'alipay' = 'stripe'
  ): Promise<string> {
    if (provider === 'stripe') {
      return stripeService.createCheckoutSession(userId, packageId, planId);
    } else {
      return alipayService.createCheckoutSession(userId, packageId, planId);
    }
  }

  async handleStripeWebhook(event: any) {
    return stripeService.handleWebhook(event);
  }

  async handleAlipayWebhook(data: any) {
    return alipayService.handleWebhook(data);
  }

  async checkPaidModelAccess(userId: string, model: 'openai' | 'claude'): Promise<boolean> {
    const userBilling = await this.getUserBillingInfo(userId);
    return userBilling.freeTokensRemaining[model] > 0;
  }

  async checkImageGenerationAccess(userId: string): Promise<boolean> {
    const userBilling = await this.getUserBillingInfo(userId);
    return userBilling.hasAccessToImageGen === true;
  }

  async updateTokenUsage(
    userId: string,
    model: keyof TokenUsage,
    tokensUsed: number
  ): Promise<void> {
    if (tokensUsed < 0) {
      throw new Error('Token usage cannot be negative');
    }

    const userBilling = await this.getUserBillingInfo(userId);

    const updatedTotalTokensUsed = {
      ...userBilling.totalTokensUsed,
      [model]: userBilling.totalTokensUsed[model] + tokensUsed
    };

    const updatedFreeTokensRemaining = {
      ...userBilling.freeTokensRemaining,
      [model]: Math.max(0, userBilling.freeTokensRemaining[model] - tokensUsed)
    };

    try {
      await prisma.userBilling.update({
        where: { id: userBilling.id },
        data: {
          totalTokensUsedJson: JSON.stringify(updatedTotalTokensUsed),
          freeTokensRemainingJson: JSON.stringify(updatedFreeTokensRemaining)
        }
      });
    } catch (error) {
      log('Error updating token usage:', error);
      throw new Error('Failed to update token usage');
    }
  }
} 