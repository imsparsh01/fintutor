import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HoldingEditModal } from '../components/HoldingEditModal';
import { TeachingBlock } from '../components/TeachingBlock';
import { colors, figure, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';
import { useAuth } from '../lib/AuthContext';
import { fetchConsolidated, type ConsolidatedTotals } from '../lib/consolidated';
import { formatRupees } from '../lib/format';
import { fetchHoldings, type Holding } from '../lib/holdings';
import { humanizeProductType, LOAN_TYPES } from '../lib/taxonomy';
import type { HoldingsStackParamList, MainTabsParamList } from '../navigation/types';
import { HoldingDetailScreen } from './HoldingDetailScreen';
import { TeachingWalkthrough } from '../components/TeachingWalkthrough';
import { buildWalkthroughPlan } from '../lib/walkthroughSteps';

const Stack = createNativeStackNavigator<HoldingsStackParamList>();

type ListProps = NativeStackScreenProps<HoldingsStackParamList, 'List'>;

// Per-row value (mockup 4.1's pattern, applied here) — mirrors
// backend/app/services/consolidated.py's own loans_total mapping (outstanding_balance for
// all three loan types); the family total itself still comes straight from that endpoint.
function holdingValue(h: Holding): number | null {
  const c = h.characteristics;
  return typeof c.outstanding_balance === 'number' ? (c.outstanding_balance as number) : null;
}

// Sub-line detail — only real, already-captured fields (never a fabricated figure).
function holdingDetail(h: Holding): string {
  const c = h.characteristics;
  const label = humanizeProductType(h.product_type);
  switch (h.product_type) {
    case 'home_loan':
    case 'personal_loan':
      return typeof c.emi_amount === 'number' ? `${label} · EMI ${formatRupees(c.emi_amount)}/mo` : label;
    case 'credit_card_debt':
      return typeof c.minimum_due === 'number' ? `${label} · Min due ${formatRupees(c.minimum_due)}` : label;
    default:
      return label;
  }
}

// D-089: an empty family section is a teaching surface, not a dead end — see the
// matching comment in InvestmentsScreen.tsx for why this list is implemented locally
// rather than through a shared list component (the generic one has since been deleted).
function LoansList({ navigation }: ListProps) {
  const { userId } = useAuth();
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [totals, setTotals] = useState<ConsolidatedTotals | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const parentNavigation = navigation.getParent<BottomTabNavigationProp<MainTabsParamList>>();
  const walkthroughPlan = buildWalkthroughPlan('loans', holdings ?? []);

  const load = useCallback(() => {
    if (!userId) return;
    setError(null);
    fetchHoldings(userId)
      .then((all) => setHoldings(all.filter((h) => LOAN_TYPES.includes(h.product_type))))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load holdings'));
    fetchConsolidated(userId)
      .then(setTotals)
      .catch(() => setTotals(null));
  }, [userId]);

  useFocusEffect(load);

  const startWalkthrough = () => {
    setShowWalkthrough(true);
  };

  const askMissingWalkthroughDetails = () => {
    if (!walkthroughPlan.missingQuestion) return;
    setShowWalkthrough(false);
    parentNavigation?.navigate('Chat', { prefillQuestion: walkthroughPlan.missingQuestion });
  };

  const startAlreadyHave = () => {
    parentNavigation?.navigate('Chat', {
      prefillQuestion: 'I think I already have a loan — can you help me note it down?',
    });
  };

  const modal = adding && (
    <HoldingEditModal
      holding={null}
      familyTypes={LOAN_TYPES}
      noun="loan"
      onClose={() => setAdding(false)}
      onChanged={load}
    />
  );

  if (!userId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.pageTitle}>Loans</Text>
        <Text style={styles.body}>Signed out — nothing to show.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.pageTitle}>Loans</Text>
        <Text style={styles.errorText}>Couldn't load holdings — {error}</Text>
        <Pressable style={styles.retryButton} onPress={load}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
        <Pressable style={styles.addButtonSecondary} onPress={() => setAdding(true)}>
          <Text style={styles.addButtonSecondaryText}>+ Add a loan manually</Text>
        </Pressable>
        {modal}
      </View>
    );
  }

  if (holdings === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  if (holdings.length === 0) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.emptyContainer}>
        <Text style={styles.pageTitle}>Loans</Text>
        <Text style={styles.emptySubtitle}>Nothing recorded here</Text>

        <TeachingBlock heading="What lives in this section" style={styles.teachingBlockWrap}>
          Money you owe, carried month to month: home loans, personal loans, and credit card debt.
          What separates them isn't who lent it, it's the shape of the obligation — a home loan is
          long, secured, and repaid on an amortising schedule, though on a floating rate that
          schedule shifts when the rate does; a personal loan is shorter and usually costs more;
          credit card debt has no fixed payoff date at all if it isn't cleared in full each cycle,
          only a minimum due that keeps it revolving. Knowing the shape is most of the literacy —
          the rate, the security, and whether there's a schedule at all are what make one obligation
          behave differently from another.
        </TeachingBlock>

        <Text style={styles.walkthroughPrompt}>
          Start with a record you choose to provide. Unknown details stay unknown until you add and confirm them.
        </Text>

        <Pressable style={styles.walkthroughButton} onPress={startWalkthrough}>
          <Text style={styles.walkthroughButtonText}>Start an own-numbers walkthrough</Text>
        </Pressable>

        <Pressable style={styles.alreadyHaveButton} onPress={startAlreadyHave}>
          <Text style={styles.alreadyHaveButtonText}>I think I have one</Text>
        </Pressable>

        <Pressable style={styles.addButtonSecondary} onPress={() => setAdding(true)}>
          <Text style={styles.addButtonSecondaryText}>+ Add a loan manually</Text>
        </Pressable>

        {modal}
        <TeachingWalkthrough visible={showWalkthrough} steps={walkthroughPlan.steps} onDismiss={() => setShowWalkthrough(false)} onAskMissing={walkthroughPlan.missingQuestion ? askMissingWalkthroughDetails : undefined} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.listContainer}>
      <Text style={styles.pageTitle}>Loans</Text>
      <Text style={styles.subtitle}>{holdings.length} {holdings.length === 1 ? 'loan' : 'loans'}</Text>
      {totals && <Text style={styles.familyTotal}>{formatRupees(totals.loans_total)}</Text>}
      <Pressable style={styles.walkthroughButton} onPress={startWalkthrough}>
        <Text style={styles.walkthroughButtonText}>Use my recorded details</Text>
      </Pressable>
      <FlatList
        data={holdings}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => {
          const value = holdingValue(item);
          return (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate('Detail', { holding: item })}
            >
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>{item.display_name ?? item.alias}</Text>
                <Text style={styles.rowSubtitle}>{holdingDetail(item)}</Text>
              </View>
              <Text style={value === null ? styles.rowValueMissing : styles.rowValue}>
                {value === null ? 'not valued' : formatRupees(value)}
              </Text>
            </Pressable>
          );
        }}
      />
      <Pressable style={styles.addButtonSecondary} onPress={() => setAdding(true)}>
        <Text style={styles.addButtonSecondaryText}>+ Add a loan</Text>
      </Pressable>
      <Text style={styles.addCaption}>Or just mention it in Ask — that's usually faster.</Text>
      {modal}
      <TeachingWalkthrough visible={showWalkthrough} steps={walkthroughPlan.steps} onDismiss={() => setShowWalkthrough(false)} onAskMissing={walkthroughPlan.missingQuestion ? askMissingWalkthroughDetails : undefined} />
    </View>
  );
}

