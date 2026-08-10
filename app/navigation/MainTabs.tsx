import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { BudgetingScreen } from '../screens/BudgetingScreen';
import { CalculatorScreen } from '../screens/CalculatorScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ConsolidatedScreen } from '../screens/ConsolidatedScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { InsuranceScreen } from '../screens/InsuranceScreen';
import { InvestmentsScreen } from '../screens/InvestmentsScreen';
import { LoansScreen } from '../screens/LoansScreen';
import { PortfolioScreen } from '../screens/PortfolioScreen';
import { ToolsScreen } from '../screens/ToolsScreen';
import { colors, font } from '../design/tokens';
import type { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

// D-106: 5 visible tabs (Home · Portfolio · Goals · Tools · Chat).
// Former family tabs (Investments/Loans/Insurance/Budgeting) are now hidden screens —
// tabBarButton: () => null keeps them navigable from PortfolioScreen without showing
// in the tab bar. Calculator is also a hidden screen, entered from ToolsScreen.
// P8 nav accessibility preserved: all screens remain navigable at all times.
export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tutor,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: {
          backgroundColor: colors.canvas,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.line,
        },
        tabBarLabelStyle: { fontFamily: font.ui, fontSize: 11 },
      }}
    >
      {/* ── Visible tabs ──────────────────────────────────────────────── */}
      <Tab.Screen name="Consolidated" component={ConsolidatedScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} options={{ tabBarLabel: 'Portfolio' }} />
      <Tab.Screen name="Goals" component={GoalsScreen} options={{ tabBarLabel: 'Goals' }} />
      <Tab.Screen name="Tools" component={ToolsScreen} options={{ tabBarLabel: 'Tools' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'Chat' }} />

      {/* ── Hidden screens — navigable but not shown in the tab bar ──── */}
      <Tab.Screen
        name="Calculator"
        component={CalculatorScreen}
        options={{ tabBarButton: () => null, tabBarStyle: { display: 'none' } }}
      />
      <Tab.Screen name="Investments" component={InvestmentsScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Loans" component={LoansScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Insurance" component={InsuranceScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Budgeting" component={BudgetingScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
}
