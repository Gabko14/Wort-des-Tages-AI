import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function useDailyRefresh(onNewDay: () => void): void {
  const lastLoadedDate = useRef<string>(getTodayDateString());
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const today = getTodayDateString();
        if (today !== lastLoadedDate.current) {
          lastLoadedDate.current = today;
          onNewDay();
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [onNewDay]);
}
