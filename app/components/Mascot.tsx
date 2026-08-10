import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../design/tokens';

export type MascotMood = 'neutral' | 'celebrating' | 'encouraging';

const MOOD_EMOJI: Record<MascotMood, string> = {
  neutral: '🌱',
  celebrating: '🌿',
  encouraging: '🌱',
};

const MOOD_MESSAGE: Record<MascotMood, string> = {
  neutral: 'Ankur',
  celebrating: 'Nice one!',
  encouraging: 'Keep going!',
};

// Ankur — the mascot D-061/P7 permits as a cosmetic, behavior-reactive game
// element. Reacts only to app behavior (streaks, session activity), never to
// financial figures — that boundary is P7's, not a per-component choice.
// Placeholder emoji visual until real character art exists. Mood wiring to
// real trigger events: streak continuation (BQ-029/030/031, ConsolidatedScreen)
// and a completed teaching moment (this item, ChatThread) both call in;
// defaults to 'neutral' otherwise.
export function Mascot({ mood = 'neutral' }: { mood?: MascotMood }) {
  const active = mood !== 'neutral';
  return (
    <View style={[styles.container, active && styles.containerActive]}>
      <Text style={styles.emoji}>{MOOD_EMOJI[mood]}</Text>
      <Text style={[styles.message, active && styles.messageActive]}>{MOOD_MESSAGE[mood]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: spacing.md, borderRadius: radius.xl },
  // Clay marks a reaction moment (celebrating/encouraging) — never present at rest,
  // and never driven by anything but the app-behavior mood passed in.
  containerActive: { backgroundColor: colors.behaviourSoft },
  emoji: { fontSize: 40 },
  message: { fontSize: 13, color: colors.inkSecondary, marginTop: spacing.xs, fontFamily: font.ui },
  messageActive: { color: colors.behaviour, fontFamily: font.uiSemibold },
});
