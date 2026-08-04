import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ChatThread, type ChatThreadHandle } from '../components/ChatThread';
import { colors } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import type { MainTabsParamList } from '../navigation/types';

type Props = BottomTabScreenProps<MainTabsParamList, 'Chat'>;

export function ChatScreen({ route, navigation }: Props) {
  const { userId } = useAuth();
  const threadRef = useRef<ChatThreadHandle>(null);

  // BQ-022: a holding's detail screen can deep-link here with a pre-filled question
  // (alias only, never a real name — see HoldingDetailScreen). Sent once, then the
  // params are cleared so navigating back to this tab later doesn't resend it.
  // deepenAlias (D-071) rides along the same param, set only by that one entry point.
  useEffect(() => {
    const prefill = route.params?.prefillQuestion;
    if (prefill) {
      threadRef.current?.send(prefill, route.params?.deepenAlias);
      navigation.setParams({ prefillQuestion: undefined, deepenAlias: undefined });
    }
  }, [route.params?.prefillQuestion, route.params?.deepenAlias, navigation]);

  if (!userId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.body}>Signed out — nothing to ask yet.</Text>
      </View>
    );
  }

  return (
    <ChatThread
      ref={threadRef}
      userId={userId}
      emptyState={<Text style={styles.body}>Ask about your loans, investments, or goals.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  body: { color: colors.textSecondary, textAlign: 'center' },
});
