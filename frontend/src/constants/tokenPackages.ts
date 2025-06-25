export interface TokenPackage {
  id: string;           // Stripe/Alipay Price ID
  label: string;        // UI title
  price: number;        // base price in USD
  tokens?: number;      // one-off packs (timeshards)
  dailyTokens?: number; // for daily bonus packs (timeshards)
  durationDays?: number;// for subscription duration
  recommended?: boolean;
  description?: string; // additional description
  popular?: boolean;    // for highlighting
}

export const TOKEN_PACKAGES: TokenPackage[] = [
  { 
    id: "price_1USD",  
    label: "Micro Pack",       
    price: 1, 
    tokens: 100_000,
    description: "Perfect for trying out premium features - 100K timeshards"
  },
  { 
    id: "price_5USD",  
    label: "Starter Pack",     
    price: 5, 
    tokens: 300_000,
    description: "Great for light usage and experimentation - 300K timeshards"
  },
  { 
    id: "price_10USD", 
    label: "Creative Pack",    
    price: 10, 
    tokens: 700_000, 
    recommended: true,
    description: "Most popular choice for creative projects - 700K timeshards"
  },
  { 
    id: "price_15USD", 
    label: "Growth Pack",      
    price: 15, 
    tokens: 1_300_000,
    description: "Ideal for growing content creators - 1.3M timeshards"
  },
  { 
    id: "price_20USD", 
    label: "Pro Pack",         
    price: 20, 
    tokens: 1_900_000,
    description: "Professional-grade timeshard allocation - 1.9M timeshards"
  },
  { 
    id: "price_50USD", 
    label: "Studio Pack",      
    price: 50, 
    tokens: 4_500_000,
    description: "For teams and heavy usage - 4.5M timeshards"
  },
  { 
    id: "price_100USD",
    label: "Enterprise Pack",  
    price: 100, 
    tokens: 10_000_000,
    description: "Maximum capacity for enterprises - 10M timeshards"
  },
  // Yumi Blessing as a monthly subscription
  {
    id: "price_YUMIBLESSING",
    label: "Yumi Blessing",
    price: 10,
    dailyTokens: 35_000,
    durationDays: 30,
    popular: true,
    description: "Daily login rewards like Genshin Impact! Get 35K timeshards daily for 30 days (1.1M total). After 10 days, claim remaining 700K timeshards immediately."
  }
];

export const PAYMENT_METHODS = {
  STRIPE: 'stripe',
  ALIPAY: 'alipay'
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

// Calculate price with Japanese consumption tax for Alipay
export function calculateAlipayPrice(basePrice: number): number {
  return Math.round((basePrice * 1.1) * 100) / 100; // 10% tax, rounded to 2 decimals
}

// Format timeshard count for display
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  } else if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(0)}K`;
  }
  return tokens.toLocaleString();
}

// Get package by ID
export function getPackageById(id: string): TokenPackage | undefined {
  return TOKEN_PACKAGES.find(pkg => pkg.id === id);
}

// Check if package is subscription
export function isSubscriptionPackage(pkg: TokenPackage): boolean {
  return !!(pkg.dailyTokens && pkg.durationDays);
} 