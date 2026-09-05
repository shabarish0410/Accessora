import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SignedImage } from './SignedImage';
import { Visitor, C, fmtTime, fmtDuration } from '../types';
import { BackBar, PurposePill, StatusPill } from './Atoms';

export function VisitorDetail({
  visitor,
  onBack,
  onExit,
  onDecide,
}: {
  visitor: Visitor;
  onBack: () => void;
  onExit?: () => void;
  onDecide?: (d: 'accepted' | 'waiting' | 'rejected') => void;
}) {
  const infoRows = [
    { icon: '📱', label: 'Mobile', val: visitor.mobile },
    { icon: '🏢', label: 'From', val: visitor.origin },
    { icon: '🕐', label: 'Arrived', val: fmtTime(visitor.arrivalTime) },
    ...(visitor.departureTime
      ? [{ icon: '🚪', label: 'Departed', val: `${fmtTime(visitor.departureTime)} (${fmtDuration(visitor.arrivalTime, visitor.departureTime)})` }]
      : []),
    ...(visitor.decidedBy ? [{ icon: '✍️', label: 'Decided by', val: visitor.decidedBy }] : []),
  ];

  return (
    <View style={styles.container}>
      <BackBar title="Visitor Details" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Photo + Identity */}
        <View style={styles.card}>
          <SignedImage path={visitor.photoUrl} style={styles.photo} />
          <View style={styles.cardBody}>
            <View style={styles.headerRow}>
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{visitor.name}</Text>
                <Text style={styles.origin}>{visitor.origin}</Text>
              </View>
              <Text style={styles.tempId}>#{visitor.tempId}</Text>
            </View>
            <View style={styles.pillRow}>
              <PurposePill purpose={visitor.purpose} />
              <StatusPill status={visitor.status} />
            </View>
          </View>
        </View>

        {/* Info Rows */}
        <View style={styles.infoCard}>
          {infoRows.map((row, i) => (
            <View key={row.label} style={[styles.infoRow, i < infoRows.length - 1 && styles.infoRowBorder]}>
              <Text style={styles.infoIcon}>{row.icon}</Text>
              <View>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoVal}>{row.val}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Chairman Decision Buttons */}
        {onDecide && visitor.status === 'pending' && (
          <View style={styles.decisionRow}>
            {([
              { d: 'accepted', icon: '✓', label: 'Allow', color: C.success },
              { d: 'waiting', icon: '⏸', label: 'Hold', color: C.warning },
              { d: 'rejected', icon: '✕', label: 'Deny', color: C.error },
            ] as const).map((btn) => (
              <TouchableOpacity
                key={btn.d}
                onPress={() => onDecide(btn.d)}
                style={[styles.decisionBtn, { backgroundColor: `${btn.color}15`, borderColor: btn.color }]}
              >
                <Text style={styles.decisionIcon}>{btn.icon}</Text>
                <Text style={[styles.decisionLabel, { color: btn.color }]}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Exit Button */}
        {visitor.status === 'accepted' && onExit && (
          <TouchableOpacity onPress={onExit} style={styles.fullExitBtn}>
            <Text style={styles.fullExitBtnText}>↩ Mark as Exited</Text>
          </TouchableOpacity>
        )}
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
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 3,
    shadowColor: C.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  photo: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  cardBody: {
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontWeight: '900',
    fontSize: 22,
    color: C.textPrimary,
  },
  origin: {
    color: C.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  tempId: {
    fontWeight: '900',
    fontSize: 22,
    color: C.primary,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  infoCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoLabel: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 15,
    color: C.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  decisionBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  decisionIcon: {
    fontSize: 26,
  },
  decisionLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  fullExitBtn: {
    width: '100%',
    backgroundColor: C.primaryDark,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullExitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
