import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import type { Holding } from './holdings';
import { nextReminderOccurrences, reminderScheduleFor } from './reminderSchedule';

const REMINDER_KEY = 'fintutor:reminder:';
const holdingOperations = new Map<string, Promise<unknown>>();

export async function scheduleHoldingReminder(holding: Holding): Promise<boolean> {
  return withHoldingLock(holding.id, () => replaceHoldingReminder(holding, true));
}

/** Refresh an existing reminder horizon without prompting on foreground activation. */
export async function refreshHoldingReminders(holdings: Holding[]): Promise<void> {
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;
  const activeIds = new Set(holdings.map((holding) => holding.id));
  const storedKeys = await AsyncStorage.getAllKeys();
  await Promise.all(storedKeys.filter((key) => key.startsWith(REMINDER_KEY)).map(async (key) => {
    const holdingId = key.slice(REMINDER_KEY.length);
    if (activeIds.has(holdingId)) return;
    await withHoldingLock(holdingId, async () => {
      const stored = await AsyncStorage.getItem(key);
      await cancelIds(stored ? parseIdentifiers(stored) : []);
      // Keep the marker so this explicitly-created reminder can resume if its
      // owning account becomes active again. Deleted holdings remove the key.
      await AsyncStorage.setItem(key, JSON.stringify([]));
    });
  }));
  await Promise.all(
    holdings.map(async (holding) => {
      // D-101 prohibits silent scheduling. Foreground work may extend a horizon that
      // this device already scheduled, but global permission (including permission
      // granted for the learning reminder) is not consent to create a holding reminder.
      const existing = await AsyncStorage.getItem(`${REMINDER_KEY}${holding.id}`);
      if (existing === null) return;
      await withHoldingLock(holding.id, () => replaceHoldingReminder(holding, false));
    })
  );
}

async function replaceHoldingReminder(holding: Holding, mayRequestPermission: boolean): Promise<boolean> {
  await cancelHoldingReminderUnlocked(holding.id);
  const schedule = reminderScheduleFor(holding);
  if (!schedule) return false;

  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && mayRequestPermission) {
    permission = await Notifications.requestPermissionsAsync();
  }
  if (!permission.granted) return false;

  const identifiers: string[] = [];
  try {
    for (const occurrence of nextReminderOccurrences(schedule)) {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: { title: 'FinTutor reminder', body: schedule.body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: occurrence.date,
        },
      });
      identifiers.push(identifier);
    }
    await AsyncStorage.setItem(`${REMINDER_KEY}${holding.id}`, JSON.stringify(identifiers));
    return identifiers.length > 0;
  } catch (error) {
    await Promise.all(
      identifiers.map((identifier) =>
        Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined)
      )
    );
    throw error;
  }
}

export async function cancelHoldingReminder(holdingId: string): Promise<void> {
  return withHoldingLock(holdingId, () => cancelHoldingReminderUnlocked(holdingId));
}

async function cancelHoldingReminderUnlocked(holdingId: string): Promise<void> {
  const key = `${REMINDER_KEY}${holdingId}`;
  const stored = await AsyncStorage.getItem(key);
  const identifiers = stored ? parseIdentifiers(stored) : [];
  await cancelIds(identifiers);
  await AsyncStorage.removeItem(key);
}

async function cancelIds(identifiers: string[]): Promise<void> {
  await Promise.all(identifiers.map((identifier) =>
    Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined)
  ));
}

function withHoldingLock<T>(holdingId: string, operation: () => Promise<T>): Promise<T> {
  const previous = holdingOperations.get(holdingId) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(operation);
  holdingOperations.set(holdingId, current);
  const cleanup = () => {
    if (holdingOperations.get(holdingId) === current) holdingOperations.delete(holdingId);
  };
  current.then(cleanup, cleanup);
  return current;
}

function parseIdentifiers(stored: string): string[] {
  try {
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    // The earlier implementation stored one raw identifier rather than JSON.
  }
  return [stored];
}
