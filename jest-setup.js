// Mock the useColorScheme hook to avoid async issues in tests
jest.mock('@/components/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));
