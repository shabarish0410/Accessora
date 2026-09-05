import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SignedImage } from './SignedImage';
import { Visitor, STATUS, C, fmtTime } from '../types';
import { PurposePill, WaitBadge } from './Atoms';

export function VisitorRow({ visitor, onPress, onExit }: { visitor: Visitor; onPress: () => void; onExit?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.avatarContainer}>
        <SignedImage path={visitor.photoUrl} style={styles.avatar} />
        <Text style={[styles.statusBadge, { backgroundColor: STATUS[visitor.status].color }]}>
          {STATUS[visitor.status].icon}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {visitor.name}
        </Text>
        <View style={styles.pillRow}>
          <PurposePill purpose={visitor.purpose} />
          {visitor.status === 'pending' && <WaitBadge arrivalTime={visitor.arrivalTime} />}
        </View>
        <Text style={styles.metaText}>
          {fmtTime(visitor.arrivalTime)} · #{visitor.tempId}
        </Text>
      </View>

      {visitor.status === 'accepted' && onExit && (
        <TouchableOpacity
          onPress={onExit}
          style={styles.exitBtn}
        >
          <Text style={styles.exitBtnText}>↩ Exit</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: C.border,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    color: '#fff',
    borderRadius: 6,
    paddingVertical: 1,
    paddingHorizontal: 5,
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
    fontSize: 15,
    color: C.textPrimary,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 4,
  },
  exitBtn: {
    backgroundColor: C.primaryDark,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  exitBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
