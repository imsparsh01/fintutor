import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HoldingEditModal } from '../components/HoldingEditModal';
import { TeachingBlock } from '../components/TeachingBlock';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { fetchHoldings, type Holding } from '../lib/holdings';
import { humanizeProductType, INVESTMENT_TYPES } from '../lib/taxonomy';
import type { HoldingsStackParamList, MainTabsParamList } from '../navigation/types';
import { HoldingDetailScreen } from './HoldingDetailScreen';

const Stack = createNativeStackNavigator<HoldingsStackParamList>();

type ListProps = NativeStackScreenProps<HoldingsStackParamList, 'List'>;

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
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const parentNavigation = navigation.getParent<BottomTabNavigationProp<MainTabsParamList>>();

  const load = useCallback(() => {
    if (!userId) return;
    setError(null);
    fetchHoldings(userId)
      .then((all) => setHoldings(all.filter((h) => INVESTMENT_TYPES.includes(h.product_type))))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load holdings'));
  }, [userId]);

  useFocusEffect(load);

  const startWalkthrough = () => {
    // Reuses the existing Chat prefill entry point (also used by HoldingDetailScreen) —
    // not a new flow. Declinable: it starts a conversation, nothing is unlocked or owed.
    parentNavigation?.navigate('Chat', {
      prefillQuestion: 'Can you walk me through investments, using my own numbers?',
    });
  };

  const modal = adding && (
    <HoldingEditModal
      holding={null}
      familyTypes={INVESTMENT_TYPES}
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

        <TeachingBlock heading="What lives in this section" style={styles.teachingBlockWrap}>
          Money set aside to grow: equity and debt mutual funds, direct stock holdings, fixed and
          recurring deposits, provident fund accounts, and employee stock options where your employer
          grants them. Each behaves differently — some are locked in for years, some move with the
          market every day, some pay a fixed rate you know in advance. What ties them together here is
          intent, not any one instrument.
        </TeachingBlock>

        <Pressable style={styles.walkthroughButton} onPress={startWalkthrough}>
          <Text style={styles.walkthroughButtonText}>Walk me through it, with my numbers</Text>
        </Pressable>
        <Text style={styles.walkthroughCaption}>Takes about two minutes. Commits you to nothing.</Text>

        <Pressable style={styles.addButtonSecondary} onPress={() => setAdding(true)}>
          <Text style={styles.addButtonSecondaryText}>+ Add an investment manually</Text>
        </Pressable>

        {modal}
      </ScrollView>
    );
  }

  return (
    <View style={styles.listContainer}>
      <Text style={styles.pageTitle}>Investments</Text>
      {/* 2C: FlatList, not a ScrollView.map — virtualizes at scale, harmless at 10 rows. */}
      <FlatList
        data={holdings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('Detail', { holding: item })}
          >
            <Text style={styles.rowTitle}>{item.display_name ?? item.alias}</Text>
            <Text style={styles.rowSubtitle}>{humanizeProductType(item.product_type)}</Text>
          </Pressable>
        )}
      />
      <Pressable style={styles.addButtonSecondary} onPress={() => setAdding(true)}>
        <Text style={styles.addButtonSecondaryText}>+ Add investment</Text>
      </Pressable>
      {modal}
    </View>
  );
}

// BQ-022: List → Detail, same small stack shape reused across the three family tabs.
export function InvestmentsScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="List" component={InvestmentsList} />
      <Stack.Screen
        name="Detail"
        component={HoldingDetailScreen}
        options={{ headerShown: true, title: 'Holding' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.screen },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.screen },
  listContainer: { flex: 1, backgroundColor: colors.screen, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  emptyContainer: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xxxl },
  // 1B: the real page H1 — these were the three most-visited screens with no title at all.
  pageTitle: {
    fontFamily: font.ui,
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  body: { fontFamily: font.ui, color: colors.inkSecondary, textAlign: 'center' },
  errorText: { fontFamily: font.ui, color: colors.danger, textAlign: 'center' },
  row: {
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowTitle: { fontFamily: font.ui, fontSize: 16, fontWeight: '500', color: colors.ink },
  rowSubtitle: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  teachingBlockWrap: { marginBottom: spacing.xl },
  walkthroughButton: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  walkthroughButtonText: { fontFamily: font.ui, color: colors.screen, fontWeight: '600', fontSize: 15 },
  walkthroughCaption: {
    fontFamily: font.ui,
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
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
  retryButtonText: { fontFamily: font.ui, fontSize: 15, color: colors.tutor, fontWeight: '600' },
  // Tertiary/quiet tier (1F) — must stay visibly secondary to the walkthrough offer (D-089).
  addButtonSecondary: { paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  addButtonSecondaryText: { fontFamily: font.ui, fontSize: 13, color: colors.inkSecondary },
});
