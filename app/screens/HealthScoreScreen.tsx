import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TeachingBlock } from '../components/TeachingBlock';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { healthInsuranceStorageKey, loadHealthScoreSnapshot, updateHealthScoreInputs } from '../lib/healthScoreSnapshot';
import { patchFinancialContext } from '../lib/financialContext';
import type { HealthScoreSnapshot } from '../lib/healthScoreSnapshot';
import type { MainTabsParamList } from '../navigation/types';

type ExpandedRow = 'investmentRate' | 'insurance' | 'emergency' | 'taxUtil' | null;

export function HealthScoreScreen() {
  const { userId } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const route = useRoute<RouteProp<MainTabsParamList, 'HealthScore'>>();
  const [state, setState] = useState<HealthScoreSnapshot | null>(null);
  const [expanded, setExpanded] = useState<ExpandedRow>(null);
  const [draftMonths, setDraftMonths] = useState('');

  const loadData = useCallback(() => {
    if (!userId) return;
    let active = true;
    setState(null);
    loadHealthScoreSnapshot(userId).then((snapshot) => { if (active) setState(snapshot); });
    return () => { active = false; };
  }, [userId]);

  useFocusEffect(loadData);

  useFocusEffect(useCallback(() => {
    setExpanded(route.params?.focus ?? null);
  }, [route.params?.focus]));

  const subScores = state?.subScores ?? {
    investmentRate: null,
    insurance: null,
    emergency: null,
    taxUtil: null,
  };
  const score = state?.score ?? null;
  const measured = state?.measured ?? 0;

  async function saveEmergencyMonths() {
    const trimmed = draftMonths.trim();
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1200) return;
    if (userId) {
      await patchFinancialContext({ emergency_fund_months: parsed });
      const next = updateHealthScoreInputs(userId, { emergencyMonths: trimmed });
      if (next) setState(next);
    }
    setExpanded(null);
    setDraftMonths('');
  }

  async function saveHealthIns(answer: 'yes' | 'no') {
    if (userId) {
      await AsyncStorage.setItem(healthInsuranceStorageKey(userId), answer);
      const next = updateHealthScoreInputs(userId, { hasHealthIns: answer });
      if (next) setState(next);
    }
    setExpanded(null);
  }

  function toggleRow(row: ExpandedRow) {
    if (expanded === row) {
      setExpanded(null);
    } else {
      setExpanded(row);
      if (row === 'emergency') {
        setDraftMonths(state?.emergencyMonths ?? '');
      }
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Explicit navigate, not goBack(). A bottom-tab navigator defaults to
          backBehavior: 'firstRoute', so goBack() from a hidden screen lands on Home —
          verified in the web preview — which contradicts the label on this control. */}
      <Pressable style={styles.back} onPress={() => navigation.navigate('Portfolio')}>
        <Text style={styles.backText}>‹ Portfolio</Text>
      </Pressable>

      <Text style={styles.heading}>Portfolio Health</Text>

      {/* Hero score */}
      <View style={styles.scoreBlock}>
        <Text style={styles.scoreNumber}>{score !== null ? String(score) : '—'}</Text>
        <Text style={styles.scoreBand}>
          {measured === 0 ? 'No areas measured yet' : `${measured} of 4 areas measured`}
        </Text>
        <Text style={styles.scoreIntro}>
          Each row below shows one lever and what it measures. The overall score is the
          average of only the areas where we have your data{measured < 4 && measured > 0 ? ' — it will shift as you fill in the gaps' : ''}.
        </Text>
      </View>

      {/* Sub-score rows */}
      <View style={styles.card}>
        <SubScoreRow
          label="Investment rate"
          mechanismNote="How much of your monthly income goes into equity or debt mutual funds (SIPs). 10% of income = 100 points."
          score={subScores.investmentRate}
          ctaLabel="Add income & SIP data in Budgeting"
          onFill={() => navigation.navigate('Budgeting')}
          isExpanded={expanded === 'investmentRate'}
          onToggle={() => toggleRow('investmentRate')}
          last={false}
        />
        <SubScoreRow
          label="Insurance safety net"
          mechanismNote={
            'Whether you have health insurance (the lever), and term cover on top of it.\n' +
            'Health-only: 50 pts. Health + term: 75 pts. Term only: 0 pts — term replaces income when you\'re gone; it doesn\'t cover the medical bills that arrive before then.'
          }
          score={subScores.insurance}
          ctaLabel="Tell us about your cover"
          onFill={() => toggleRow('insurance')}
          isExpanded={expanded === 'insurance'}
          onToggle={() => toggleRow('insurance')}
          last={false}
        >
          {expanded === 'insurance' && (
            <View style={styles.inlineForm}>
              <Text style={styles.inlineQuestion}>Do you have health insurance?</Text>
              <View style={styles.inlineButtons}>
                <Pressable
                  style={[styles.answerBtn, state?.hasHealthIns === 'yes' && styles.answerBtnSelected]}
                  onPress={() => saveHealthIns('yes')}
                >
                  <Text style={[styles.answerBtnText, state?.hasHealthIns === 'yes' && styles.answerBtnTextSelected]}>Yes</Text>
                </Pressable>
                <Pressable
                  style={[styles.answerBtn, state?.hasHealthIns === 'no' && styles.answerBtnSelected]}
                  onPress={() => saveHealthIns('no')}
                >
                  <Text style={[styles.answerBtnText, state?.hasHealthIns === 'no' && styles.answerBtnTextSelected]}>No</Text>
                </Pressable>
              </View>
            </View>
          )}
        </SubScoreRow>
        <SubScoreRow
          label="Emergency buffer"
          mechanismNote="Months of expenses you can cover without income. 12 months = 100 points. This optional confirmed value is stored with your account."
          score={subScores.emergency}
          ctaLabel="Enter your emergency fund months"
          onFill={() => toggleRow('emergency')}
          isExpanded={expanded === 'emergency'}
          onToggle={() => toggleRow('emergency')}
          last={false}
        >
          {expanded === 'emergency' && (
            <View style={styles.inlineForm}>
              <Text style={styles.inlineQuestion}>How many months of expenses could you cover?</Text>
              <View style={styles.inlineRow}>
                <TextInput
                  style={styles.monthsInput}
                  value={draftMonths}
                  onChangeText={setDraftMonths}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 6"
                  placeholderTextColor={colors.inkMuted}
                  maxLength={5}
                />
                <Text style={styles.monthsUnit}>months</Text>
                <Pressable style={styles.saveBtn} onPress={saveEmergencyMonths}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </Pressable>
              </View>
            </View>
          )}
        </SubScoreRow>
        <SubScoreRow
          label="Tax utilisation"
          mechanismNote="Annual 80C contributions: PPF, EPF, and insurance premiums. ₹1.5L / year = 100 points."
          score={subScores.taxUtil}
          ctaLabel="Add holdings to compute"
          onFill={() => navigation.navigate('Investments')}
          isExpanded={expanded === 'taxUtil'}
          onToggle={() => toggleRow('taxUtil')}
          last
        />
      </View>

      {/* D-091 standing block — always shown */}
      <TeachingBlock heading="What we won't say" style={styles.teachingBlock}>
        {'Whether this score is good or bad. What this screen does: shows the levers and what each one measures, so you can see exactly where you are.'}
      </TeachingBlock>
    </ScrollView>
  );
}

