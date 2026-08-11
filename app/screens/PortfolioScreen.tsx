import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TeachingBlock } from '../components/TeachingBlock';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { computeCategoryConcentration } from '../lib/concentration';
import { loadHealthScoreSnapshot } from '../lib/healthScoreSnapshot';
import { INSURANCE_TYPES, INVESTMENT_TYPES, LOAN_TYPES } from '../lib/taxonomy';
import type { ConcentrationSummary } from '../lib/concentration';
import type { HealthScoreSnapshot } from '../lib/healthScoreSnapshot';
import type { Holding } from '../lib/holdings';
import type { MainTabsParamList } from '../navigation/types';

// D-106: Portfolio tab — detailed holdings view. BQ-054 added the Portfolio Health entry;
// BQ-061 added category concentration; BQ-058 adds allocation, sub-scores, and trend teaching.
// Family section navigation rows (Investments, Loans, Insurance, Budgeting) give access to the
// family holding screens that were previously their own tabs.
//
export function PortfolioScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const { userId } = useAuth();
  const [snapshot, setSnapshot] = useState<HealthScoreSnapshot | null>(null);

  const loadData = useCallback(() => {
    if (!userId) return;
    loadHealthScoreSnapshot(userId, true).then(setSnapshot);
  }, [userId]);

  useFocusEffect(loadData);

  const holdings = snapshot?.holdings ?? null;
  const concentration = computeCategoryConcentration(holdings);
  const allocation = computeFamilyAllocation(holdings);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Portfolio</Text>

      <Text style={styles.sectionLabel}>Allocation</Text>
      <AllocationCard allocation={allocation} onAdd={() => navigation.navigate('Investments')} />

      <Text style={[styles.sectionLabel, { marginTop: spacing.xxl }]}>Portfolio health</Text>
      <HealthSummary snapshot={snapshot} onOpen={() => navigation.navigate('HealthScore', { focus: undefined })} />

      <Text style={[styles.sectionLabel, { marginTop: spacing.xxl }]}>Holdings</Text>
      <View style={styles.card}>
        <FamilyRow label="Investments" sub="Mutual funds · EPF · Stocks" onPress={() => navigation.navigate('Investments')} />
        <FamilyRow label="Loans" sub="Home loan · Personal loan · Cards" onPress={() => navigation.navigate('Loans')} />
        <FamilyRow label="Insurance" sub="Term · Health · ULIP" onPress={() => navigation.navigate('Insurance')} />
        <FamilyRow label="Budgeting" sub="Income · EMIs · Spending" onPress={() => navigation.navigate('Budgeting')} last />
      </View>

      <Text style={[styles.sectionLabel, { marginTop: spacing.xxl }]}>Category concentration</Text>
      <ConcentrationCard summary={concentration} onAddFunds={() => navigation.navigate('Investments')} />

      <View style={styles.trendCard}>
        <Text style={styles.trendLabel}>Portfolio trend</Text>
        <Text style={styles.trendTitle}>A trend needs snapshots, not a single balance</Text>
        <Text style={styles.trendBody}>
          Today’s holdings show where your records sit now. A real trend would compare the same
          measure across dates; FinTutor does not store that history yet, so it will not draw a
          performance line from one point.
        </Text>
      </View>
    </ScrollView>
  );
}

interface AllocationSlice {
  label: string;
  count: number;
  marker: string;
}

function computeFamilyAllocation(holdings: Holding[] | null): AllocationSlice[] | null {
  if (holdings === null) return null;
  const slices = [
    { label: 'Investments', count: holdings.filter((h) => INVESTMENT_TYPES.includes(h.product_type)).length, marker: colors.ink },
    { label: 'Loans', count: holdings.filter((h) => LOAN_TYPES.includes(h.product_type)).length, marker: colors.inkSecondary },
    { label: 'Insurance', count: holdings.filter((h) => INSURANCE_TYPES.includes(h.product_type)).length, marker: colors.tutor },
  ];
  return slices.filter((slice) => slice.count > 0);
}

