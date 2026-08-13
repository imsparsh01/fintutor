import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { colors, font, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { AssessmentApiError, getAssessment, type AssessmentState } from '../lib/onboardingAssessment';
import type { MainTabsParamList } from '../navigation/types';
import { OnboardingScreen } from './OnboardingScreen';
import { AssessmentContextScreen } from './AssessmentContextScreen';

type Props = BottomTabScreenProps<MainTabsParamList, 'Assessment'>;

// BQ-068: reuses v2 without making it an access gate. Before eligibility is
// acknowledged a legacy user can leave; after start, normal global exit applies.
export function VoluntaryAssessmentScreen({ navigation }: Props) {
  const { userId } = useAuth();
  const [state, setState] = useState<AssessmentState | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);

  useFocusEffect(useCallback(() => {
    if (!userId) return;
    let active = true;
    setState(undefined);
    setFailed(false);
    getAssessment(userId)
      .then((assessment) => {
        if (!active) return;
        setState(assessment);
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof AssessmentApiError && error.status === 404) setState(null);
        else setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [userId]));

  if (!userId) return null;
  if (failed) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>We could not load personalization just now.</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Consolidated')} style={styles.backButton}>
          <Text style={styles.link}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }
  if (state === undefined) {
    return <View style={styles.centered}><ActivityIndicator color={colors.tutor} /></View>;
  }

  if (state?.status === 'handled') {
    return <AssessmentContextScreen userId={userId} initialState={state} onBack={() => navigation.navigate('Consolidated')} />;
  }

  return (
    <OnboardingScreen
      userId={userId}
      initialState={state}
      onCancel={() => navigation.navigate('Consolidated')}
      onDone={(destination) => navigation.navigate(destination)}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.screen },
  message: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 15, textAlign: 'center' },
  link: { color: colors.tutor, fontFamily: font.uiMedium, fontSize: 14, marginTop: spacing.lg },
  backButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.lg },
});
