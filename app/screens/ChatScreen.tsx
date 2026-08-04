import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { askQuestion } from '../lib/chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

// BQ-023's /chat endpoint, surfaced. Each question is an independent call — no
// conversation memory sent to the model (D-022); the message list below is local
// display state only, so the user can see the thread while the app is open.
export function ChatScreen() {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    const question = input.trim();
    if (!question || !userId || sending) return;

    setError(null);
    setInput('');
    const userMessage: Message = { id: `${Date.now()}-u`, role: 'user', text: question };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);

    try {
      const response = await askQuestion(userId, question);
      setMessages((prev) => [...prev, { id: `${Date.now()}-a`, role: 'assistant', text: response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reach the teaching engine');
    } finally {
      setSending(false);
    }
  };

  if (!userId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.body}>Signed out — nothing to ask yet.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {messages.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.body}>Ask about your loans, investments, or goals.</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={styles.bubbleText}>{item.text}</Text>
            </View>
          )}
        />
      )}

      {sending && <ActivityIndicator style={styles.spinner} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question…"
          multiline
          editable={!sending}
        />
        <Pressable style={styles.sendButton} onPress={send} disabled={sending || !input.trim()}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  body: { color: colors.textSecondary, textAlign: 'center' },
  list: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  bubble: { borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, maxWidth: '85%' },
  userBubble: { backgroundColor: colors.borderLight, alignSelf: 'flex-end' },
  assistantBubble: { backgroundColor: '#eef6ee', alignSelf: 'flex-start' },
  bubbleText: { fontSize: 15, color: colors.text, lineHeight: 21 },
  spinner: { marginVertical: spacing.sm },
  errorText: { color: colors.danger, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: { marginLeft: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  sendButtonText: { color: colors.success, fontWeight: '600' },
});
