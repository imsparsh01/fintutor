import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { HoldingEditModal } from './HoldingEditModal';
import { useAuth } from '../lib/AuthContext';
import { fetchHoldings, type Holding } from '../lib/holdings';
import { humanizeProductType } from '../lib/taxonomy';

// List view (BQ-019) with tap-to-edit/delete/recategorize (BQ-027/D-059).
export function HoldingsList({
  title,
  familyTypes,
  emptyHint,
}: {
  title: string;
  familyTypes: string[];
  emptyHint: string;
}) {
  const { userId } = useAuth();
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Holding | null>(null);

  const load = useCallback(() => {
    if (!userId) return;
    setError(null);
    fetchHoldings(userId)
      .then((all) => setHoldings(all.filter((h) => familyTypes.includes(h.product_type))))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load holdings'));
  }, [userId, familyTypes]);

  useEffect(() => {
    load();
  }, [load]);

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
          <Pressable style={styles.row} onPress={() => setSelected(item)}>
            <Text style={styles.rowTitle}>{item.display_name ?? item.alias}</Text>
            <Text style={styles.rowSubtitle}>{humanizeProductType(item.product_type)}</Text>
          </Pressable>
        )}
      />
      {selected && (
        <HoldingEditModal
          holding={selected}
          onClose={() => setSelected(null)}
          onChanged={load}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  listContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  body: { color: '#666', paddingHorizontal: 24, textAlign: 'center' },
  errorText: { color: '#c00', paddingHorizontal: 24, textAlign: 'center' },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  rowTitle: { fontSize: 16, fontWeight: '500' },
  rowSubtitle: { fontSize: 13, color: '#888', marginTop: 2 },
});
