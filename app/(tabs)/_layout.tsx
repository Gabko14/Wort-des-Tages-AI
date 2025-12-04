import React from 'react';

import { Alert, Text, TouchableOpacity } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import Constants from 'expo-constants';
import { Tabs } from 'expo-router';
import * as Updates from 'expo-updates';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function getUpdateInfo() {
  const version = Constants.expoConfig?.version ?? '?';
  const updateId = Updates.updateId?.slice(0, 7) ?? 'dev';
  const fullUpdateId = Updates.updateId ?? 'development';
  const channel = Updates.channel ?? 'development';
  const createdAt = Updates.createdAt
    ? Updates.createdAt.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const manifest = Updates.manifest as any;
  const message =
    manifest?.extra?.expoClient?.extra?.updateMessage ??
    manifest?.extra?.updateMessage ??
    manifest?.message ??
    'Keine Nachricht';

  return { version, updateId, fullUpdateId, channel, createdAt, message };
}

function showUpdateDetails() {
  const info = getUpdateInfo();
  Alert.alert(
    'App-Info',
    `Version: ${info.version}\n` +
      `Update-ID: ${info.fullUpdateId}\n` +
      `Channel: ${info.channel}\n` +
      `Erstellt: ${info.createdAt}\n` +
      `Nachricht: ${info.message}`,
    [{ text: 'OK' }]
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? 'light'].text;
  const info = getUpdateInfo();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
        headerRight: () => (
          <TouchableOpacity
            onPress={showUpdateDetails}
            style={{ marginRight: 16 }}
          >
            <Text style={{ opacity: 0.5, fontSize: 14, color: textColor }}>
              v{info.version} ({info.updateId})
            </Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wörter',
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Einstellungen',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
