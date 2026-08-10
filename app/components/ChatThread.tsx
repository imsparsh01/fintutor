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
  // Distinguishes the two ways a proposal can resolve — only Save renders the "Added to
  // Investments" confirmation + WHY NO VERDICT HERE follow-up (mockup Flow 03.3). "Not now"
  // still resolves the message (D-078 — the card never returns) but shows nothing further.
  proposalSaved?: boolean;
}

// Flow 03.1 (D-029): a figure the tutor states is either the user's own (from the profile) or
// a band ("typical, not yours"). Every real number renders in font.mono regardless of which —
// this is a presentation-only inline emphasis, not a provenance judgement; the provenance itself
// is decided server-side by what the model chooses to write (D-029 is a prompt-level rule).
const FIGURE_PATTERN =
  /₹\s?\d[\d,]*(?:\.\d+)?|\d[\d,]*(?:\.\d+)?\s?[–-]\s?\d[\d,]*(?:\.\d+)?%|\d[\d,]*(?:\.\d+)?%/g;

// A band figure specifically — digits, a dash, more digits, a percent sign. Used only to decide
// whether this message earns the "RANGE, NOT YOUR NUMBER" block (D-029); the figure emphasis
// above (FIGURE_PATTERN) is unconditional and covers point figures too.
const BAND_FIGURE_PATTERN = /\d[\d,]*(?:\.\d+)?\s?[–-]\s?\d[\d,]*(?:\.\d+)?%/;

function hasBandFigure(text: string): boolean {
  return BAND_FIGURE_PATTERN.test(text);
}

