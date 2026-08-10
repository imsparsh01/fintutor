import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
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
import { colors, font, radius, spacing } from '../design/tokens';
import { askQuestion, type HoldingProposal } from '../lib/chat';
import { createHolding } from '../lib/holdings';
import { HoldingProposalCard } from './HoldingProposalCard';
import { Mascot, type MascotMood } from './Mascot';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  // D-078: present only on an assistant message the classifier attached a proposal to.
  // `proposalResolved` flips true on Save or Not-now — the card never re-renders after that,
  // same one-shot treatment either way (declining is not tracked differently from saving).
  holdingProposal?: HoldingProposal;
  proposalResolved?: boolean;
}

export interface ChatThreadHandle {
  // deepenAlias: D-071 — set only when the caller (HoldingDetailScreen's "Ask about
  // this") knows the triggering holding with certainty. Chip starters and the typed
  // input never pass one, keeping the general case on D-028's "deepen nothing" default.
  // onboardingTrackHint: BQ-042 — set only by OnboardingScreen's chip taps, which know
  // their track with certainty; the typed input never passes one.
  send: (text: string, deepenAlias?: string, onboardingTrackHint?: string) => void;
}

// How long the mascot stays 'celebrating' after a completed exchange before
// reverting to 'neutral' — a brief reaction, not a persistent state change.
const CELEBRATION_DURATION_MS = 2500;

// BQ-023's /chat endpoint, surfaced. Each question is an independent call — no
// conversation memory sent to the model (D-022); the message list here is local
// display state only, so the user can see the thread while the app is open.
// Shared by ChatScreen (BQ-024) and OnboardingScreen (BQ-025) — same underlying
// capability, different entry content above the input (emptyState) and an
// imperative `send` (for chip-driven starters) via ref.
export const ChatThread = forwardRef<
  ChatThreadHandle,
  // onboarding: BQ-042 — true only for OnboardingScreen's usage. Every other /chat entry
  // point (ChatScreen, HoldingDetailScreen) leaves it unset, keeping the onboarding
  // machinery entirely out of the general Chat tab, per the PRD's confirmed scope.
  { userId: string; emptyState: ReactNode; onMessageSent?: () => void; onboarding?: boolean }
>(function ChatThread({ userId, emptyState, onMessageSent, onboarding = false }, ref) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // D-061/P7: reacts to the completed-exchange event itself, never to the
  // content of the response — same boundary BQ-031's streak wiring holds.
  const [mood, setMood] = useState<MascotMood>('neutral');
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
    };
  }, []);

  const sendText = async (raw: string, deepenAlias?: string, onboardingTrackHint?: string) => {
    const question = raw.trim();
    if (!question || sending) return;

    // D-085: read before this turn's user message is added below, so this is the AI's own
    // last reply — the one narrow exception to D-022, computed from state this component
    // already holds for display, never persisted, never sent outside onboarding.
    const lastAiMessage = onboarding
      ? [...messages].reverse().find((m) => m.role === 'assistant')?.text
      : undefined;

    setError(null);
    setInput('');
    const userMessage: Message = { id: `${Date.now()}-u`, role: 'user', text: question };
    setMessages((prev) => [...prev, userMessage]);
    setSending(true);
    onMessageSent?.();

    try {
      const { response, holdingProposal } = await askQuestion(
        userId,
        question,
        deepenAlias,
        onboarding ? { trackHint: onboardingTrackHint, lastAiMessage } : undefined
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          role: 'assistant',
          text: response,
          holdingProposal: holdingProposal ?? undefined,
        },
      ]);
      setMood('celebrating');
      if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
      celebrationTimer.current = setTimeout(() => setMood('neutral'), CELEBRATION_DURATION_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reach the teaching engine');
    } finally {
      setSending(false);
    }
  };

  const resolveProposal = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, proposalResolved: true } : m))
    );
  };

  const handleSaveProposal = async (messageId: string, proposal: HoldingProposal) => {
    await createHolding(userId, {
      product_type: proposal.product_type,
      characteristics: proposal.characteristics,
    });
    resolveProposal(messageId);
  };

  useImperativeHandle(ref, () => ({ send: sendText }));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Mascot mood={mood} />
      {messages.length === 0 ? (
        <View style={styles.centered}>{emptyState}</View>
      ) : (
        <FlatList
          style={styles.list}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                {/* P11: the tutor's generated prose renders in font.tutor (serif); the
                    user's own words render in font.ui — the typeface itself is the tell,
                    with no other cue needed. */}
                <Text style={item.role === 'user' ? styles.userBubbleText : styles.assistantBubbleText}>
                  {item.text}
                </Text>
              </View>
              {item.holdingProposal && !item.proposalResolved && (
                <HoldingProposalCard
                  proposal={item.holdingProposal}
                  onSave={() => handleSaveProposal(item.id, item.holdingProposal!)}
                  onDismiss={() => resolveProposal(item.id)}
                />
              )}
            </View>
          )}
        />
      )}

      {sending && <ActivityIndicator style={styles.spinner} color={colors.ink} />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question…"
          placeholderTextColor={colors.inkMuted}
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
  container: { flex: 1, backgroundColor: colors.screen },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  list: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  bubble: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, maxWidth: '85%' },
  // User messages: quieter, a hairline outline on the app's own canvas surface.
  userBubble: {
    backgroundColor: colors.canvas,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    alignSelf: 'flex-end',
  },
  // Tutor messages: the teaching surface — tutorSoft fill, no border.
  assistantBubble: { backgroundColor: colors.tutorSoft, alignSelf: 'flex-start' },
  userBubbleText: { fontSize: 15, color: colors.ink, lineHeight: 21, fontFamily: font.ui },
  assistantBubbleText: { fontSize: 15, color: colors.ink, lineHeight: 22, fontFamily: font.tutor },
  spinner: { marginVertical: spacing.sm },
  errorText: { color: colors.danger, paddingHorizontal: spacing.lg, marginBottom: spacing.sm, fontFamily: font.ui },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lineSoft,
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    fontSize: 15,
    fontFamily: font.ui,
    color: colors.ink,
  },
  sendButton: { marginLeft: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  sendButtonText: { color: colors.tutor, fontWeight: '600', fontFamily: font.ui },
});
