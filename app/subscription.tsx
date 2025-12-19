import { useCallback, useState } from 'react';

import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

import { Button } from '@/components/Button';
import { Text, View } from '@/components/Themed';
import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_SKUS, SubscriptionSku } from '@/services/subscriptionService';
import { SubscriptionProduct } from '@/types/premium';

function SubscriptionCard({
  product,
  isSelected,
  onSelect,
  isYearly,
}: {
  product: SubscriptionProduct;
  isSelected: boolean;
  onSelect: () => void;
  isYearly: boolean;
}) {
  return (
    <Pressable
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect();
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${product.title}, ${product.price}`}
    >
      {isYearly && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Beliebt</Text>
        </View>
      )}
      <Text style={styles.cardTitle}>{product.title.replace(' (Wort des Tages)', '')}</Text>
      <Text style={styles.cardPrice}>{product.price}</Text>
      <Text style={styles.cardPeriod}>{isYearly ? 'pro Jahr' : 'pro Monat'}</Text>
      {isYearly && <Text style={styles.cardSavings}>Spare 33%</Text>}
    </Pressable>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name="checkmark-circle" size={20} color="#34C759" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

export default function SubscriptionScreen() {
  const { products, isLoading, isPurchasing, isRestoring, error, purchase, restore, clearError } =
    useSubscription();

  const [selectedSku, setSelectedSku] = useState<SubscriptionSku>(SUBSCRIPTION_SKUS.YEARLY);

  const handlePurchase = useCallback(async () => {
    const success = await purchase(selectedSku);
    if (success) {
      Toast.show({
        type: 'success',
        text1: 'Premium aktiviert!',
        text2: 'Vielen Dank für dein Abonnement.',
      });
      router.back();
    }
  }, [purchase, selectedSku]);

  const handleRestore = useCallback(async () => {
    const restored = await restore();
    if (restored) {
      Toast.show({
        type: 'success',
        text1: 'Käufe wiederhergestellt',
        text2: 'Dein Premium-Status wurde aktiviert.',
      });
      router.back();
    } else {
      Toast.show({
        type: 'info',
        text1: 'Keine Käufe gefunden',
        text2: 'Es wurden keine aktiven Abonnements gefunden.',
      });
    }
  }, [restore]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Lade Abonnement-Optionen...</Text>
      </View>
    );
  }

  const monthlyProduct = products.find((p) => p.sku === SUBSCRIPTION_SKUS.MONTHLY);
  const yearlyProduct = products.find((p) => p.sku === SUBSCRIPTION_SKUS.YEARLY);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Premium freischalten</Text>
        <Text style={styles.subtitle}>
          Erweitere dein Lernerlebnis mit KI-generierten Definitionen und Quizfragen.
        </Text>
      </View>

      <View style={styles.features}>
        <FeatureRow text="KI-generierte Definitionen" />
        <FeatureRow text="Beispielsätze zu jedem Wort" />
        <FeatureRow text="Interaktive Quizfragen" />
        <FeatureRow text="Jederzeit kündbar" />
      </View>

      {products.length > 0 ? (
        <View style={styles.cards}>
          {monthlyProduct && (
            <SubscriptionCard
              product={monthlyProduct}
              isSelected={selectedSku === SUBSCRIPTION_SKUS.MONTHLY}
              onSelect={() => setSelectedSku(SUBSCRIPTION_SKUS.MONTHLY)}
              isYearly={false}
            />
          )}
          {yearlyProduct && (
            <SubscriptionCard
              product={yearlyProduct}
              isSelected={selectedSku === SUBSCRIPTION_SKUS.YEARLY}
              onSelect={() => setSelectedSku(SUBSCRIPTION_SKUS.YEARLY)}
              isYearly
            />
          )}
        </View>
      ) : (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsText}>
            Abonnement-Optionen sind derzeit nicht verfügbar.
          </Text>
          <Text style={styles.noProductsHint}>Bitte versuche es später erneut.</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
          <Button variant="ghost" title="Schließen" onPress={clearError} />
        </View>
      )}

      <View style={styles.actions}>
        <Button
          variant="primary"
          title={isPurchasing ? 'Verarbeite...' : 'Abonnieren'}
          onPress={handlePurchase}
          loading={isPurchasing}
          disabled={isPurchasing || isRestoring || products.length === 0}
          icon="card-outline"
          accessibilityLabel="Abonnement abschließen"
        />

        <Button
          variant="ghost"
          title={isRestoring ? 'Suche...' : 'Käufe wiederherstellen'}
          onPress={handleRestore}
          loading={isRestoring}
          disabled={isPurchasing || isRestoring}
          accessibilityLabel="Vorherige Käufe wiederherstellen"
        />
      </View>

      <Text style={styles.terms}>
        Durch Fortfahren stimmst du unseren Nutzungsbedingungen und Datenschutzrichtlinien zu. Das
        Abonnement verlängert sich automatisch, sofern nicht mindestens 24 Stunden vor Ablauf des
        aktuellen Zeitraums gekündigt wird. Du kannst das Abonnement jederzeit in den Google
        Play-Einstellungen verwalten.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
  header: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 22,
  },
  features: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
  },
  cards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(128,128,128,0.3)',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  cardSelected: {
    borderColor: '#007AFF',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardPeriod: {
    fontSize: 14,
    opacity: 0.7,
  },
  cardSavings: {
    fontSize: 12,
    color: '#34C759',
    marginTop: 4,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  noProductsContainer: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
    marginBottom: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  noProductsText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  noProductsHint: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 8,
  },
  terms: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 18,
  },
});
