import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { TokenPackage, PremiumPlan, TokenUsage, TOKEN_PACKAGES, PREMIUM_PLANS } from '../types';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export class StripeService {
  async createCheckoutSession(
    userId: string,
    packageId?: string,
    planId?: string
  ): Promise<string> {
    const successUrl = `${process.env.FRONTEND_URL}/charge?success=true`;
    const cancelUrl = `${process.env.FRONTEND_URL}/charge?cancel=true`;

    let priceId: string;
    let mode: 'payment' | 'subscription' = 'payment';

    if (packageId) {
      priceId = process.env[`STRIPE_PRICE_${packageId.toUpperCase()}`]!;
    } else if (planId) {
      priceId = process.env[`STRIPE_PRICE_${planId.toUpperCase()}`]!;
      mode = 'subscription';
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
      customer: await this.getOrCreateCustomer(userId)
    } as Stripe.Checkout.SessionCreateParams);

    await this.createPaymentSession(userId, {
      packageId,
      planId,
      amount: mode === 'payment' ? 5 : 10,
      sessionId: session.id
    });

    return session.url!;
  }

  private async getOrCreateCustomer(userId: string): Promise<string> {
    const userBilling = await prisma.userBilling.findUnique({
      where: { userId }
    });

    if (userBilling?.stripeCustomerId) {
      return userBilling.stripeCustomerId;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    const customer = await stripe.customers.create({
      email: user?.email,
      metadata: { userId }
    });

    await prisma.userBilling.update({
      where: { userId },
      data: { stripeCustomerId: customer.id }
    });

    return customer.id;
  }

  private async createPaymentSession(userId: string, data: {
    packageId?: string;
    planId?: string;
    amount: number;
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
        provider: 'stripe',
        sessionId: data.sessionId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  async handleWebhook(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.handleSuccessfulPayment(
        session.metadata?.userId!,
        session.metadata?.packageId,
        session.metadata?.planId
      );
    }
  }

  private async handleSuccessfulPayment(
    userId: string,
    packageId?: string,
    planId?: string
  ) {
    const userBilling = await prisma.userBilling.findUnique({
      where: { userId }
    });

    if (!userBilling) {
      throw new Error('User billing record not found');
    }

    const currentTokensUsed = JSON.parse(userBilling.totalTokensUsedJson) as TokenUsage;
    const currentFreeTokens = JSON.parse(userBilling.freeTokensRemainingJson) as TokenUsage;

    if (packageId) {
      const package_ = TOKEN_PACKAGES.find(p => p.id === packageId);
      if (!package_) throw new Error('Invalid package ID');

      const updatedFreeTokens = {
        openai: currentFreeTokens.openai + package_.tokens,
        claude: currentFreeTokens.claude + package_.tokens,
        qwen: currentFreeTokens.qwen + package_.tokens
      };

      await prisma.userBilling.update({
        where: { id: userBilling.id },
        data: {
          freeTokensRemainingJson: JSON.stringify(updatedFreeTokens),
          hasAccessToImageGen: true,
          totalAmountSpent: (userBilling.totalAmountSpent || 0) + package_.price
        }
      });
    } else if (planId) {
      const plan = PREMIUM_PLANS.find(p => p.id === planId);
      if (!plan) throw new Error('Invalid plan ID');

      await prisma.userBilling.update({
        where: { id: userBilling.id },
        data: {
          subscriptionStatus: 'pro',
          availableTokens: plan.dailyTokens,
          lastTokenResetDate: new Date(),
          hasAccessToImageGen: true,
          totalAmountSpent: (userBilling.totalAmountSpent || 0) + plan.price
        }
      });
    }
  }
} 