import { PrismaClient } from '@prisma/client';
import AliPaySDK from 'alipay-sdk';
import { v4 as uuidv4 } from 'uuid';
import { TokenUsage, TOKEN_PACKAGES, PREMIUM_PLANS } from '../types';

const prisma = new PrismaClient();

// Initialize Alipay SDK conditionally
let alipay: AliPaySDK | null = null;
try {
  if (process.env.ALIPAY_APP_ID && process.env.ALIPAY_PRIVATE_KEY && process.env.ALIPAY_PUBLIC_KEY) {
    alipay = new AliPaySDK({
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
});
  } else {
    console.log('ℹ️  Alipay SDK not initialized (missing credentials or development mode)');
  }
} catch (error) {
  console.error('❌ Alipay SDK initialization failed:', error);
  alipay = null;
}

export class AlipayService {
  async createCheckoutSession(
    userId: string,
    packageId?: string,
    planId?: string
  ): Promise<string> {
    if (!alipay) {
      throw new Error('Alipay SDK is not available. Please contact support or use Stripe payment.');
    }

    const amount = packageId ? 5 : 10;
    const subject = packageId ? 'Token Package' : 'Premium Plan';

    const result = await alipay.exec('alipay.trade.page.pay', {
      notify_url: `${process.env.FRONTEND_URL}/api/billing/alipay/notify`,
      return_url: `${process.env.FRONTEND_URL}/charge?success=true`,
      bizContent: {
        out_trade_no: uuidv4(),
        total_amount: amount,
        subject,
        product_code: 'FAST_INSTANT_TRADE_PAY'
      }
    });

    await this.createPaymentSession(userId, {
      packageId,
      planId,
      amount,
      sessionId: result.out_trade_no
    });

    return result.body;
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
        provider: 'alipay',
        sessionId: data.sessionId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  async handleWebhook(data: any) {
    if (data.trade_status === 'TRADE_SUCCESS') {
      const paymentSession = await prisma.paymentSession.findFirst({
        where: { sessionId: data.out_trade_no }
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