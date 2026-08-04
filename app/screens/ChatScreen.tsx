import { StyleSheet, Text, View } from 'react-native';
import { ChatThread } from '../components/ChatThread';
import { colors } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';

export function ChatScreen() {
  const { userId } = useAuth();

  if (!userId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.body}>Signed out — nothing to ask yet.</Text>
      </View>
    );
  }

  return (
    <ChatThread
      userId={userId}
      emptyState={<Text style={styles.body}>Ask about your loans, investments, or goals.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  body: { color: colors.textSecondary, textAlign: 'center' },
});