interface SubScoreRowProps {
  label: string;
  mechanismNote: string;
  score: number | null;
  ctaLabel: string;
  onFill: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  last?: boolean;
  children?: React.ReactNode;
}

function SubScoreRow({
  label,
  mechanismNote,
  score,
  ctaLabel,
  onFill,
  isExpanded,
  onToggle,
  last,
  children,
}: SubScoreRowProps) {
  return (
    <View style={[styles.rowWrapper, !last && styles.rowBorder]}>
      <Pressable style={styles.row} onPress={onToggle}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>{label}</Text>
          {isExpanded && (
            <Text style={styles.mechanismNote}>{mechanismNote}</Text>
          )}
        </View>
        <View style={styles.rowRight}>
          {score !== null ? (
            <Text style={styles.scoreValue}>{score}/100</Text>
          ) : (
            <Pressable style={styles.ctaChip} onPress={onFill}>
              <Text style={styles.ctaText}>{ctaLabel} ›</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },

  back: { marginBottom: spacing.lg },
  backText: { fontFamily: font.ui, fontSize: 15, color: colors.tutor },

  heading: {
    fontFamily: font.uiSemibold,
    fontSize: 24,
    color: colors.ink,
    marginBottom: spacing.xxl,
  },

  scoreBlock: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  scoreNumber: {
    fontFamily: font.mono,
    fontSize: 64,
    color: colors.ink,
    lineHeight: 72,
  },
  scoreBand: {
    fontFamily: font.mono,
    fontSize: 13,
    color: colors.inkSecondary,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  scoreIntro: {
    fontFamily: font.tutor,
    fontSize: 14,
    color: colors.inkSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },

  card: {
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
  },

  rowWrapper: {},
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  rowLabel: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.ink },
  mechanismNote: {
    fontFamily: font.tutor,
    fontSize: 13,
    color: colors.inkSecondary,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  rowRight: { alignItems: 'flex-end', marginLeft: spacing.md, flexShrink: 0 },
  scoreValue: { fontFamily: font.mono, fontSize: 15, color: colors.ink },

  ctaChip: {
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  ctaText: { fontFamily: font.ui, fontSize: 12, color: colors.tutor },

  inlineForm: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  inlineQuestion: {
    fontFamily: font.tutor,
    fontSize: 14,
    color: colors.ink,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  inlineButtons: { flexDirection: 'row', gap: spacing.sm },
  answerBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    alignItems: 'center',
    backgroundColor: colors.canvas,
  },
  answerBtnSelected: {
    backgroundColor: colors.tutor,
    borderColor: colors.tutor,
  },
  answerBtnText: { fontFamily: font.uiSemibold, fontSize: 14, color: colors.ink },
  answerBtnTextSelected: { color: colors.canvas },

  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  monthsInput: {
    fontFamily: font.mono,
    fontSize: 16,
    color: colors.ink,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: 72,
    backgroundColor: colors.screen,
  },
  monthsUnit: { fontFamily: font.ui, fontSize: 14, color: colors.inkSecondary },
  saveBtn: {
    backgroundColor: colors.tutor,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  saveBtnText: { fontFamily: font.uiSemibold, fontSize: 14, color: colors.canvas },

  teachingBlock: { marginTop: 0 },
});
