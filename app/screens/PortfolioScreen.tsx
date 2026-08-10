import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, font, radius, spacing } from '../design/tokens';
import type { MainTabsParamList } from '../navigation/types';

// D-106: Portfolio tab — detailed holdings view. Placeholder structure; BQ-054 (Health Score),
// BQ-058 (donut chart + sub-scores), and BQ-061 (overlap indicator) fill this screen in.
// For now: family section navigation rows (Investments, Loans, Insurance, Budgeting)
// give access to the family holding screens that were previously their own tabs.
export function PortfolioScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();

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

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonLabel}>Coming soon</Text>
        <Text style={styles.comingSoonBody}>Asset allocation, financial health score, and portfolio overlap will appear here once built.</Text>
      </View>
    </ScrollView>
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
