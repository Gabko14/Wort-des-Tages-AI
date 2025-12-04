import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  ThemeMode,
} from '@/services/settingsService';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  colorScheme: 'light' | 'dark';
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  setThemeMode: async () => {},
  colorScheme: 'light',
  isLoading: true,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useNativeColorScheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded);
      setIsLoading(false);
    });
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    const newSettings = { ...settings, themeMode: mode };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const colorScheme =
    settings.themeMode === 'system'
      ? systemColorScheme ?? 'light'
      : settings.themeMode;

  return (
    <ThemeContext.Provider
      value={{
        themeMode: settings.themeMode,
        setThemeMode,
        colorScheme,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
