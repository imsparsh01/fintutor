import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CHARACTERISTICS_SCHEMA } from '../lib/characteristicsSchema';
import { useAuth } from '../lib/AuthContext';
import { createHolding, deleteHolding, updateHolding, type Holding } from '../lib/holdings';
import { ALL_PRODUCT_TYPES, humanizeProductType } from '../lib/taxonomy';
import { colors, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';
import { scheduleHoldingReminder } from '../lib/reminders';
import { cancelHoldingReminder } from '../lib/reminders';

// Characteristics are form-edited as strings, converted to their real type on save.
// A field left blank is omitted from the payload rather than sent as an empty string.
// D-074: holding is null in create mode — no existing values to read, so this returns {}
// (BQ-028's progressive-capture behavior applies for free: nothing is required up front).
function initialCharacteristicsState(
  productType: string,
  holding: Holding | null
): Record<string, string> {
  if (!holding || productType !== holding.product_type) return {};
  const fields = CHARACTERISTICS_SCHEMA[productType] ?? [];
  const state: Record<string, string> = {};
  for (const field of fields) {
    const value = holding.characteristics[field.key];
    state[field.key] = value === null || value === undefined ? '' : String(value);
  }
  return state;
}

// Edit/delete/recategorize UI (D-059, Path C) — full direct-manipulation authority over
// a holding, including the per-type characteristics field blob (BQ-028), keyed off the
// known D-013 field list per product_type (see lib/characteristicsSchema.ts).
//
// "Endowment / ULIP" reads better than humanizeProductType's literal "Endowment Ulip" —
// a display-only override for the chip label, not a taxonomy change (lib/taxonomy.ts is
// untouched). Mirrors the same override in InsuranceScreen.tsx/HoldingDetailScreen.tsx.
function chipLabel(productType: string): string {
  return productType === 'endowment_ulip' ? 'Endowment / ULIP' : humanizeProductType(productType);
}

// "Add a policy" / "Add an investment" (mockup 4.4) — a small article helper so the title
// reads naturally regardless of which family's noun is passed in.
function articleFor(word: string): string {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

// D-074: a null `holding` switches this to create mode — no alias field (the backend
// generates one), no delete button, POST instead of PATCH. `familyTypes` scopes the
// product-type picker to the tab the user tapped "+ Add" from; edit mode ignores it and
// keeps the existing unconstrained ALL_PRODUCT_TYPES recategorize picker (BQ-027/D-059).
// `noun` (mockup 4.4) is purely the display word for the title/save button — "investment"
// / "loan" / "policy" from the calling screen, defaulting to the generic "holding".
export function HoldingEditModal({
  holding,
  familyTypes,
  noun = 'holding',
  onClose,
  onChanged,
}: {
  holding: Holding | null;
  familyTypes?: string[];
  noun?: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const isCreate = holding === null;
  const { userId } = useAuth();
  const [alias, setAlias] = useState(holding?.alias ?? '');
  const [displayName, setDisplayName] = useState(holding?.display_name ?? '');
  const [productType, setProductType] = useState(
    holding?.product_type ?? familyTypes?.[0] ?? ALL_PRODUCT_TYPES[0]
  );
  const [characteristics, setCharacteristics] = useState(() =>
    initialCharacteristicsState(productType, holding)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recategorizing changes which fields apply — a different product type's
  // characteristics aren't meaningful carried over, so the section resets.
  useEffect(() => {
    setCharacteristics(initialCharacteristicsState(productType, holding));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType]);

  const fields = CHARACTERISTICS_SCHEMA[productType] ?? [];
  const pickerTypes = isCreate ? familyTypes ?? ALL_PRODUCT_TYPES : ALL_PRODUCT_TYPES;

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      const characteristicsPayload: Record<string, unknown> = {};
      for (const field of fields) {
        const raw = characteristics[field.key];
        if (raw === undefined || raw === '') continue;
        characteristicsPayload[field.key] = field.kind === 'number' ? Number(raw) : raw;
      }
      if (isCreate) {
        const created = await createHolding(userId, {
          product_type: productType,
          display_name: displayName || null,
          characteristics: characteristicsPayload,
        });
        await scheduleHoldingReminder(created);
      } else {
        const updated = await updateHolding(userId, holding.id, {
          alias,
          display_name: displayName || null,
          product_type: productType,
          characteristics: characteristicsPayload,
        });
        await scheduleHoldingReminder(updated);
      }
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!holding) return;
    Alert.alert('Delete holding?', `This removes "${displayName || alias}" permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  };

  const doDelete = async () => {
    if (!userId || !holding) return;
    setSaving(true);
    setError(null);
    try {
      await deleteHolding(userId, holding.id);
      await cancelHoldingReminder(holding.id);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setSaving(false);
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          {isCreate ? `Add ${articleFor(noun)} ${noun}` : `Edit ${noun}`}
        </Text>
        {isCreate && (
          <Text style={styles.titleCaption}>
            You can also just tell me about it in Ask — I'll fill this in for you.
          </Text>
        )}

        <Text style={styles.fieldLabel}>What do you call it?</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          // No real product, fund, insurer, or bank name may appear in app-authored copy —
          // PROJECT_SPEC.md §2's strict compliance stance. The user's own display_name may of
          // course be anything they like (P6); the placeholder we suggest may not.
          placeholder="e.g. My home loan"
          placeholderTextColor={colors.inkMuted}
        />
        <Text style={styles.fieldNote}>
          Only you see this name. It's stored on your device's account, never sent to the model.
        </Text>

        {!isCreate && (
          <>
            <Text style={styles.fieldLabel}>Alias</Text>
            <TextInput
              style={styles.input}
              value={alias}
              onChangeText={setAlias}
              placeholder="e.g. Loan-1"
              placeholderTextColor={colors.inkMuted}
            />
          </>
        )}

        <Text style={styles.fieldLabel}>Type</Text>
        <View style={styles.chipRow}>
          {pickerTypes.map((type) => (
            <Pressable
              key={type}
              style={[styles.chip, type === productType && styles.chipSelected]}
              onPress={() => setProductType(type)}
            >
              <Text style={[styles.chipText, type === productType && styles.chipTextSelected]}>
                {chipLabel(type)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Characteristics</Text>
        <Text style={styles.fieldNote}>
          Anything you leave blank stays blank — we won't guess, and nothing here is required.
        </Text>
        {fields.length === 0 ? (
          <Text style={styles.noFieldsText}>No known fields for this product type.</Text>
        ) : (
          fields.map((field) => (
            <View key={field.key}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              {field.kind === 'enum' ? (
                <View style={styles.chipRow}>
                  {field.options?.map((option) => (
                    <Pressable
                      key={option}
                      style={[styles.chip, characteristics[field.key] === option && styles.chipSelected]}
                      onPress={() => setCharacteristics((prev) => ({ ...prev, [field.key]: option }))}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          characteristics[field.key] === option && styles.chipTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  value={characteristics[field.key] ?? ''}
                  onChangeText={(text) =>
                    setCharacteristics((prev) => ({ ...prev, [field.key]: text }))
                  }
                  keyboardType={field.kind === 'number' ? 'numeric' : 'default'}
                  placeholder={field.label}
                  placeholderTextColor={colors.inkMuted}
                />
              )}
            </View>
          ))
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable style={[styles.button, styles.saveButton]} onPress={save} disabled={saving}>
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : isCreate ? `Save ${noun}` : 'Save changes'}
          </Text>
        </Pressable>

        {!isCreate && (
          <Pressable style={[styles.button, styles.deleteButton]} onPress={confirmDelete} disabled={saving}>
            <Text style={styles.deleteButtonText}>Delete holding</Text>
          </Pressable>
        )}

        <Pressable style={styles.cancel} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingTop: spacing.xxxl, backgroundColor: colors.screen },
  title: { fontSize: 20, marginBottom: spacing.sm, color: colors.ink, fontFamily: font.uiSemibold },
  // Mockup 4.4's caption under the title, pointing at the faster Ask-based capture path.
  titleCaption: { fontFamily: font.ui, fontSize: 13, color: colors.inkMuted, marginBottom: spacing.lg },
  // `label` and `fieldLabel` were byte-identical except marginTop — merged (1H). Mono
  // uppercase to match every other form label in the app (this one was the odd one out,
  // font.ui sentence case).
  fieldLabel: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: 6,
    marginTop: spacing.md,
  },
  // Mockup 4.4's reassurance notes — display-name privacy, and "nothing here is required".
  fieldNote: { fontFamily: font.ui, fontSize: 12, color: colors.inkMuted, marginTop: -2, marginBottom: spacing.sm },
  noFieldsText: { fontSize: 13, color: colors.inkMuted, fontStyle: 'italic', fontFamily: font.ui },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.ink,
    fontFamily: font.ui,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  chipSelected: { backgroundColor: colors.tutor, borderColor: colors.tutor },
  chipText: { fontSize: 13, color: colors.ink, fontFamily: font.ui },
  chipTextSelected: { color: colors.screen },
  errorText: { color: colors.danger, marginTop: spacing.lg, fontFamily: font.ui },
  button: { borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.xl },
  saveButton: { backgroundColor: colors.tutor },
  saveButtonText: typography.primaryButtonText,
  // Delete is a genuine destructive action — colors.danger here is correct P10 usage
  // (a real error/destructive state, not a negative financial value).
  deleteButton: {
    backgroundColor: colors.screen,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.danger,
    marginTop: spacing.md,
  },
  deleteButtonText: { color: colors.danger, fontFamily: font.uiSemibold },
  cancel: { alignItems: 'center', marginTop: spacing.lg },
  cancelText: { color: colors.inkMuted, fontFamily: font.ui },
});
