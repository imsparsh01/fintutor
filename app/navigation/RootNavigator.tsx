import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';
import { NotConfiguredScreen } from '../screens/NotConfiguredScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AuthProvider } from '../lib/AuthContext';
import { hasSeenOnboarding, markOnboardingSeen } from '../lib/onboarding';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

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

export function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <NavigationContainer>
        <NotConfiguredScreen />
      </NavigationContainer>
    );
  }

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      {session ? (
        <AuthProvider userId={session.user.id}>
          <AuthenticatedApp userId={session.user.id} />
        </AuthProvider>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