export function LoansScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="List" component={LoansList} />
      <Stack.Screen name="Detail" component={HoldingDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.screen },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.screen },
  listContainer: { flex: 1, backgroundColor: colors.screen, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  emptyContainer: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xxxl },
  pageTitle: typography.pageTitle,
  body: { fontFamily: font.ui, color: colors.inkSecondary, textAlign: 'center' },
  errorText: { fontFamily: font.ui, color: colors.danger, textAlign: 'center' },
  subtitle: { fontFamily: font.mono, fontSize: 13, color: colors.inkMuted, marginTop: -spacing.sm },
  familyTotal: {
    fontFamily: font.monoSemibold,
    fontSize: figure.subHero,
    color: colors.ink,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  list: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowMain: { flex: 1, paddingRight: spacing.md },
  rowTitle: { fontFamily: font.uiMedium, fontSize: 16, color: colors.ink },
  rowSubtitle: {
    fontFamily: font.mono,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  rowValue: typography.ledgerValue,
  rowValueMissing: { fontFamily: font.mono, fontSize: 13, color: colors.inkMuted, fontStyle: 'italic' },
  emptySubtitle: { fontFamily: font.ui, fontSize: 14, color: colors.inkMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  teachingBlockWrap: { marginBottom: spacing.xl },
  walkthroughPrompt: {
    fontFamily: font.tutor,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSecondary,
    marginBottom: spacing.lg,
  },
  walkthroughButton: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  walkthroughButtonText: typography.primaryButtonText,
  alreadyHaveButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  alreadyHaveButtonText: typography.secondaryButtonText,
  retryButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  retryButtonText: typography.secondaryButtonText,
  addButtonSecondary: { paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  addButtonSecondaryText: { fontFamily: font.ui, fontSize: 13, color: colors.inkSecondary },
  addCaption: {
    fontFamily: font.ui,
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: -spacing.md,
  },
});
