import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';

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
// real trigger events (streak continuation — BQ-029/030/031; a completed
// teaching moment — BQ-023/024) isn't built yet; this is the reusable
// display piece those will call into, defaulting to 'neutral' until they do.
export function Mascot({ mood = 'neutral' }: { mood?: MascotMood }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{MOOD_EMOJI[mood]}</Text>
      <Text style={styles.message}>{MOOD_MESSAGE[mood]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  emoji: { fontSize: 40 },
  message: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
});
