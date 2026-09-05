import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Purpose, VStatus, PURPOSE, STATUS, C, minsAgo } from '../types';

export function PurposePill({ purpose }: { purpose: Purpose }) {
  const p = PURPOSE[purpose];
  return (
    <View style={[styles.pill, { backgroundColor: p.bg }]}>
      <Text style={[styles.pillText, { color: p.color }]}>
        {p.icon} {p.label}
      </Text>
    </View>
  );
}

export function StatusPill({ status }: { status: VStatus }) {
  const s = STATUS[status];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.pillText, { color: s.color }]}>
        {s.icon} {s.label}
      </Text>
    </View>
  );
}

export function WaitBadge({ arrivalTime }: { arrivalTime: Date }) {
  const m = minsAgo(arrivalTime);
  const color = m < 10 ? C.success : m < 30 ? C.warning : C.error;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}18` }]}>
      <Text style={[styles.badgeText, { color }]}>{m}m wait</Text>
    </View>
  );
}

export function BackBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.backBar}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.backTitle}>{title}</Text>
    </View>
  );
}

export function SectionHead({ label }: { label: string }) {
  return <Text style={styles.sectionHead}>{label}</Text>;
}

export function BigBtn({ label, color, disabled, onClick }: { label: string; color: string; disabled: boolean; onClick: () => void }) {
  return (
    <TouchableOpacity
      onPress={onClick}
      disabled={disabled}
      style={[
        styles.bigBtn,
        { backgroundColor: disabled ? C.border : color }
      ]}
    >
      <Text style={[styles.bigBtnText, { color: disabled ? C.textMuted : color === C.accent ? '#fff' : C.textPrimary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[styles.toggleTrack, { backgroundColor: on ? C.primary : C.border }]}
    >
      <View style={[styles.toggleThumb, { left: on ? 22 : 3 }]} />
    </TouchableOpacity>
  );
}

export function SettingsCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.settingsCardContainer}>
      <Text style={styles.settingsCardTitle}>{title}</Text>
      <View style={styles.settingsCardBody}>{children}</View>
    </View>
  );
}

export function SettingsRow({ label, right, last }: { label: string; right: ReactNode; last?: boolean }) {
  return (
    <View style={[styles.settingsRow, !last && styles.settingsRowBorder]}>
      <Text style={styles.settingsRowLabel}>{label}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 7,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  backBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: C.background,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 18,
    color: C.textPrimary,
  },
  backTitle: {
    fontWeight: '700',
    fontSize: 17,
    color: C.textPrimary,
  },
  sectionHead: {
    fontWeight: '800',
    fontSize: 12,
    color: C.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  bigBtn: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  toggleTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    position: 'absolute',
    top: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  settingsCardContainer: {
    marginBottom: 16,
  },
  settingsCardTitle: {
    fontWeight: '700',
    fontSize: 11,
    color: C.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  settingsCardBody: {
    backgroundColor: C.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
  },
  settingsRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  settingsRowLabel: {
    fontSize: 15,
    color: C.textPrimary,
    fontWeight: '600',
  },
});
