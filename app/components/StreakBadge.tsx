import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../design/tokens';

// D-060/D-061/P7: reacts only to the app-open/streak event, never to a financial figure.
// Clay (colors.behaviour / behaviourSoft) is reserved for this engagement component —
// must never migrate onto a ledger row or a real number.
export function StreakBadge({ currentStreak }: { currentStreak: number }) {
  const active = currentStreak > 0;
  const label = active ? `${currentStreak}-day streak` : 'Open the app tomorrow to start a streak';

  return (
    <View style={[styles.container, active && styles.containerActive]}>
      {active && <Text style={styles.flame}>🔥</Text>}
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  containerActive: { backgroundColor: colors.behaviourSoft },
  flame: { fontSize: 14, marginRight: spacing.xs },
  text: { fontSize: 14, color: colors.inkSecondary, fontFamily: font.uiSemibold },
  textActive: { color: colors.behaviour },
});
