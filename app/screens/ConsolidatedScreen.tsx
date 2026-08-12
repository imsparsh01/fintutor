import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ConsolidatedTotalsCard } from '../components/ConsolidatedTotalsCard';
import { ProgressBar } from '../components/ProgressBar';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { loadHealthScoreSnapshot } from '../lib/healthScoreSnapshot';
import {
  AssessmentApiError,
  dismissLegacyInvite,
  getAssessment,
  getLegacyCompatibility,
  hasDismissedLegacyInvite,
} from '../lib/onboardingAssessment';
import { randomRewardFact } from '../lib/rewardFacts';
import { fetchProgression, type ProgressionSummary } from '../lib/progression';
import { recordAppOpen, type StreakOpenResult } from '../lib/streaks';
import { fetchSurfacingCandidates, type SurfacingCandidate } from '../lib/surfacing';
import { supabase } from '../lib/supabase';
import type { HealthScoreSnapshot } from '../lib/healthScoreSnapshot';
import type {
  CalculatorType,
  MainTabsParamList,
  PortfolioHealthFocus,
  ScenarioType,
} from '../navigation/types';

const HEALTH_ROWS: Array<{ key: PortfolioHealthFocus; label: string }> = [
  { key: 'investmentRate', label: 'Investment rate' },
  { key: 'insurance', label: 'Insurance' },
  { key: 'emergency', label: 'Emergency buffer' },
  { key: 'taxUtil', label: 'Tax utilisation' },
];

const CALCULATOR_CARDS: Array<{ type: CalculatorType; label: string; prompt: string }> = [
  { type: 'sip_goal', label: 'SIP goal', prompt: 'Monthly amount for a target corpus' },
  { type: 'emi', label: 'Home-loan EMI', prompt: 'Instalment and interest from loan inputs' },
  { type: 'inflation', label: 'Inflation impact', prompt: "What today's cost becomes later" },
  { type: 'stepup_sip', label: 'Step-up SIP', prompt: 'Corpus when contributions rise yearly' },
  { type: 'cagr_backward', label: 'CAGR', prompt: 'Annualised change between two values' },
];

const SCENARIO_CARDS: Array<{ type: ScenarioType; label: string; prompt: string }> = [
  { type: 'emergency_runway', label: 'Emergency runway', prompt: 'Months your balances could cover' },
  { type: 'sip_increase', label: 'Invest more monthly', prompt: 'The corpus difference over time' },
  { type: 'debt_cost', label: 'Debt cost', prompt: 'Interest inside remaining repayments' },
  { type: 'idle_cash', label: 'Idle cash', prompt: 'One balance at two user-set rates' },
  { type: 'corpus_target', label: 'Corpus target', prompt: 'When your current path reaches it' },
];

const LEARN_CARDS = [
  { label: 'How compounding works', question: 'Teach me how compounding works with a simple example.' },
  { label: 'What an EMI contains', question: 'Teach me how principal and interest move inside an EMI.' },
  { label: 'What insurance transfers', question: 'Teach me what financial risk insurance transfers.' },
];

