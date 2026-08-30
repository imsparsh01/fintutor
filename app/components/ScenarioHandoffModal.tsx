import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';

export function ScenarioHandoffModal({ visible, prompt, onCancel, onConfirm }: {
  visible: boolean;
  prompt: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.backdrop} accessibilityViewIsModal>
      <View style={styles.card}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>Send this exact payload to Arya?</Text>
          <Text style={styles.body}>Nothing is sent until you confirm. The payload contains no names, institutions, record IDs, or source records.</Text>
          <View style={styles.payload}><Text selectable style={styles.payloadText}>{prompt}</Text></View>
          <Pressable accessibilityRole="button" style={styles.primary} onPress={onConfirm}><Text style={styles.primaryText}>Confirm and open Arya</Text></Pressable>
          <Pressable accessibilityRole="button" style={styles.secondary} onPress={onCancel}><Text style={styles.secondaryText}>Cancel</Text></Pressable>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(29, 26, 22, 0.45)', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 620, maxHeight: '88%', alignSelf: 'center', backgroundColor: colors.screen, borderRadius: radius.lg },
  content: { padding: spacing.xl },
  title: typography.pageTitle,
  body: { fontFamily: font.ui, fontSize: 14, lineHeight: 21, color: colors.inkSecondary, marginTop: spacing.sm },
  payload: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.canvas, padding: spacing.md, marginTop: spacing.lg },
  payloadText: { fontFamily: font.mono, fontSize: 12, lineHeight: 19, color: colors.ink },
  primary: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tutor, borderRadius: radius.md, marginTop: spacing.lg },
  primaryText: typography.primaryButtonText,
  secondary: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  secondaryText: { fontFamily: font.uiMedium, fontSize: 14, color: colors.inkSecondary },
});
