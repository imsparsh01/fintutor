import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EsopExerciseCostModal } from '../components/EsopExerciseCostModal';
import { HoldingEditModal } from '../components/HoldingEditModal';
import { LoanVsInvestModal } from '../components/LoanVsInvestModal';
import { TeachingBlock } from '../components/TeachingBlock';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { CHARACTERISTICS_SCHEMA } from '../lib/characteristicsSchema';
import { humanizeProductType } from '../lib/taxonomy';
import type { HoldingsStackParamList, MainTabsParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HoldingsStackParamList, 'Detail'>;

// D-067's scope for the loan-vs-invest comparison: Home Loan / Personal Loan only,
// matching backend/app/services/loan_vs_invest.py's own restriction.
const LOAN_VS_INVEST_TYPES = new Set(['home_loan', 'personal_loan']);

// D-091: the "what we won't say" block goes wherever a verdict is the natural next
// thought. In the current taxonomy (lib/taxonomy.ts) that's specifically the mixed
// protection-and-savings insurance type — a term policy or a loan doesn't carry the
// same keep/surrender/paid-up fork. Scoped narrowly on purpose rather than shown for
// every product type, per D-091's "name the SPECIFIC verdict" requirement.
const WHAT_WE_WONT_SAY_TYPES = new Set(['endowment_ulip']);

// BQ-022: read-only home for teaching content about one specific holding, reached by
// tapping a row in HoldingsList. Full edit/delete/recategorize authority (BQ-027/D-059)
// is one tap deeper via the Edit button, not this screen's own job.
export function HoldingDetailScreen({ route, navigation }: Props) {
  const { holding } = route.params;
  const { userId } = useAuth();
  const [editing, setEditing] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [checkingExerciseCost, setCheckingExerciseCost] = useState(false);
  const parentNavigation = navigation.getParent<BottomTabNavigationProp<MainTabsParamList>>();

  // D-069/BRIEF-015's scope: ESOP options only, not RSU (no exercise decision for RSUs).
  const isEsopOptions =
    holding.product_type === 'esop' && holding.characteristics.grant_type === 'options';

  const showWontSayBlock = WHAT_WE_WONT_SAY_TYPES.has(holding.product_type);

  const fields = CHARACTERISTICS_SCHEMA[holding.product_type] ?? [];
  const filledFields = fields.filter((field) => {
    const value = holding.characteristics[field.key];
    return value !== null && value !== undefined && value !== '';
  });

  const askAboutThis = () => {
    // Alias only, never display_name — /chat sends this question text to the LLM
    // verbatim (D-010: the app must never construct a message carrying a real name).
    // deepenAlias (D-071): this screen knows the holding with certainty (no inference),
    // so the backend can set `deepen` deterministically instead of leaving it absent.
    parentNavigation?.navigate('Chat', {
      prefillQuestion: `Can you help me understand ${holding.alias} better?`,
      deepenAlias: holding.alias,
    });
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.title}>{holding.display_name ?? holding.alias}</Text>
        <Text style={styles.subtitle}>{humanizeProductType(holding.product_type)}</Text>

        <View>
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

        {showWontSayBlock && (
          <TeachingBlock heading="What we won't say" style={styles.teachingBlockWrap}>
            Whether to keep it, surrender it, or make it paid-up. We'll show what each of those does to
            your numbers, in the same detail, whenever you ask.
          </TeachingBlock>
        )}

        <Pressable style={styles.askButton} onPress={askAboutThis}>
          <Text style={styles.askButtonText}>Ask about this</Text>
        </Pressable>

        {LOAN_VS_INVEST_TYPES.has(holding.product_type) && userId && (
          <Pressable style={styles.compareButton} onPress={() => setComparing(true)}>
            <Text style={styles.compareButtonText}>Compare: prepay vs. invest</Text>
          </Pressable>
        )}

        {isEsopOptions && userId && (
          <Pressable style={styles.compareButton} onPress={() => setCheckingExerciseCost(true)}>
            <Text style={styles.compareButtonText}>Cost of exercising today</Text>
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

      {checkingExerciseCost && userId && (
        <EsopExerciseCostModal
          userId={userId}
          holdingId={holding.id}
          onClose={() => setCheckingExerciseCost(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.screen },
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  title: { fontFamily: font.ui, fontSize: 20, fontWeight: '600', color: colors.ink },
  subtitle: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  emptyText: { fontFamily: font.ui, color: colors.inkMuted, fontSize: 13, fontStyle: 'italic' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    flex: 1,
  },
  rowValue: { fontFamily: font.mono, fontSize: 15, fontWeight: '600', color: colors.ink },
  teachingBlockWrap: { marginTop: spacing.xl },
  askButton: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  askButtonText: { fontFamily: font.ui, fontSize: 15, color: colors.screen, fontWeight: '600' },
  compareButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  compareButtonText: { fontFamily: font.ui, color: colors.tutor, fontWeight: '600' },
  // Tertiary/quiet tier (1F) — Edit is a management action, secondary to Ask/Compare,
  // not a bordered choice of its own. Borderless, muted, matches addButtonSecondary
  // elsewhere in the app.
  editButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  editButtonText: { fontFamily: font.ui, fontSize: 13, color: colors.inkSecondary },
});