function AllocationCard({ allocation, onAdd }: { allocation: AllocationSlice[] | null; onAdd: () => void }) {
  if (allocation === null) {
    return <View style={[styles.card, styles.plainRow]}><Text style={styles.bodyText}>Your allocation could not be loaded just now.</Text></View>;
  }
  const total = allocation.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) {
    return (
      <View style={[styles.card, styles.plainRow]}>
        <Text style={styles.bodyText}>Add a holding and this view will show how your records divide across investments, loans, and insurance.</Text>
        <Pressable style={styles.inlineLink} onPress={onAdd}><Text style={styles.linkText}>Add a holding ›</Text></Pressable>
      </View>
    );
  }

  const segments = Array.from({ length: 12 }, (_, index) => {
    const point = ((index + 0.5) / 12) * total;
    let running = 0;
    return allocation.find((slice) => {
      running += slice.count;
      return point <= running;
    }) ?? allocation[allocation.length - 1];
  });

  return (
    <View style={styles.card}>
      <View style={styles.allocationBody}>
        <View style={styles.donut} accessibilityLabel={`Allocation by record count: ${allocation.map((item) => `${item.label} ${item.count}`).join(', ')}`}>
          {segments.map((segment, index) => (
            <View key={index} style={[styles.donutSegment, { backgroundColor: segment.marker, transform: [{ rotate: `${index * 30}deg` }, { translateY: -42 }] }]} />
          ))}
          <View style={styles.donutCenter}>
            <Text style={styles.donutNumber}>{total}</Text>
            <Text style={styles.donutUnit}>records</Text>
          </View>
        </View>
        <View style={styles.allocationLegend}>
          {allocation.map((slice) => (
            <View key={slice.label} style={styles.legendRow}>
              <View style={[styles.legendMarker, { backgroundColor: slice.marker }]} />
              <Text style={styles.legendLabel}>{slice.label}</Text>
              <Text style={styles.legendValue}>{slice.count}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.allocationNote}>By holding records, not rupee value. Each recorded holding counts once.</Text>
    </View>
  );
}

function HealthSummary({ snapshot, onOpen }: { snapshot: HealthScoreSnapshot | null; onOpen: () => void }) {
  const rows = [
    ['Investment rate', snapshot?.subScores.investmentRate],
    ['Insurance', snapshot?.subScores.insurance],
    ['Emergency buffer', snapshot?.subScores.emergency],
    ['Tax utilisation', snapshot?.subScores.taxUtil],
  ] as const;
  return (
    <Pressable style={styles.card} onPress={onOpen}>
      <View style={styles.healthHeader}>
        <View>
          <Text style={styles.healthTitle}>Portfolio Health</Text>
          <Text style={styles.healthMeta}>{snapshot ? `${snapshot.measured} of 4 areas measured` : 'Loading your coverage'}</Text>
        </View>
        <Text style={styles.healthScore}>{snapshot?.score ?? '—'}</Text>
      </View>
      <View style={styles.scoreGrid}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.scoreCell}>
            <Text style={styles.scoreCellValue}>{value === undefined || value === null ? '—' : value}</Text>
            <Text style={styles.scoreCellLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.openHealth}>Open the four levers ›</Text>
    </Pressable>
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

  // ── BQ-058 allocation + health summary
  allocationBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  donut: { width: 116, height: 116, alignItems: 'center', justifyContent: 'center' },
  donutSegment: {
    position: 'absolute',
    width: 9,
    height: 22,
    borderRadius: radius.pill,
  },
  donutCenter: { alignItems: 'center' },
  donutNumber: { fontFamily: font.monoSemibold, fontSize: 24, color: colors.ink },
  donutUnit: {
    fontFamily: font.mono,
    fontSize: 9,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  allocationLegend: { flex: 1, gap: spacing.md },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendMarker: { width: 8, height: 8, borderRadius: radius.pill, marginRight: spacing.sm },
  legendLabel: { flex: 1, fontFamily: font.ui, fontSize: 13, color: colors.inkSecondary },
  legendValue: { fontFamily: font.mono, fontSize: 14, color: colors.ink },
  allocationNote: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: font.tutor,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSecondary,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  healthTitle: { fontFamily: font.uiSemibold, fontSize: 16, color: colors.ink },
  healthMeta: { fontFamily: font.ui, fontSize: 12, color: colors.inkSecondary, marginTop: 2 },
  healthScore: { fontFamily: font.monoSemibold, fontSize: 30, color: colors.ink },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  scoreCell: {
    width: '50%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lineSoft,
  },
  scoreCellValue: { fontFamily: font.mono, fontSize: 18, color: colors.ink },
  scoreCellLabel: { fontFamily: font.ui, fontSize: 11, color: colors.inkSecondary, marginTop: 2 },
  openHealth: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: font.uiMedium,
    fontSize: 13,
    color: colors.tutor,
  },

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

  trendCard: {
    marginTop: spacing.xxl,
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  trendLabel: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.tutor,
    marginBottom: spacing.xs,
  },
  trendTitle: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.ink, marginBottom: spacing.xs },
  trendBody: { fontFamily: font.tutor, fontSize: 14, lineHeight: 20, color: colors.inkSecondary },
});
