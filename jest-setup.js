// Suppress act() warnings from @expo/vector-icons (library internal async font loading)
const originalError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('An update to Icon inside a test was not wrapped in act') ||
      message.includes('wrap-tests-with-act'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock the useColorScheme hook to avoid async issues in tests
jest.mock('@/components/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

// Mock AsyncStorage with a default export for compatibility with default imports
const mockAsyncStorage = require('@react-native-async-storage/async-storage/jest/async-storage-mock');

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  ...mockAsyncStorage,
  default: mockAsyncStorage,
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  AndroidImportance: {
    HIGH: 4,
  },
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
  },
}));
