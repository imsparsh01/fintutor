import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';
import { NotConfiguredScreen } from '../screens/NotConfiguredScreen';
import { AuthProvider } from '../lib/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

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
          <MainTabs />
        </AuthProvider>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
