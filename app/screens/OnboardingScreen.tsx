import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../design/tokens';
import {
  answerAssessment,
  assessmentQuestions,
  handleAssessment,
  skipAssessmentQuestion,
  startAssessment,
  type AssessmentQuestion,
  type AssessmentState,
} from '../lib/onboardingAssessment';
import { ASSESSMENT_QUESTIONS, EXCLUSIVE_EXPOSURE_VALUES } from '../lib/assessmentVocabulary';
import type { OnboardingDestination } from '../navigation/MainTabs';

const HANDOFF_CHOICES: Array<{
  destination: OnboardingDestination;
  label: string;
  description: string;
}> = [
  { destination: 'Chat', label: 'Ask Arya', description: 'Start with a question or teaching moment.' },
  { destination: 'Portfolio', label: 'Something I manage', description: 'Add or understand a holding you already manage.' },
  { destination: 'Goals', label: 'A goal', description: 'Create a goal or explore how goal planning works.' },
  { destination: 'Tools', label: 'Calculators and scenarios', description: 'Try a calculator or model a what-if scenario.' },
  { destination: 'Consolidated', label: 'Home', description: 'Look around without adding any financial details.' },
];

function suggestedDestination(intent: unknown): OnboardingDestination | null {
  if (intent === 'ask_arya' || intent === 'learn_basics') return 'Chat';
  if (intent === 'connect_picture' || intent === 'understand_existing') return 'Portfolio';
  if (intent === 'model_future') return 'Tools';
  if (intent === 'build_routine') return 'Consolidated';
  // Skipped, unknown, explore, and undisclosed answers deliberately produce no
  // suggestion. Home remains equally visible without pretending an inference.
  return null;
}

