import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../design/tokens';

// The single "what we won't say" / "what lives here" teaching callout (D-091 and the
// family-section empty states share the same product pattern). Coherence fix 1A: two
// agents drew this two different ways in parallel; this is Design A, kept because the
// green teaching plane is the stronger read for a teaching callout — a hairline-bordered
// canvas box (Design B) reads as a disclaimer, not a lesson.
//
// `heading` is stored sentence case by callers; the uppercase rendering happens here via
// textTransform, not by shouting in the source string.
export function TeachingBlock({
  heading,
  children,
  style,
}: {
  heading: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.heading}>{heading}</Text>
      {typeof children === 'string' ? <Text style={styles.body}>{children}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  heading: {
    fontFamily: font.uiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.tutor,
    marginBottom: spacing.sm,
  },
  body: { fontFamily: font.tutor, fontSize: 15, lineHeight: 22, color: colors.ink },
});
