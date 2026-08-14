import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, font, spacing } from '../design/tokens';
import { typography } from '../design/typography';
import { fetchConsolidated, type ConsolidatedTotals } from '../lib/consolidated';
import { formatRupees } from '../lib/format';

// D-065: three separate family totals, not one signed net-worth figure — see BQ-018's
// write-up for why (FD/RD has no accrued-value field to make a subtraction meaningful).
export function ConsolidatedTotalsCard({ userId }: { userId: string | null }) {
  const [totals, setTotals] = useState<ConsolidatedTotals | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 2A: was useEffect(..., [userId]) — the Consolidated screen never unmounts in the
  // bottom-tab navigator, so that effect never re-ran after the initial mount. Adding a
  // holding on another tab and returning here left the total stale for the rest of the
  // session. useFocusEffect matches the idiom the three list screens already use.
  const load = useCallback(() => {
    if (!userId) return;
    setError(null);
    fetchConsolidated(userId)
      .then(setTotals)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load totals'));
  }, [userId]);

  useFocusEffect(load);

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
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TotalsRow
        label="Investments"
        status={totals.investments_status}
        total={totals.investments_total}
        invalidCount={totals.investments_invalid_value_count}
      />
      <TotalsRow
        label="Loans"
        status={totals.loans_status}
        total={totals.loans_total}
        invalidCount={totals.loans_invalid_value_count}
      />
      <TotalsRow
        label="Insurance (cash value)"
        status={totals.insurance_status}
        total={totals.insurance_total}
        invalidCount={totals.insurance_invalid_value_count}
      />
      {totals.unclassified_holding_count > 0 ? (
        <Text style={styles.metadataText}>
          {countLabel(totals.unclassified_holding_count, 'record needs', 'records need')} classification
        </Text>
      ) : null}
    </View>
  );
}

function TotalsRow({
  label,
  status,
  total,
  invalidCount,
}: {
  label: string;
  status: ConsolidatedTotals['investments_status'];
  total: number;
  invalidCount: number;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLine}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{displayValue(status, total)}</Text>
      </View>
      {invalidCount > 0 ? (
        <Text style={styles.metadataText}>
          {countLabel(invalidCount, 'record has', 'records have')} a value we couldn&apos;t read
        </Text>
      ) : null}
    </View>
  );
}

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function displayValue(status: ConsolidatedTotals['investments_status'], total: number): string {
  if (status === 'empty') return '—';
  if (status === 'unvalued' || status === 'excluded') return 'Not valued yet';
  return formatRupees(total);
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  // Warm-ledger row: label-left/value-right, separated by a hairline rule — not a
  // shadowed card or filled box. Generous vertical rhythm per the visual register.
  row: {
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // P10: these are real financial figures — undecorated, no valence. Label and value
  // both render in font.mono per the ledger register; only weight/color differ.
  label: {
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: font.mono,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: typography.ledgerValue,
  metadataText: {
    marginTop: spacing.sm,
    color: colors.inkSecondary,
    fontFamily: font.ui,
    fontSize: 13,
  },
  errorText: { color: colors.danger, textAlign: 'center', fontFamily: font.ui },
});
