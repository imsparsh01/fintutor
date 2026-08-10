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
import { humanizeProductType, INVESTMENT_TYPES } from '../lib/taxonomy';
import type { HoldingsStackParamList, MainTabsParamList } from '../navigation/types';
import { HoldingDetailScreen } from './HoldingDetailScreen';
import { TeachingWalkthrough } from '../components/TeachingWalkthrough';
import { INVESTMENT_WALKTHROUGH } from '../lib/walkthroughSteps';

const Stack = createNativeStackNavigator<HoldingsStackParamList>();

type ListProps = NativeStackScreenProps<HoldingsStackParamList, 'List'>;

// Per-row value (mockup 4.1): mirrors, field-for-field, the mapping
// backend/app/services/consolidated.py already uses to compute investments_total — this is
// a client-side DISPLAY of the same known fields, not a new valuation rule, and the family
// total itself still comes straight from that endpoint (see loadTotals below), untouched.
// ESOP has no decided valuation formula (that file's own docstring) so it renders "not
// valued" here too, same as the total excludes it.
function holdingValue(h: Holding): number | null {
  const c = h.characteristics;
  const num = (key: string) => (typeof c[key] === 'number' ? (c[key] as number) : null);
  switch (h.product_type) {
    case 'equity_mutual_fund':
    case 'debt_mutual_fund':
    case 'stocks':
      return num('current_value');
    case 'fd_rd':
      return num('principal_or_monthly_amount');
    case 'ppf_epf':
      return num('current_balance');
    default:
      return null; // esop: no decided valuation formula — not guessed here either.
  }
}

// Sub-line detail (mockup 4.1: "Equity Mutual Fund · SIP ₹15,000/mo"). The schema has no
// monthly-instalment field to source a real "/mo" figure from (characteristicsSchema.ts's
// FUND_FIELDS only has a total invested_amount), so only real, already-captured fields are
// used — never a fabricated monthly amount.
function holdingDetail(h: Holding): string {
  const c = h.characteristics;
  const label = humanizeProductType(h.product_type);
  switch (h.product_type) {
    case 'equity_mutual_fund':
    case 'debt_mutual_fund':
      if (c.investment_mode === 'SIP') return `${label} · SIP`;
      if (c.investment_mode === 'lumpsum') return `${label} · Lumpsum`;
      return label;
    case 'stocks':
      return typeof c.sector === 'string' && c.sector ? `${label} · ${c.sector}` : label;
    case 'fd_rd':
      return typeof c.deposit_mode === 'string' && c.deposit_mode ? `${label} · ${c.deposit_mode}` : label;
    case 'ppf_epf':
      return typeof c.retirement_fund_type === 'string' && c.retirement_fund_type
        ? `${label} · ${c.retirement_fund_type}`
        : label;
    case 'esop':
      return typeof c.grant_type === 'string' && c.grant_type
        ? `${label} · ${String(c.grant_type).toUpperCase()}`
        : label;
    default:
      return label;
  }
}

