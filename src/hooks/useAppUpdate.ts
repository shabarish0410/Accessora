/**
 * useAppUpdate.ts
 *
 * Custom hook that wraps Expo's useUpdates() and exposes a simplified
 * state machine for the AppUpdateModal and manual "Check for Updates" UI.
 *
 * States:
 *   idle        – no check performed yet
 *   checking    – checkForUpdateAsync() in flight
 *   available   – update ready to download
 *   downloading – fetchUpdateAsync() in flight
 *   downloaded  – fetch complete, ready to reload
 *   latest      – no update available
 *   error       – something went wrong (app continues normally)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUpdates } from 'expo-updates';
import { checkForUpdate, fetchUpdate, reloadApp } from '../services/updateService';

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'downloaded'
  | 'latest'
  | 'error';

export interface AppUpdateState {
  status: UpdateStatus;
  downloadProgress: number; // 0–1
  errorMessage: string | null;
  checkForAppUpdate: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  applyUpdate: () => Promise<void>;
  dismissError: () => void;
}

export function useAppUpdate(): AppUpdateState {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // useUpdates() gives us isChecking, isDownloading, downloadProgress, etc.
  const { downloadProgress: expoDownloadProgress, isUpdatePending } = useUpdates();

  // downloadProgress is a plain number (0–1) or undefined when not downloading
  const downloadProgress =
    status === 'downloading' ? (expoDownloadProgress ?? 0) : 0;

  // Guard against running OTA checks in development
  const isDev = __DEV__;

  // Avoid running the auto-check more than once per mount
  const autoChecked = useRef(false);

  // ─── Auto-check on startup ──────────────────────────────────────────────
  useEffect(() => {
    if (isDev || autoChecked.current) return;
    autoChecked.current = true;

    (async () => {
      await performCheck();
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── If Expo reports a pending update (e.g. via isUpdatePending), reflect it ─
  useEffect(() => {
    if (isUpdatePending && status !== 'downloaded') {
      setStatus('downloaded');
    }
  }, [isUpdatePending]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Core check logic ───────────────────────────────────────────────────
  const performCheck = useCallback(async () => {
    if (isDev) return;
    setStatus('checking');
    setErrorMessage(null);

    const result = await checkForUpdate();

    if (result === null) {
      // checkForUpdate swallows errors and returns null
      // Treat as "latest" so the app continues normally
      setStatus('latest');
      return;
    }

    if (result.isAvailable) {
      setStatus('available');
    } else {
      setStatus('latest');
    }
  }, [isDev]);

  // ─── Manual trigger (e.g. from Settings "Check for Updates" button) ─────
  const checkForAppUpdate = useCallback(async () => {
    if (status === 'checking' || status === 'downloading') return;
    await performCheck();
  }, [status, performCheck]);

  // ─── Download ────────────────────────────────────────────────────────────
  const downloadUpdate = useCallback(async () => {
    if (status !== 'available') return;
    setStatus('downloading');
    setErrorMessage(null);

    try {
      await fetchUpdate();
      setStatus('downloaded');
    } catch (err: any) {
      const msg =
        err?.message ??
        'Unable to download the update. Please check your internet connection and try again.';
      setErrorMessage(msg);
      setStatus('error');
    }
  }, [status]);

  // ─── Apply (reload) ──────────────────────────────────────────────────────
  const applyUpdate = useCallback(async () => {
    if (status !== 'downloaded') return;
    try {
      await reloadApp();
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to restart the app. Please restart manually.';
      setErrorMessage(msg);
      setStatus('error');
    }
  }, [status]);

  // ─── Dismiss error (return to idle so the user can retry later) ──────────
  const dismissError = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return {
    status,
    downloadProgress,
    errorMessage,
    checkForAppUpdate,
    downloadUpdate,
    applyUpdate,
    dismissError,
  };
}
