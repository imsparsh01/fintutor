import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { nextLearningReminderOccurrences, validReminderTime } from './learningReminderSchedule';

export type LearningReminderStatus = 'disabled' | 'paused' | 'enabled';
export type LearningReminderState = {
  eligible: boolean;
  offered: boolean;
  status: LearningReminderStatus;
  hour: number | null;
  minute: number | null;
  permissionDenied: boolean;
  notificationIds: string[];
};

const listeners = new Set<(userId: string) => void>();
const operations = new Map<string, Promise<unknown>>();
const keyFor = (userId: string) => `fintutor:learning-reminder:${userId}`;
const DEFAULT_STATE: LearningReminderState = {
  eligible: false, offered: false, status: 'disabled', hour: null, minute: null,
  permissionDenied: false, notificationIds: [],
};

export async function getLearningReminderState(userId: string): Promise<LearningReminderState> {
  return readState(userId);
}

/** Keep only the authenticated account's generic reminder active on a shared device. */
export async function activateLearningReminderUser(userId: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  await Promise.all(keys.filter((key) => key.startsWith('fintutor:learning-reminder:') && key !== keyFor(userId)).map(async (key) => {
    const otherUserId = key.slice('fintutor:learning-reminder:'.length);
    await withUserLock(otherUserId, async () => {
      const state = await readState(otherUserId);
      await cancelIds(state.notificationIds);
      await writeState(otherUserId, { ...state, notificationIds: [] });
    });
  }));
  await refreshLearningReminder(userId);
}

/** Called only after a valid learning result or successful Arya response. */
export function noteMeaningfulLearningInteraction(userId: string): void {
  void withUserLock(userId, async () => {
    const state = await readState(userId);
    if (!state.eligible) await writeState(userId, { ...state, eligible: true });
    listeners.forEach((listener) => listener(userId));
  });
}

export function subscribeToLearningReminderEligibility(listener: (userId: string) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function dismissLearningReminderOffer(userId: string): Promise<void> {
  await withUserLock(userId, async () => {
    const state = await readState(userId);
    await writeState(userId, { ...state, offered: true });
  });
}

export async function enableLearningReminder(userId: string, hour: number, minute: number): Promise<'enabled' | 'denied'> {
  if (!validReminderTime(hour, minute)) throw new Error('invalid_time');
  return withUserLock(userId, async () => {
    let state = await readState(userId);
    // Record the offer before opening the OS prompt. A denial must never cause a later nag.
    state = { ...state, eligible: true, offered: true, hour, minute };
    await writeState(userId, state);
    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) {
      await cancelIds(state.notificationIds);
      await writeState(userId, { ...state, status: 'disabled', permissionDenied: true, notificationIds: [] });
      return 'denied';
    }
    await replaceSchedule(userId, { ...state, status: 'enabled', permissionDenied: false });
    return 'enabled';
  });
}

export async function pauseLearningReminder(userId: string): Promise<void> {
  await withUserLock(userId, async () => {
    const state = await readState(userId);
    await cancelIds(state.notificationIds);
    await writeState(userId, { ...state, status: 'paused', notificationIds: [] });
  });
}

export async function disableLearningReminder(userId: string): Promise<void> {
  await withUserLock(userId, async () => {
    const state = await readState(userId);
    await cancelIds(state.notificationIds);
    await writeState(userId, { ...state, status: 'disabled', hour: null, minute: null, notificationIds: [] });
  });
}

export async function refreshLearningReminder(userId: string): Promise<void> {
  await withUserLock(userId, async () => {
    const state = await readState(userId);
    if (state.status !== 'enabled' || state.hour === null || state.minute === null) {
      if (state.notificationIds.length > 0) {
        await cancelIds(state.notificationIds);
        await writeState(userId, { ...state, notificationIds: [] });
      }
      return;
    }
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) {
      await cancelIds(state.notificationIds);
      await writeState(userId, { ...state, status: 'disabled', permissionDenied: true, notificationIds: [] });
      return;
    }
    await replaceSchedule(userId, state);
  });
}

async function replaceSchedule(userId: string, state: LearningReminderState): Promise<void> {
  if (state.hour === null || state.minute === null) return;
  const newIds: string[] = [];
  try {
    for (const occurrence of nextLearningReminderOccurrences(state.hour, state.minute)) {
      newIds.push(await Notifications.scheduleNotificationAsync({
        content: {
          title: 'FinTutor learning reminder',
          body: occurrence.body,
          data: { fintutorRoute: 'Consolidated', reminderKind: 'learning' },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: occurrence.date },
      }));
    }
    await writeState(userId, { ...state, notificationIds: newIds });
    await cancelIds(state.notificationIds);
  } catch (error) {
    await cancelIds(newIds);
    throw error;
  }
}

async function cancelIds(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
}

async function readState(userId: string): Promise<LearningReminderState> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  if (!raw) return { ...DEFAULT_STATE };
  try {
    const value = JSON.parse(raw) as Partial<LearningReminderState>;
    const storedHour = typeof value.hour === 'number' && Number.isInteger(value.hour) ? value.hour : null;
    const storedMinute = typeof value.minute === 'number' && Number.isInteger(value.minute) ? value.minute : null;
    const hasValidTime = storedHour !== null && storedMinute !== null && validReminderTime(storedHour, storedMinute);
    const requestedStatus = value.status === 'enabled' || value.status === 'paused' ? value.status : 'disabled';
    return {
      eligible: value.eligible === true,
      offered: value.offered === true,
      status: requestedStatus !== 'disabled' && !hasValidTime ? 'disabled' : requestedStatus,
      hour: hasValidTime ? storedHour : null,
      minute: hasValidTime ? storedMinute : null,
      permissionDenied: value.permissionDenied === true,
      notificationIds: Array.isArray(value.notificationIds) ? value.notificationIds.filter((id): id is string => typeof id === 'string') : [],
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

async function writeState(userId: string, state: LearningReminderState): Promise<void> {
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(state));
}

function withUserLock<T>(userId: string, operation: () => Promise<T>): Promise<T> {
  const previous = operations.get(userId) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(operation);
  operations.set(userId, current);
  const cleanup = () => { if (operations.get(userId) === current) operations.delete(userId); };
  current.then(cleanup, cleanup);
  return current;
}
