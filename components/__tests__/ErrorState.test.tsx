import { fireEvent, render, screen } from '@testing-library/react-native';

import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('should render error message', () => {
    render(<ErrorState message="Test error message" onRetry={jest.fn()} />);

    expect(screen.getByText('Ein Fehler ist aufgetreten')).toBeTruthy();
    expect(screen.getByText('Test error message')).toBeTruthy();
  });

  it('should render retry button', () => {
    render(<ErrorState message="Test error" onRetry={jest.fn()} />);

    expect(screen.getByLabelText('Erneut versuchen')).toBeTruthy();
  });

  it('should call onRetry when button is pressed', () => {
    const onRetry = jest.fn();
    render(<ErrorState message="Test error" onRetry={onRetry} />);

    const button = screen.getByLabelText('Erneut versuchen');
    fireEvent.press(button);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should render error icon', () => {
    const { UNSAFE_getAllByType } = render(<ErrorState message="Test error" onRetry={jest.fn()} />);

    // Check that Ionicons are rendered (error icon + button icon)
    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });
});
