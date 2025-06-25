import axios, { AxiosResponse } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true
});

// Billing API service for Yumi-Series pricing (3x markup for sustainable business)
export interface UserBilling {
  id: number
  email: string
  creditsBalance: number // Credits in USD
  totalSpent: number
  qwenTokensUsedMonth: number
  premiumTokensUsedMonth?: number

  subscriptionStatus: 'active' | 'inactive' | 'canceled' | 'past_due'
  subscriptionPlan: string
  monthlyTokensUsed?: number
  dailyTokensUsed?: number
  premiumTokens?: number
  credits: number
  qwenTokensUsed: number
  qwenTokensLeft?: number
  premiumTokensLeft?: number

  nextReset: string
  nextBillingDate?: string
}

export interface CreditPackage {
  id: string
  name: string
  credits: number // USD value
  price: number // Price in cents
  description: string
  recommended: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number // Price in cents
  tokensPerDay: number
  tokensPerMonth: number
  description: string
  benefits: string[]
  interval?: string
}

export interface ModelPricing {
  [provider: string]: {
    [modelId: string]: {
      inputCost: number // Cost per 1K tokens (3x markup)
      outputCost: number // Cost per 1K tokens (3x markup)
      unit: string
      dailyLimit?: number
      monthlyLimit?: number
    }
  }
}

export interface ModelAvailability {
  available: boolean
  isFree: boolean
  reason: string
  suggestion?: string
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  currency: string;
  recommended?: boolean;
}

export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  dailyTokens: number;
  features: string[];
}

export interface UserBillingInfo {
  stripeCustomerId: string;
  credits: number;
  subscription: {
    status: 'active' | 'inactive' | 'cancelled';
    plan: 'free' | 'pro';
    nextBillingDate: string;
  };
  freeTokensRemaining?: {
    openai: number;
    claude: number;
    qwen: number;
  };
  premiumPlanId?: string;
  premiumPlanExpiresAt?: string;
  dailyTokensRemaining?: number;
}

export interface BillingInfo {
  tokens: number;
  dailyTokensRemaining: number;
  blessingActive: boolean;
}

export interface PaymentResponse {
  url: string;
}

interface CheckoutResponse {
  url: string;
}

export const billingApi = {
  getBillingInfo: async (): Promise<BillingInfo> => {
    try {
      const response: AxiosResponse<BillingInfo> = await apiClient.get('/api/billing/info');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch billing info:', error);
      // Return mock data for development
      return {
        tokens: 1000,
        dailyTokensRemaining: 100,
        blessingActive: false
      };
    }
  },

  async getPackagesAndPlans(): Promise<{
    packages: TokenPackage[];
    plans: PremiumPlan[];
  }> {
    try {
      const response: AxiosResponse<{
        packages: TokenPackage[];
        plans: PremiumPlan[];
      }> = await apiClient.get('/api/billing/packages');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch packages and plans:', error);
      // Return mock data for development
      return {
        packages: [
          {
            id: 'basic',
            name: 'Basic Package',
            tokens: 1000,
            price: 5,
            currency: 'USD'
          },
          {
            id: 'pro',
            name: 'Pro Package',
            tokens: 5000,
            price: 20,
            currency: 'USD',
            recommended: true
          }
        ],
        plans: [
          {
            id: 'yumi_blessing',
            name: 'Yumi Blessing',
            price: 10,
            currency: 'USD',
            dailyTokens: 1000,
            features: ['Unlimited AI generations', 'Priority support', 'Advanced features']
          }
        ]
      };
    }
  },

  async createStripeCheckout(packageId?: string, planId?: string): Promise<string> {
    try {
      const response: AxiosResponse<CheckoutResponse> = await apiClient.post('/api/billing/checkout/stripe', {
        packageId,
        planId
      });
      return response.data.url;
    } catch (error) {
      console.error('Failed to create Stripe checkout:', error);
      throw new Error('Payment service temporarily unavailable');
    }
  },

  async createAlipayCheckout(packageId?: string, planId?: string): Promise<string> {
    try {
      const response: AxiosResponse<CheckoutResponse> = await apiClient.post('/api/billing/checkout/alipay', {
        packageId,
        planId
      });
      return response.data.url;
    } catch (error) {
      console.error('Failed to create Alipay checkout:', error);
      throw new Error('Payment service temporarily unavailable');
    }
  },

  needsTokenPurchase(billingInfo: BillingInfo): boolean {
    return billingInfo.tokens < 1000;
  },

  needsPremiumPlan(billingInfo: BillingInfo): boolean {
    return !billingInfo.blessingActive;
  },

  getTokensRemaining(billingInfo: BillingInfo, provider?: 'openai' | 'claude' | 'qwen'): number {
    return billingInfo.tokens;
  },

  initiatePayment: async (packageId: string): Promise<PaymentResponse> => {
    try {
      const response: AxiosResponse<PaymentResponse> = await apiClient.post('/api/billing/payment', {
        packageId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      throw new Error('Payment service temporarily unavailable');
    }
  }
}; 