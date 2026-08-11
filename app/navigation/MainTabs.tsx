import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { TabIcon, type TabIconName } from '../components/TabIcon';
import { BudgetingScreen } from '../screens/BudgetingScreen';
import { CalculatorScreen } from '../screens/CalculatorScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ConsolidatedScreen } from '../screens/ConsolidatedScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { HealthScoreScreen } from '../screens/HealthScoreScreen';
import { InsuranceScreen } from '../screens/InsuranceScreen';
import { InvestmentsScreen } from '../screens/InvestmentsScreen';
import { LoansScreen } from '../screens/LoansScreen';
import { PortfolioScreen } from '../screens/PortfolioScreen';
import { ScenarioScreen } from '../screens/ScenarioScreen';
import { ToolsScreen } from '../screens/ToolsScreen';
import { VoluntaryAssessmentScreen } from '../screens/VoluntaryAssessmentScreen';
import { colors, font } from '../design/tokens';
import type { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const visibleTabIcons: Partial<Record<keyof MainTabsParamList, TabIconName>> = {
  Consolidated: 'home',
  Portfolio: 'portfolio',
  Goals: 'goals',
  Tools: 'tools',
  Chat: 'chat',
};

// D-106: 5 visible tabs (Home · Portfolio · Goals · Tools · Chat).
// Former family tabs (Investments/Loans/Insurance/Budgeting) are now hidden screens —
// tabBarButton: () => null keeps them navigable from PortfolioScreen without showing
// in the tab bar. Calculator is also a hidden screen, entered from ToolsScreen.
// P8 nav accessibility preserved: all screens remain navigable at all times.
export type OnboardingDestination = 'Consolidated' | 'Portfolio' | 'Tools' | 'Chat';

export function MainTabs({ initialRouteName = 'Consolidated' }: { initialRouteName?: OnboardingDestination }) {
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tutor,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarIcon: ({ color, focused }) => {
          const icon = visibleTabIcons[route.name];
          return icon ? <TabIcon name={icon} color={color} focused={focused} /> : undefined;
        },
        tabBarStyle: {
          backgroundColor: colors.canvas,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.line,
          height: 68,
          paddingTop: 7,
          paddingBottom: 7,
        },
        tabBarItemStyle: { paddingVertical: 1 },
        tabBarLabelStyle: { fontFamily: font.uiMedium, fontSize: 11 },
      })}
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
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="Scenario"
        component={ScenarioScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="Investments"
        component={InvestmentsScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />
      <Tab.Screen
        name="Loans"
        component={LoansScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />
      <Tab.Screen
        name="Insurance"
        component={InsuranceScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />
      <Tab.Screen
        name="Budgeting"
        component={BudgetingScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />
      <Tab.Screen
        name="HealthScore"
        component={HealthScoreScreen}
        options={{ tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }}
      />
      <Tab.Screen
        name="Assessment"
        component={VoluntaryAssessmentScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
}
