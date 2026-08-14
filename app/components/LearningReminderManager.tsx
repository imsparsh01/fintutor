import { useEffect, useState } from 'react';
import { AppState, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, radius, spacing } from '../design/tokens';
import {
  dismissLearningReminderOffer,
  activateLearningReminderUser,
  enableLearningReminder,
  getLearningReminderState,
  refreshLearningReminder,
  subscribeToLearningReminderEligibility,
} from '../lib/learningReminders';

export function LearningReminderManager({ userId }: { userId: string }) {
  const [visible, setVisible] = useState(false);
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const checkOffer = () => getLearningReminderState(userId).then((state) => {
      if (active) setVisible(state.eligible && !state.offered);
    }).catch(() => undefined);
    activateLearningReminderUser(userId).catch(() => undefined);
    checkOffer();
    const unsubscribe = subscribeToLearningReminderEligibility((changedUserId) => {
      if (changedUserId === userId) checkOffer();
    });
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshLearningReminder(userId).catch(() => undefined);
        checkOffer();
      }
    });
    return () => { active = false; unsubscribe(); appState.remove(); };
  }, [userId]);

  const dismiss = async () => {
    setVisible(false);
    await dismissLearningReminderOffer(userId).catch(() => undefined);
  };
  const enable = async () => {
    if (hour.trim() === '' || minute.trim() === '') {
      setError('Choose both an hour and minute.');
      return;
    }
    const chosenHour = Number(hour);
    const chosenMinute = Number(minute);
    if (!Number.isInteger(chosenHour) || chosenHour < 0 || chosenHour > 23 || !Number.isInteger(chosenMinute) || chosenMinute < 0 || chosenMinute > 59) {
      setError('Enter a time using hour 0–23 and minute 0–59.');
      return;
    }
    setSaving(true); setError(null);
    try {
      const status = await enableLearningReminder(userId, chosenHour, chosenMinute);
      setVisible(false);
      if (status === 'denied') setError(null);
    } catch {
      setError('The reminder could not be scheduled. Try again.');
    } finally { setSaving(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.backdrop} accessibilityViewIsModal>
        <View style={styles.card}>
          <Text style={styles.title} accessibilityRole="header">Would a daily learning reminder help?</Text>
          <Text style={styles.body}>Choose a local time for one short, generic FinTutor reminder each day. It will never include your financial information.</Text>
          <View style={styles.timeRow}>
            <TextInput style={styles.timeInput} value={hour} onChangeText={setHour} keyboardType="number-pad" placeholder="Hour (0–23)" accessibilityLabel="Reminder hour, 0 to 23" />
            <Text style={styles.separator}>:</Text>
            <TextInput style={styles.timeInput} value={minute} onChangeText={setMinute} keyboardType="number-pad" placeholder="Minute" accessibilityLabel="Reminder minute, 0 to 59" />
          </View>
          {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
          <Pressable style={[styles.primary, saving && styles.disabled]} disabled={saving} onPress={enable}><Text style={styles.primaryText}>Enable reminder</Text></Pressable>
          <Pressable style={styles.secondary} onPress={dismiss}><Text style={styles.secondaryText}>Not now</Text></Pressable>
          <Text style={styles.note}>If notification access is declined, FinTutor will not ask again. You can manage this later in Learning progress.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(22,33,28,0.42)', justifyContent: 'center', padding: spacing.xl },
  card: { backgroundColor: colors.canvas, borderRadius: radius.lg, padding: spacing.xl },
  title: { fontFamily: font.uiSemibold, fontSize: 20, color: colors.ink },
  body: { fontFamily: font.ui, fontSize: 14, lineHeight: 20, color: colors.inkSecondary, marginTop: spacing.sm },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl },
  timeInput: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md, color: colors.ink, fontFamily: font.mono },
  separator: { marginHorizontal: spacing.sm, fontFamily: font.mono, color: colors.ink },
  error: { color: colors.danger, fontFamily: font.ui, marginTop: spacing.md },
  primary: { marginTop: spacing.xl, borderRadius: radius.md, backgroundColor: colors.tutor, padding: 14, alignItems: 'center' },
  disabled: { opacity: 0.5 }, primaryText: { color: colors.canvas, fontFamily: font.uiSemibold },
  secondary: { padding: 14, alignItems: 'center' }, secondaryText: { color: colors.inkSecondary, fontFamily: font.uiSemibold },
  note: { fontFamily: font.ui, fontSize: 12, lineHeight: 17, color: colors.inkMuted },
});
