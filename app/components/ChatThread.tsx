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
import {
  applyHoldingProposal,
  refreshedProposalFrom,
  resolveHoldingProposal,
} from '../lib/holdingReconciliation';
import { HoldingProposalCard } from './HoldingProposalCard';
import { scheduleHoldingReminder } from '../lib/reminders';
import { noteMeaningfulLearningInteraction } from '../lib/learningReminders';
import {
  CHAT_FAILURE_MESSAGE,
  captureFailedChatRequest,
  retryInvocationFor,
  type FailedChatRequest,
} from '../lib/chatRetry';

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
  reconciliation?: {
    status: 'new' | 'updated' | 'contradiction';
    product_type: string;
    changed_fields: string[];
  };
  proposalAnnouncement?: string;
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
  const [failedRequest, setFailedRequest] = useState<FailedChatRequest | null>(null);
  const [disclosureOpen, setDisclosureOpen] = useState(false);
  const generationRef = useRef(0);

  useEffect(() => {
    generationRef.current += 1;
    setMessages([]);
    setInput('');
    setSending(false);
    setError(null);
    setFailedRequest(null);
    setDisclosureOpen(false);
    return () => {
      generationRef.current += 1;
    };
  }, [userId]);

  const sendText = async (
    raw: string,
    deepenAlias?: string,
    onboardingTrackHint?: string,
    appendUserMessage = true,
  ) => {
    const question = raw.trim();
    if (!question || sending) return;
    const generation = generationRef.current;

    // D-085: read before this turn's user message is added below, so this is the AI's own
    // last reply — the one narrow exception to D-022, computed from state this component
    // already holds for display, never persisted, never sent outside onboarding.
    const lastAiMessage = onboarding
      ? [...messages].reverse().find((m) => m.role === 'assistant')?.text
      : undefined;

    setError(null);
    setFailedRequest(null);
    setInput('');
    if (appendUserMessage) {
      const userMessage: Message = { id: `${Date.now()}-u`, role: 'user', text: question };
      setMessages((prev) => [...prev, userMessage]);
    }
    setSending(true);
    if (appendUserMessage) onMessageSent?.();

    try {
      const { response, holdingProposal } = await askQuestion(
        userId,
        question,
        deepenAlias,
        onboarding ? { trackHint: onboardingTrackHint, lastAiMessage } : undefined
      );
      if (generation !== generationRef.current) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          role: 'assistant',
          text: response,
          holdingProposal: holdingProposal ?? undefined,
        },
      ]);
      noteMeaningfulLearningInteraction(userId);
    } catch (err) {
      if (generation !== generationRef.current) return;
      setFailedRequest(captureFailedChatRequest(question, deepenAlias, onboardingTrackHint));
      setError(CHAT_FAILURE_MESSAGE);
    } finally {
      if (generation === generationRef.current) setSending(false);
    }
  };

  const retryFailedRequest = () => {
    if (sending) return;
    const retry = retryInvocationFor(failedRequest);
    if (!retry) return;
    void sendText(
      retry.question,
      retry.deepenAlias,
      retry.onboardingTrackHint,
      retry.appendUserMessage,
    );
  };

  const resolveProposal = (messageId: string, saved: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, proposalResolved: true, proposalSaved: saved } : m))
    );
  };

  const handleSaveProposal = async (messageId: string, proposal: HoldingProposal) => {
    const generation = generationRef.current;
    try {
      const savedHolding = await applyHoldingProposal(userId, proposal);
      // The holding write is already authoritative. Optional local reminder
      // scheduling must not make a successful confirmation look retryable.
      await scheduleHoldingReminder(savedHolding).catch(() => undefined);
      if (generation !== generationRef.current) return;
      setMessages((prev) => prev.map((m) => (m.id === messageId
        ? { ...m, proposalResolved: true, proposalSaved: true, reconciliation: savedHolding.reconciliation }
        : m)));
    } catch (caught) {
      const refreshed = refreshedProposalFrom(caught);
      if (refreshed) {
        if (generation !== generationRef.current) return;
        setMessages((prev) => prev.map((m) => (m.id === messageId
          ? { ...m, holdingProposal: refreshed, proposalAnnouncement: 'This holding changed. Review the refreshed comparison.' }
          : m)));
        throw new Error('This holding changed. Review the refreshed comparison before applying it.');
      }
      throw caught;
    }
  };

  const handleResolveProposal = async (
    messageId: string,
    proposal: HoldingProposal,
    targetId: string | null,
  ) => {
    const generation = generationRef.current;
    const resolved = await resolveHoldingProposal(userId, proposal, targetId);
    if (generation !== generationRef.current) return;
    setMessages((prev) => prev.map((m) => (m.id === messageId
      ? { ...m, holdingProposal: resolved, proposalAnnouncement: 'Comparison ready. Review the stored and proposed values.' }
      : m)));
  };

  useImperativeHandle(ref, () => ({ send: sendText }));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* BQ-055 (D-105): Arya persona header — shown in the Chat tab, hidden on onboarding
          (which has its own context framing). Avatar is a monogram "A" in colors.tutor. */}
      {!onboarding && (
        <>
          <AryaHeader
            disclosureOpen={disclosureOpen}
            onToggleDisclosure={() => setDisclosureOpen((open) => !open)}
          />
          {disclosureOpen && <ModelBoundaryDisclosure />}
        </>
      )}
      {messages.length === 0 ? (
        <View style={styles.centered}>
          {!onboarding && <FirstEntryScope />}
          {emptyState}
        </View>
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
                  announcement={item.proposalAnnouncement}
                  onResolve={(targetId) => handleResolveProposal(item.id, item.holdingProposal!, targetId)}
                  onSave={() => handleSaveProposal(item.id, item.holdingProposal!)}
                  onDismiss={() => resolveProposal(item.id, false)}
                />
              )}

              {/* Flow 03.3: only a Save earns the confirmation + follow-up — "Not now"
                  resolves the message (D-078) but stays silent past that, same as today. */}
              {item.holdingProposal && item.proposalResolved && item.proposalSaved && (
                <>
                  <SavedConfirmation status={item.reconciliation?.status ?? 'new'} />
                  <WhyNoVerdictBlock onSuggestion={(text) => sendText(text)} />
                </>
              )}
            </View>
          )}
        />
      )}

      {sending && (
        <View
          style={styles.loadingState}
          accessibilityRole="progressbar"
          accessibilityLabel="Arya is preparing an explanation"
        >
          <ActivityIndicator color={colors.ink} />
          <Text style={styles.loadingText}>Arya is preparing an explanation…</Text>
        </View>
      )}
      {error && failedRequest && (
        <View style={styles.errorCard} accessibilityRole="alert">
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry the failed question"
            disabled={sending}
            accessibilityState={{ disabled: sending }}
            onPress={retryFailedRequest}
          >
            <Text style={styles.retryButtonText}>Retry question</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a question…"
          placeholderTextColor={colors.inkMuted}
          accessibilityLabel="Your question"
          multiline
          editable={!sending}
        />
        <Pressable
          style={styles.sendButton}
          accessibilityRole="button"
          accessibilityState={{ disabled: sending || !input.trim() }}
          onPress={() => sendText(input)}
          disabled={sending || !input.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
});

// BQ-055 (D-105): Arya header — monogram avatar + name + subtitle. Shown at top of the Chat
// tab (not during onboarding). Visual = circle filled colors.tutor, "A" in colors.canvas.
function AryaHeader({
  disclosureOpen,
  onToggleDisclosure,
}: {
  disclosureOpen: boolean;
  onToggleDisclosure: () => void;
}) {
  return (
    <View style={styles.aryaHeader}>
      <View style={styles.aryaAvatar}>
        <Text style={styles.aryaMonogram}>A</Text>
      </View>
      <View style={styles.aryaIdentityText}>
        <Text style={styles.aryaName}>Arya</Text>
        <Text style={styles.aryaSubtitle}>Your financial tutor</Text>
      </View>
      <Pressable
        style={styles.disclosureButton}
        accessibilityRole="button"
        accessibilityState={{ expanded: disclosureOpen }}
        onPress={onToggleDisclosure}
      >
        <Text style={styles.disclosureButtonText}>What Arya receives</Text>
      </Pressable>
    </View>
  );
}

function ModelBoundaryDisclosure() {
  return (
    <View style={styles.disclosurePanel} accessibilityLiveRegion="polite">
      <Text style={styles.disclosureTitle}>What Arya receives</Text>
      <Text style={styles.disclosureBody}>
        Recognisable names are replaced inside FinTutor before the teaching model receives your question.
        The model receives aliases and relevant characteristics.
      </Text>
      <Text style={styles.disclosureFootnote}>
        Account, card and policy numbers, PAN-like identifiers, email addresses and phone numbers are not sent.
      </Text>
    </View>
  );
}

function FirstEntryScope() {
  return (
    <View style={styles.firstEntryScope}>
      <Text style={styles.firstEntryTitle}>Start with what feels unclear.</Text>
      <Text style={styles.firstEntryBody}>
        Arya explains financial mechanisms using your current recorded context. The decision stays with you.
      </Text>
      <Text style={styles.sessionScope}>
        This is a fresh conversation. Arya can use your current records, but not a previous chat.
      </Text>
    </View>
  );
}

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
function SavedConfirmation({ status }: { status: 'new' | 'updated' | 'contradiction' }) {
  const title = status === 'updated' ? 'Updated in your baseline'
    : status === 'contradiction' ? 'This differs from what’s recorded'
    : 'Added to your baseline';
  return (
    <View style={styles.savedBanner}>
      <View style={styles.savedHeader}>
        <View style={styles.savedDot}>
          <Text style={styles.savedCheck}>✓</Text>
        </View>
        <Text style={styles.savedTitle}>{title}</Text>
      </View>
      <Text style={styles.savedBody}>
        {status === 'new' ? 'Saved. Edit or recategorise it from Investments anytime.'
          : status === 'updated' ? 'The recorded details now reflect this information.'
          : 'Review the recorded holding before deciding which detail to keep.'}
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
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  loadingText: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 12 },
  errorCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.danger,
    borderRadius: radius.md,
    backgroundColor: colors.screen,
  },
  errorText: { color: colors.danger, marginBottom: spacing.sm, fontFamily: font.ui, fontSize: 13, lineHeight: 19 },
  retryButton: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: spacing.md },
  retryButtonText: { color: colors.tutor, fontFamily: font.uiSemibold, fontSize: 14 },
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
  aryaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    backgroundColor: colors.canvas,
  },
  aryaIdentityText: { flex: 1 },
  aryaAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tutor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aryaMonogram: { fontFamily: font.uiSemibold, fontSize: 18, color: colors.canvas },
  aryaName: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.ink },
  aryaSubtitle: { fontFamily: font.ui, fontSize: 12, color: colors.inkSecondary },
  disclosureButton: { minHeight: 44, justifyContent: 'center', paddingLeft: spacing.sm },
  disclosureButtonText: { fontFamily: font.uiMedium, fontSize: 12, color: colors.tutor },
  disclosurePanel: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    backgroundColor: colors.tutorSoft,
  },
  disclosureTitle: { fontFamily: font.uiSemibold, fontSize: 13, color: colors.ink, marginBottom: spacing.xs },
  disclosureBody: { fontFamily: font.ui, fontSize: 12, lineHeight: 18, color: colors.inkSecondary },
  disclosureFootnote: { fontFamily: font.ui, fontSize: 11, lineHeight: 17, color: colors.inkMuted, marginTop: spacing.xs },
  firstEntryScope: { alignItems: 'center', maxWidth: 420, marginBottom: spacing.lg },
  firstEntryTitle: { fontFamily: font.uiSemibold, fontSize: 20, color: colors.ink, textAlign: 'center' },
  firstEntryBody: {
    fontFamily: font.tutor,
    fontSize: 15,
    lineHeight: 22,
    color: colors.inkSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  sessionScope: {
    fontFamily: font.ui,
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
