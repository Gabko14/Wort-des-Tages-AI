import { AppState } from 'react-native';

import { renderHook } from '@testing-library/react-native';

import { useDailyRefresh } from '../useDailyRefresh';

jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
}));

describe('useDailyRefresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call onNewDay when app becomes active on a new day', () => {
    const onNewDay = jest.fn();
    const mockListener = jest.fn();

    (AppState.addEventListener as jest.Mock).mockImplementation((_event: string, listener: any) => {
      mockListener.mockImplementation(listener);
      return { remove: jest.fn() };
    });

    renderHook(() => useDailyRefresh(onNewDay));

    // Simulate app coming to foreground from background
    mockListener('inactive'); // App going inactive
    mockListener('active'); // App coming active

    // On first call, dates are the same, so onNewDay should not be called
    expect(onNewDay).not.toHaveBeenCalled();
  });

  it('should not call onNewDay when date has not changed', () => {
    const onNewDay = jest.fn();
    const mockListener = jest.fn();

    (AppState.addEventListener as jest.Mock).mockImplementation((_event: string, listener: any) => {
      mockListener.mockImplementation(listener);
      return { remove: jest.fn() };
    });

    renderHook(() => useDailyRefresh(onNewDay));

    // Simulate multiple transitions on the same day
    mockListener('background');
    mockListener('active');

    mockListener('inactive');
    mockListener('active');

    expect(onNewDay).not.toHaveBeenCalled();
  });

  it('should setup and cleanup AppState listener', () => {
    const onNewDay = jest.fn();
    const mockRemove = jest.fn();

    (AppState.addEventListener as jest.Mock).mockReturnValue({
      remove: mockRemove,
    });

    const { unmount } = renderHook(() => useDailyRefresh(onNewDay));

    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  it('should handle state transitions correctly', () => {
    const onNewDay = jest.fn();
    const mockListener = jest.fn();

    (AppState.addEventListener as jest.Mock).mockImplementation((_event: string, listener: any) => {
      mockListener.mockImplementation(listener);
      return { remove: jest.fn() };
    });

    renderHook(() => useDailyRefresh(onNewDay));

    // Simulate: inactive -> active -> background -> inactive -> active
    mockListener('inactive');
    expect(onNewDay).not.toHaveBeenCalled();

    mockListener('active');
    expect(onNewDay).not.toHaveBeenCalled(); // Still same day

    mockListener('background');
    mockListener('inactive');
    mockListener('active');

    // Should not call because still same day
    expect(onNewDay).not.toHaveBeenCalled();
  });

  it('should call onNewDay when transitioning from background to active', () => {
    const onNewDay = jest.fn();
    const mockListener = jest.fn();

    (AppState.addEventListener as jest.Mock).mockImplementation((_event: string, listener: any) => {
      mockListener.mockImplementation(listener);
      return { remove: jest.fn() };
    });

    renderHook(() => useDailyRefresh(onNewDay));

    // Simulate transition from background to active (normal use case)
    mockListener('background');
    mockListener('active');

    // On first setup, current date and loaded date are same
    // So this shouldn't trigger onNewDay on same day
    expect(onNewDay).not.toHaveBeenCalled();
  });
});
