import Constants from 'expo-constants';

import { getUpdateInfo, getUpdateMessage } from '../updateService';

type MockUpdates = {
  manifest: unknown;
  updateId?: string;
  channel?: string;
  createdAt?: Date;
};

const mockUpdates: MockUpdates = {
  manifest: {},
  updateId: undefined,
  channel: undefined,
  createdAt: undefined,
};

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.0.0' } },
}));

jest.mock('expo-updates', () => ({
  __esModule: true,
  get manifest() {
    return mockUpdates.manifest;
  },
  get updateId() {
    return mockUpdates.updateId;
  },
  get channel() {
    return mockUpdates.channel;
  },
  get createdAt() {
    return mockUpdates.createdAt;
  },
}));

describe('updateService', () => {
  beforeEach(() => {
    mockUpdates.manifest = {};
    mockUpdates.updateId = undefined;
    mockUpdates.channel = undefined;
    mockUpdates.createdAt = undefined;
  });

  it('prefers nested update message from manifest', () => {
    mockUpdates.manifest = {
      extra: { expoClient: { extra: { updateMessage: 'Deep message' } } },
    };

    const message = getUpdateMessage();

    expect(message).toBe('Deep message');
  });

  it('falls back to top-level message when no nested message exists', () => {
    mockUpdates.manifest = { message: 'Top level message' };

    const message = getUpdateMessage();

    expect(message).toBe('Top level message');
  });

  it('returns complete update info with defaults applied', () => {
    mockUpdates.manifest = { extra: { updateMessage: 'Info message' } };
    mockUpdates.updateId = 'abcdef123456';
    mockUpdates.channel = 'production';
    mockUpdates.createdAt = {
      toLocaleDateString: jest.fn().mockReturnValue('02.01.2024, 10:30'),
    } as unknown as Date;

    const info = getUpdateInfo();

    expect(info).toEqual({
      version: (Constants as any).expoConfig.version,
      updateId: 'abcdef1',
      fullUpdateId: 'abcdef123456',
      channel: 'production',
      createdAt: '02.01.2024, 10:30',
      message: 'Info message',
    });
  });
});
