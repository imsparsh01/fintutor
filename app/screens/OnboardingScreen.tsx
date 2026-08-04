import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChatThread, type ChatThreadHandle } from '../components/ChatThread';
import { colors, spacing } from '../design/tokens';

// D-058: chip-guided conversation (Option C — no structured field anywhere), the default
// landing screen right after registration, never a hard gate. "Skip for now" is always
// visible; once a chip or typed message has been sent, the same button becomes "Done —
// go to app" (still just dismisses). Resuming later is the persistent Chat tab (BQ-024) —
// no separate resume UI, per D-058's own "left to build-time, low-stakes" note.
const CHIP_STARTERS = [
  { label: 'I just started earning', message: "I just started earning and I'm not sure where to begin." },
  { label: 'I have a loan/EMI', message: 'I have a loan or EMI and want to understand it better.' },
  { label: 'I already track my budget', message: 'I already track my budget and want to go deeper.' },
  { label: 'Something else', message: "I'm not sure yet — help me figure out where to start." },
];

export function OnboardingScreen({ userId, onDone }: { userId: string; onDone: () => void }) {
  const threadRef = useRef<ChatThreadHandle>(null);
  const [engaged, setEngaged] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to FinTutor</Text>
        <Pressable onPress={onDone} hitSlop={8}>
          <Text style={styles.skip}>{engaged ? 'Done — go to app' : 'Skip for now'}</Text>
        </Pressable>
      </View>

      <ChatThread
        ref={threadRef}
        userId={userId}
        onMessageSent={() => setEngaged(true)}
        emptyState={
          <View style={styles.emptyState}>
            <Text style={styles.prompt}>What brings you here today?</Text>
            <View style={styles.chipRow}>
              {CHIP_STARTERS.map((chip) => (
                <Pressable
                  key={chip.label}
                  style={styles.chip}
                  onPress={() => threadRef.current?.send(chip.message)}
                >
                  <Text style={styles.chipText}>{chip.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  title: { fontSize: 18, fontWeight: '600', color: colors.text },
  skip: { color: colors.textSecondary, fontSize: 14 },
  emptyState: { alignItems: 'center' },
  prompt: { fontSize: 16, color: colors.text, marginBottom: spacing.lg, textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipText: { fontSize: 14, color: colors.text },
});
