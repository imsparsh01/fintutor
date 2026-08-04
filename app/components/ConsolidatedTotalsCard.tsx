import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';
import { fetchConsolidated, type ConsolidatedTotals } from '../lib/consolidated';

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

// D-065: three separate family totals, not one signed net-worth figure — see BQ-018's
// write-up for why (FD/RD has no accrued-value field to make a subtraction meaningful).
export function ConsolidatedTotalsCard({ userId }: { userId: string | null }) {
  const [totals, setTotals] = useState<ConsolidatedTotals | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setError(null);
    fetchConsolidated(userId)
      .then(setTotals)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load totals'));
  }, [userId]);

  if (!userId) return null;

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Couldn't load totals — {error}</Text>
      </View>
    );
  }

  if (totals === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Investments</Text>
        <Text style={styles.value}>{formatRupees(totals.investments_total)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Loans</Text>
        <Text style={styles.value}>{formatRupees(totals.loans_total)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Insurance (cash value)</Text>
        <Text style={styles.value}>{formatRupees(totals.insurance_total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  label: { fontSize: 14, color: colors.textSecondary },
  value: { fontSize: 14, fontWeight: '600', color: colors.text },
  errorText: { color: colors.danger, textAlign: 'center' },
});
