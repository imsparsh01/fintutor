import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ProgressBar } from '../components/ProgressBar';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import {
  fetchProgression,
  fetchProgressionHistory,
  type ProgressionHistoryEvent,
  type ProgressionSummary,
} from '../lib/progression';
import type { MainTabsParamList } from '../navigation/types';

const STAGE_LABELS: Record<string, string> = {
  discovering: 'Discovering', exploring: 'Exploring', connecting: 'Connecting',
  deepening: 'Deepening', expanding: 'Expanding',
};

export function ProgressScreen() {
  const { userId } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const [summary, setSummary] = useState<ProgressionSummary | null>(null);
  const [history, setHistory] = useState<ProgressionHistoryEvent[]>([]);

  useFocusEffect(useCallback(() => {
    let active = true;
    setSummary(null);
    setHistory([]);
    if (!userId) return () => { active = false; };
    Promise.all([fetchProgression(userId), fetchProgressionHistory(userId)])
      .then(([nextSummary, nextHistory]) => {
        if (active) { setSummary(nextSummary); setHistory(nextHistory); }
      })
      .catch(() => { if (active) { setSummary(null); setHistory([]); } });
    return () => { active = false; };
  }, [userId]));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => navigation.navigate('Consolidated')}><Text style={styles.back}>‹ Home</Text></Pressable>
      <Text style={styles.heading}>Learning progress</Text>
      <Text style={styles.guardrail}>This reflects participation across FinTutor—not competence, financial health, or financial success.</Text>
      <Pressable style={styles.reminderLink} onPress={() => navigation.navigate('LearningReminder')} accessibilityRole="button">
        <Text style={styles.reminderLinkText}>Daily learning reminder settings</Text>
      </Pressable>
      {summary && <>
        <View style={styles.hero}>
          <Text style={styles.stage}>{STAGE_LABELS[summary.stage] ?? summary.stage}</Text>
          <Text style={styles.points}>{summary.points} points</Text>
          <ProgressBar
            fraction={summary.stage_progress.fraction}
            min={summary.stage_progress.start}
            max={summary.stage_progress.end}
            value={summary.stage_progress.value}
          />
          <Text style={styles.range}>
            {summary.stage_progress.value} of {summary.stage_progress.end} points toward the {summary.next_stage ? 'next stage threshold' : 'next 250-point milestone'}
          </Text>
        </View>
        {summary.next_stage ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>To reach {STAGE_LABELS[summary.next_stage]}</Text>
            <Gate label="Points" remaining={summary.unmet_conditions.points} done="Point condition met" />
            <Gate label="Kinds of learning activity" remaining={summary.unmet_conditions.dimensions} done="Breadth condition met" />
            <Gate label="Meaningful return days" remaining={summary.unmet_conditions.return_days} done="Return-day condition met" />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Expanding</Text>
            <Text style={styles.body}>{summary.expanding_milestones} full 250-point milestone{summary.expanding_milestones === 1 ? '' : 's'} beyond the Expanding threshold. Your lifetime total remains {summary.points}.</Text>
          </View>
        )}
      </>}
      <Text style={styles.section}>Recent qualifying actions</Text>
      <View style={styles.card}>
        {history.length === 0 ? <Text style={styles.body}>Your qualifying learning actions will appear here.</Text> : history.map((event, index) => (
          <View key={`${event.occurred_at}:${event.event_type}:${index}`} style={[styles.event, index < history.length - 1 && styles.divider]}>
            <Text style={styles.eventTitle}>{eventLabel(event)}</Text>
            <Text style={styles.eventMeta}>{dateLabel(event.occurred_at)} · {dimensionLabel(event.dimension)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Gate({ label, remaining, done }: { label: string; remaining?: number; done: string }) {
  return <Text style={styles.gate}>{remaining ? `${remaining} more ${label.toLowerCase()}` : done}</Text>;
}

function eventLabel(event: ProgressionHistoryEvent): string {
  if (event.event_type === 'onboarding_handled') return 'Set your learning starting point';
  if (event.event_type === 'context_prompt_handled') return 'Handled a context prompt';
  if (event.event_type === 'arya_exchange_completed') return 'Explored a question with Arya';
  if (event.event_type === 'calculator_completed') return `Completed ${friendlySubject(event.subject_key)} calculator`;
  if (event.event_type === 'scenario_completed') return `Explored ${friendlySubject(event.subject_key)} scenario`;
  if (event.event_type === 'capability_first_used') return `First used ${friendlySubject(event.subject_key)}`;
  return 'Completed a qualifying learning action';
}
const SUBJECTS: Record<string, string> = { sip_goal: 'SIP goal', emi: 'EMI', inflation: 'inflation impact', stepup_sip: 'step-up SIP', cagr_backward: 'CAGR', emergency_runway: 'emergency runway', sip_increase: 'monthly investment', debt_cost: 'debt cost', idle_cash: 'idle cash', corpus_target: 'corpus target', arya: 'Arya', calculator: 'a calculator', scenario: 'a scenario' };
function friendlySubject(value: string | null) { return value ? SUBJECTS[value] ?? 'a learning tool' : 'a learning tool'; }
function dimensionLabel(value: string) { return ({ explore: 'Explore', model: 'Model', reflect: 'Reflect' } as Record<string, string>)[value] ?? 'Learning'; }
function dateLabel(value: string) { return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen }, content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  back: { fontFamily: font.uiMedium, color: colors.tutor, fontSize: 14, marginBottom: spacing.lg },
  heading: { fontFamily: font.uiSemibold, fontSize: 25, color: colors.ink },
  guardrail: { fontFamily: font.ui, fontSize: 14, lineHeight: 20, color: colors.inkSecondary, marginTop: spacing.sm },
  reminderLink: { alignSelf: 'flex-start', marginTop: spacing.md }, reminderLinkText: { color: colors.tutor, fontFamily: font.uiSemibold, fontSize: 14 },
  hero: { backgroundColor: colors.tutorSoft, borderRadius: radius.lg, padding: spacing.xl, marginTop: spacing.xl, gap: spacing.md },
  stage: { fontFamily: font.uiSemibold, fontSize: 22, color: colors.ink }, points: { fontFamily: font.monoSemibold, fontSize: 16, color: colors.ink },
  range: { fontFamily: font.ui, fontSize: 12, color: colors.inkSecondary }, section: { fontFamily: font.mono, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.inkMuted, marginTop: spacing.xxl, marginBottom: spacing.sm },
  card: { backgroundColor: colors.canvas, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, padding: spacing.lg, marginTop: spacing.lg },
  cardTitle: { fontFamily: font.uiSemibold, fontSize: 16, color: colors.ink, marginBottom: spacing.sm }, body: { fontFamily: font.ui, fontSize: 14, lineHeight: 20, color: colors.inkSecondary },
  gate: { fontFamily: font.ui, fontSize: 14, lineHeight: 22, color: colors.ink }, event: { paddingVertical: spacing.sm }, divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, eventTitle: { fontFamily: font.uiMedium, fontSize: 14, color: colors.ink }, eventMeta: { fontFamily: font.mono, fontSize: 11, color: colors.inkMuted, marginTop: spacing.xs },
});
