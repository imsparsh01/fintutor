import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TeachingBlock } from '../components/TeachingBlock';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { computeCategoryConcentration } from '../lib/concentration';
import { fetchHoldings } from '../lib/holdings';
import type { ConcentrationSummary } from '../lib/concentration';
import type { Holding } from '../lib/holdings';
import type { MainTabsParamList } from '../navigation/types';

// D-106: Portfolio tab — detailed holdings view. BQ-054 added the Health Score entry;
// BQ-061 adds the category concentration card. BQ-058 (donut chart + sub-scores) still to come.
// Family section navigation rows (Investments, Loans, Insurance, Budgeting) give access to the
// family holding screens that were previously their own tabs.
//
// This screen fetches holdings independently. That is safe today because it is never focused at
// the same time as HealthScoreScreen (a hidden tab), so there is no double-fetch on one focus
// event — but it does NOT settle the shared-store question TODOS.md raises for BQ-058, which is
// about health sub-scores diverging between two surfaces, not about a holdings count.
export function PortfolioScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const { userId } = useAuth();
  const [holdings, setHoldings] = useState<Holding[] | null>(null);

  const loadData = useCallback(() => {
    if (!userId) return;
    fetchHoldings(userId)
      .then(setHoldings)
      .catch(() => setHoldings(null));
  }, [userId]);

  useFocusEffect(loadData);

  const concentration = computeCategoryConcentration(holdings);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Portfolio</Text>

      <Text style={styles.sectionLabel}>Holdings</Text>
      <View style={styles.card}>
        <FamilyRow label="Investments" sub="Mutual funds · EPF · Stocks" onPress={() => navigation.navigate('Investments')} />
        <FamilyRow label="Loans" sub="Home loan · Personal loan · Cards" onPress={() => navigation.navigate('Loans')} />
        <FamilyRow label="Insurance" sub="Term · Health · ULIP" onPress={() => navigation.navigate('Insurance')} />
        <FamilyRow label="Budgeting" sub="Income · EMIs · Spending" onPress={() => navigation.navigate('Budgeting')} last />
      </View>

      <Text style={[styles.sectionLabel, { marginTop: spacing.xxl }]}>Analysis</Text>
      <View style={styles.card}>
        <FamilyRow label="Health Score" sub="Investment rate · Insurance · Emergency buffer · Tax" onPress={() => navigation.navigate('HealthScore')} last />
      </View>

      <Text style={[styles.sectionLabel, { marginTop: spacing.xxl }]}>Category concentration</Text>
      <ConcentrationCard summary={concentration} onAddFunds={() => navigation.navigate('Investments')} />

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonLabel}>Coming soon</Text>
        <Text style={styles.comingSoonBody}>Asset allocation will appear here once built.</Text>
      </View>
    </ScrollView>
  );
}

// BQ-061 (D-106 Decision 4). Counts only — no rupee figure, no scheme names, no external data.
// The D-091 block is the load-bearing part of this card: the number is easy to mistake for an
// overlap measure, and the block is what states plainly that it is not one.
function ConcentrationCard({
  summary,
  onAddFunds,
}: {
  summary: ConcentrationSummary | null;
  onAddFunds: () => void;
}) {
  if (summary === null) {
    return (
      <View style={styles.card}>
        <View style={styles.plainRow}>
          <Text style={styles.bodyText}>
            Your holdings could not be loaded just now. This card fills in once they do.
          </Text>
        </View>
      </View>
    );
  }

  // D-089: an empty section teaches what lives there rather than showing a dead zero.
  if (summary.totalFunds === 0) {
    return (
      <>
        <View style={styles.card}>
          <View style={styles.plainRow}>
            <Text style={styles.bodyText}>
              Once you record mutual funds, this shows how they divide between equity and debt.
              Equity and debt funds respond to different things — rate moves hit debt funds, market
              moves hit equity funds — so which categories you hold is what decides how much of your
              money moves together.
            </Text>
            <Pressable style={styles.inlineLink} onPress={onAddFunds}>
              <Text style={styles.linkText}>Open Investments ›</Text>
            </Pressable>
          </View>
        </View>
        <ConcentrationBlock />
      </>
    );
  }

  const largest = summary.largest!;
  const singleCategory = summary.categories.length === 1;

  return (
    <>
      <View style={styles.card}>
        <View style={styles.headline}>
          {/* P10: a count is a real figure — ink, undecorated. */}
          <Text style={styles.headlineFigure}>
            {largest.count} of {summary.totalFunds}
          </Text>
          <Text style={styles.headlineUnit}>
            {summary.totalFunds === 1
              ? 'fund you hold'
              : `funds you hold are ${largest.label.toLowerCase()}`}
          </Text>
        </View>

        {summary.categories.map((c) => (
          <View key={c.productType} style={styles.countRow}>
            <Text style={styles.countLabel}>{c.label}</Text>
            <Text style={styles.countValue}>{c.count}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.caption}>
        {summary.totalFunds === 1
          ? 'One fund sits in one category by definition. This number starts saying something once you hold more than one.'
          : singleCategory
            ? 'Every fund you hold is in the same category, so all of it responds to the same conditions at the same time.'
            : 'Funds in the same category tend to move together, because the same conditions drive them.'}
      </Text>

      <ConcentrationBlock />
    </>
  );
}

// D-106 specifies this wording. Rendered from one place so the empty and populated states show
// the identical block — D-091 requires it read the same way every time.
function ConcentrationBlock() {
  return (
    <TeachingBlock heading="What we won't say" style={styles.teachingBlock}>
      {'Whether you are too concentrated. What this number shows: how spread your mutual fund holdings are across fund categories. What it cannot tell you: whether different equity funds hold the same underlying stocks — that would need scheme-level data from your fund account, which this app does not have.'}
    </TeachingBlock>
  );
}

function FamilyRow({ label, sub, onPress, last }: { label: string; sub: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  heading: { fontFamily: font.uiSemibold, fontSize: 24, color: colors.ink, marginBottom: spacing.xl },
  sectionLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowLabel: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.ink },
  rowSub: { fontFamily: font.ui, fontSize: 12, color: colors.inkSecondary, marginTop: 2 },
  chevron: { fontFamily: font.ui, fontSize: 18, color: colors.inkMuted, marginLeft: spacing.sm },

  // ── BQ-061 concentration card
  plainRow: { padding: spacing.lg },
  bodyText: { fontFamily: font.tutor, fontSize: 14, lineHeight: 20, color: colors.inkSecondary },
  inlineLink: { marginTop: spacing.md },
  linkText: { fontFamily: font.ui, fontSize: 14, color: colors.tutor },
  headline: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  // P10: ink, never coloured by whether the concentration reads as good or bad.
  headlineFigure: { fontFamily: font.mono, fontSize: 28, color: colors.ink },
  headlineUnit: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  countLabel: { fontFamily: font.ui, fontSize: 14, color: colors.inkSecondary },
  countValue: { fontFamily: font.mono, fontSize: 15, color: colors.ink },
  caption: {
    fontFamily: font.tutor,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSecondary,
    marginTop: spacing.sm,
  },
  teachingBlock: { marginTop: spacing.lg },

  comingSoon: {
    marginTop: spacing.xxl,
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  comingSoonLabel: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.tutor,
    marginBottom: spacing.xs,
  },
  comingSoonBody: { fontFamily: font.tutor, fontSize: 15, lineHeight: 22, color: colors.ink },
});
