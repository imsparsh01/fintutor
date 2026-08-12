import * as Notifications from 'expo-notifications';
import type { Holding } from './holdings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REMINDER_HOUR, reminderScheduleFor } from './reminderSchedule';

const REMINDER_KEY = 'fintutor:reminder:';

export async function scheduleHoldingReminder(holding: Holding): Promise<boolean> {
  await cancelHoldingReminder(holding.id);
  const schedule = reminderScheduleFor(holding);
  if (!schedule) return false;
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    const requested = await Notifications.requestPermissionsAsync();
    if (!requested.granted) return false;
  }
  // MONTHLY repeats on its own. The previous DATE trigger fired once and then went silent
  // until the user happened to re-edit the holding, so a recurring EMI reminded exactly once.
  const identifier = await Notifications.scheduleNotificationAsync({
    content: { title: 'FinTutor reminder', body: schedule.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
      day: schedule.day,
      hour: REMINDER_HOUR,
      minute: 0,
    },
  });
  await AsyncStorage.setItem(`${REMINDER_KEY}${holding.id}`, identifier);
  return true;
}

export async function cancelHoldingReminder(holdingId: string): Promise<void> {
  const key = `${REMINDER_KEY}${holdingId}`;
  const identifier = await AsyncStorage.getItem(key);
  if (identifier) await Notifications.cancelScheduledNotificationAsync(identifier);
  await AsyncStorage.removeItem(key);
}
