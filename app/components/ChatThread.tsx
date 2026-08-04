import { forwardRef, useImperativeHandle, useState, type ReactNode } from 'react';
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
import { askQuestion } from '../lib/chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface ChatThreadHandle {
  send: (text: string) => void;
}

// BQ-023's /chat endpoint, surfaced. Each question is an independent call — no
// conversation memory sent to the model (D-022); the message list here is local
// display state only, so the user can see the thread while the app is open.
// Shared by ChatScreen (BQ-024) and OnboardingScreen (BQ-025) — same underlying
// capability, different entry content above the input (emptyState) and an
// imperative `send` (for chip-driven starters) via ref.
export const ChatThread = forwardRef<
  ChatThreadHandle,
  { userId: string; emptyState: ReactNode; onMessageSent?: () => void }
>(function ChatThread({ userId, emptyState, onMessageSent }, ref) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendText = async (raw: string) => {
    const question = raw.trim();
    if (!question || sending) return;

    setError(null);
    setInput('');
    const userMessage: Message = { id: `${Date.now()}-u`, role: 'user', text: question };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);
    onMessageSent?.();

    try {
      const response = await askQuestion(userId, question);
      setMessages((prev) => [...prev, { id: `${Date.now()}-a`, role: 'assistant', text: response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reach the teaching engine');
    } finally {
      setSending(false);
    }
  };

  useImperativeHandle(ref, () => ({ send: sendText }));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {messages.length === 0 ? (
        <View style={styles.centered}>{emptyState}</View>
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
        <Pressable style={styles.sendButton} onPress={() => sendText(input)} disabled={sending || !input.trim()}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
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
