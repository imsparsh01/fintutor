import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { CHARACTERISTICS_SCHEMA } from '../lib/characteristicsSchema';
import type { HoldingProposal } from '../lib/chat';
import { humanizeProductType } from '../lib/taxonomy';
import { colors, spacing } from '../design/tokens';

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
      {Object.entries(proposal.characteristics).map(([key, value]) => {
        const label = fieldLabels.find((f) => f.key === key)?.label ?? key;
        return (
          <Text key={key} style={styles.fieldRow}>
            {label}: <Text style={styles.fieldValue}>{String(value)}</Text>
          </Text>
        );
      })}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.actions}>
        <Pressable style={styles.dismissButton} onPress={onDismiss} disabled={saving}>
          <Text style={styles.dismissButtonText}>Not now</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  title: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  productType: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  fieldRow: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  fieldValue: { color: colors.text, fontWeight: '500' },
  errorText: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.sm },
  dismissButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  dismissButtonText: { color: colors.textSecondary, fontWeight: '500' },
  saveButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
    minWidth: 64,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '600' },
});
