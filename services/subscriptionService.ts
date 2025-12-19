import { Platform } from 'react-native';

import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  getAvailablePurchases,
  type Purchase,
  type ProductSubscription,
  ErrorCode,
} from 'expo-iap';
import type { PurchaseError } from 'expo-iap';

import { supabase } from '@/config/supabase';
import { getDeviceId } from '@/services/deviceService';
import { SubscriptionProduct } from '@/types/premium';
import { AppError } from '@/utils/appError';

// Product SKUs - configure in Google Play Console
export const SUBSCRIPTION_SKUS = {
  MONTHLY: 'wdt_premium_monthly',
  YEARLY: 'wdt_premium_yearly',
} as const;

export type SubscriptionSku = (typeof SUBSCRIPTION_SKUS)[keyof typeof SUBSCRIPTION_SKUS];

let isConnected = false;

/**
 * Initialize IAP connection to Google Play Billing.
 * Must be called before any other IAP operations.
 */
export async function initializeIAP(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  if (isConnected) {
    return true;
  }

  try {
    const result = await initConnection();
    isConnected = Boolean(result);
    return isConnected;
  } catch (error) {
    throw new AppError(
      'iap_init_failed',
      'In-App-Käufe konnten nicht initialisiert werden.',
      error
    );
  }
}

/**
 * Clean up IAP connection when component unmounts.
 */
export async function cleanupIAP(): Promise<void> {
  if (!isConnected) return;

  try {
    await endConnection();
    isConnected = false;
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Fetch available subscription products from Google Play.
 */
export async function fetchSubscriptionProducts(): Promise<SubscriptionProduct[]> {
  if (Platform.OS !== 'android') {
    return [];
  }

  if (!isConnected) {
    await initializeIAP();
  }

  try {
    const skus = Object.values(SUBSCRIPTION_SKUS);
    const products = await fetchProducts({ skus, type: 'subs' });

    if (!products) {
      return [];
    }

    // Filter to only subscription products (type === 'subs')
    const subscriptions = products.filter((p): p is ProductSubscription => p.type === 'subs');

    return subscriptions.map((sub) => {
      // For Android subscriptions, get pricing from offer details
      const offerDetails =
        sub.platform === 'android' ? sub.subscriptionOfferDetailsAndroid?.[0] : null;
      const pricingPhase = offerDetails?.pricingPhases?.pricingPhaseList?.[0];

      return {
        sku: sub.id,
        title: sub.title,
        description: sub.description,
        price: sub.displayPrice ?? pricingPhase?.formattedPrice ?? '',
        priceAmountMicros: pricingPhase?.priceAmountMicros ?? '0',
        currency: sub.currency ?? pricingPhase?.priceCurrencyCode ?? 'EUR',
        subscriptionPeriod: pricingPhase?.billingPeriod ?? 'P1M',
      };
    });
  } catch (error) {
    throw new AppError(
      'subscription_fetch_failed',
      'Abonnement-Optionen konnten nicht geladen werden.',
      error
    );
  }
}

/**
 * Initiate a subscription purchase flow.
 */
export async function purchaseSubscription(sku: SubscriptionSku): Promise<Purchase> {
  if (Platform.OS !== 'android') {
    throw new AppError('platform_not_supported', 'Abonnements nur auf Android verfügbar.');
  }

  if (!isConnected) {
    await initializeIAP();
  }

  try {
    // Get subscription details to find the offer token
    const products = await fetchProducts({ skus: [sku], type: 'subs' });
    const subscription = products?.find(
      (p): p is ProductSubscription => p.type === 'subs' && p.id === sku
    );

    if (!subscription) {
      throw new Error('Subscription product not found');
    }

    // Get offer token for Android
    const offerToken =
      subscription.platform === 'android'
        ? (subscription.subscriptionOfferDetailsAndroid?.[0]?.offerToken ?? '')
        : '';

    const purchase = await requestPurchase({
      request: {
        google: {
          skus: [sku],
          subscriptionOffers: [{ sku, offerToken }],
        },
      },
      type: 'subs',
    });

    if (!purchase) {
      throw new Error('Purchase returned null');
    }

    // requestPurchase can return Purchase or Purchase[]
    const singlePurchase = Array.isArray(purchase) ? purchase[0] : purchase;
    if (!singlePurchase) {
      throw new Error('Purchase returned empty');
    }

    return singlePurchase;
  } catch (error) {
    const purchaseError = error as PurchaseError;
    if (purchaseError.code === ErrorCode.UserCancelled) {
      throw new AppError('purchase_cancelled', 'Kauf wurde abgebrochen.');
    }
    throw new AppError('purchase_failed', 'Kauf fehlgeschlagen.', error);
  }
}

interface GrantPremiumResponse {
  success?: boolean;
  expiresAt?: string;
  autoRenewing?: boolean;
}

/**
 * Validate purchase with server and grant premium access.
 */
export async function validateAndGrantSubscription(
  purchaseToken: string,
  subscriptionId: string
): Promise<{ success: boolean; expiresAt?: string; autoRenewing?: boolean }> {
  if (!supabase) {
    throw new AppError('supabase_not_configured', 'Server nicht verfügbar.');
  }

  const deviceId = await getDeviceId();

  const { data, error } = await supabase.functions.invoke<GrantPremiumResponse>('grant-premium', {
    body: {
      deviceId,
      source: 'google_play',
      purchaseToken,
      subscriptionId,
    },
  });

  if (error) {
    throw new AppError('validation_failed', 'Kauf konnte nicht validiert werden.', error);
  }

  return {
    success: data?.success ?? false,
    expiresAt: data?.expiresAt,
    autoRenewing: data?.autoRenewing,
  };
}

/**
 * Acknowledge the purchase after server validation.
 * This tells Google Play the purchase was processed.
 */
export async function acknowledgeSubscription(purchase: Purchase): Promise<void> {
  try {
    await finishTransaction({
      purchase,
      isConsumable: false,
    });
  } catch (error) {
    // Log but don't throw - purchase is already validated server-side
    console.error('Failed to acknowledge purchase:', error);
  }
}

/**
 * Restore existing purchases (e.g., after reinstall or device change).
 */
export async function restorePurchases(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  if (!supabase) {
    throw new AppError('supabase_not_configured', 'Server nicht verfügbar.');
  }

  if (!isConnected) {
    await initializeIAP();
  }

  try {
    const purchases = await getAvailablePurchases();

    if (!purchases || purchases.length === 0) {
      return false;
    }

    // Find active subscription from our SKUs
    const subscription = purchases.find((p) =>
      Object.values(SUBSCRIPTION_SKUS).includes(p.productId as SubscriptionSku)
    );

    if (!subscription || !subscription.purchaseToken) {
      return false;
    }

    // Validate with server
    const result = await validateAndGrantSubscription(
      subscription.purchaseToken,
      subscription.productId
    );

    return result.success;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('restore_failed', 'Käufe konnten nicht wiederhergestellt werden.', error);
  }
}
