import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HoldingEditModal } from './HoldingEditModal';
import { useAuth } from '../lib/AuthContext';
import { fetchHoldings, type Holding } from '../lib/holdings';
import { humanizeProductType } from '../lib/taxonomy';
import type { HoldingsStackParamList } from '../navigation/types';
import { colors, font, spacing } from '../design/tokens';

// List view (BQ-019). Tapping a row navigates to the detail screen (BQ-022) — full
// edit/delete/recategorize authority (BQ-027/D-059) lives there now, one tap deeper,
// reached via its own "Edit" button rather than directly from this list.
// D-074: "+ Add" opens HoldingEditModal in create mode (null holding), scoped to this
// screen's familyTypes — the manual fallback path D-012 named but never built.
export function HoldingsList({
  title,
  familyTypes,
  addLabel,
  emptyHint,
}: {
  title: string;
  familyTypes: string[];
  addLabel: string;
  emptyHint: string;
}) {
  const { userId } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<HoldingsStackParamList>>();
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => {
    if (!userId) return;
    setError(null);
    fetchHoldings(userId)
      .then((all) => setHoldings(all.filter((h) => familyTypes.includes(h.product_type))))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load holdings'));
  }, [userId, familyTypes]);

  // Reloads whenever this list regains focus — covers returning from Detail after an
  // edit/delete, without needing a callback threaded back through navigation params.
  useFocusEffect(load);

  const addButton = userId && (
    <Pressable style={styles.addButton} onPress={() => setAdding(true)}>
      <Text style={styles.addButtonText}>{addLabel}</Text>
    </Pressable>
  );

  const modal = adding && (
    <HoldingEditModal
      holding={null}
      familyTypes={familyTypes}
      onClose={() => setAdding(false)}
      onChanged={load}
    />
  );

  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>Signed out — no holdings to show.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.errorText}>Couldn't load holdings — {error}</Text>
        {addButton}
        {modal}
      </View>
    );
  }

  if (holdings === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <ActivityIndicator />
      </View>
    );
  }

  if (holdings.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{emptyHint}</Text>
        {addButton}
        {modal}
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={holdings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('Detail', { holding: item })}>
            <Text style={styles.rowTitle}>{item.display_name ?? item.alias}</Text>
            <Text style={styles.rowSubtitle}>{humanizeProductType(item.product_type)}</Text>
          </Pressable>
        )}
      />
      {addButton}
      {modal}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.screen },
  listContainer: { flex: 1, backgroundColor: colors.screen, paddingTop: spacing.lg },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.ink,
    fontFamily: font.ui,
  },
  body: { color: colors.inkSecondary, paddingHorizontal: spacing.xl, textAlign: 'center', fontFamily: font.ui },
  errorText: { color: colors.danger, paddingHorizontal: spacing.xl, textAlign: 'center', fontFamily: font.ui },
  // Ledger row: hairline-separated, no card, no fill, no shadow.
  row: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowTitle: { fontSize: 16, fontWeight: '500', color: colors.ink, fontFamily: font.ui },
  rowSubtitle: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
    fontFamily: font.mono,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: { paddingVertical: spacing.md, alignItems: 'center' },
  addButtonText: { color: colors.tutor, fontWeight: '600', fontSize: 14, fontFamily: font.ui },
});
