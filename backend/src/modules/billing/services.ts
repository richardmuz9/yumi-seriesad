import { PrismaClient } from '@prisma/client';
import { 
  TokenPackage, 
  PremiumPlan, 
  UserBillingInfo, 
  FREE_TOKEN_LIMITS, 
  TOKEN_PACKAGES, 
  PREMIUM_PLANS,
  calculateAlipayPrice,
  getTokenPackageById,
  getPremiumPlanById,
  isSubscriptionPlan,
  TokenUsage,
  ArtworkContribution,
  ContributionReward,
  CONTRIBUTION_REWARDS,
  calculateContributionReward,
  formatContributionReward
} from './types';
import Stripe from 'stripe';
import AliPaySDK from 'alipay-sdk';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Initialize Alipay SDK conditionally
let alipay: AliPaySDK | null = null;
try {
  if (process.env.ALIPAY_APP_ID && process.env.ALIPAY_PRIVATE_KEY && process.env.ALIPAY_PUBLIC_KEY) {
    alipay = new AliPaySDK({
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
});
    console.log('✅ Alipay SDK initialized successfully');
  } else {
    console.log('ℹ️  Alipay SDK not initialized (missing credentials or development mode)');
  }
} catch (error) {
  console.error('❌ Alipay SDK initialization failed:', error);
  alipay = null;
}

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

export class BillingService {
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
        contributionRewards: 0,
        artworkContributions: 0,
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

  async getPackagesAndPlans(): Promise<{ packages: TokenPackage[], plans: PremiumPlan[] }> {
    return {
      packages: TOKEN_PACKAGES,
      plans: PREMIUM_PLANS
    };
  }

  async createStripeCheckoutSession(
    userId: string,
    packageId?: string,
    planId?: string
  ): Promise<string> {
    const frontendUrl = process.env.FRONTEND_URL || process.env.YOUR_DOMAIN || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:3001';
    
    const successUrl = `${frontendUrl}/charge?success=true`;
    const cancelUrl = `${frontendUrl}/charge?cancel=true`;

    let priceId: string;
    let mode: 'payment' | 'subscription' = 'payment';
    let amount: number;

    if (packageId) {
      const tokenPackage = getTokenPackageById(packageId);
      if (!tokenPackage) {
        throw new Error(`Token package not found: ${packageId}`);
      }
      priceId = process.env[`STRIPE_${packageId.toUpperCase()}`]!;
      amount = tokenPackage.price;
    } else if (planId) {
      const plan = getPremiumPlanById(planId);
      if (!plan) {
        throw new Error(`Premium plan not found: ${planId}`);
      }
      priceId = process.env[`STRIPE_${planId.toUpperCase()}`]!;
      mode = 'subscription';
      amount = plan.price;
    } else {
      throw new Error('Either packageId or planId must be provided');
    }

    const session = await stripe.checkout.sessions.create({
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, packageId, planId },
      customer: await this.getOrCreateStripeCustomer(userId)
    } as Stripe.Checkout.SessionCreateParams);

    await this.createPaymentSession(userId, {
      packageId,
      planId,
      amount,
      provider: 'stripe',
      sessionId: session.id
    });

