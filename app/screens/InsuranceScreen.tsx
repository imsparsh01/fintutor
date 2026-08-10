import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HoldingEditModal } from '../components/HoldingEditModal';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { fetchHoldings, type Holding } from '../lib/holdings';
import { humanizeProductType, INSURANCE_TYPES } from '../lib/taxonomy';
import type { HoldingsStackParamList, MainTabsParamList } from '../navigation/types';
import { HoldingDetailScreen } from './HoldingDetailScreen';

const Stack = createNativeStackNavigator<HoldingsStackParamList>();

type ListProps = NativeStackScreenProps<HoldingsStackParamList, 'List'>;

// D-089: an empty family section is a teaching surface, not a dead end — see the
// matching comment in InvestmentsScreen.tsx for why this list is implemented locally
// rather than through the shared HoldingsList component (owned by another agent here).
function InsuranceList({ navigation }: ListProps) {
  const { userId } = useAuth();
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const parentNavigation = navigation.getParent<BottomTabNavigationProp<MainTabsParamList>>();

  const load = useCallback(() => {
    if (!userId) return;
    setError(null);
    fetchHoldings(userId)
      .then((all) => setHoldings(all.filter((h) => INSURANCE_TYPES.includes(h.product_type))))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load holdings'));
  }, [userId]);

  useFocusEffect(load);

  const startWalkthrough = () => {
    parentNavigation?.navigate('Chat', {
      prefillQuestion: 'Can you walk me through insurance, using my own numbers?',
    });
  };

  const modal = adding && (
    <HoldingEditModal
      holding={null}
      familyTypes={INSURANCE_TYPES}
      onClose={() => setAdding(false)}
      onChanged={load}
    />
  );

  if (!userId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.sectionTitle}>Insurance</Text>
        <Text style={styles.body}>Signed out — nothing to show.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.sectionTitle}>Insurance</Text>
        <Text style={styles.errorText}>Couldn't load holdings — {error}</Text>
        {modal}
      </View>
    );
  }

  if (holdings === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  if (holdings.length === 0) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.emptyContainer}>
        <Text style={styles.sectionTitle}>Insurance</Text>

        <View style={styles.teachingCard}>
          <Text style={styles.teachingHeading}>WHAT LIVES IN THIS SECTION</Text>
          <Text style={styles.teachingBody}>
            Two mechanisms sit under "insurance", and they behave very differently: one buys protection
            only, one mixes protection with savings. Knowing which is which is most of the literacy.
          </Text>
        </View>

        <Pressable style={styles.walkthroughButton} onPress={startWalkthrough}>
          <Text style={styles.walkthroughButtonText}>Walk me through it, with my numbers</Text>
        </Pressable>
        <Text style={styles.walkthroughCaption}>Takes about two minutes. Commits you to nothing.</Text>

        <Pressable style={styles.addButtonSecondary} onPress={() => setAdding(true)}>
          <Text style={styles.addButtonSecondaryText}>+ Add a policy manually</Text>
        </Pressable>

        {modal}
      </ScrollView>
    );
  }

  return (
    <View style={styles.listContainer}>
      <Text style={styles.sectionTitle}>Insurance</Text>
      <ScrollView>
        {holdings.map((item) => (
          <Pressable
            key={item.id}
            style={styles.row}
            onPress={() => navigation.navigate('Detail', { holding: item })}
          >
            <Text style={styles.rowTitle}>{item.display_name ?? item.alias}</Text>
            <Text style={styles.rowSubtitle}>{humanizeProductType(item.product_type)}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable style={styles.addButtonSecondary} onPress={() => setAdding(true)}>
        <Text style={styles.addButtonSecondaryText}>+ Add insurance</Text>
      </Pressable>
      {modal}
    </View>
  );
}

export function InsuranceScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="List" component={InsuranceList} />
      <Stack.Screen
        name="Detail"
        component={HoldingDetailScreen}
        options={{ headerShown: true, title: 'Holding' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.screen },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.screen },
  listContainer: { flex: 1, backgroundColor: colors.screen, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  emptyContainer: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xxxl },
  sectionTitle: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: spacing.lg,
  },
  body: { fontFamily: font.ui, color: colors.inkSecondary, textAlign: 'center' },
  errorText: { fontFamily: font.ui, color: colors.danger, textAlign: 'center' },
  row: {
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowTitle: { fontFamily: font.ui, fontSize: 16, fontWeight: '500', color: colors.ink },
  rowSubtitle: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  teachingCard: {
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  teachingHeading: {
    fontFamily: font.ui,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.tutor,
    marginBottom: spacing.sm,
  },
  teachingBody: { fontFamily: font.tutor, fontSize: 15, lineHeight: 22, color: colors.ink },
  walkthroughButton: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  walkthroughButtonText: { fontFamily: font.ui, color: colors.screen, fontWeight: '600', fontSize: 15 },
  walkthroughCaption: {
    fontFamily: font.ui,
    fontSize: 12,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  addButtonSecondary: { paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  addButtonSecondaryText: { fontFamily: font.ui, fontSize: 13, color: colors.inkSecondary },
});
