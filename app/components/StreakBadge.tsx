import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../design/tokens';

// D-060/D-061/P7: reacts only to the app-open/streak event, never to a financial figure.
export function StreakBadge({ currentStreak }: { currentStreak: number }) {
  const label =
    currentStreak > 0
      ? `🔥 ${currentStreak}-day streak`
      : 'Open the app tomorrow to start a streak';

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  text: { fontSize: 14, fontWeight: '600', color: colors.text },
});
