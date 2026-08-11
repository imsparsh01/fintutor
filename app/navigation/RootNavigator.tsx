import { useEffect, useState } from 'react';
import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { NotConfiguredScreen } from '../screens/NotConfiguredScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { colors, font } from '../design/tokens';
import { AuthProvider } from '../lib/AuthContext';
import { hasSeenOnboarding } from '../lib/onboarding';
import {
  AssessmentApiError,
  cacheHandledAssessment,
  getAssessment,
  hasHandledAssessmentCache,
  type AssessmentState,
} from '../lib/onboardingAssessment';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AuthStack } from './AuthStack';
import { MainTabs, type OnboardingDestination } from './MainTabs';

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

// D-119: assessment v2 state is authoritative on the backend. `onboardingDone` starts
// null while that state is checked, preventing a flash of either onboarding or the app;
// the device cache is consulted only when the backend cannot be reached.
function AuthenticatedApp({ userId }: { userId: string }) {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [assessmentState, setAssessmentState] = useState<AssessmentState | null>(null);
  const [destination, setDestination] = useState<OnboardingDestination>('Consolidated');

  useEffect(() => {
    let active = true;
    async function resolveOnboarding() {
      try {
        const state = await getAssessment(userId);
        if (!active) return;
        setAssessmentState(state);
        setOnboardingDone(state.status === 'handled');
        if (state.status === 'handled') await cacheHandledAssessment(userId);
      } catch (error) {
        if (!active) return;
        if (error instanceof AssessmentApiError && error.status === 404) {
          // Preserve access for users who already dismissed the legacy flow. BQ-068
          // will offer v2 as a voluntary reassessment without inferring any answers.
          setOnboardingDone(await hasSeenOnboarding(userId));
          return;
        }
        // D-119: backend state is authoritative. The local value is only an outage
        // fallback for a completion already observed on this device.
        setOnboardingDone(await hasHandledAssessmentCache(userId));
      }
    }
    resolveOnboarding();
    return () => {
      active = false;
    };
  }, [userId]);

  if (onboardingDone === null) {
    return (
      <View style={styles.assessmentLoading} accessibilityLiveRegion="polite">
        <ActivityIndicator color={colors.tutor} />
        <Text style={styles.assessmentLoadingText}>Preparing your starting point…</Text>
      </View>
    );
  }

  if (!onboardingDone) {
    return (
      <OnboardingScreen
        userId={userId}
        initialState={assessmentState}
        onDone={async (nextDestination) => {
          await cacheHandledAssessment(userId);
          setDestination(nextDestination);
          setOnboardingDone(true);
        }}
      />
    );
  }

  return <MainTabs initialRouteName={destination} />;
}

const styles = StyleSheet.create({
  assessmentLoading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.screen },
  assessmentLoadingText: { marginTop: 12, color: colors.inkSecondary, fontFamily: font.ui, fontSize: 14 },
});

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
  const devShowOnboarding = process.env.EXPO_PUBLIC_DEV_SHOW_ONBOARDING === 'true';

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
          {devShowOnboarding ? <AuthenticatedApp userId={devUserId} /> : <MainTabs />}
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
