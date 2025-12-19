export interface PremiumStatus {
  isPremium: boolean;
  source?: 'dev' | 'google_play' | 'apple';
  expiresAt?: string;
  autoRenewing?: boolean;
}

export interface SubscriptionProduct {
  sku: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: string;
  currency: string;
  subscriptionPeriod: string;
}
