import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../design/tokens';
import {
  clearAssessmentContext,
  updateAssessmentContext,
  type AssessmentQuestion,
  type AssessmentState,
} from '../lib/onboardingAssessment';
import {
  ASSESSMENT_QUESTIONS,
  EXCLUSIVE_EXPOSURE_VALUES,
  assessmentValueLabels,
} from '../lib/assessmentVocabulary';

export function AssessmentContextScreen({
  userId,
  initialState,
  onBack,
}: {
  userId: string;
  initialState: AssessmentState;
  onBack: () => void;
}) {
  const [assessment, setAssessment] = useState(initialState);
  const [editing, setEditing] = useState<AssessmentQuestion | null>(null);
  const [multiSelection, setMultiSelection] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  function beginEdit(question: AssessmentQuestion) {
    const value = assessment.answers[question];
    setMultiSelection(Array.isArray(value) ? value : []);
    setEditing(question);
    setError(null);
    setConfirmClear(false);
  }

  async function save(question: AssessmentQuestion, value: string | string[]) {
    setSaving(true);
    setError(null);
    try {
      setAssessment(await updateAssessmentContext(userId, question, value));
      setEditing(null);
    } catch {
      setError('We could not save that change just now. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function clearAll() {
    setSaving(true);
    setError(null);
    try {
      setAssessment(await clearAssessmentContext(userId));
      setConfirmClear(false);
      setEditing(null);
    } catch {
      setError('We could not clear your context just now. Try again.');
    } finally {
      setSaving(false);
    }
  }

  function toggleExposure(value: string) {
    setMultiSelection((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value);
      if (EXCLUSIVE_EXPOSURE_VALUES.has(value)) return [value];
      return [...current.filter((item) => !EXCLUSIVE_EXPOSURE_VALUES.has(item)), value];
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onBack}>
          <Text style={styles.back}>‹ Home</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Personalization</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>YOUR CONTEXT</Text>
        <Text style={styles.title}>How FinTutor begins explanations</Text>
        <Text style={styles.intro}>
          These optional categories shape where explanations begin. They do not limit what you can explore,
          and they contain no amounts or account details.
        </Text>
        {assessment.cleared_at ? (
          <View style={styles.clearedCard} accessibilityLiveRegion="polite">
            <Text style={styles.clearedTitle}>Personalization context cleared</Text>
            <Text style={styles.clearedBody}>Arya will use a neutral starting point until you add context again.</Text>
          </View>
        ) : null}

        <View style={styles.cards}>
          {Object.keys(ASSESSMENT_QUESTIONS).map((key) => {
            const question = key as AssessmentQuestion;
            const content = ASSESSMENT_QUESTIONS[question];
            const isEditing = editing === question;
            const labels = assessmentValueLabels(question, assessment.answers[question]);
            return (
              <View key={question} style={styles.card}>
                <Text style={styles.cardLabel}>{content.eyebrow.toUpperCase()}</Text>
                <Text style={styles.cardTitle}>{content.title}</Text>
                {!isEditing ? (
                  <>
                    <Text style={styles.currentValue}>{labels.length ? labels.join(', ') : 'Not provided'}</Text>
                    <Pressable accessibilityRole="button" onPress={() => beginEdit(question)} style={styles.changeButton}>
                      <Text style={styles.changeText}>Change</Text>
                    </Pressable>
                  </>
                ) : (
                  <View style={styles.editor}>
                    <Text style={styles.helper}>{content.helper}</Text>
                    {content.options.map((option) => {
                      const selected = content.multi
                        ? multiSelection.includes(option.value)
                        : assessment.answers[question] === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          accessibilityRole={content.multi ? 'checkbox' : 'radio'}
                          accessibilityState={{ checked: selected, disabled: saving }}
                          disabled={saving}
                          onPress={() => content.multi ? toggleExposure(option.value) : save(question, option.value)}
                          style={[styles.option, selected && styles.optionSelected]}
                        >
                          <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                          {selected ? <Text style={styles.check}>✓</Text> : null}
                        </Pressable>
                      );
                    })}
                    {content.multi ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ disabled: saving || multiSelection.length === 0 }}
                        disabled={saving || multiSelection.length === 0}
                        onPress={() => save(question, multiSelection)}
                        style={[styles.saveButton, multiSelection.length === 0 && styles.disabled]}
                      >
                        {saving ? <ActivityIndicator color={colors.screen} /> : <Text style={styles.saveText}>Save change</Text>}
                      </Pressable>
                    ) : null}
                    <Pressable accessibilityRole="button" disabled={saving} onPress={() => setEditing(null)} style={styles.cancelButton}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <View style={styles.clearArea}>
          <Text style={styles.clearTitle}>Clear personalization context</Text>
          <Text style={styles.clearBody}>
            This replaces all five answers with “Prefer not to say.” Your learning progress is not removed.
          </Text>
          {!confirmClear ? (
            <Pressable accessibilityRole="button" onPress={() => setConfirmClear(true)} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear my context</Text>
            </Pressable>
          ) : (
            <View style={styles.confirmArea}>
              <Text style={styles.confirmText}>Clear all personalization answers?</Text>
              <View style={styles.confirmActions}>
                <Pressable accessibilityRole="button" disabled={saving} onPress={clearAll} style={styles.confirmClear}>
                  {saving ? <ActivityIndicator color={colors.screen} /> : <Text style={styles.confirmClearText}>Yes, clear</Text>}
                </Pressable>
                <Pressable accessibilityRole="button" disabled={saving} onPress={() => setConfirmClear(false)} style={styles.keepButton}>
                  <Text style={styles.keepText}>Keep answers</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.screen },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  back: { color: colors.tutor, fontFamily: font.uiMedium, fontSize: 14 },
  headerTitle: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 15 },
  headerSpacer: { width: 50 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl, maxWidth: 620, width: '100%', alignSelf: 'center' },
  kicker: { color: colors.tutor, fontFamily: font.monoMedium, fontSize: 10, letterSpacing: 1, marginBottom: spacing.sm },
  title: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 28, lineHeight: 35 },
  intro: { color: colors.inkSecondary, fontFamily: font.tutor, fontSize: 16, lineHeight: 24, marginTop: spacing.md },
  clearedCard: { backgroundColor: colors.tutorSoft, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.xl },
  clearedTitle: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 14 },
  clearedBody: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 13, lineHeight: 19, marginTop: spacing.xs },
  cards: { gap: spacing.md, marginTop: spacing.xl },
  card: { backgroundColor: colors.canvas, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.lg },
  cardLabel: { color: colors.inkMuted, fontFamily: font.monoMedium, fontSize: 10, letterSpacing: 0.7 },
  cardTitle: { color: colors.ink, fontFamily: font.uiMedium, fontSize: 15, lineHeight: 21, marginTop: spacing.sm },
  currentValue: { color: colors.inkSecondary, fontFamily: font.tutor, fontSize: 16, lineHeight: 23, marginTop: spacing.md },
  changeButton: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginTop: spacing.sm },
  changeText: { color: colors.tutor, fontFamily: font.uiSemibold, fontSize: 13 },
  editor: { marginTop: spacing.md },
  helper: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 13, lineHeight: 19, marginBottom: spacing.md },
  option: { minHeight: 48, flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  optionSelected: { borderColor: colors.tutor, backgroundColor: colors.tutorSoft },
  optionText: { flex: 1, color: colors.ink, fontFamily: font.ui, fontSize: 14 },
  optionTextSelected: { color: colors.tutor, fontFamily: font.uiMedium },
  check: { color: colors.tutor, fontFamily: font.uiSemibold, fontSize: 15 },
  saveButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tutor, borderRadius: radius.md, marginTop: spacing.sm },
  saveText: { color: colors.screen, fontFamily: font.uiSemibold, fontSize: 14 },
  disabled: { opacity: 0.42 },
  cancelButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 13 },
  error: { color: colors.danger, fontFamily: font.ui, fontSize: 14, lineHeight: 20, marginTop: spacing.lg },
  clearArea: { marginTop: spacing.xxl, paddingTop: spacing.xl, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  clearTitle: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 15 },
  clearBody: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 13, lineHeight: 20, marginTop: spacing.sm },
  clearButton: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginTop: spacing.md },
  clearButtonText: { color: colors.danger, fontFamily: font.uiMedium, fontSize: 13 },
  confirmArea: { marginTop: spacing.lg },
  confirmText: { color: colors.ink, fontFamily: font.uiMedium, fontSize: 14 },
  confirmActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  confirmClear: { minHeight: 44, justifyContent: 'center', backgroundColor: colors.danger, borderRadius: radius.md, paddingHorizontal: spacing.lg },
  confirmClearText: { color: colors.screen, fontFamily: font.uiSemibold, fontSize: 13 },
  keepButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md },
  keepText: { color: colors.inkSecondary, fontFamily: font.uiMedium, fontSize: 13 },
});
