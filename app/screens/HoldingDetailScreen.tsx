import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HoldingEditModal } from '../components/HoldingEditModal';
import { LoanVsInvestModal } from '../components/LoanVsInvestModal';
import { colors, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { CHARACTERISTICS_SCHEMA } from '../lib/characteristicsSchema';
import { humanizeProductType } from '../lib/taxonomy';
import type { HoldingsStackParamList, MainTabsParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HoldingsStackParamList, 'Detail'>;

// D-067's scope for the loan-vs-invest comparison: Home Loan / Personal Loan only,
// matching backend/app/services/loan_vs_invest.py's own restriction.
const LOAN_VS_INVEST_TYPES = new Set(['home_loan', 'personal_loan']);

// BQ-022: read-only home for teaching content about one specific holding, reached by
// tapping a row in HoldingsList. Full edit/delete/recategorize authority (BQ-027/D-059)
// is one tap deeper via the Edit button, not this screen's own job.
export function HoldingDetailScreen({ route, navigation }: Props) {
  const { holding } = route.params;
  const { userId } = useAuth();
  const [editing, setEditing] = useState(false);
  const [comparing, setComparing] = useState(false);
  const parentNavigation = navigation.getParent<BottomTabNavigationProp<MainTabsParamList>>();

  const fields = CHARACTERISTICS_SCHEMA[holding.product_type] ?? [];
  const filledFields = fields.filter((field) => {
    const value = holding.characteristics[field.key];
    return value !== null && value !== undefined && value !== '';
  });

  const askAboutThis = () => {
    // Alias only, never display_name — /chat sends this question text to the LLM
    // verbatim (D-010: the app must never construct a message carrying a real name).
    parentNavigation?.navigate('Chat', {
      prefillQuestion: `Can you help me understand ${holding.alias} better?`,
    });
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{holding.display_name ?? holding.alias}</Text>
        <Text style={styles.subtitle}>{humanizeProductType(holding.product_type)}</Text>

        <View style={styles.card}>
          {filledFields.length === 0 ? (
            <Text style={styles.emptyText}>No characteristic details recorded yet.</Text>
          ) : (
            filledFields.map((field) => (
              <View key={field.key} style={styles.row}>
                <Text style={styles.rowLabel}>{field.label}</Text>
                <Text style={styles.rowValue}>{String(holding.characteristics[field.key])}</Text>
              </View>
            ))
          )}
        </View>

        <Pressable style={styles.askButton} onPress={askAboutThis}>
          <Text style={styles.askButtonText}>Ask about this</Text>
        </Pressable>

        {LOAN_VS_INVEST_TYPES.has(holding.product_type) && userId && (
          <Pressable style={styles.compareButton} onPress={() => setComparing(true)}>
            <Text style={styles.compareButtonText}>Compare: prepay vs. invest</Text>
          </Pressable>
        )}

        <Pressable style={styles.editButton} onPress={() => setEditing(true)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </ScrollView>

      {editing && (
        <HoldingEditModal
          holding={holding}
          onClose={() => setEditing(false)}
          onChanged={() => {
            setEditing(false);
            navigation.goBack();
          }}
        />
      )}

      {comparing && userId && (
        <LoanVsInvestModal
          userId={userId}
          holdingId={holding.id}
          onClose={() => setComparing(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  title: { fontSize: 20, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: spacing.md,
  },
  emptyText: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  rowLabel: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  askButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  askButtonText: { color: '#fff', fontWeight: '600' },
  compareButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.success,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  compareButtonText: { color: colors.success, fontWeight: '600' },
  editButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  editButtonText: { color: colors.text, fontWeight: '600' },
});