// D-089: an empty family section is a teaching surface, not a dead end — it names what
// lives here (mechanisms/categories, never a fund or bank name), offers a declinable
// walk-through using the user's own numbers, and keeps manual add present but secondary.
//
// This list is implemented locally rather than through a shared list component — the
// generic HoldingsList component this reskin pass produced in parallel only took a single
// `emptyHint` string, with no room for the mechanism copy or walk-through CTA this decision
// requires, and has since been deleted as dead code (nothing else referenced it).
function InvestmentsList({ navigation }: ListProps) {
  const { userId } = useAuth();
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [totals, setTotals] = useState<ConsolidatedTotals | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const parentNavigation = navigation.getParent<BottomTabNavigationProp<MainTabsParamList>>();

  const load = useCallback(() => {
    if (!userId) return;
    setError(null);
    fetchHoldings(userId)
      .then((all) => setHoldings(all.filter((h) => INVESTMENT_TYPES.includes(h.product_type))))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load holdings'));
    // Family total (mockup 4.1) — reuses the existing /consolidated endpoint as-is; the
    // computation stays entirely server-side (D-065), this screen only displays it.
    fetchConsolidated(userId)
      .then(setTotals)
      .catch(() => setTotals(null));
  }, [userId]);

  useFocusEffect(load);

  const startWalkthrough = () => {
    setShowWalkthrough(true);
  };

  const startAlreadyHave = () => {
    parentNavigation?.navigate('Chat', {
      prefillQuestion: 'I think I already have some investments — can you help me note them down?',
    });
  };

  const modal = adding && (
    <HoldingEditModal
      holding={null}
      familyTypes={INVESTMENT_TYPES}
      noun="investment"
      onClose={() => setAdding(false)}
      onChanged={load}
    />
  );

  if (!userId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.pageTitle}>Investments</Text>
        <Text style={styles.body}>Signed out — nothing to show.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.pageTitle}>Investments</Text>
        <Text style={styles.errorText}>Couldn't load holdings — {error}</Text>
        {/* 2B: the GET failing must not also take away the ability to add — adding is a
            local POST that doesn't depend on this fetch, and re-triggering the fetch
            shouldn't require leaving and returning to the tab. */}
        <Pressable style={styles.retryButton} onPress={load}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
        <Pressable style={styles.addButtonSecondary} onPress={() => setAdding(true)}>
          <Text style={styles.addButtonSecondaryText}>+ Add an investment manually</Text>
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
        <Text style={styles.pageTitle}>Investments</Text>
        <Text style={styles.emptySubtitle}>Nothing recorded here</Text>

        <TeachingBlock heading="What lives in this section" style={styles.teachingBlockWrap}>
          Money set aside to grow: equity and debt mutual funds, direct stock holdings, fixed and
          recurring deposits, provident fund accounts, and employee stock options where your employer
          grants them. Each behaves differently — some are locked in for years, some move with the
          market every day, some pay a fixed rate you know in advance. What ties them together here is
          intent, not any one instrument.
        </TeachingBlock>

        <Text style={styles.walkthroughPrompt}>
          Want a short map of how each one works? You can apply it to your own numbers in Chat when
          you are ready.
        </Text>

        <Pressable style={styles.walkthroughButton} onPress={startWalkthrough}>
          <Text style={styles.walkthroughButtonText}>Walk me through it</Text>
        </Pressable>

        <Pressable style={styles.alreadyHaveButton} onPress={startAlreadyHave}>
          <Text style={styles.alreadyHaveButtonText}>I think I have some</Text>
        </Pressable>

        <Pressable style={styles.addButtonSecondary} onPress={() => setAdding(true)}>
          <Text style={styles.addButtonSecondaryText}>+ Add an investment manually</Text>
        </Pressable>

        {modal}
        <TeachingWalkthrough visible={showWalkthrough} steps={INVESTMENT_WALKTHROUGH} onDismiss={() => setShowWalkthrough(false)} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.listContainer}>
      <Text style={styles.pageTitle}>Investments</Text>
      <Text style={styles.subtitle}>{holdings.length} {holdings.length === 1 ? 'holding' : 'holdings'}</Text>
      {totals && <Text style={styles.familyTotal}>{formatRupees(totals.investments_total)}</Text>}
      {/* 2C: FlatList, not a ScrollView.map — virtualizes at scale, harmless at 10 rows. */}
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
              {/* P10: a real value renders undecorated in ink; "not valued" is a status,
                  not a figure, so it's never shown as ₹0 (never invent a figure). */}
              <Text style={value === null ? styles.rowValueMissing : styles.rowValue}>
                {value === null ? 'not valued' : formatRupees(value)}
              </Text>
            </Pressable>
          );
        }}
      />
      <Pressable style={styles.addButtonSecondary} onPress={() => setAdding(true)}>
        <Text style={styles.addButtonSecondaryText}>+ Add an investment</Text>
      </Pressable>
      <Text style={styles.addCaption}>Or just mention it in Ask — that's usually faster.</Text>
      {modal}
    </View>
  );
}

// BQ-022: List → Detail, same small stack shape reused across the three family tabs.
export function InvestmentsScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="List" component={InvestmentsList} />
      <Stack.Screen name="Detail" component={HoldingDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.screen },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.screen },
  listContainer: { flex: 1, backgroundColor: colors.screen, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  emptyContainer: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xxxl },
  // 1B: the real page H1 — these were the three most-visited screens with no title at all.
  pageTitle: typography.pageTitle,
  body: { fontFamily: font.ui, color: colors.inkSecondary, textAlign: 'center' },
  errorText: { fontFamily: font.ui, color: colors.danger, textAlign: 'center' },
  // Mockup 4.1: "N holdings" quiet count line, then the family total, both above the list.
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
  // "I think I have some" (mockup 4.2's pattern) — a second, still-declinable entry to Ask
  // for someone who already holds something and just wants to mention it, one tier below
  // the walkthrough offer.
  alreadyHaveButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  alreadyHaveButtonText: typography.secondaryButtonText,
  // Secondary tier (1F/2B) — recovery action in the error branch, one notch below primary.
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
  // Tertiary/quiet tier (1F) — must stay visibly secondary to the walkthrough offer (D-089).
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
