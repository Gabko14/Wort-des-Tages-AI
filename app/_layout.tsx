import { useEffect } from 'react';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { ErrorBoundaryProps, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';

import 'react-native-reanimated';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Etwas ist schiefgelaufen</Text>
      <Text style={styles.subtitle}>Bitte versuche es erneut.</Text>
      {__DEV__ && (
        <Text selectable style={styles.details}>
          {error?.stack ?? String(error)}
        </Text>
      )}
      <View style={styles.buttonRow}>
        <Pressable
          onPress={() => {
            void retry().catch((err) => console.error('ErrorBoundary retry failed:', err));
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            void Updates.reloadAsync().catch((err) => {
              console.error('App reload failed:', err);
              return retry();
            });
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Reload</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const UNSTABLE_SETTINGS = {
  initialRouteName: '(tabs)',
};

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  if (error) {
    throw error;
  }

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: 'white',
    opacity: 0.8,
    marginBottom: 16,
  },
  details: {
    color: 'white',
    opacity: 0.7,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    borderWidth: 1,
    borderColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
