import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HoldingEditModal } from '../components/HoldingEditModal';
import { TermInsuranceExplorerModal } from '../components/TermInsuranceExplorerModal';
import { TeachingBlock } from '../components/TeachingBlock';
import { colors, figure, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';
import { useAuth } from '../lib/AuthContext';
import { fetchConsolidated, type ConsolidatedTotals } from '../lib/consolidated';
import { formatRupees } from '../lib/format';
import { fetchHoldings, type Holding } from '../lib/holdings';
import { fetchGoals, type GoalRecord } from '../lib/goals';
import { humanizeProductType, INSURANCE_TYPES } from '../lib/taxonomy';
import type { HoldingsStackParamList, MainTabsParamList } from '../navigation/types';
import { HoldingDetailScreen } from './HoldingDetailScreen';
import { TeachingWalkthrough } from '../components/TeachingWalkthrough';
import { buildWalkthroughPlan } from '../lib/walkthroughSteps';

const Stack = createNativeStackNavigator<HoldingsStackParamList>();

type ListProps = NativeStackScreenProps<HoldingsStackParamList, 'List'>;

// "Endowment / ULIP" reads better than humanizeProductType's literal "Endowment Ulip" —
// a display-only override, not a taxonomy change (lib/taxonomy.ts is untouched).
function productLabel(productType: string): string {
  return productType === 'endowment_ulip' ? 'Endowment / ULIP' : humanizeProductType(productType);
}

// Per-row value — mirrors backend/app/services/consolidated.py's own insurance_total
// mapping (current_fund_value, Endowment/ULIP only; Term Insurance has no fund value and
// is deliberately "not valued", matching that file's own comment, never guessed).
function holdingValue(h: Holding): number | null {
  const c = h.characteristics;
  return h.product_type === 'endowment_ulip' && typeof c.current_fund_value === 'number'
    ? (c.current_fund_value as number)
    : null;
}

function holdingDetail(h: Holding): string {
  const c = h.characteristics;
  const label = productLabel(h.product_type);
  return typeof c.premium === 'number' ? `${label} · Premium ${formatRupees(c.premium)}` : label;
}

// D-089: an empty family section is a teaching surface, not a dead end — see the
// matching comment in InvestmentsScreen.tsx for why this list is implemented locally
// rather than through a shared list component (the generic one has since been deleted).
function InsuranceList({ navigation }: ListProps) {
  const { userId } = useAuth();
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [allHoldings, setAllHoldings] = useState<Holding[] | null>(null);
  const [goals, setGoals] = useState<GoalRecord[] | null>(null);
  const [totals, setTotals] = useState<ConsolidatedTotals | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showTermExplorer, setShowTermExplorer] = useState(false);
  const parentNavigation = navigation.getParent<BottomTabNavigationProp<MainTabsParamList>>();
  const walkthroughPlan = buildWalkthroughPlan('insurance', holdings ?? []);

  const load = useCallback(() => {
    if (!userId) return;
    setError(null);
    fetchHoldings(userId)
      .then((all) => {
        setAllHoldings(all);
        setHoldings(all.filter((h) => INSURANCE_TYPES.includes(h.product_type)));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load holdings'));
    fetchGoals(userId).then(setGoals).catch(() => setGoals(null));
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
      prefillQuestion: 'I think I already have a policy — can you help me note it down?',
    });
  };

  const modal = adding && (
    <HoldingEditModal
      holding={null}
      familyTypes={INSURANCE_TYPES}
      noun="policy"
      onClose={() => setAdding(false)}
      onChanged={load}
    />
  );

  if (!userId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.pageTitle}>Insurance</Text>
        <Text style={styles.body}>Signed out — nothing to show.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.pageTitle}>Insurance</Text>
        <Text style={styles.errorText}>Couldn't load holdings — {error}</Text>
        <Pressable style={styles.retryButton} onPress={load}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
        <Pressable style={styles.addButtonSecondary} onPress={() => setAdding(true)}>
          <Text style={styles.addButtonSecondaryText}>+ Add a policy manually</Text>
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

  // Empty state (mockup 4.2) — teaching copy and "+ Add a policy manually" wording are
  // preserved verbatim (recently finalized); only the surrounding layout changes: a muted
  // "Nothing recorded here" line under the title, the walkthrough question moved in front of
  // the buttons, the walkthrough button's label shortened to match the mockup (its
  // navigation action is untouched per BQ-049/BQ-050), and a new "I think I have one"
  // second entry point into Ask, one tier below the walkthrough offer.
  if (holdings.length === 0) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.emptyContainer}>
        <Text style={styles.pageTitle}>Insurance</Text>
        <Text style={styles.emptySubtitle}>Nothing recorded here</Text>

        <TeachingBlock heading="What lives in this section" style={styles.teachingBlockWrap}>
          Two mechanisms sit under "insurance", and they behave very differently: one buys protection
          only, the other mixes protection with savings. Term cover pays a fixed sum to your family if
          you die within the policy period and costs nothing beyond that promise — the premium is a pure
          expense, with no return if the term ends without a claim. Endowment and ULIP plans wrap a
          savings or market-linked layer inside the same envelope; premiums are higher, part funds the
          cover, part accumulates on a schedule set by the plan. Whether that combination is worth
          carrying depends on whether you need the savings discipline the policy enforces, or whether
          pure cover is what matters. Knowing which mechanism you hold — and why — is most of the
          literacy.
        </TeachingBlock>

        <Text style={styles.walkthroughPrompt}>
          Start with a record you choose to provide. Unknown details stay unknown until you add and confirm them.
        </Text>

        <Pressable style={styles.walkthroughButton} onPress={startWalkthrough}>
          <Text style={styles.walkthroughButtonText}>Start an own-numbers walkthrough</Text>
        </Pressable>

        <Pressable
          style={styles.explorerButton}
          disabled={allHoldings === null}
          onPress={() => setShowTermExplorer(true)}
        >
          <Text style={styles.explorerButtonText}>
            {allHoldings === null ? 'Loading your context…' : 'Explore term cover with my numbers'}
          </Text>
        </Pressable>

        <Pressable style={styles.alreadyHaveButton} onPress={startAlreadyHave}>
          <Text style={styles.alreadyHaveButtonText}>I think I have one</Text>
        </Pressable>

        <Pressable style={styles.addButtonSecondary} onPress={() => setAdding(true)}>
          <Text style={styles.addButtonSecondaryText}>+ Add a policy manually</Text>
        </Pressable>

        {modal}
        <TeachingWalkthrough visible={showWalkthrough} steps={walkthroughPlan.steps} onDismiss={() => setShowWalkthrough(false)} onAskMissing={walkthroughPlan.missingQuestion ? askMissingWalkthroughDetails : undefined} />
        {allHoldings ? <TermInsuranceExplorerModal visible={showTermExplorer} holdings={allHoldings} goals={goals ?? []} recordedContextAvailable={goals !== null} onDismiss={() => setShowTermExplorer(false)} /> : null}
      </ScrollView>
    );
  }

  return (
    <View style={styles.listContainer}>
      <Text style={styles.pageTitle}>Insurance</Text>
      <Text style={styles.subtitle}>{holdings.length} {holdings.length === 1 ? 'policy' : 'policies'}</Text>
      {totals && <Text style={styles.familyTotal}>{formatRupees(totals.insurance_total)}</Text>}
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
        <Text style={styles.addButtonSecondaryText}>+ Add a policy</Text>
      </Pressable>
      <Text style={styles.addCaption}>Or just mention it in Ask — that's usually faster.</Text>
      <Pressable
        style={styles.explorerButton}
        disabled={allHoldings === null}
        onPress={() => setShowTermExplorer(true)}
      >
        <Text style={styles.explorerButtonText}>
          {allHoldings === null ? 'Loading your context…' : 'Explore term cover with my numbers'}
        </Text>
      </Pressable>
      {modal}
      <TeachingWalkthrough visible={showWalkthrough} steps={walkthroughPlan.steps} onDismiss={() => setShowWalkthrough(false)} onAskMissing={walkthroughPlan.missingQuestion ? askMissingWalkthroughDetails : undefined} />
      {allHoldings ? <TermInsuranceExplorerModal visible={showTermExplorer} holdings={allHoldings} goals={goals ?? []} recordedContextAvailable={goals !== null} onDismiss={() => setShowTermExplorer(false)} /> : null}
    </View>
  );
}

export function InsuranceScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="List" component={InsuranceList} />
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
  explorerButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  explorerButtonText: typography.secondaryButtonText,
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
