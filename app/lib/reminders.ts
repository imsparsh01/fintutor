import * as Notifications from 'expo-notifications';
import type { Holding } from './holdings';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDER_KEY = 'fintutor:reminder:';

export async function scheduleHoldingReminder(holding: Holding): Promise<boolean> {
  await cancelHoldingReminder(holding.id);
  const date = nextReminderDate(holding);
  if (!date) return false;
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    const requested = await Notifications.requestPermissionsAsync();
    if (!requested.granted) return false;
  }
  const identifier = await Notifications.scheduleNotificationAsync({
    content: { title: 'FinTutor reminder', body: reminderBody(holding.product_type) },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
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

function nextReminderDate(holding: Holding): Date | null {
  const c = holding.characteristics;
  if (holding.product_type === 'credit_card_debt' && typeof c.payment_due_date === 'string') {
    const date = new Date(`${c.payment_due_date}T09:00:00`);
    return Number.isNaN(date.getTime()) ? null : date > new Date() ? date : null;
  }
  if ((holding.product_type === 'home_loan' || holding.product_type === 'personal_loan') && typeof c.emi_due_day === 'number') {
    const day = Math.min(31, Math.max(1, Math.floor(c.emi_due_day)));
    const now = new Date();
    let date = new Date(now.getFullYear(), now.getMonth(), Math.min(day, daysInMonth(now.getFullYear(), now.getMonth())), 9);
    if (date <= now) date = new Date(now.getFullYear(), now.getMonth() + 1, Math.min(day, daysInMonth(now.getFullYear(), now.getMonth() + 1)), 9);
    return date;
  }
  return null;
}

function daysInMonth(year: number, month: number): number { return new Date(year, month + 1, 0).getDate(); }
function reminderBody(productType: string): string {
  return productType === 'credit_card_debt' ? 'A payment date you recorded is coming up.' : 'An EMI date you recorded is coming up.';
}
