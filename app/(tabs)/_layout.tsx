import React, { useCallback, useMemo } from 'react';

import { Alert, Text, TouchableOpacity } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { getUpdateInfo } from '@/services/updateService';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? 'light'].text;
  const info = useMemo(() => getUpdateInfo(), []);

  const showUpdateDetails = useCallback(() => {
    Alert.alert(
      'App-Info',
      `Version: ${info.version}\n` +
        `Update-ID: ${info.fullUpdateId}\n` +
        `Channel: ${info.channel}\n` +
        `Erstellt: ${info.createdAt}\n` +
        `Nachricht: ${info.message}`,
      [{ text: 'OK' }]
    );
  }, [info]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
        headerRight: () => (
          <TouchableOpacity onPress={showUpdateDetails} style={{ marginRight: 16 }}>
            <Text style={{ opacity: 0.5, fontSize: 14, color: textColor }}>v{info.version}</Text>
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
