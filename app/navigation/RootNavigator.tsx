import { useEffect, useState } from 'react';
import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';
import { NotConfiguredScreen } from '../screens/NotConfiguredScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { colors } from '../design/tokens';
import { AuthProvider } from '../lib/AuthContext';
import { hasSeenOnboarding, markOnboardingSeen } from '../lib/onboarding';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

// Presentation only — the warm-ledger palette applied to the navigation chrome itself
// (screen transitions, tab/stack backgrounds) so no white flash shows through between
// the token-styled screens. Does not touch route names or navigation structure.
const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.screen,
    card: colors.canvas,
    border: colors.line,
    text: colors.ink,
    primary: colors.tutor,
  },
};

// D-058: the chip-guided onboarding conversation is the default landing screen after
// auth, but never a hard gate. `onboardingDone` starts `null` (checking AsyncStorage)
// to avoid a one-frame flash of the wrong screen.
function AuthenticatedApp({ userId }: { userId: string }) {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    hasSeenOnboarding(userId).then(setOnboardingDone);
  }, [userId]);

  if (onboardingDone === null) return null;

  if (!onboardingDone) {
    return (
      <OnboardingScreen
        userId={userId}
        onDone={() => {
          markOnboardingSeen(userId);
          setOnboardingDone(true);
        }}
      />
    );
  }

  return <MainTabs />;
}

// First name for the greeting, best-effort from Supabase user metadata, falling back to
// the email local-part. Presentation only — never blocks render if absent.
function deriveDisplayName(session: Session): string | null {
  const meta = session.user.user_metadata ?? {};
  const full = (meta.full_name || meta.name || '') as string;
  if (full.trim()) return full.trim().split(/\s+/)[0];
  const email = session.user.email ?? '';
  if (email.includes('@')) {
    const local = email.split('@')[0].split(/[._-]/)[0];
    return local ? local.charAt(0).toUpperCase() + local.slice(1) : null;
  }
  return null;
}

export function RootNavigator() {
  // DEV-ONLY (D-094 verification aid): when EXPO_PUBLIC_DEV_USER_ID is set, skip the
  // Supabase login gate and render the authenticated tabs directly for that user id, so
  // the local web preview can display inner screens without a password. Unset in any real
  // build — this branch is inert when the env var is absent. Not a product auth path.
  // Read once as a build-constant; hooks below still run unconditionally (Rules of Hooks).
  const devUserId = process.env.EXPO_PUBLIC_DEV_USER_ID;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (devUserId) return;
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, [devUserId]);

  if (devUserId) {
    return (
      <NavigationContainer theme={navigationTheme}>
        <AuthProvider userId={devUserId} displayName={process.env.EXPO_PUBLIC_DEV_USER_NAME ?? null}>
          <MainTabs />
        </AuthProvider>
      </NavigationContainer>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <NavigationContainer theme={navigationTheme}>
        <NotConfiguredScreen />
      </NavigationContainer>
    );
  }

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {session ? (
        <AuthProvider userId={session.user.id} displayName={deriveDisplayName(session)}>
          <AuthenticatedApp userId={session.user.id} />
        </AuthProvider>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
