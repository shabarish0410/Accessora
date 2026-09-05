import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Visitor, C } from '../types';
import { BackBar, SectionHead } from './Atoms';
import { VisitorRow } from './VisitorRow';

export function LeavingScreen({
  visitors,
  onExit,
  onBack,
  onViewDetail,
}: {
  visitors: Visitor[];
  onExit: (id: string | number) => void;
  onBack: () => void;
  onViewDetail: (id: string | number) => void;
}) {
  const inside = visitors.filter((v) => v.status === 'accepted');

  return (
    <View style={styles.container}>
      <BackBar title="Visitor Leaving" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {inside.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚪</Text>
            <Text style={styles.emptyText}>No visitors inside right now</Text>
          </View>
        ) : (
          <View>
            <SectionHead label={`${inside.length} visitor${inside.length > 1 ? 's' : ''} currently inside`} />
            <View style={styles.list}>
              {inside.map((v) => (
                <VisitorRow key={v.id} visitor={v} onPress={() => onViewDetail(v.id)} onExit={() => onExit(v.id)} />
              ))}
            </View>
          </View>
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyText: {
    fontWeight: '700',
    fontSize: 16,
    color: C.textSecondary,
  },
  list: {
    gap: 12,
  },
});
