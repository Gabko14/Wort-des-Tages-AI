import { ReactNode, useEffect, useState } from 'react';

import { ActivityIndicator, View } from 'react-native';

import { checkPremiumStatus, isPremiumCached } from '@/services/premiumService';

type PremiumGateProps = {
  fallback: ReactNode;
  children: ReactNode;
};

export function PremiumGate({ fallback, children }: PremiumGateProps) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(isPremiumCached());

  useEffect(() => {
    checkPremiumStatus()
      .then((status) => setAllowed(status.isPremium))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
