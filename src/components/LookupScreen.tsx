import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Visitor, C, fmtTime } from '../types';
import { BackBar, PurposePill, StatusPill } from './Atoms';
import { SignedImage } from './SignedImage';

export function LookupScreen({
  visitors,
  onExit,
  onBack,
}: {
  visitors: Visitor[];
  onExit: (id: string | number) => void;
  onBack: () => void;
}) {
  const [digits, setDigits] = useState('');
  const result = digits.length === 4 ? visitors.find((v) => v.tempId === digits) : undefined;
  const notFound = digits.length === 4 && !result;

  return (
    <View style={styles.container}>
      <BackBar title="Check Visitor ID" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🔍</Text>
          <Text style={styles.headerSub}>Enter the 4-digit visitor pass ID</Text>
        </View>

        <View style={[styles.displayBox, { borderColor: digits.length === 4 ? (result ? C.success : C.error) : C.border }]}>
          <View style={styles.digitRow}>
            {digits.padEnd(4, '·').split('').map((ch, i) => (
              <Text key={i} style={[styles.digitChar, { opacity: i < digits.length ? 1 : 0.25 }]}>
                {ch}
              </Text>
            ))}
          </View>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <SignedImage path={result.photoUrl} style={styles.resultPhoto} />
            <View style={styles.resultBody}>
              <Text style={styles.resultName}>{result.name}</Text>
              <View style={styles.pillRow}>
                <PurposePill purpose={result.purpose} />
                <StatusPill status={result.status} />
              </View>
              <Text style={styles.resultMeta}>
                Arrived {fmtTime(result.arrivalTime)} · From {result.origin}
              </Text>
              {result.status === 'accepted' && (
                <TouchableOpacity onPress={() => onExit(result.id)} style={styles.exitBtn}>
                  <Text style={styles.exitBtnText}>↩ Mark Exit</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {notFound && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.errorTitle}>ID Not Found</Text>
            <Text style={styles.errorSub}>No visitor with pass #{digits} today</Text>
          </View>
        )}

        <View style={styles.keypadGrid}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                if (k === '⌫') setDigits((d) => d.slice(0, -1));
                else if (k && digits.length < 4) setDigits((d) => d + k);
              }}
              disabled={!k}
              style={[
                styles.keypadBtn,
                { backgroundColor: k === '⌫' ? `${C.error}15` : C.surface, opacity: k ? 1 : 0 },
              ]}
            >
              <Text style={[styles.keypadText, { color: k === '⌫' ? C.error : C.textPrimary }]}>{k}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerSub: {
    color: C.textSecondary,
    fontSize: 14,
  },
  displayBox: {
    backgroundColor: C.surface,
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  digitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  digitChar: {
    fontSize: 40,
    fontWeight: '900',
    color: C.textPrimary,
  },
  resultCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: C.success,
  },
  resultPhoto: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  resultBody: {
    padding: 16,
  },
  resultName: {
    fontWeight: '800',
    fontSize: 18,
    color: C.textPrimary,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  resultMeta: {
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 12,
  },
  exitBtn: {
    backgroundColor: C.primaryDark,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  exitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  errorCard: {
    backgroundColor: `${C.error}12`,
    borderWidth: 1,
    borderColor: C.error,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  errorTitle: {
    fontWeight: '800',
    color: C.error,
    fontSize: 15,
  },
  errorSub: {
    color: C.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  keypadBtn: {
    width: '30%',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  keypadText: {
    fontSize: 22,
    fontWeight: '700',
  },
});
