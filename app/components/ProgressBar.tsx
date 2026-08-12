import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../design/tokens';

export function ProgressBar({
  fraction,
  min = 0,
  max = 1,
  value = fraction,
}: {
  fraction: number;
  min?: number;
  max?: number;
  value?: number;
}) {
  const width = `${Math.max(0, Math.min(1, fraction)) * 100}%` as `${number}%`;
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min, max, now: Math.max(min, Math.min(max, value)) }}
    >
      <View style={[styles.fill, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 7, backgroundColor: colors.lineSoft, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.tutor, borderRadius: radius.pill },
});
