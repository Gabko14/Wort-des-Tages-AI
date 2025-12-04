import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

/**
 * Get the update message from the Expo manifest.
 * Supports multiple manifest structures used by different Expo SDK versions.
 */
export function getUpdateMessage(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const manifest = Updates.manifest as any;
  return (
    manifest?.extra?.expoClient?.extra?.updateMessage ??
    manifest?.extra?.updateMessage ??
    manifest?.message ??
    'Keine Nachricht'
  );
}

/**
 * Get comprehensive update information about the app.
 */
export function getUpdateInfo() {
  const version = Constants.expoConfig?.version ?? '?';
  const updateId = Updates.updateId?.slice(0, 7) ?? 'dev';
  const fullUpdateId = Updates.updateId ?? 'development';
  const channel = Updates.channel ?? 'development';
  const createdAt = Updates.createdAt
    ? Updates.createdAt.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';
  const message = getUpdateMessage();

  return { version, updateId, fullUpdateId, channel, createdAt, message };
}
