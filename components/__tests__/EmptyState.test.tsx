import { fireEvent, render, screen } from '@testing-library/react-native';

import { EmptyState } from '../EmptyState';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('EmptyState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render default message', () => {
    render(<EmptyState />);

    expect(screen.getByText('Keine Wörter verfügbar')).toBeTruthy();
    expect(
      screen.getByText(
        'Keine Wörter für heute gefunden. Überprüfe deine Einstellungen, um Wörter zu aktivieren.'
      )
    ).toBeTruthy();
  });

  it('should render custom message', () => {
    render(<EmptyState message="Custom empty message" />);

    expect(screen.getByText('Custom empty message')).toBeTruthy();
  });

  it('should render settings button', () => {
    render(<EmptyState />);

    expect(screen.getByLabelText('Zu den Einstellungen')).toBeTruthy();
  });

  it('should navigate to settings when button is pressed', () => {
    const { router } = require('expo-router');
    render(<EmptyState />);

    const button = screen.getByLabelText('Zu den Einstellungen');
    fireEvent.press(button);

    expect(router.push).toHaveBeenCalledWith('/(tabs)/two');
    expect(router.push).toHaveBeenCalledTimes(1);
  });

  it('should render empty icon', () => {
    const { UNSAFE_getAllByType } = render(<EmptyState />);

    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });
});
