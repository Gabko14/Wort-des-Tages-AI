import { useEffect, useState, useCallback } from 'react';

import * as Sentry from '@sentry/react-native';

import {
  initializeIAP,
  cleanupIAP,
  fetchSubscriptionProducts,
  purchaseSubscription,
  validateAndGrantSubscription,
  acknowledgeSubscription,
  restorePurchases,
  SubscriptionSku,
} from '@/services/subscriptionService';
import { SubscriptionProduct } from '@/types/premium';
import { AppError, asAppError } from '@/utils/appError';

export interface UseSubscriptionResult {
  products: SubscriptionProduct[];
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  error: AppError | null;
  purchase: (sku: SubscriptionSku) => Promise<boolean>;
  restore: () => Promise<boolean>;
  clearError: () => void;
}

export function useSubscription(): UseSubscriptionResult {
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  // Initialize IAP and fetch products on mount
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await initializeIAP();
        const fetchedProducts = await fetchSubscriptionProducts();
        if (mounted) {
          setProducts(fetchedProducts);
        }
      } catch (err) {
        if (mounted) {
          const appError = asAppError(
            err,
            new AppError('iap_init_failed', 'Initialisierung fehlgeschlagen.')
          );
          setError(appError);

          if (!__DEV__) {
            Sentry.captureException(err, { tags: { feature: 'subscription_init' } });
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
      cleanupIAP().catch(() => {});
    };
  }, []);

  const purchase = useCallback(async (sku: SubscriptionSku): Promise<boolean> => {
    setIsPurchasing(true);
    setError(null);

    try {
      // 1. Request purchase from Google Play
      const purchaseResult = await purchaseSubscription(sku);

      if (!purchaseResult.purchaseToken) {
        throw new AppError('purchase_failed', 'Kauf-Token nicht erhalten.');
      }

      // 2. Validate on server
      const validated = await validateAndGrantSubscription(purchaseResult.purchaseToken, sku);

      if (!validated.success) {
        throw new AppError('validation_failed', 'Server-Validierung fehlgeschlagen.');
      }

      // 3. Acknowledge purchase with Google Play
      await acknowledgeSubscription(purchaseResult);

      return true;
    } catch (err) {
      const appError = asAppError(err, new AppError('purchase_failed', 'Kauf fehlgeschlagen.'));
      setError(appError);

      // Don't log user cancellations to Sentry
      if (appError.code !== 'purchase_cancelled' && !__DEV__) {
        Sentry.captureException(err, { tags: { feature: 'subscription_purchase' } });
      }

      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    setIsRestoring(true);
    setError(null);

    try {
      const restored = await restorePurchases();
      return restored;
    } catch (err) {
      const appError = asAppError(
        err,
        new AppError('restore_failed', 'Wiederherstellung fehlgeschlagen.')
      );
      setError(appError);

      if (!__DEV__) {
        Sentry.captureException(err, { tags: { feature: 'subscription_restore' } });
      }

      return false;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    products,
    isLoading,
    isPurchasing,
    isRestoring,
    error,
    purchase,
    restore,
    clearError,
  };
}
