import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'fintutor:onboarding_seen:';

// D-058: onboarding is the default landing screen after registration, but not a hard
// gate — a returning user who has already dismissed it (skipped, or finished a chip
// conversation) should land straight in MainTabs on future opens. Left to build-time as
// a low-stakes detail (D-058's own text) — local persistence, not a backend field, since
// this is purely "has this device seen the landing screen," not baseline data.
export async function hasSeenOnboarding(userId: string): Promise<boolean> {
  const value = await AsyncStorage.getItem(`${KEY_PREFIX}${userId}`);
  return value === 'true';
}

export async function markOnboardingSeen(userId: string): Promise<void> {
  await AsyncStorage.setItem(`${KEY_PREFIX}${userId}`, 'true');
}
