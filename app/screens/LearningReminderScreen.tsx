import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import {
  disableLearningReminder,
  enableLearningReminder,
  getLearningReminderState,
  pauseLearningReminder,
  type LearningReminderState,
} from '../lib/learningReminders';
import type { MainTabsParamList } from '../navigation/types';

export function LearningReminderScreen() {
  const { userId } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const [state, setState] = useState<LearningReminderState | null>(null);
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!userId) return;
    getLearningReminderState(userId).then((next) => {
      setState(next);
      setHour(next.hour === null ? '' : String(next.hour));
      setMinute(next.minute === null ? '' : String(next.minute).padStart(2, '0'));
    }).catch(() => setError('Reminder settings could not be loaded.'));
  }, [userId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async () => {
    if (!userId) return;
    if (hour.trim() === '' || minute.trim() === '') {
      setError('Choose both an hour and minute.'); return;
    }
    const h = Number(hour); const m = Number(minute);
    if (!Number.isInteger(h) || h < 0 || h > 23 || !Number.isInteger(m) || m < 0 || m > 59) {
      setError('Enter a time using hour 0–23 and minute 0–59.'); return;
    }
    setError(null);
    try {
      const result = await enableLearningReminder(userId, h, m);
      if (result === 'denied') setError('Notification access is off. Enable it in your device settings if you want this reminder.');
      load();
    } catch { setError('The reminder could not be scheduled. Try again.'); }
  };
  const pause = async () => { if (userId) { await pauseLearningReminder(userId); load(); } };
  const disable = async () => { if (userId) { await disableLearningReminder(userId); load(); } };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => navigation.navigate('Progress')}><Text style={styles.back}>‹ Learning progress</Text></Pressable>
      <Text style={styles.heading}>Daily learning reminder</Text>
      <Text style={styles.body}>One generic local reminder at a time you choose. It never uses balances, holdings, products, streak pressure, or financial outcomes.</Text>
      <Text style={styles.status}>Status: {state?.status ?? 'loading'}</Text>
      <View style={styles.timeRow}>
        <TextInput style={styles.input} value={hour} onChangeText={setHour} keyboardType="number-pad" placeholder="Hour (0–23)" accessibilityLabel="Reminder hour, 0 to 23" />
        <Text style={styles.separator}>:</Text>
        <TextInput style={styles.input} value={minute} onChangeText={setMinute} keyboardType="number-pad" placeholder="Minute" accessibilityLabel="Reminder minute, 0 to 59" />
      </View>
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      {state?.permissionDenied ? <Pressable onPress={() => Linking.openSettings().catch(() => setError('Device settings could not be opened.'))}><Text style={styles.settingsLink}>Open device notification settings</Text></Pressable> : null}
      <Pressable style={styles.primary} onPress={save}><Text style={styles.primaryText}>{state?.status === 'enabled' ? 'Change time' : 'Enable reminder'}</Text></Pressable>
      {state?.status === 'enabled' ? <Pressable style={styles.secondary} onPress={pause}><Text style={styles.secondaryText}>Pause</Text></Pressable> : null}
      {state?.status !== 'disabled' || state?.hour !== null ? <Pressable style={styles.secondary} onPress={disable}><Text style={styles.secondaryText}>Disable and clear time</Text></Pressable> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screen }, content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  back: { fontFamily: font.uiMedium, color: colors.tutor, fontSize: 14, marginBottom: spacing.lg },
  heading: { fontFamily: font.uiSemibold, fontSize: 24, color: colors.ink },
  body: { fontFamily: font.ui, fontSize: 14, lineHeight: 21, color: colors.inkSecondary, marginTop: spacing.sm },
  status: { fontFamily: font.mono, fontSize: 13, color: colors.ink, marginTop: spacing.xl },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  input: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md, fontFamily: font.mono, color: colors.ink },
  separator: { marginHorizontal: spacing.sm, fontFamily: font.mono, color: colors.ink },
  error: { color: colors.danger, fontFamily: font.ui, lineHeight: 19, marginTop: spacing.md },
  settingsLink: { color: colors.tutor, fontFamily: font.uiSemibold, marginTop: spacing.md, textDecorationLine: 'underline' },
  primary: { backgroundColor: colors.tutor, borderRadius: radius.md, padding: 14, alignItems: 'center', marginTop: spacing.xl },
  primaryText: { color: colors.canvas, fontFamily: font.uiSemibold },
  secondary: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, padding: 14, alignItems: 'center', marginTop: spacing.md },
  secondaryText: { color: colors.inkSecondary, fontFamily: font.uiSemibold },
});
