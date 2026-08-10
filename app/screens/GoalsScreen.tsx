import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../design/tokens';

// D-106: Goals tab — illustrated goal cards, insurance entry, emergency CTA.
// Placeholder structure; BQ-059 builds the full illustrated goal-card grid,
// insurance entry section, and emergency readiness CTA.
export function GoalsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Goals</Text>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonLabel}>Coming soon</Text>
        <Text style={styles.comingSoonBody}>
          Set goals — retirement, home purchase, education, or wedding — and track how your holdings
          are building toward each one. Insurance coverage and emergency readiness will also appear
          here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  heading: { fontFamily: font.uiSemibold, fontSize: 24, color: colors.ink, marginBottom: spacing.xl },
  comingSoon: {
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  comingSoonLabel: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.tutor,
    marginBottom: spacing.xs,
  },
  comingSoonBody: { fontFamily: font.tutor, fontSize: 15, lineHeight: 22, color: colors.ink },
});
