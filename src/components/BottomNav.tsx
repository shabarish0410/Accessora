import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../types';

export function BottomNav({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; icon: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <View style={styles.navContainer}>
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <TouchableOpacity key={t.id} onPress={() => onChange(t.id)} activeOpacity={0.7} style={styles.navItem}>
            <Text style={[styles.navIcon, { opacity: isActive ? 1 : 0.4 }]}>{t.icon}</Text>
            <Text style={[styles.navLabel, { color: isActive ? C.primary : C.textMuted }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: 'row',
    paddingVertical: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  navIcon: {
    fontSize: 22,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
