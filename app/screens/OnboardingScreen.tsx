import { useMemo, useState } from 'react';
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
import type { OnboardingDestination } from '../navigation/MainTabs';

type Option = { label: string; value: string };
type QuestionContent = { eyebrow: string; title: string; helper: string; options: Option[]; multi?: boolean };

const QUESTIONS: Record<AssessmentQuestion, QuestionContent> = {
  immediate_intent: {
    eyebrow: 'A useful starting point',
    title: 'What would you like FinTutor to help you do first?',
    helper: 'This only shapes where we begin. It is not a recommendation.',
    options: [
      { label: 'Understand the basics', value: 'learn_basics' },
      { label: 'See how my financial picture fits together', value: 'connect_picture' },
      { label: 'Understand something I already have', value: 'understand_existing' },
      { label: 'Explore a goal or scenario', value: 'model_future' },
      { label: 'Build a learning routine', value: 'build_routine' },
      { label: 'Ask Arya a question', value: 'ask_arya' },
      { label: 'Just look around', value: 'explore' },
      { label: 'Prefer not to choose', value: 'undisclosed' },
    ],
  },
  earning_context: {
    eyebrow: 'Your current context',
    title: 'Which description is closest to where you are today?',
    helper: 'No income amount is needed.',
    options: [
      { label: 'Studying', value: 'student' },
      { label: 'Preparing to start earning', value: 'pre_earning' },
      { label: 'Started earning recently', value: 'early_earner' },
      { label: 'Working for a few years', value: 'established_earner' },
      { label: 'My situation or income varies', value: 'variable_or_transitioning' },
      { label: 'Prefer not to say', value: 'undisclosed' },
    ],
  },
  responsibility_context: {
    eyebrow: 'The people money supports',
    title: 'How are day-to-day financial responsibilities arranged?',
    helper: 'Choose the closest fit—you can change this later.',
    options: [
      { label: 'Mostly just me', value: 'self' },
      { label: 'Shared or family expenses', value: 'shared' },
      { label: 'Others depend on me', value: 'dependents' },
      { label: 'It changes month to month', value: 'variable' },
      { label: 'Prefer not to say', value: 'undisclosed' },
    ],
  },
  exposure_flags: {
    eyebrow: 'What you have encountered',
    title: 'Which money topics are already part of your life?',
    helper: 'Choose any that fit. We still do not need amounts or account details.',
    multi: true,
    options: [
      { label: 'Spending', value: 'spending' },
      { label: 'Saving', value: 'saving' },
      { label: 'Investing', value: 'investing' },
      { label: 'Borrowing or EMIs', value: 'borrowing' },
      { label: 'Insurance', value: 'insurance' },
      { label: 'Financial goals', value: 'goals' },
      { label: 'Workplace benefits or tax', value: 'workplace_and_tax' },
      { label: 'None of these yet', value: 'none' },
      { label: 'Not sure', value: 'unsure' },
      { label: 'Prefer not to say', value: 'undisclosed' },
    ],
  },
  familiarity: {
    eyebrow: 'How explanations should begin',
    title: 'How familiar do these topics generally feel?',
    helper: 'This changes explanation depth, not what you are allowed to explore.',
    options: [
      { label: 'Start from the foundations', value: 'foundations' },
      { label: 'I know the working basics', value: 'working_basics' },
      { label: 'I am connecting the pieces', value: 'connecting' },
      { label: 'I want deeper context', value: 'deeper_context' },
      { label: 'It varies by topic', value: 'variable' },
      { label: 'Prefer not to say', value: 'undisclosed' },
    ],
  },
};

const EXCLUSIVE_EXPOSURE = new Set(['none', 'unsure', 'undisclosed']);

function destinationFor(intent: string | null): OnboardingDestination {
  if (intent === 'understand_existing') return 'Portfolio';
  if (intent === 'model_future') return 'Tools';
  if (intent === 'ask_arya' || intent === 'learn_basics') return 'Chat';
  return 'Consolidated';
}

function handoffCopy(destination: OnboardingDestination) {
  if (destination === 'Portfolio') return ['See the whole picture', 'Open Portfolio'];
  if (destination === 'Tools') return ['Try a scenario without changing real money', 'Open Tools'];
  if (destination === 'Chat') return ['Start with a question or teaching moment', 'Open Arya'];
  return ['See your starting point and explore at your pace', 'Go to Home'];
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
  const [showWhy, setShowWhy] = useState(false);

  const question = assessment?.current_question ?? 'immediate_intent';
  const content = QUESTIONS[question];
  const index = assessmentQuestions.indexOf(question);
  const immediateIntent = (closing ?? assessment)?.answers.immediate_intent;
  const destination = destinationFor(typeof immediateIntent === 'string' ? immediateIntent : null);
  const closingCopy = useMemo(() => handoffCopy(destination), [destination]);

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
      if (EXCLUSIVE_EXPOSURE.has(value)) return [value];
      return [...current.filter((item) => !EXCLUSIVE_EXPOSURE.has(item)), value];
    });
  }

  if (closing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.closing}>
          <Text style={styles.kicker}>YOUR FINTUTOR JOURNEY</Text>
          <Text style={styles.closingTitle}>You’re starting at Discovering.</Text>
          <Text style={styles.closingBody}>
            That only means your FinTutor journey is beginning—not that you’re a beginner with money.
            You can change how Arya explains things at any time.
          </Text>
          <View style={styles.handoff}>
            <Text style={styles.handoffLabel}>A PLACE TO BEGIN</Text>
            <Text style={styles.handoffText}>{closingCopy[0]}</Text>
            <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setShowWhy((value) => !value)}>
              <Text style={styles.whyLink}>{showWhy ? 'Hide explanation' : 'Why am I seeing this?'}</Text>
            </Pressable>
            {showWhy ? (
              <Text style={styles.whyText}>
                This suggestion comes only from what you chose to explore first. Every part of FinTutor remains available.
              </Text>
            ) : null}
          </View>
          <PrimaryButton label={closingCopy[1]} busy={false} onPress={() => onDone(destination)} />
        </View>
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
  closing: { flex: 1, justifyContent: 'center', padding: spacing.xl, maxWidth: 620, width: '100%', alignSelf: 'center' },
  closingTitle: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 34, lineHeight: 41, marginBottom: spacing.lg },
  closingBody: { color: colors.inkSecondary, fontFamily: font.tutor, fontSize: 19, lineHeight: 28, marginBottom: spacing.xxl },
  handoff: { borderLeftWidth: 2, borderLeftColor: colors.tutor, paddingLeft: spacing.lg, paddingVertical: spacing.sm, marginBottom: spacing.xxl },
  handoffLabel: { color: colors.inkMuted, fontFamily: font.monoMedium, fontSize: 10, letterSpacing: 0.8, marginBottom: spacing.sm },
  handoffText: { color: colors.ink, fontFamily: font.uiMedium, fontSize: 16, lineHeight: 23 },
  whyLink: { color: colors.tutor, fontFamily: font.uiMedium, fontSize: 13, marginTop: spacing.lg, textDecorationLine: 'underline' },
  whyText: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 13, lineHeight: 20, marginTop: spacing.sm },
});