export function OnboardingScreen({
  userId,
  initialState,
  onDone,
  onCancel,
}: {
  userId: string;
  initialState: AssessmentState | null;
  onDone: (destination: OnboardingDestination) => void;
  onCancel?: () => void;
}) {
  const [assessment, setAssessment] = useState(initialState);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState<AssessmentState | null>(null);
  const [choiceMade, setChoiceMade] = useState(false);
  const choiceMadeRef = useRef(false);

  const question = assessment?.current_question ?? 'immediate_intent';
  const content = ASSESSMENT_QUESTIONS[question];
  const index = assessmentQuestions.indexOf(question);

  async function run(action: () => Promise<AssessmentState | null>, finish = false) {
    setSaving(true);
    setError(null);
    try {
      const next = await action();
      if (next) {
        setAssessment(next);
        setSelected([]);
        if (finish || next.status === 'handled') setClosing(next);
      }
    } catch {
      setError('We could not save that just now. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function exitQuestions() {
    if (!assessment) return;
    await run(() => handleAssessment(userId), true);
  }

  function toggleExposure(value: string) {
    setSelected((current) => {
      if (current.includes(value)) return current.filter((item) => item !== value);
      if (EXCLUSIVE_EXPOSURE_VALUES.has(value)) return [value];
      return [...current.filter((item) => !EXCLUSIVE_EXPOSURE_VALUES.has(item)), value];
    });
  }

  if (closing) {
    const suggestion = suggestedDestination(closing.answers.immediate_intent);
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.closing}>
          <Text style={styles.kicker}>YOUR FINTUTOR JOURNEY</Text>
          <Text style={styles.closingTitle}>You’re starting at Discovering.</Text>
          <Text style={styles.closingBody}>
            That only means your FinTutor journey is beginning—not that you’re a beginner with money.
            You can change how Arya explains things at any time.
          </Text>
          <Text style={styles.handoffLabel}>CHOOSE A PLACE TO BEGIN</Text>
          <Text style={styles.handoffIntro}>
            Pick any starting point. Every part of FinTutor stays available, and Home requires no financial details.
          </Text>
          <View style={styles.handoffChoices}>
            {HANDOFF_CHOICES.map((choice) => (
              <Pressable
                key={choice.destination}
                accessibilityRole="button"
                accessibilityLabel={`${choice.label}. ${choice.description}${suggestion === choice.destination ? ' Suggested from what you chose.' : ''}`}
                accessibilityState={{ disabled: choiceMade }}
                disabled={choiceMade}
                onPress={() => {
                  if (choiceMadeRef.current) return;
                  choiceMadeRef.current = true;
                  setChoiceMade(true);
                  onDone(choice.destination);
                }}
                style={({ pressed }) => [styles.handoffChoice, pressed && styles.pressed]}
              >
                <View style={styles.handoffChoiceBody}>
                  <Text style={styles.handoffChoiceLabel}>{choice.label}</Text>
                  <Text style={styles.handoffChoiceDescription}>{choice.description}</Text>
                  {suggestion === choice.destination ? (
                    <Text style={styles.suggestedLabel}>Suggested from what you chose</Text>
                  ) : null}
                </View>
                <Text style={styles.handoffChevron}>›</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!assessment) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.intro}>
          <Text style={styles.brand}>FinTutor</Text>
          <Text style={styles.kicker}>A QUICK START</Text>
          <Text style={styles.introTitle}>Let’s make FinTutor useful for where you are today.</Text>
          <Text style={styles.introBody}>
            Five quick questions—no amounts or account details, and you can skip anything.
          </Text>
          <View style={styles.ageCard}>
            <Text style={styles.ageTitle}>FinTutor is currently for adults 18 and older.</Text>
            <Text style={styles.ageBody}>Continue to confirm that you are 18 or older.</Text>
          </View>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <PrimaryButton label="I’m 18 or older — begin" busy={saving} onPress={() => run(() => startAssessment(userId))} />
          {onCancel ? (
            <Pressable accessibilityRole="button" disabled={saving} onPress={onCancel} style={styles.skipQuestion}>
              <Text style={styles.skipQuestionText}>Not now</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.brandSmall}>FinTutor</Text>
        <Pressable accessibilityRole="button" disabled={saving} hitSlop={8} onPress={exitQuestions}>
          <Text style={styles.exit}>Continue to app</Text>
        </Pressable>
      </View>
      <View
        style={styles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityLabel={`Question ${index + 1} of ${assessmentQuestions.length}`}
      >
        <View style={[styles.progressFill, { width: `${((index + 1) / assessmentQuestions.length) * 100}%` }]} />
      </View>
      <ScrollView contentContainerStyle={styles.questionWrap}>
        <Text style={styles.step}>QUESTION {index + 1} OF {assessmentQuestions.length}</Text>
        <Text style={styles.kicker}>{content.eyebrow.toUpperCase()}</Text>
        <Text style={styles.questionTitle}>{content.title}</Text>
        <Text style={styles.helper}>{content.helper}</Text>
        <View style={styles.options} accessibilityRole={content.multi ? undefined : 'radiogroup'}>
          {content.options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <Pressable
                accessibilityRole={content.multi ? 'checkbox' : 'radio'}
                accessibilityState={{ checked: isSelected, disabled: saving }}
                disabled={saving}
                key={option.value}
                onPress={() => {
                  if (content.multi) toggleExposure(option.value);
                  else run(() => answerAssessment(userId, question, option.value));
                }}
                style={({ pressed }) => [styles.option, isSelected && styles.optionSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.label}</Text>
                {isSelected ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {content.multi ? (
          <PrimaryButton
            label="Continue"
            busy={saving}
            disabled={selected.length === 0}
            onPress={() => run(() => answerAssessment(userId, question, selected))}
          />
        ) : saving ? <ActivityIndicator color={colors.tutor} style={styles.loader} /> : null}
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={() => run(() => skipAssessmentQuestion(userId, question))}
          style={styles.skipQuestion}
        >
          <Text style={styles.skipQuestionText}>Skip this question</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function PrimaryButton({
  label,
  busy,
  disabled = false,
  onPress,
}: {
  label: string;
  busy: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [styles.primary, disabled && styles.primaryDisabled, pressed && styles.pressed]}
    >
      {busy ? <ActivityIndicator color={colors.screen} /> : <Text style={styles.primaryText}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.screen },
  intro: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, maxWidth: 620, width: '100%', alignSelf: 'center' },
  brand: { color: colors.tutor, fontFamily: font.uiSemibold, fontSize: 18, marginBottom: spacing.xxxl },
  brandSmall: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 16 },
  kicker: { color: colors.tutor, fontFamily: font.uiSemibold, fontSize: 11, letterSpacing: 1.3, marginBottom: spacing.md },
  introTitle: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 34, lineHeight: 41, marginBottom: spacing.lg },
  introBody: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 17, lineHeight: 26, marginBottom: spacing.xxl },
  ageCard: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.line, paddingVertical: spacing.lg, marginBottom: spacing.xxl },
  ageTitle: { color: colors.ink, fontFamily: font.uiMedium, fontSize: 15, lineHeight: 22 },
  ageBody: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 14, lineHeight: 21, marginTop: spacing.xs },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  exit: { color: colors.tutor, fontFamily: font.uiMedium, fontSize: 14 },
  progressTrack: { height: 2, backgroundColor: colors.lineSoft },
  progressFill: { height: 2, backgroundColor: colors.tutor },
  questionWrap: { padding: spacing.xl, paddingBottom: spacing.xxxl, maxWidth: 620, width: '100%', alignSelf: 'center' },
  step: { color: colors.inkMuted, fontFamily: font.monoMedium, fontSize: 11, letterSpacing: 0.7, marginBottom: spacing.xxl },
  questionTitle: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 27, lineHeight: 34, marginBottom: spacing.md },
  helper: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 15, lineHeight: 22, marginBottom: spacing.xl },
  options: { gap: spacing.sm, marginBottom: spacing.lg },
  option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.screen },
  optionSelected: { borderColor: colors.tutor, backgroundColor: colors.tutorSoft },
  optionText: { flex: 1, color: colors.ink, fontFamily: font.ui, fontSize: 15, lineHeight: 21 },
  optionTextSelected: { color: colors.tutor, fontFamily: font.uiMedium },
  check: { color: colors.tutor, fontFamily: font.uiSemibold, fontSize: 16, marginLeft: spacing.md },
  primary: { minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tutor, borderRadius: radius.md, paddingHorizontal: spacing.xl, marginTop: spacing.sm },
  primaryDisabled: { opacity: 0.42 },
  primaryText: { color: colors.screen, fontFamily: font.uiSemibold, fontSize: 15 },
  skipQuestion: { alignSelf: 'center', padding: spacing.lg },
  skipQuestionText: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 14, textDecorationLine: 'underline' },
  error: { color: colors.danger, fontFamily: font.ui, fontSize: 14, lineHeight: 20, marginBottom: spacing.md },
  loader: { marginVertical: spacing.md },
  pressed: { opacity: 0.7 },
  closing: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, paddingBottom: spacing.xxxl, maxWidth: 620, width: '100%', alignSelf: 'center' },
  closingTitle: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 34, lineHeight: 41, marginBottom: spacing.lg },
  closingBody: { color: colors.inkSecondary, fontFamily: font.tutor, fontSize: 19, lineHeight: 28, marginBottom: spacing.xxl },
  handoffLabel: { color: colors.inkMuted, fontFamily: font.monoMedium, fontSize: 10, letterSpacing: 0.8, marginBottom: spacing.sm },
  handoffIntro: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 14, lineHeight: 21, marginBottom: spacing.lg },
  handoffChoices: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.lg, overflow: 'hidden' },
  handoffChoice: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, backgroundColor: colors.canvas },
  handoffChoiceBody: { flex: 1 },
  handoffChoiceLabel: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 15 },
  handoffChoiceDescription: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 13, lineHeight: 19, marginTop: 2 },
  suggestedLabel: { color: colors.tutor, fontFamily: font.uiMedium, fontSize: 11, lineHeight: 16, marginTop: spacing.xs },
  handoffChevron: { color: colors.inkMuted, fontFamily: font.ui, fontSize: 20, marginLeft: spacing.md },
});
