/**
 * updateService.ts
 *
 * Thin wrappers around expo-updates APIs.
 * All functions are safe to call in any state — they never throw to the caller.
 * All OTA operations are a no-op when running in development mode (__DEV__).
 */

import * as Updates from 'expo-updates';

export interface UpdateInfo {
  channel: string | null;
  updateId: string | null;
  runtimeVersion: string | null;
  isEmbeddedLaunch: boolean;
}

/**
 * Check whether a new compatible update is available from the EAS Update server.
 * Returns `null` when called in development mode or on error.
 */
export async function checkForUpdate(): Promise<Updates.UpdateCheckResult | null> {
  if (__DEV__) return null;
  try {
    const result = await Updates.checkForUpdateAsync();
    return result;
  } catch (error) {
    console.warn('[updateService] checkForUpdate error:', error);
    return null;
  }
}

/**
 * Download the available update from EAS Update.
 * Must only be called after `checkForUpdate()` returned `isAvailable: true`.
 * Re-throws so the hook can capture the error message.
 */
export async function fetchUpdate(): Promise<Updates.UpdateFetchResult | null> {
  if (__DEV__) return null;
  try {
    const result = await Updates.fetchUpdateAsync();
    return result;
  } catch (error) {
    console.warn('[updateService] fetchUpdate error:', error);
    throw error;
  }
}

/**
 * Reload the application to apply the downloaded update.
 * This is a no-op in development mode.
 */
export async function reloadApp(): Promise<void> {
  if (__DEV__) {
    console.warn('[updateService] reloadApp is a no-op in development mode');
    return;
  }
  try {
    await Updates.reloadAsync();
  } catch (error) {
    console.warn('[updateService] reloadApp error:', error);
    throw error;
  }
}

/**
 * Returns metadata about the current running update.
 * Uses the correct Expo SDK 57 field names (isEmbeddedLaunch, not isEmbedded).
 */
export function getUpdateInfo(): UpdateInfo {
  return {
    channel: Updates.channel ?? null,
    updateId: Updates.updateId ?? null,
    runtimeVersion: Updates.runtimeVersion ?? null,
    isEmbeddedLaunch: Updates.isEmbeddedLaunch,
  };
}
