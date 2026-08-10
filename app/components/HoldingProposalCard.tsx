import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { CHARACTERISTICS_SCHEMA } from '../lib/characteristicsSchema';
import type { HoldingProposal } from '../lib/chat';
import { humanizeProductType } from '../lib/taxonomy';
import { colors, font, radius, spacing } from '../design/tokens';

// D-078 Fork 2: a read-only preview of what the classifier extracted. Nothing is written to the
// database until Save is tapped — Not now just dismisses, same weight as declining. No in-card
// field editing in v1 (scoped out in D-078); corrections happen via the existing edit UI
// (BQ-028) after saving, same simplicity precedent the manual-add flow (BQ-036) set.
export function HoldingProposalCard({
  proposal,
  onSave,
  onDismiss,
}: {
  proposal: HoldingProposal;
  onSave: () => Promise<void>;
  onDismiss: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fieldLabels = CHARACTERISTICS_SCHEMA[proposal.product_type] ?? [];

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSave();
    } catch {
      setError("Couldn't save this holding — try again in a moment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Save this as a new holding?</Text>
      <Text style={styles.productType}>{humanizeProductType(proposal.product_type)}</Text>
      {/* Every known field for this product type gets a row, present or not — an unset
          field renders the literal text "not stated" rather than being silently omitted,
          so the preview never implies more (or less) than the classifier actually found. */}
      {fieldLabels.map((field) => {
        const value = proposal.characteristics[field.key];
        const hasValue = value !== undefined && value !== null && value !== '';
        return (
          <View key={field.key} style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <Text style={hasValue ? styles.fieldValue : styles.fieldValueUnset}>
              {hasValue ? String(value) : 'not stated'}
            </Text>
          </View>
        );
      })}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.actions}>
        {/* Declining carries the same visual weight as accepting — equal size, equal
            padding, equal border — never a de-emphasised afterthought. */}
        <Pressable style={styles.dismissButton} onPress={onDismiss} disabled={saving}>
          <Text style={styles.dismissButtonText}>Not now</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={colors.screen} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.screen,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkMuted,
    marginBottom: spacing.sm,
    fontFamily: font.mono,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productType: { fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: spacing.sm, fontFamily: font.ui },
  // Hairline-separated label/value field rows, mono throughout — the ledger register.
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineSoft,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: font.mono,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: { color: colors.ink, fontWeight: '500', fontFamily: font.mono, fontSize: 13 },
  fieldValueUnset: { color: colors.inkMuted, fontStyle: 'italic', fontFamily: font.mono, fontSize: 13 },
  errorText: { color: colors.danger, fontSize: 12, marginTop: spacing.sm, fontFamily: font.ui },
  actions: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  // Equally-weighted buttons: same padding, same border, same radius — only fill differs.
  // Primary spec (1C) applied to saveButton; dismissButton's geometry matches it exactly
  // to preserve that equal weighting.
  dismissButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dismissButtonText: { fontSize: 15, color: colors.ink, fontWeight: '600', fontFamily: font.ui },
  saveButton: {
    flex: 1,
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 15, color: colors.screen, fontWeight: '600', fontFamily: font.ui },
});
