import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, font, radius, spacing } from '../design/tokens';
import type { CalculatorType, MainTabsParamList } from '../navigation/types';

// BQ-057 (D-105): Tools tab — calculator entry point list.
// Batch 1: C-04, C-10, C-17, C-22, C-24.
// Navigates to CalculatorScreen (hidden tab) with { type, label }.

type CalcEntry = { type: CalculatorType; label: string; description: string };

const CALCULATORS: CalcEntry[] = [
  {
    type: 'sip_goal',
    label: 'SIP Goal Planner',
    description: 'Find the monthly SIP needed to reach a corpus target.',
  },
  {
    type: 'emi',
    label: 'Home Loan EMI',
    description: 'Calculate your monthly instalment and total interest.',
  },
  {
    type: 'inflation',
    label: 'Inflation Impact',
    description: "See what today's cost becomes after inflation compounds.",
  },
  {
    type: 'stepup_sip',
    label: 'Step-up SIP',
    description: 'Model a SIP that increases each year as your income grows.',
  },
  {
    type: 'cagr_backward',
    label: 'CAGR Calculator',
    description: 'Measure the annualised return on any investment you hold.',
  },
];

export function ToolsScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Tools</Text>

      <Text style={styles.sectionLabel}>Calculators</Text>
      <View style={styles.card}>
        {CALCULATORS.map((c, idx) => (
          <Pressable
            key={c.type}
            style={[styles.row, idx < CALCULATORS.length - 1 && styles.rowBorder]}
            onPress={() => navigation.navigate('Calculator', { type: c.type, label: c.label })}
          >
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{c.label}</Text>
              <Text style={styles.rowDesc}>{c.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  heading: {
    fontFamily: font.uiSemibold,
    fontSize: 24,
    color: colors.ink,
    marginBottom: spacing.xl,
  },
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
  rowBody: { flex: 1 },
  rowLabel: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.ink },
  rowDesc: { fontFamily: font.ui, fontSize: 12, color: colors.inkSecondary, marginTop: 2, lineHeight: 17 },
  chevron: { fontFamily: font.ui, fontSize: 18, color: colors.inkMuted, marginLeft: spacing.sm },
});
