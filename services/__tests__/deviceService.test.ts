/* eslint-disable @typescript-eslint/no-require-imports */
type AsyncStorageModule = typeof import('@react-native-async-storage/async-storage').default;
type PlatformModule = { OS: string };

let AsyncStorage: AsyncStorageModule;
let getAndroidId: jest.Mock;
let getIosIdForVendorAsync: jest.Mock;
let Platform: PlatformModule;

jest.mock('expo-application', () => ({
  getAndroidId: jest.fn(),
  getIosIdForVendorAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

describe('deviceService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const expoApplication = require('expo-application');
    getAndroidId = expoApplication.getAndroidId as jest.Mock;
    getIosIdForVendorAsync = expoApplication.getIosIdForVendorAsync as jest.Mock;
    Platform = (require('react-native') as { Platform: PlatformModule }).Platform;
    Platform.OS = 'android';
    await AsyncStorage.clear();
  });

  const loadService = () => {
    let service: typeof import('../deviceService');
    jest.isolateModules(() => {
      service = require('../deviceService');
    });
    return service!;
  };

  it('returns cached ID without re-reading storage', async () => {
    await AsyncStorage.setItem('device_id', 'stored-id');

    const { getDeviceId } = loadService();
    const first = await getDeviceId();

    const second = await getDeviceId();

    expect(first).toBe('stored-id');
    expect(second).toBe('stored-id');
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
  });

  it('generates and stores Android IDs when missing', async () => {
    getAndroidId.mockReturnValue('android-device-id');

    const { getDeviceId } = loadService();
    const id = await getDeviceId();

    expect(id).toBe('android-device-id');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('device_id', 'android-device-id');
  });

  it('uses iOS vendor ID when platform is ios', async () => {
    Platform.OS = 'ios';
    getIosIdForVendorAsync.mockResolvedValueOnce('ios-id');

    const { getDeviceId } = loadService();
    const id = await getDeviceId();

    expect(id).toBe('ios-id');
  });

  it('falls back to generated ID when native calls fail', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-05-10T00:00:00Z'));
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
    getAndroidId.mockImplementation(() => {
      throw new Error('no id');
    });

    const { getDeviceId } = loadService();
    const id = await getDeviceId();

    expect(id).toBe('dev-1715299200000-1f9add3739635f');

    (Math.random as jest.Mock).mockRestore();
    jest.useRealTimers();
  });

  it('falls back to generated ID when iOS native call fails', async () => {
    Platform.OS = 'ios';
    jest.useFakeTimers().setSystemTime(new Date('2024-05-10T00:00:00Z'));
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
    getIosIdForVendorAsync.mockRejectedValue(new Error('iOS error'));

    const { getDeviceId } = loadService();
    const id = await getDeviceId();

    expect(id).toBe('dev-1715299200000-1f9add3739635f');

    (Math.random as jest.Mock).mockRestore();
    jest.useRealTimers();
  });

  it('falls back to generated ID when iOS returns null', async () => {
    Platform.OS = 'ios';
    jest.useFakeTimers().setSystemTime(new Date('2024-05-10T00:00:00Z'));
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
    getIosIdForVendorAsync.mockResolvedValue(null);

    const { getDeviceId } = loadService();
    const id = await getDeviceId();

    expect(id).toBe('dev-1715299200000-1f9add3739635f');

    (Math.random as jest.Mock).mockRestore();
    jest.useRealTimers();
  });

  it('falls back to generated ID when Android returns null', async () => {
    Platform.OS = 'android';
    jest.useFakeTimers().setSystemTime(new Date('2024-05-10T00:00:00Z'));
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
    getAndroidId.mockReturnValue(null);

    const { getDeviceId } = loadService();
    const id = await getDeviceId();

    expect(id).toBe('dev-1715299200000-1f9add3739635f');

    (Math.random as jest.Mock).mockRestore();
    jest.useRealTimers();
  });

  it('falls back to generated ID on unknown platform', async () => {
    Platform.OS = 'web';
    jest.useFakeTimers().setSystemTime(new Date('2024-05-10T00:00:00Z'));
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);

    const { getDeviceId } = loadService();
    const id = await getDeviceId();

    expect(id).toBe('dev-1715299200000-1f9add3739635f');

    (Math.random as jest.Mock).mockRestore();
    jest.useRealTimers();
  });

  it('handles AsyncStorage.getItem error gracefully', async () => {
    getAndroidId.mockReturnValue('android-id');
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getDeviceId } = loadService();
    const id = await getDeviceId();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to read device ID from storage:',
      expect.any(Error)
    );
    expect(id).toBe('android-id');

    consoleSpy.mockRestore();
  });

  it('handles AsyncStorage.setItem error gracefully', async () => {
    getAndroidId.mockReturnValue('android-id');
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getDeviceId } = loadService();
    const id = await getDeviceId();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to persist device ID:', expect.any(Error));
    // Should still return the ID even if storage fails
    expect(id).toBe('android-id');

    consoleSpy.mockRestore();
  });
});
