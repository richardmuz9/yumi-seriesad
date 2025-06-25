export interface TokenPackage {
  id: string;
  name: string;
  tokens: number; // timeshards
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
  dailyTokens: number; // daily timeshards
  durationDays: number;
  features: string[];
  description?: string;
  popular?: boolean;
}

export interface TokenUsage {
  openai: number; // timeshards used
  claude: number; // timeshards used
  qwen: number;   // timeshards used
}

export interface ArtworkContribution {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'approved' | 'rejected';
  rewardClaimed: boolean;
  rewardAmount: number;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContributionReward {
  id: string;
  userId: string;
  contributionId: string;
  timeshardsAwarded: number;
  awardedAt: Date;
  reason: string;
}

export interface UserBillingInfo {
  id: string;
  userId: string;
  premiumPlanId?: string;
  premiumPlanExpiresAt?: Date;
  dailyTokensRemaining: number; // daily timeshards remaining
  lastTokenResetDate: Date;
  stripeCustomerId?: string;
  hasAccessToImageGen: boolean;
  totalAmountSpent: number;
  totalTokensUsed: TokenUsage; // total timeshards used
  freeTokensRemaining: TokenUsage; // free timeshards remaining
  contributionRewards: number; // total timeshards earned from contributions
  artworkContributions: number; // number of approved contributions
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSession {
  id: string;
  userId: string;
  packageId?: string;
  planId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  provider: 'stripe' | 'alipay';
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Contribution reward constants
export const CONTRIBUTION_REWARDS = {
  ARTWORK_SUBMISSION: 1000, // 1000 timeshards for approved artwork
  FIRST_CONTRIBUTION_BONUS: 500, // Additional 500 timeshards for first contribution
  QUALITY_BONUS: 250, // Extra reward for exceptional quality
  COMMUNITY_FAVORITE: 750 // Extra reward if artwork becomes community favorite
};

// Extended Timeshard Packages - 1, 5, 10, 15, 20, 50, 100 USD
export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'price_1USD',
    name: 'Micro Pack',
    tokens: 100000, // 100K timeshards
    price: 1,
    currency: 'USD',
    description: 'Perfect for trying out premium features - 100K timeshards'
  },
  {
    id: 'price_5USD',
    name: 'Starter Pack',
    tokens: 300000, // 300K timeshards
    price: 5,
    currency: 'USD',
    description: 'Great for light usage and experimentation - 300K timeshards'
  },
  {
    id: 'price_10USD',
    name: 'Creative Pack',
    tokens: 700000, // 700K timeshards
    price: 10,
    currency: 'USD',
    description: 'Most popular choice for creative projects - 700K timeshards',
    recommended: true
  },
  {
    id: 'price_15USD',
    name: 'Growth Pack',
    tokens: 1300000, // 1.3M timeshards
    price: 15,
    currency: 'USD',
    description: 'Ideal for growing content creators - 1.3M timeshards'
  },
  {
    id: 'price_20USD',
    name: 'Pro Pack',
    tokens: 1900000, // 1.9M timeshards
    price: 20,
    currency: 'USD',
    description: 'Professional-grade timeshard allocation - 1.9M timeshards'
  },
  {
    id: 'price_50USD',
    name: 'Studio Pack',
    tokens: 4500000, // 4.5M timeshards
    price: 50,
    currency: 'USD',
    description: 'For teams and heavy usage - 4.5M timeshards'
  },
  {
    id: 'price_100USD',
    name: 'Enterprise Pack',
    tokens: 10000000, // 10M timeshards
    price: 100,
    currency: 'USD',
    description: 'Maximum capacity for enterprises - 10M timeshards'
  }
];

// Yumi Blessing Subscription Plan
export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'price_YUMIBLESSING',
    name: 'Yumi Blessing',
    price: 10,
    currency: 'USD',
    dailyTokens: 35000, // 35K timeshards per day
    durationDays: 30,
    popular: true,
    description: 'Daily login rewards like Genshin Impact! Get 35K timeshards daily for 30 days (1.1M total). After 10 days, claim remaining 700K timeshards immediately.',
    features: [
      '✨ 35,000 timeshards every day for 30 days',
      '🎯 Total of 1.1M timeshards per month',
      '⚡ After 10 days, claim remaining 700K timeshards immediately',
      '🎮 No need to login daily - timeshards accumulate automatically',
      '💫 Special blessing effects and priority support',
      '🎁 Exclusive Yumi personality interactions'
    ]
  }
];

export const FREE_TOKEN_LIMITS: TokenUsage = {
  openai: 10000,   // 10K free timeshards for OpenAI
  claude: 10000,   // 10K free timeshards for Claude
  qwen: 1000000    // 1M free timeshards for Qwen
};

// Alipay pricing with 10% Japanese consumption tax
export function calculateAlipayPrice(basePrice: number): number {
  return Math.round((basePrice * 1.1) * 100) / 100;
}

// Get package by ID
export function getTokenPackageById(id: string): TokenPackage | undefined {
  return TOKEN_PACKAGES.find(pkg => pkg.id === id);
}

// Get plan by ID
export function getPremiumPlanById(id: string): PremiumPlan | undefined {
  return PREMIUM_PLANS.find(plan => plan.id === id);
}

// Check if package/plan is subscription
export function isSubscriptionPlan(id: string): boolean {
  return PREMIUM_PLANS.some(plan => plan.id === id);
}

// Contribution helper functions
export function calculateContributionReward(
  isFirstContribution: boolean,
  qualityBonus: boolean = false,
  communityFavorite: boolean = false
): number {
  let reward = CONTRIBUTION_REWARDS.ARTWORK_SUBMISSION;
  
  if (isFirstContribution) {
    reward += CONTRIBUTION_REWARDS.FIRST_CONTRIBUTION_BONUS;
  }
  
  if (qualityBonus) {
    reward += CONTRIBUTION_REWARDS.QUALITY_BONUS;
  }
  
  if (communityFavorite) {
    reward += CONTRIBUTION_REWARDS.COMMUNITY_FAVORITE;
  }
  
  return reward;
}

export function formatContributionReward(reward: number): string {
  return `${reward.toLocaleString()} timeshards`;
} 