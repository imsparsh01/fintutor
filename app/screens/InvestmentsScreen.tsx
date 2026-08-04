import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HoldingsList } from '../components/HoldingsList';
import { INVESTMENT_TYPES } from '../lib/taxonomy';
import type { HoldingsStackParamList } from '../navigation/types';
import { HoldingDetailScreen } from './HoldingDetailScreen';

const Stack = createNativeStackNavigator<HoldingsStackParamList>();

// BQ-022: List → Detail, same small stack shape reused across the three family tabs.
export function InvestmentsScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="List">
        {() => (
          <HoldingsList
            title="Investments"
            familyTypes={INVESTMENT_TYPES}
            addLabel="+ Add investment"
            emptyHint="No investments tracked yet — they'll show up here once surfaced or added."
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
