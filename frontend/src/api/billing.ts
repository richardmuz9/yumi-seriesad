import debug from 'debug';

const log = debug('app:billing:api');

export interface BillingInfo {
  id: string;
  userId: string;
  premiumPlanId?: string;
  premiumPlanExpiresAt?: Date;
  dailyTokensRemaining: number;
  lastTokenResetDate: Date;
  stripeCustomerId?: string;
  totalTokensUsed: {
    openai: number;
    claude: number;
    qwen: number;
  };
  freeTokensRemaining: {
    openai: number;
    claude: number;
    qwen: number;
  };
}

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  currency: string;
  description?: string;
  recommended?: boolean;
}

export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  dailyTokens: number;
  durationDays: number;
  features: string[];
  description?: string;
  popular?: boolean;
}

interface TokenUsage {
  freeTokensRemaining: {
    openai: number;
    claude: number;
    qwen: number;
  };
  totalTokensUsed: {
    openai: number;
    claude: number;
    qwen: number;
  };
  dailyTokensRemaining: number;
  premiumPlanId?: string;
  recentUsage: Array<{
    timestamp: Date;
    tokenCount: number;
    model: string;
  }>;
}

class BillingAPI {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network response was not ok' }));
      log('API Error:', { status: response.status, error });
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getBillingInfo(): Promise<BillingInfo> {
    log('Fetching billing info');
    try {
      const response = await fetch('/api/billing/info', {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });
      const data = await this.handleResponse<BillingInfo>(response);
      log('Billing info received:', data);
      return data;
    } catch (error) {
      log('Error fetching billing info:', error);
      throw error;
    }
  }

  async getPackagesAndPlans(): Promise<{ packages: TokenPackage[], plans: PremiumPlan[] }> {
    log('Fetching packages and plans');
    try {
      const response = await fetch('/api/billing/packages', {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });
      const data = await this.handleResponse<{ packages: TokenPackage[], plans: PremiumPlan[] }>(response);
      log('Packages and plans received:', data);
      return data;
    } catch (error) {
      log('Error fetching packages and plans:', error);
      throw error;
    }
  }

  async createStripeCheckout(packageId?: string, planId?: string): Promise<{ url: string }> {
    log('Creating Stripe checkout:', { packageId, planId });
    try {
      const response = await fetch('/api/billing/checkout/stripe', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ packageId, planId })
      });
      const data = await this.handleResponse<{ url: string }>(response);
      log('Stripe checkout URL received:', data);
      return data;
    } catch (error) {
      log('Error creating Stripe checkout:', error);
      throw error;
    }
  }

  async createAlipayCheckout(packageId?: string, planId?: string): Promise<{ url: string }> {
    log('Creating Alipay checkout:', { packageId, planId });
    try {
      const response = await fetch('/api/billing/checkout/alipay', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ packageId, planId })
      });
      const data = await this.handleResponse<{ url: string }>(response);
      log('Alipay checkout URL received:', data);
      return data;
    } catch (error) {
      log('Error creating Alipay checkout:', error);
      throw error;
    }
  }

  async claimRemainingBlessingTokens(): Promise<{ success: boolean, tokensAdded: number }> {
    log('Claiming remaining Yumi Blessing tokens');
    try {
      const response = await fetch('/api/billing/claim-blessing-tokens', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });
      const data = await this.handleResponse<{ success: boolean, tokensAdded: number }>(response);
      log('Blessing tokens claim result:', data);
      return data;
    } catch (error) {
      log('Error claiming blessing tokens:', error);
      throw error;
    }
  }

  async getTokenUsage(): Promise<TokenUsage> {
    log('Fetching token usage');
    try {
      const response = await fetch('/api/billing/token-usage', {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });
      const data = await this.handleResponse<TokenUsage>(response);
      log('Token usage received:', data);
      return data;
    } catch (error) {
      log('Error fetching token usage:', error);
      throw error;
    }
  }
}

export const billingAPI = new BillingAPI(); 