// Splits a tutor reply into plain-prose runs (inherit the surrounding font.tutor serif) and
// inline figures (font.mono, per the "figures are always mono" constraint) — the typeface
// itself is the tell that a span is a real number, no colour or weight games needed.
function renderTutorText(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = new RegExp(FIGURE_PATTERN);
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(<Text key={`${keyPrefix}-t${i}`}>{text.slice(lastIndex, match.index)}</Text>);
    }
    nodes.push(
      <Text key={`${keyPrefix}-f${i}`} style={styles.figureInline}>
        {match[0]}
      </Text>
    );
    lastIndex = match.index + match[0].length;
    i += 1;
  }
  if (lastIndex < text.length) {
    nodes.push(<Text key={`${keyPrefix}-t${i}`}>{text.slice(lastIndex)}</Text>);
  }
  return nodes;
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

  const resolveProposal = (messageId: string, saved: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, proposalResolved: true, proposalSaved: saved } : m))
    );
  };

  const handleSaveProposal = async (messageId: string, proposal: HoldingProposal) => {
    await createHolding(userId, {
      product_type: proposal.product_type,
      characteristics: proposal.characteristics,
    });
    resolveProposal(messageId, true);
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
                    with no other cue needed. Figures inside a tutor reply render in
                    font.mono regardless (renderTutorText), same tell applied inline. */}
                <Text style={item.role === 'user' ? styles.userBubbleText : styles.assistantBubbleText}>
                  {item.role === 'assistant' ? renderTutorText(item.text, item.id) : item.text}
                </Text>
              </View>

              {/* Flow 03.1 (D-029): any tutor reply carrying a band figure ("11–24%") earns
                  the standing disclaimer, verbatim from the mockup. */}
              {item.role === 'assistant' && hasBandFigure(item.text) && <RangeBlock />}

              {item.holdingProposal && !item.proposalResolved && (
                <HoldingProposalCard
                  proposal={item.holdingProposal}
                  onSave={() => handleSaveProposal(item.id, item.holdingProposal!)}
                  onDismiss={() => resolveProposal(item.id, false)}
                />
              )}

              {/* Flow 03.3: only a Save earns the confirmation + follow-up — "Not now"
                  resolves the message (D-078) but stays silent past that, same as today. */}
              {item.holdingProposal && item.proposalResolved && item.proposalSaved && (
                <>
                  <SavedConfirmation />
                  <WhyNoVerdictBlock onSuggestion={(text) => sendText(text)} />
                </>
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

// Static — the disclaimer's wording is fixed regardless of which band figure triggered it
// (D-029's guard is about the range's own tightness, decided server-side; the client's job is
// only to always show the label next to a band, never to reword it per figure).
function RangeBlock() {
  return (
    <View style={styles.rangeBlock}>
      <Text style={styles.rangeLabel}>Range, not your number</Text>
      <Text style={styles.rangeBody}>
        Any figure we can't trace to your own profile is shown as a band, always labelled.
      </Text>
    </View>
  );
}

// Flow 03.3's "Added to Investments" moment — fires once, on the same message that carried the
// now-saved proposal. Deliberately generic ("Saved." not a restated figure) since this component
// has no access to which specific field a given product type surfaces.
function SavedConfirmation() {
  return (
    <View style={styles.savedBanner}>
      <View style={styles.savedHeader}>
        <View style={styles.savedDot}>
          <Text style={styles.savedCheck}>✓</Text>
        </View>
        <Text style={styles.savedTitle}>Added to Investments</Text>
      </View>
      <Text style={styles.savedBody}>
        Saved. Edit or recategorise it from Investments anytime.
      </Text>
    </View>
  );
}

// D-091's "what we won't say" pattern, this instance's missing input named per the task brief:
// a goal. Names the verdict declined and what happens instead (its two load-bearing rules) —
// never an apology. The two chips are ordinary follow-up questions routed through the same
// sendText path as any typed message; no new capability, no navigation target.
function WhyNoVerdictBlock({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  return (
    <View style={styles.verdictBlock}>
      <Text style={styles.verdictLabel}>Why no verdict here</Text>
      <Text style={styles.verdictBody}>
        FinTutor won't say whether this is enough — that depends on a goal only you can set.
        It'll show what these numbers do over time the moment you set one.
      </Text>
      <View style={styles.suggestionRow}>
        <Pressable
          style={styles.suggestionChipPrimary}
          onPress={() => onSuggestion('How do I check what has actually been deposited?')}
        >
          <Text style={styles.suggestionChipPrimaryText}>How do I check it?</Text>
        </Pressable>
        <Pressable
          style={styles.suggestionChipNeutral}
          onPress={() => onSuggestion('Can you help me set a financial goal?')}
        >
          <Text style={styles.suggestionChipNeutralText}>Set a goal</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.screen },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  list: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  bubble: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, maxWidth: '90%' },
  // User messages: plain, right-aligned — a quiet fill on the app's own recessed tone, no
  // border (mockup Flow 03: align-self flex-end, background lineSoft, nothing else).
  userBubble: {
    backgroundColor: colors.lineSoft,
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  // Tutor messages: the teaching surface — tutorSoft fill, no border.
  assistantBubble: { backgroundColor: colors.tutorSoft, alignSelf: 'flex-start' },
  userBubbleText: { fontSize: 15, color: colors.ink, lineHeight: 21, fontFamily: font.ui },
  assistantBubbleText: { fontSize: 15, color: colors.ink, lineHeight: 22, fontFamily: font.tutor },
  // Inline figure emphasis inside a tutor reply — font.mono per the "every real number is
  // mono" constraint, smaller than the surrounding serif prose, same ratio the mockup draws.
  figureInline: { fontFamily: font.monoMedium, fontSize: 13 },
  spinner: { marginVertical: spacing.sm },
  errorText: { color: colors.danger, paddingHorizontal: spacing.lg, marginBottom: spacing.sm, fontFamily: font.ui },
  // Flow 03.1 — RANGE, NOT YOUR NUMBER. Dashed hairline, off the ledger register on purpose
  // (a dashed rule reads as "aside," not as a bounded card the way HoldingProposalCard is).
  rangeBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    maxWidth: '90%',
    alignSelf: 'flex-start',
    backgroundColor: colors.screen,
  },
  rangeLabel: {
    fontFamily: font.monoMedium,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  rangeBody: { fontFamily: font.ui, fontSize: 12, lineHeight: 18, color: colors.inkSecondary },
  // Flow 03.3 — the saved confirmation. tutorSoft ground (the same teaching-adjacent surface
  // as the assistant bubble), a small filled dot standing in for a check mark.
  savedBanner: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    maxWidth: '90%',
    alignSelf: 'flex-start',
  },
  savedHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  savedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.tutor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedCheck: { fontSize: 10, color: colors.tutorSoft, fontFamily: font.uiSemibold },
  savedTitle: { fontFamily: font.uiSemibold, fontSize: 13, color: colors.tutor },
  savedBody: { fontFamily: font.ui, fontSize: 13, lineHeight: 19, color: colors.inkSecondary },
  // Flow 03.3 — WHY NO VERDICT HERE. Same dashed-aside treatment as RangeBlock; the two share
  // a register (an app-voice caveat, not a teaching moment, not a card requiring a decision).
  verdictBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    maxWidth: '90%',
    alignSelf: 'flex-start',
  },
  verdictLabel: {
    fontFamily: font.monoMedium,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  verdictBody: { fontFamily: font.ui, fontSize: 12, lineHeight: 18, color: colors.inkSecondary },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  suggestionChipPrimary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  suggestionChipPrimaryText: { fontFamily: font.uiMedium, fontSize: 13, color: colors.tutor },
  suggestionChipNeutral: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  suggestionChipNeutralText: { fontFamily: font.uiMedium, fontSize: 13, color: colors.inkSecondary },
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
  sendButtonText: { color: colors.tutor, fontFamily: font.uiSemibold },
});
