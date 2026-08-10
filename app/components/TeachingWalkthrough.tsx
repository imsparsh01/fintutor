import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../design/tokens';

// ---------------------------------------------------------------------------
// TeachingWalkthrough — full-screen, multi-step teaching moment ("fork 1f").
//
// Decided at D-090 (docs/decisions/D-090-teaching-moment-fullscreen-walkthrough.md),
// build item BQ-048. This is a presentation container only — it renders teaching
// content the caller supplies; it does not fetch, gate, or persist anything.
//
// USAGE
//
//   <TeachingWalkthrough
//     visible={showWalkthrough}
//     onDismiss={() => setShowWalkthrough(false)}
//     steps={[
//       { title: 'What compounding actually does', body: 'Each year, growth applies not just to what you put in, but to the growth you already earned...' },
//       { title: 'Why the first years look slow', body: 'Most of the curve happens late...', figures: [{ label: 'Year 1 growth', value: '₹4,200' }, { label: 'Year 20 growth', value: '₹1,84,000' }] },
//       { body: 'That is the whole mechanism — no more moving parts than that.' },
//     ]}
//   />
//
// ---------------------------------------------------------------------------
// THE P9 GUARD — load-bearing, not stylistic. Read D-090 in full before editing.
//
// A full-screen multi-step sequence is, by construction, the one format of the
// three fork options (1d chat bubble, 1e mechanism card, 1f this) capable of
// being turned into the "lesson tree" PROJECT_SPEC.md §2 forbids. D-090 is
// explicit that the drift toward that happens through a few small, individually
// reasonable-looking additions — not one obviously bad call. So: do not add a
// completion callback, a required-read gate, a quiz, a resume-where-you-left-off
// feature, or a progress percentage to this component, even if a future feature
// seems to want one. That feature needs its own new decision record, not a prop
// added here.
//
// The four requirements, and how this file enforces each one:
//
//   1. Skip is live on every step.
//      The header's Skip control is rendered once, outside the per-step body,
//      and calls `onDismiss` unconditionally. It is never removed, disabled, or
//      wrapped in a confirm step — including on the first and last steps.
//
//   2. Nothing unlocks at the end.
//      There is no `onComplete` prop, no "finished"/"completed" state, and no
//      value this component reports that differs from calling `onDismiss` early.
//      The final step's forward action is labelled "Done" but is wired to the
//      exact same `onDismiss` callback as Skip — reaching step N carries no
//      different consequence than leaving on step 1.
//
//   3. No comprehension check anywhere in the sequence.
//      Steps render prose (and optional inert figures) only. There is no input,
//      no answer, no correct/incorrect state, and no "confirm you've read this"
//      gate between steps or before Skip/Done.
//
//   4. Steps are freely navigable, and nothing persists.
//      Back/Next only move an in-memory index; both directions are always
//      enabled where a step exists in that direction. `currentStep` resets to 0
//      whenever `visible` flips to true, so re-entering always starts fresh.
//      No AsyncStorage, no store, no prop for initial step or resume position.
//
// Deliberately left OUT of the props to make violating the guard difficult:
//   - `onComplete` (would let a caller distinguish "finished" from "left early")
//   - `canSkip` / `requireAcknowledge` (would make Skip conditional)
//   - a completion percentage or step-count-reported-as-progress value
//   - any persisted/resumable position
// ---------------------------------------------------------------------------

export type WalkthroughStep = {
  title?: string;
  body: string;
  figures?: { label: string; value: string }[];
};

export type TeachingWalkthroughProps = {
  visible: boolean;
  steps: WalkthroughStep[];
  onDismiss: () => void;
};

export function TeachingWalkthrough({ visible, steps, onDismiss }: TeachingWalkthroughProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  // Re-entering always starts a fresh pass — never resume mid-sequence (P9 #4).
  useEffect(() => {
    if (visible) {
      setStepIndex(0);
      fade.setValue(1);
    }
  }, [visible, fade]);

  const total = steps.length;
  const safeIndex = Math.min(stepIndex, Math.max(total - 1, 0));
  const step = steps[safeIndex];
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === total - 1;

  const animateTo = (nextIndex: number) => {
    Animated.timing(fade, { toValue: 0, duration: 90, useNativeDriver: true }).start(() => {
      setStepIndex(nextIndex);
      Animated.timing(fade, { toValue: 1, duration: 120, useNativeDriver: true }).start();
    });
  };

  const goBack = () => {
    if (!isFirst) animateTo(safeIndex - 1);
  };

  const goForward = () => {
    if (!isLast) animateTo(safeIndex + 1);
  };

  if (!step) return null;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>
            {safeIndex + 1} / {total}
          </Text>
          {/* P9 #1 — Skip is unconditional, present on every step, first through last. */}
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.dashRow}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[styles.dash, i === safeIndex ? styles.dashActive : styles.dashInactive]}
            />
          ))}
        </View>

        <Animated.View style={[styles.bodyWrap, { opacity: fade }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {step.title ? <Text style={styles.title}>{step.title}</Text> : null}
            <Text style={styles.prose}>{step.body}</Text>

            {step.figures && step.figures.length > 0 ? (
              <View style={styles.figures}>
                {step.figures.map((f, i) => (
                  <View key={i} style={styles.figureRow}>
                    <Text style={styles.figureLabel}>{f.label}</Text>
                    <Text style={styles.figureValue}>{f.value}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>
        </Animated.View>

        <View style={styles.footer}>
          <Pressable
            onPress={goBack}
            disabled={isFirst}
            hitSlop={8}
            style={[styles.navButton, isFirst && styles.navButtonDisabled]}
          >
            <Text style={[styles.navText, isFirst && styles.navTextDisabled]}>Back</Text>
          </Pressable>

          {isLast ? (
            // Reaching the last step and pressing "Done" is wired to the same
            // onDismiss as Skip — there is no separate completion path (P9 #2).
            <Pressable onPress={onDismiss} hitSlop={8} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </Pressable>
          ) : (
            <Pressable onPress={goForward} hitSlop={8} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  stepIndicator: {
    fontFamily: font.mono,
    fontSize: 12,
    color: colors.inkMuted,
  },
  skipText: {
    fontFamily: font.ui,
    fontSize: 15,
    fontWeight: '600',
    color: colors.inkSecondary,
  },
  dashRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  dash: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  dashActive: {
    backgroundColor: colors.inkSecondary,
  },
  dashInactive: {
    backgroundColor: colors.line,
  },
  bodyWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontFamily: font.ui,
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  prose: {
    fontFamily: font.tutor,
    fontSize: 18,
    lineHeight: 28,
    color: colors.ink,
    maxWidth: 560,
  },
  figures: {
    marginTop: spacing.xxl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  figureRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  figureLabel: {
    fontFamily: font.ui,
    fontSize: 14,
    color: colors.inkSecondary,
  },
  // P10 — real financial figures render undecorated in mono ink; no valence colour.
  figureValue: {
    fontFamily: font.mono,
    fontSize: 15,
    color: colors.ink,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lineSoft,
  },
  navButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navText: {
    fontFamily: font.ui,
    fontSize: 15,
    fontWeight: '600',
    color: colors.inkSecondary,
  },
  navTextDisabled: {
    color: colors.inkMuted,
  },
  primaryButton: {
    backgroundColor: colors.tutor,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  primaryButtonText: {
    fontFamily: font.ui,
    fontSize: 15,
    fontWeight: '700',
    color: colors.screen,
  },
});
