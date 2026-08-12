import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, findNodeHandle, Pressable, StyleSheet, Text, View } from 'react-native';
import { CHARACTERISTICS_SCHEMA } from '../lib/characteristicsSchema';
import type { HoldingProposal } from '../lib/holdingReconciliation';
import { humanizeProductType } from '../lib/taxonomy';
import { colors, font, radius, spacing } from '../design/tokens';

function display(value: unknown): string {
  return value === null || value === undefined || value === '' ? 'not stated' : String(value);
}

export function HoldingProposalCard({
  proposal,
  announcement,
  onResolve,
  onSave,
  onDismiss,
}: {
  proposal: HoldingProposal;
  announcement?: string;
  onResolve: (targetId: string | null) => Promise<void>;
  onSave: () => Promise<void>;
  onDismiss: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actionStarted = useRef(false);
  const headingRef = useRef<Text>(null);
  const labels = new Map(
    (CHARACTERISTICS_SCHEMA[proposal.product_type] ?? []).map((field) => [field.key, field.label]),
  );

  useEffect(() => {
    if (!announcement) return;
    AccessibilityInfo.announceForAccessibility(announcement);
    const heading = findNodeHandle(headingRef.current);
    if (heading) AccessibilityInfo.setAccessibilityFocus(heading);
  }, [announcement, proposal]);

  const run = async (action: () => Promise<void>) => {
    if (actionStarted.current) return;
    actionStarted.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
      actionStarted.current = false;
      setBusy(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't update this holding — try again.");
      actionStarted.current = false;
      setBusy(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text ref={headingRef} style={styles.title} accessibilityRole="header">
        {proposal.kind === 'select' ? 'Which holding did you mean?' : proposal.kind === 'new' ? 'Add as a new holding?' : 'Review this change'}
      </Text>
      <Text style={styles.productType}>{humanizeProductType(proposal.product_type)}</Text>

      {proposal.kind === 'select' ? (
        <View style={styles.candidates}>
          {proposal.candidates.map((candidate) => (
            <Pressable
              key={candidate.id}
              style={styles.candidateButton}
              accessibilityRole="button"
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={() => run(() => onResolve(candidate.id))}
            >
              <Text style={styles.candidateName}>{candidate.display_name ?? candidate.alias}</Text>
              <Text style={styles.candidateType}>{humanizeProductType(candidate.product_type)}</Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.candidateButton}
            accessibilityRole="button"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={() => run(() => onResolve(null))}
          >
            <Text style={styles.candidateName}>Add as new</Text>
            <Text style={styles.candidateType}>Keep existing holdings unchanged</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {proposal.target ? (
            <Text style={styles.targetName}>For {proposal.target.display_name ?? proposal.target.alias}</Text>
          ) : null}
          {proposal.diff.map((row) => (
            <View key={row.field} style={styles.diffRow}>
              <View style={styles.diffHeading}>
                <Text style={styles.fieldLabel}>{labels.get(row.field) ?? row.field}</Text>
                <Text style={styles.statusLabel}>{row.status}</Text>
              </View>
              {proposal.kind === 'update' ? (
                <>
                  <Text style={styles.valueLabel}>Stored</Text>
                  <Text style={styles.fieldValue}>{display(row.stored_value)}</Text>
                  <Text style={styles.valueLabel}>Proposed</Text>
                </>
              ) : null}
              <Text style={styles.fieldValue}>{display(row.proposed_value)}</Text>
            </View>
          ))}
        </>
      )}

      {busy ? <ActivityIndicator color={colors.tutor} style={styles.spinner} /> : null}
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
      <View style={styles.actions}>
        <Pressable
          style={styles.dismissButton}
          onPress={onDismiss}
          disabled={busy}
          accessibilityState={{ disabled: busy }}
        >
          <Text style={styles.dismissButtonText}>Not now</Text>
        </Pressable>
        {proposal.kind !== 'select' ? (
          <Pressable
            style={styles.saveButton}
            onPress={() => run(onSave)}
            disabled={busy}
            accessibilityState={{ disabled: busy }}
          >
            <Text style={styles.saveButtonText}>{proposal.kind === 'new' ? 'Add holding' : 'Apply changes'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.screen, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, maxWidth: '94%', alignSelf: 'flex-start' },
  title: { fontSize: 12, color: colors.inkMuted, marginBottom: spacing.sm, fontFamily: font.monoSemibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  productType: { fontSize: 16, color: colors.ink, marginBottom: spacing.md, fontFamily: font.uiSemibold },
  targetName: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 13, marginBottom: spacing.md },
  candidates: { gap: spacing.sm },
  candidateButton: { minHeight: 52, justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  candidateName: { color: colors.ink, fontFamily: font.uiSemibold, fontSize: 14 },
  candidateType: { color: colors.inkSecondary, fontFamily: font.ui, fontSize: 12, marginTop: 2 },
  diffRow: { paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineSoft },
  diffHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  fieldLabel: { flex: 1, color: colors.inkMuted, fontFamily: font.mono, fontSize: 11, textTransform: 'uppercase' },
  statusLabel: { color: colors.inkSecondary, fontFamily: font.mono, fontSize: 10, textTransform: 'uppercase' },
  valueLabel: { color: colors.inkMuted, fontFamily: font.mono, fontSize: 10, marginTop: spacing.xs },
  fieldValue: { color: colors.ink, fontFamily: font.monoMedium, fontSize: 13, marginTop: 2 },
  spinner: { marginTop: spacing.md },
  errorText: { color: colors.danger, fontSize: 12, marginTop: spacing.sm, fontFamily: font.ui },
  actions: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  dismissButton: { flex: 1, minHeight: 48, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md, justifyContent: 'center', alignItems: 'center' },
  dismissButtonText: { fontSize: 14, color: colors.ink, fontFamily: font.uiSemibold },
  saveButton: { flex: 1, minHeight: 48, backgroundColor: colors.tutor, borderRadius: radius.md, paddingHorizontal: spacing.md, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: colors.screen, fontFamily: font.uiSemibold, fontSize: 14 },
});