// BQ-060 / D-111: Richify-inspired structure adapted to FinTutor's eight approved sections.
// Every number remains neutral (P10), and every tool card opens a user-controlled mechanism.
export function ConsolidatedScreen() {
  const { userId, displayName } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const [streak, setStreak] = useState<StreakOpenResult | null>(null);
  const [candidate, setCandidate] = useState<SurfacingCandidate | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [rewardFact, setRewardFact] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthScoreSnapshot | null>(null);
  const [showAssessmentInvite, setShowAssessmentInvite] = useState(false);
  const [progression, setProgression] = useState<ProgressionSummary | null>(null);

  useEffect(() => {
    if (!userId) return;
    recordAppOpen(userId).then((result) => {
      setStreak(result);
      if (result.reward_fired) setRewardFact(randomRewardFact());
    }).catch(() => {});
  }, [userId]);

  const loadHome = useCallback(() => {
    let active = true;
    setProgression(null);
    if (!userId) return () => { active = false; };
    loadHealthScoreSnapshot(userId, true).then(setHealth);
    fetchSurfacingCandidates(userId)
      .then((items) => setCandidate(items[0] ?? null))
      .catch(() => setCandidate(null));
    fetchProgression(userId)
      .then((next) => { if (active) setProgression(next); })
      .catch(() => { if (active) setProgression(null); });
    return () => { active = false; };
  }, [userId]);

  useFocusEffect(loadHome);

  useFocusEffect(useCallback(() => {
    if (!userId) return;
    let active = true;
    setShowAssessmentInvite(false);
    shouldOfferAssessment(userId)
      .then((show) => { if (active) setShowAssessmentInvite(show); })
      .catch(() => { if (active) setShowAssessmentInvite(false); });
    return () => { active = false; };
  }, [userId]));

  if (!userId) return null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.greeting}>{greeting(displayName)}</Text>
          <Text style={styles.month}>{currentMonthLabel()}</Text>
        </View>
        {streak && streak.current_streak > 0 && (
          <View style={styles.streak}>
            <Text style={styles.streakGlyph}>🔥</Text>
            <Text style={styles.streakCount}>{streak.current_streak}</Text>
          </View>
        )}
      </View>

      <SectionLabel>Financial picture</SectionLabel>
      <ConsolidatedTotalsCard userId={userId} />

      <SectionLabel>Portfolio health</SectionLabel>
      <PortfolioHealthCard health={health} navigation={navigation} />

      <SectionLabel>Ask Arya</SectionLabel>
      {showAssessmentInvite && (
        <View style={styles.personalizeCard}>
          <Text style={styles.personalizeLabel}>OPTIONAL PERSONALIZATION</Text>
          <Text style={styles.personalizeTitle}>Personalize how Arya explains things</Text>
          <Text style={styles.personalizeBody}>
            Five quick, optional questions can tune where explanations begin. No amounts or account details.
          </Text>
          <View style={styles.aryaActions}>
            <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={() => navigation.navigate('Assessment')}>
              <Text style={styles.primaryButtonText}>Personalize Arya</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={async () => {
              try {
                await dismissLegacyInvite(userId);
                setShowAssessmentInvite(false);
              } catch {
                // Leave the card visible if its dismissal could not be remembered.
              }
            }}>
              <Text style={styles.secondaryAction}>Not now</Text>
            </Pressable>
          </View>
        </View>
      )}
      <View style={styles.aryaCard}>
        <View style={styles.aryaIdentity}>
          <View style={styles.aryaMark}><Text style={styles.aryaMarkText}>A</Text></View>
          <View style={styles.headerCopy}>
            <Text style={styles.aryaName}>Arya</Text>
            <Text style={styles.aryaRole}>Your financial tutor</Text>
          </View>
        </View>
        <Text style={styles.aryaBody}>
          {candidate && !dismissed
            ? tutorPrompt(candidate)
            : 'Bring one number or mechanism you want to understand. We can take it apart without choosing for you.'}
        </Text>
        <View style={styles.aryaActions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Chat', {
              prefillQuestion: candidate && !dismissed ? tutorPrefill(candidate) : undefined,
            })}
          >
            <Text style={styles.primaryButtonText}>Start a conversation</Text>
          </Pressable>
          {candidate && !dismissed && (
            <Pressable onPress={() => setDismissed(true)}><Text style={styles.secondaryAction}>Not now</Text></Pressable>
          )}
        </View>
      </View>

      <SectionLabel>Run the numbers</SectionLabel>
      <Text style={styles.sectionNote}>Calculators use figures you enter. No result is treated as a recommendation.</Text>
      <HorizontalCards>
        {CALCULATOR_CARDS.map((card) => (
          <ToolCard key={card.type} label={card.label} prompt={card.prompt} onPress={() => navigation.navigate('Calculator', card)} />
        ))}
      </HorizontalCards>

      <SectionLabel>What if…</SectionLabel>
      <Text style={styles.sectionNote}>Scenarios start from your records, and every prefilled figure remains editable.</Text>
      <HorizontalCards>
        {SCENARIO_CARDS.map((card) => (
          <ToolCard key={card.type} label={card.label} prompt={card.prompt} onPress={() => navigation.navigate('Scenario', card)} />
        ))}
      </HorizontalCards>

      <SectionLabel>Learn</SectionLabel>
      <View style={styles.learnCard}>
        {LEARN_CARDS.map((card, index) => (
          <Pressable
            key={card.label}
            style={[styles.learnRow, index < LEARN_CARDS.length - 1 && styles.rowBorder]}
            onPress={() => navigation.navigate('Chat', { prefillQuestion: card.question })}
          >
            <Text style={styles.learnLabel}>{card.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <SectionLabel>Keep learning</SectionLabel>
      <Pressable style={styles.progressCard} onPress={() => navigation.navigate('Progress')}>
        <View style={styles.progressHeader}>
          <View style={styles.headerCopy}>
            <Text style={styles.progressTitle}>{stageLabel(progression?.stage)} stage</Text>
            <Text style={styles.progressMeta}>{progression ? `${progression.points} participation points` : 'Loading learning progress'}</Text>
          </View>
          <Text style={styles.toolOpen}>Details ›</Text>
        </View>
        <ProgressBar
          fraction={progression?.stage_progress.fraction ?? 0}
          min={progression?.stage_progress.start ?? 0}
          max={progression?.stage_progress.end ?? 1}
          value={progression?.stage_progress.value ?? 0}
        />
      </Pressable>
      {rewardFact ? (
        <View style={styles.rewardFact}>
          <Text style={styles.rewardLabel}>A fact worth knowing</Text>
          <Text style={styles.rewardBody}>{rewardFact}</Text>
          <Pressable onPress={() => setRewardFact(null)}><Text style={styles.rewardDismiss}>Dismiss</Text></Pressable>
        </View>
      ) : (
        <View style={styles.streakCard}>
          <Text style={styles.streakCardNumber}>{streak?.current_streak ?? '—'}</Text>
          <View style={styles.headerCopy}>
            <Text style={styles.streakCardTitle}>day learning streak</Text>
            <Text style={styles.streakCardBody}>App opens are counted; financial outcomes never are.</Text>
          </View>
        </View>
      )}

      <Pressable style={styles.signOut} onPress={() => supabase?.auth.signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

function PortfolioHealthCard({
  health,
  navigation,
}: {
  health: HealthScoreSnapshot | null;
  navigation: BottomTabNavigationProp<MainTabsParamList>;
}) {
  return (
    <View style={styles.healthCard}>
      <Pressable style={styles.healthHeader} onPress={() => navigation.navigate('HealthScore', { focus: undefined })}>
        <View style={styles.headerCopy}>
          <Text style={styles.healthTitle}>Portfolio Health</Text>
          <Text style={styles.healthMeta}>{health ? `${health.measured} of 4 areas measured` : 'Loading coverage'}</Text>
        </View>
        <Text style={styles.healthOverall}>{health?.score ?? '—'}</Text>
      </Pressable>
      <View style={styles.healthGrid}>
        {HEALTH_ROWS.map((row) => {
          const value = health?.subScores[row.key];
          return (
            <Pressable
              key={row.key}
              style={styles.healthCell}
              onPress={() => navigation.navigate('HealthScore', { focus: row.key })}
            >
              <Text style={styles.healthCellValue}>{value === undefined || value === null ? '—' : value}</Text>
              <Text style={styles.healthCellLabel}>{row.label}</Text>
              <Text style={styles.healthCellOpen}>Open ›</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function HorizontalCards({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCards}>
      {children}
    </ScrollView>
  );
}

function ToolCard({ label, prompt, onPress }: { label: string; prompt: string; onPress: () => void }) {
  return (
    <Pressable style={styles.toolCard} onPress={onPress}>
      <Text style={styles.toolLabel}>{label}</Text>
      <Text style={styles.toolPrompt}>{prompt}</Text>
      <Text style={styles.toolOpen}>Open ›</Text>
    </Pressable>
  );
}

function greeting(name?: string | null): string {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return name ? `${part}, ${name}` : part;
}

function currentMonthLabel(): string {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function stageLabel(stage?: string): string {
  if (!stage) return 'Learning';
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

async function shouldOfferAssessment(userId: string): Promise<boolean> {
  try {
    if (await hasDismissedLegacyInvite(userId)) return false;
  } catch {
    // A storage failure must not turn an optional invitation into a blocking error.
  }
  try {
    await getAssessment(userId);
    return false;
  } catch (error) {
    if (!(error instanceof AssessmentApiError) || error.status !== 404) return false;
  }
  try {
    return await getLegacyCompatibility(userId);
  } catch {
    return false;
  }
}

function tutorPrompt(candidate: SurfacingCandidate): string {
  if (candidate.reason === 'loan_without_life_cover') {
    return "You’re carrying a loan, but there’s no term cover on record. Want to see how term insurance works with your own numbers?";
  }
  return 'There’s a mechanism in your records worth understanding. Want to walk through it with your own numbers?';
}

function tutorPrefill(candidate: SurfacingCandidate): string {
  if (candidate.reason === 'loan_without_life_cover') {
    return 'Can you explain how term insurance works, using my own numbers?';
  }
  return 'Can you walk me through this, using my own numbers?';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  headerCopy: { flex: 1 },
  greeting: { fontFamily: font.uiSemibold, fontSize: 24, color: colors.ink },
  month: { fontFamily: font.mono, fontSize: 12, letterSpacing: 0.5, color: colors.inkMuted, marginTop: spacing.xs },
  streak: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  streakGlyph: { fontSize: 14 },
  streakCount: { fontFamily: font.monoSemibold, fontSize: 15, color: colors.behaviour },
  sectionLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xxl,
    marginBottom: spacing.xs,
  },
  sectionNote: { fontFamily: font.tutor, fontSize: 13, lineHeight: 18, color: colors.inkSecondary, marginBottom: spacing.md },
  healthCard: { backgroundColor: colors.canvas, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, overflow: 'hidden' },
  healthHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  healthTitle: { fontFamily: font.uiSemibold, fontSize: 16, color: colors.ink },
  healthMeta: { fontFamily: font.ui, fontSize: 12, color: colors.inkSecondary, marginTop: 2 },
  healthOverall: { fontFamily: font.monoSemibold, fontSize: 30, color: colors.ink },
  healthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  healthCell: { width: '50%', padding: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.lineSoft },
  healthCellValue: { fontFamily: font.mono, fontSize: 20, color: colors.ink },
  healthCellLabel: { fontFamily: font.ui, fontSize: 12, color: colors.inkSecondary, marginTop: spacing.xs },
  healthCellOpen: { fontFamily: font.uiMedium, fontSize: 11, color: colors.tutor, marginTop: spacing.sm },
  aryaCard: { backgroundColor: colors.tutorSoft, borderRadius: radius.lg, padding: spacing.lg },
  personalizeCard: { backgroundColor: colors.canvas, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, padding: spacing.lg, marginBottom: spacing.md },
  personalizeLabel: { color: colors.tutor, fontFamily: font.monoMedium, fontSize: 10, letterSpacing: 0.8 },
  personalizeTitle: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 17, marginTop: spacing.sm },
  personalizeBody: { color: colors.inkSecondary, fontFamily: font.tutor, fontSize: 15, lineHeight: 22, marginTop: spacing.sm },
  aryaIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  aryaMark: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.tutor, alignItems: 'center', justifyContent: 'center' },
  aryaMarkText: { fontFamily: font.uiSemibold, fontSize: 18, color: colors.screen },
  aryaName: { fontFamily: font.uiSemibold, fontSize: 16, color: colors.ink },
  aryaRole: { fontFamily: font.ui, fontSize: 12, color: colors.inkSecondary, marginTop: 2 },
  aryaBody: { fontFamily: font.tutor, fontSize: 16, lineHeight: 23, color: colors.ink },
  aryaActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.lg },
  primaryButton: { backgroundColor: colors.tutor, borderRadius: radius.md, paddingVertical: 11, paddingHorizontal: spacing.lg },
  primaryButtonText: { fontFamily: font.uiSemibold, fontSize: 13, color: colors.screen },
  secondaryAction: { fontFamily: font.ui, fontSize: 13, color: colors.inkSecondary },
  horizontalCards: { gap: spacing.md, paddingRight: spacing.xl },
  toolCard: { width: 184, minHeight: 142, backgroundColor: colors.canvas, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, padding: spacing.lg },
  toolLabel: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.ink },
  toolPrompt: { flex: 1, fontFamily: font.tutor, fontSize: 13, lineHeight: 18, color: colors.inkSecondary, marginTop: spacing.sm },
  toolOpen: { fontFamily: font.uiMedium, fontSize: 12, color: colors.tutor, marginTop: spacing.md },
  learnCard: { backgroundColor: colors.canvas, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, overflow: 'hidden' },
  learnRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  learnLabel: { flex: 1, fontFamily: font.uiMedium, fontSize: 14, color: colors.ink },
  chevron: { fontFamily: font.ui, fontSize: 18, color: colors.inkMuted },
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: colors.behaviourSoft, borderRadius: radius.lg, padding: spacing.lg },
  progressCard: { backgroundColor: colors.canvas, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, padding: spacing.lg, marginBottom: spacing.md, gap: spacing.md },
  progressHeader: { flexDirection: 'row', alignItems: 'center' },
  progressTitle: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.ink },
  progressMeta: { fontFamily: font.ui, fontSize: 12, color: colors.inkSecondary, marginTop: 2 },
  streakCardNumber: { fontFamily: font.monoSemibold, fontSize: 30, color: colors.behaviour },
  streakCardTitle: { fontFamily: font.uiSemibold, fontSize: 14, color: colors.ink },
  streakCardBody: { fontFamily: font.tutor, fontSize: 12, lineHeight: 17, color: colors.inkSecondary, marginTop: 2 },
  rewardFact: { backgroundColor: colors.behaviourSoft, borderRadius: radius.lg, padding: spacing.lg },
  rewardLabel: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.behaviour },
  rewardBody: { fontFamily: font.tutor, fontSize: 16, lineHeight: 24, color: colors.ink, marginTop: spacing.sm },
  rewardDismiss: { fontFamily: font.uiMedium, fontSize: 13, color: colors.inkSecondary, marginTop: spacing.md },
  signOut: { paddingVertical: spacing.md, marginTop: spacing.xxl, alignItems: 'center' },
  signOutText: { fontFamily: font.ui, fontSize: 13, color: colors.inkMuted },
});
