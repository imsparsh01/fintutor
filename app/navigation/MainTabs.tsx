import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ConsolidatedScreen } from '../screens/ConsolidatedScreen';
import { InsuranceScreen } from '../screens/InsuranceScreen';
import { InvestmentsScreen } from '../screens/InvestmentsScreen';
import { LoansScreen } from '../screens/LoansScreen';
import type { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

// D-031's persistent-section structure — three MVP holding families plus the
// consolidated view. No per-item management yet (Decision 2, still open).
export function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Consolidated" component={ConsolidatedScreen} />
      <Tab.Screen name="Investments" component={InvestmentsScreen} />
      <Tab.Screen name="Loans" component={LoansScreen} />
      <Tab.Screen name="Insurance" component={InsuranceScreen} />
    </Tab.Navigator>
  );
}
