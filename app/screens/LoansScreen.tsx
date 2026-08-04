import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HoldingsList } from '../components/HoldingsList';
import { LOAN_TYPES } from '../lib/taxonomy';
import type { HoldingsStackParamList } from '../navigation/types';
import { HoldingDetailScreen } from './HoldingDetailScreen';

const Stack = createNativeStackNavigator<HoldingsStackParamList>();

export function LoansScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="List">
        {() => (
          <HoldingsList
            title="Loans"
            familyTypes={LOAN_TYPES}
            addLabel="+ Add loan"
            emptyHint="No loans tracked yet — they'll show up here once surfaced or added."
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Detail"
        component={HoldingDetailScreen}
        options={{ headerShown: true, title: 'Holding' }}
      />
    </Stack.Navigator>
  );
}