    return session.url!;
  }

  async createAlipayCheckoutSession(
    userId: string,
    packageId?: string,
    planId?: string
  ): Promise<string> {
    if (!alipay) {
      throw new Error('Alipay SDK is not available. Please contact support or use Stripe payment.');
    }

    const frontendUrl = process.env.FRONTEND_URL || process.env.YOUR_DOMAIN || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:3001';
    
    let baseAmount: number;
    let subject: string;

    if (packageId) {
      const tokenPackage = getTokenPackageById(packageId);
      if (!tokenPackage) {
        throw new Error(`Token package not found: ${packageId}`);
      }
      baseAmount = tokenPackage.price;
      subject = `${tokenPackage.name} - ${tokenPackage.tokens.toLocaleString()} tokens`;
    } else if (planId) {
      const plan = getPremiumPlanById(planId);
      if (!plan) {
        throw new Error(`Premium plan not found: ${planId}`);
      }
      baseAmount = plan.price;
      subject = `${plan.name} - ${plan.dailyTokens.toLocaleString()} tokens/day`;
    } else {
      throw new Error('Either packageId or planId must be provided');
    }

    // Apply 10% Japanese consumption tax for Alipay
    const finalAmount = calculateAlipayPrice(baseAmount);
    const tradeNo = `YS_${Date.now()}_${uuidv4().slice(0, 8)}`;

    const result = await alipay.exec('alipay.trade.page.pay', {
      notify_url: `${backendUrl}/api/billing/alipay/notify`,
      return_url: `${frontendUrl}/charge?success=true`,
      bizContent: {
        out_trade_no: tradeNo,
        total_amount: finalAmount.toString(),
        subject,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        body: `Yumi Series - ${subject} (包含10%日本消费税)`
      }
    });

    await this.createPaymentSession(userId, {
      packageId,
      planId,
      amount: finalAmount,
      provider: 'alipay',
      sessionId: tradeNo
    });

    return result.body;
  }

  private async createPaymentSession(userId: string, data: {
    packageId?: string;
    planId?: string;
    amount: number;
    provider: 'stripe' | 'alipay';
    sessionId: string;
  }) {
    return await prisma.paymentSession.create({
      data: {
        id: uuidv4(),
        userId,
        packageId: data.packageId,
        planId: data.planId,
        amount: data.amount,
        currency: 'USD',
        status: 'pending',
        provider: data.provider,
        sessionId: data.sessionId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  private async getUserEmail(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    return user?.email || '';
  }

  private async getOrCreateStripeCustomer(userId: string): Promise<string> {
    const userBilling = await this.getUserBillingInfo(userId);
    if (userBilling.stripeCustomerId) {
      return userBilling.stripeCustomerId;
    }

    const email = await this.getUserEmail(userId);
    const customer = await stripe.customers.create({
      email,
      metadata: { userId }
    });

    await prisma.userBilling.update({
      where: { id: userBilling.id },
      data: { stripeCustomerId: customer.id }
    });

    return customer.id;
  }

  async handleStripeWebhook(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, packageId, planId } = session.metadata!;
      await this.handleSuccessfulPayment(userId, packageId, planId);
    } else if (event.type === 'invoice.payment_succeeded') {
      // Handle recurring subscription payments for Yumi Blessing
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      
      // Find user by Stripe customer ID
      const userBilling = await prisma.userBilling.findFirst({
        where: { stripeCustomerId: customerId }
      });
      
      if (userBilling) {
        await this.resetDailyTokens(convertToUserBillingInfo(userBilling));
      }
    }
  }

  async handleAlipayWebhook(data: any) {
    const { out_trade_no, trade_status } = data;
    
    if (trade_status === 'TRADE_SUCCESS') {
      const paymentSession = await prisma.paymentSession.findFirst({
        where: { sessionId: out_trade_no }
      });
      
      if (paymentSession) {
        await this.handleSuccessfulPayment(
          paymentSession.userId,
          paymentSession.packageId || undefined,
          paymentSession.planId || undefined
        );
      }
    }
  }

  private async handleSuccessfulPayment(
    userId: string,
    packageId?: string,
    planId?: string
  ) {
    const userBilling = await this.getUserBillingInfo(userId);

    if (packageId) {
      // Handle token package purchase
      const tokenPackage = getTokenPackageById(packageId);
      if (!tokenPackage) {
        throw new Error(`Token package not found: ${packageId}`);
      }

      // Add tokens to user's free token balance
      const updatedFreeTokens = {
        openai: userBilling.freeTokensRemaining.openai + Math.floor(tokenPackage.tokens * 0.4),
        claude: userBilling.freeTokensRemaining.claude + Math.floor(tokenPackage.tokens * 0.4),
        qwen: userBilling.freeTokensRemaining.qwen + Math.floor(tokenPackage.tokens * 0.2)
      };

      await prisma.userBilling.update({
        where: { id: userBilling.id },
        data: {
          freeTokensRemainingJson: stringifyTokenUsage(updatedFreeTokens),
          totalAmountSpent: userBilling.totalAmountSpent + tokenPackage.price,
          hasAccessToImageGen: true
        }
      });

    } else if (planId) {
      // Handle Yumi Blessing subscription
      const plan = getPremiumPlanById(planId);
      if (!plan) {
        throw new Error(`Premium plan not found: ${planId}`);
      }

      await prisma.userBilling.update({
        where: { id: userBilling.id },
        data: {
          subscriptionStatus: planId,
          availableTokens: plan.dailyTokens,
          lastTokenResetDate: new Date(),
          totalAmountSpent: userBilling.totalAmountSpent + plan.price,
          hasAccessToImageGen: true
        }
      });
    }

    // Mark payment session as completed
    await prisma.paymentSession.updateMany({
      where: { 
        userId,
        OR: [
          { packageId },
          { planId }
        ],
        status: 'pending'
      },
      data: { status: 'completed' }
    });
  }

  // Yumi Blessing special feature: Early token claim after 10 days
  async claimRemainingBlessingTokens(userId: string): Promise<{ success: boolean, tokensAdded: number }> {
    const userBilling = await this.getUserBillingInfo(userId);
    
    if (!userBilling.premiumPlanId || !userBilling.premiumPlanExpiresAt) {
      throw new Error('User does not have an active Yumi Blessing subscription');
    }

    const plan = getPremiumPlanById(userBilling.premiumPlanId);
    if (!plan || plan.id !== 'price_YUMIBLESSING') {
      throw new Error('User does not have Yumi Blessing subscription');
    }

    // Check if 10 days have passed since subscription start
    const subscriptionStart = new Date(userBilling.premiumPlanExpiresAt);
    subscriptionStart.setDate(subscriptionStart.getDate() - plan.durationDays);
    
    const daysPassed = Math.floor((Date.now() - subscriptionStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysPassed < 10) {
      throw new Error(`You can claim remaining tokens after 10 days. ${10 - daysPassed} days remaining.`);
    }

    // Calculate remaining tokens (700K as specified)
    const remainingDays = plan.durationDays - daysPassed;
    const remainingTokens = Math.max(0, remainingDays * plan.dailyTokens);
    const claimableTokens = Math.min(remainingTokens, 700000); // Cap at 700K as specified

    if (claimableTokens <= 0) {
      return { success: false, tokensAdded: 0 };
    }

    // Add tokens to user's balance and cancel subscription
    const updatedFreeTokens = {
      openai: userBilling.freeTokensRemaining.openai + Math.floor(claimableTokens * 0.4),
      claude: userBilling.freeTokensRemaining.claude + Math.floor(claimableTokens * 0.4),
      qwen: userBilling.freeTokensRemaining.qwen + Math.floor(claimableTokens * 0.2)
    };

    await prisma.userBilling.update({
      where: { id: userBilling.id },
      data: {
        freeTokensRemainingJson: stringifyTokenUsage(updatedFreeTokens),
        subscriptionStatus: 'free',
        availableTokens: 0
      }
    });

    return { success: true, tokensAdded: claimableTokens };
  }

  async checkPaidModelAccess(userId: string, model: 'openai' | 'claude'): Promise<boolean> {
    const billing = await this.getUserBillingInfo(userId);
    return billing.freeTokensRemaining[model] > 0 || !!billing.premiumPlanId;
  }

  async checkImageGenerationAccess(userId: string): Promise<boolean> {
    const billing = await this.getUserBillingInfo(userId);
    return billing.hasAccessToImageGen;
  }

  async updateTokenUsage(
    userId: string,
    model: 'openai' | 'claude' | 'qwen',
    tokensUsed: number
  ): Promise<void> {
    const billing = await this.getUserBillingInfo(userId);
    
    // Update total usage
    const updatedTotalUsage = {
      ...billing.totalTokensUsed,
      [model]: billing.totalTokensUsed[model] + tokensUsed
    };

    // Deduct from appropriate token source
    let updatedFreeTokens = { ...billing.freeTokensRemaining };
    let updatedDailyTokens = billing.dailyTokensRemaining;

    if (billing.premiumPlanId && billing.dailyTokensRemaining > 0) {
      // Use daily tokens first for premium subscribers
      const tokensFromDaily = Math.min(tokensUsed, billing.dailyTokensRemaining);
      updatedDailyTokens -= tokensFromDaily;
      
      const remainingTokens = tokensUsed - tokensFromDaily;
      if (remainingTokens > 0) {
        updatedFreeTokens[model] = Math.max(0, updatedFreeTokens[model] - remainingTokens);
      }
    } else {
      // Use free tokens
      updatedFreeTokens[model] = Math.max(0, updatedFreeTokens[model] - tokensUsed);
    }

    await prisma.userBilling.update({
      where: { id: billing.id },
      data: {
        totalTokensUsedJson: stringifyTokenUsage(updatedTotalUsage),
        freeTokensRemainingJson: stringifyTokenUsage(updatedFreeTokens),
        availableTokens: updatedDailyTokens
      }
    });
  }

  async getTokenUsage(userId: string) {
    const billing = await this.getUserBillingInfo(userId);
    return {
      freeTokensRemaining: billing.freeTokensRemaining,
      totalTokensUsed: billing.totalTokensUsed,
      dailyTokensRemaining: billing.dailyTokensRemaining,
      premiumPlanId: billing.premiumPlanId,
      recentUsage: [] // Could be implemented with a separate usage log table
    };
  }

  // Artwork Contribution Methods
  async submitArtworkContribution(
    userId: string,
    filename: string,
    originalName: string,
    fileSize: number,
    mimeType: string
  ): Promise<ArtworkContribution> {
    const contribution = await prisma.artworkContribution.create({
      data: {
        id: uuidv4(),
        userId,
        filename,
        originalName,
        fileSize,
        mimeType,
        status: 'pending',
        rewardClaimed: false,
        rewardAmount: CONTRIBUTION_REWARDS.ARTWORK_SUBMISSION,
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return contribution as ArtworkContribution;
  }

  async approveArtworkContribution(
    contributionId: string,
    reviewerId: string,
    qualityBonus: boolean = false,
    communityFavorite: boolean = false
  ): Promise<{ contribution: ArtworkContribution, reward: ContributionReward }> {
    const contribution = await prisma.artworkContribution.findUnique({
      where: { id: contributionId }
    });

    if (!contribution) {
      throw new Error('Contribution not found');
    }

    if (contribution.status !== 'pending') {
      throw new Error('Contribution has already been reviewed');
    }

    // Check if this is the user's first contribution
    const userContributions = await prisma.artworkContribution.count({
      where: {
        userId: contribution.userId,
        status: 'approved'
      }
    });

    const isFirstContribution = userContributions === 0;
    const rewardAmount = calculateContributionReward(isFirstContribution, qualityBonus, communityFavorite);

    // Update contribution status
    const updatedContribution = await prisma.artworkContribution.update({
      where: { id: contributionId },
      data: {
        status: 'approved',
        rewardAmount,
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
        updatedAt: new Date()
      }
    });

    // Create reward record
    const reward = await prisma.contributionReward.create({
      data: {
        id: uuidv4(),
        userId: contribution.userId,
        contributionId,
        timeshardsAwarded: rewardAmount,
        awardedAt: new Date(),
        reason: `Artwork contribution approved${isFirstContribution ? ' (First contribution bonus)' : ''}${qualityBonus ? ' (Quality bonus)' : ''}${communityFavorite ? ' (Community favorite)' : ''}`
      }
    });

    // Award timeshards to user
    await this.awardContributionTimeshards(contribution.userId, rewardAmount);

    return {
      contribution: updatedContribution as ArtworkContribution,
      reward: reward as ContributionReward
    };
  }

  async rejectArtworkContribution(
    contributionId: string,
    reviewerId: string,
    reason?: string
  ): Promise<ArtworkContribution> {
    const updatedContribution = await prisma.artworkContribution.update({
      where: { id: contributionId },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
        updatedAt: new Date()
      }
    });

    return updatedContribution as ArtworkContribution;
  }

  private async awardContributionTimeshards(userId: string, amount: number): Promise<void> {
    const billing = await this.getUserBillingInfo(userId);
    
    // Add timeshards to free tokens (can be used for any model)
    const updatedFreeTokens = {
      ...billing.freeTokensRemaining,
      qwen: billing.freeTokensRemaining.qwen + amount
    };

    await prisma.userBilling.update({
      where: { userId },
      data: {
        freeTokensRemainingJson: stringifyTokenUsage(updatedFreeTokens),
        contributionRewards: billing.contributionRewards + amount,
        artworkContributions: billing.artworkContributions + 1,
        updatedAt: new Date()
      }
    });
  }

  async getUserContributions(userId: string): Promise<ArtworkContribution[]> {
    const contributions = await prisma.artworkContribution.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' }
    });

    return contributions as ArtworkContribution[];
  }

  async getUserContributionStats(userId: string): Promise<{
    totalContributions: number;
    approvedContributions: number;
    pendingContributions: number;
    totalRewardsEarned: number;
  }> {
    const [total, approved, pending, rewards] = await Promise.all([
      prisma.artworkContribution.count({
        where: { userId }
      }),
      prisma.artworkContribution.count({
        where: { userId, status: 'approved' }
      }),
      prisma.artworkContribution.count({
        where: { userId, status: 'pending' }
      }),
      prisma.contributionReward.aggregate({
        where: { userId },
        _sum: { timeshardsAwarded: true }
      })
    ]);

      return {
      totalContributions: total,
      approvedContributions: approved,
      pendingContributions: pending,
      totalRewardsEarned: rewards._sum.timeshardsAwarded || 0
    };
  }
} 