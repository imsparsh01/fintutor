import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { BudgetingScreen } from '../screens/BudgetingScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ConsolidatedScreen } from '../screens/ConsolidatedScreen';
import { InsuranceScreen } from '../screens/InsuranceScreen';
import { InvestmentsScreen } from '../screens/InvestmentsScreen';
import { LoansScreen } from '../screens/LoansScreen';
import { colors, font } from '../design/tokens';
import type { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

// D-031's persistent-section structure — three MVP holding families plus the
// consolidated view. Each section lists real Holdings (BQ-019); no per-item
// management yet (Decision 2, still open).
//
// Chat (BQ-024) added as its own tab — no navigation placement was decided for it
// (BRIEF-013 named the conversational surface as the central missing piece without
// specifying where it lives), so a persistent tab was chosen as the lowest-risk,
// easily-revised placement, consistent with D-031's always-accessible sections.
// BQ-025 (D-058's onboarding flow) may change this once designed — that's its call,
// not this item's.
// P8: all six tabs stay present and reachable at all times, including with zero
// holdings — never hidden, disabled, or gated on data. Styling below is presentation
// only (colours, hairline, label typeface); it does not touch which tabs exist.
export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        // Each screen draws its own in-content header (the mockup register — e.g. Home's
        // "Good evening" greeting, the family screens' pageTitle), so the tab navigator's
        // default route-name header is redundant and is hidden.
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
      {/* Route names are unchanged (they're referenced by navigation.navigate calls);
          only the visible tab labels are set to the mockup's shorter wording. */}
      <Tab.Screen name="Consolidated" component={ConsolidatedScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="Investments" component={InvestmentsScreen} options={{ tabBarLabel: 'Invest' }} />
      <Tab.Screen name="Loans" component={LoansScreen} options={{ tabBarLabel: 'Loans' }} />
      <Tab.Screen name="Insurance" component={InsuranceScreen} options={{ tabBarLabel: 'Insure' }} />
      <Tab.Screen name="Budgeting" component={BudgetingScreen} options={{ tabBarLabel: 'Budget' }} />
    </Tab.Navigator>
  );
}
