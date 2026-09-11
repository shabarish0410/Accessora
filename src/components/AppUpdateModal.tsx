/**
 * AppUpdateModal.tsx
 *
 * Modal UI for OTA update dialogs:
 *   • "New Update Available" — with Later / Update Now buttons
 *   • "Downloading update…"  — with real progress bar (0–100%)
 *   • "Update Ready"         — with Restart Now button
 *   • Error state            — with a friendly message and Dismiss
 *
 * Receives all state/actions from the useAppUpdate hook via props.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { C } from '../types';
import { UpdateStatus } from '../hooks/useAppUpdate';

interface AppUpdateModalProps {
  status: UpdateStatus;
  downloadProgress: number; // 0–1
  errorMessage: string | null;
  onLater: () => void;
  onUpdateNow: () => Promise<void>;
  onRestart: () => Promise<void>;
  onDismissError: () => void;
}

export function AppUpdateModal({
  status,
  downloadProgress,
  errorMessage,
  onLater,
  onUpdateNow,
  onRestart,
  onDismissError,
}: AppUpdateModalProps) {
  const visible =
    status === 'available' ||
    status === 'downloading' ||
    status === 'downloaded' ||
    status === 'error';

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* ── Available ──────────────────────────────────────────────── */}
          {status === 'available' && (
            <>
              <Text style={styles.icon}>🚀</Text>
              <Text style={styles.title}>New Update Available</Text>
              <Text style={styles.body}>
                A new version of the app is available. Update now for the latest
                features and improvements.
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  onPress={onLater}
                  style={[styles.btn, styles.btnSecondary]}
                  accessibilityLabel="Later"
                >
                  <Text style={styles.btnSecondaryText}>Later</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onUpdateNow}
                  style={[styles.btn, styles.btnPrimary]}
                  accessibilityLabel="Update Now"
                >
                  <Text style={styles.btnPrimaryText}>Update Now</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Downloading ────────────────────────────────────────────── */}
          {status === 'downloading' && (
            <>
              <ActivityIndicator size="large" color={C.primary} style={{ marginBottom: 16 }} />
              <Text style={styles.title}>Downloading Update…</Text>
              <Text style={styles.body}>Please keep the app open while we download.</Text>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round(downloadProgress * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {Math.round(downloadProgress * 100)}%
              </Text>
            </>
          )}

          {/* ── Downloaded / Ready ─────────────────────────────────────── */}
          {status === 'downloaded' && (
            <>
              <Text style={styles.icon}>✅</Text>
              <Text style={styles.title}>Update Ready</Text>
              <Text style={styles.body}>
                The latest update has been downloaded. Restart the app to apply it.
              </Text>
              <TouchableOpacity
                onPress={onRestart}
                style={[styles.btn, styles.btnPrimary, styles.btnFull]}
                accessibilityLabel="Restart Now"
              >
                <Text style={styles.btnPrimaryText}>Restart Now</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Error ──────────────────────────────────────────────────── */}
          {status === 'error' && (
            <>
              <Text style={styles.icon}>⚠️</Text>
              <Text style={styles.title}>Update Failed</Text>
              <Text style={styles.body}>
                {errorMessage ??
                  'Unable to download the update. Please check your internet connection and try again.'}
              </Text>
              <TouchableOpacity
                onPress={onDismissError}
                style={[styles.btn, styles.btnSecondary, styles.btnFull]}
                accessibilityLabel="Dismiss"
              >
                <Text style={styles.btnSecondaryText}>Dismiss</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: C.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFull: {
    flex: 0,
    width: '100%',
  },
  btnPrimary: {
    backgroundColor: C.primary,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  btnSecondary: {
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  btnSecondaryText: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: C.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textSecondary,
    marginBottom: 8,
  },
});
