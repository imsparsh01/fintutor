import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CHARACTERISTICS_SCHEMA } from '../lib/characteristicsSchema';
import { useAuth } from '../lib/AuthContext';
import { createHolding, deleteHolding, fetchHoldingDeletionImpact, updateHolding, type Holding, type HoldingUpdate } from '../lib/holdings';
import { isStaleWriteError } from '../lib/apiResponse';
import { recategorisationFieldLoss } from '../lib/baselineUiState';
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
  intent = 'edit',
  onClose,
  onChanged,
}: {
  holding: Holding | null;
  familyTypes?: string[];
  noun?: string;
  intent?: 'edit' | 'recategorise';
  onClose: () => void;
  onChanged: () => void;
}) {
  const isCreate = holding === null;
  const { userId } = useAuth();
  const [alias] = useState(holding?.alias ?? '');
  const [displayName, setDisplayName] = useState(holding?.display_name ?? '');
  const [productType, setProductType] = useState(
    holding?.product_type ?? familyTypes?.[0] ?? ALL_PRODUCT_TYPES[0]
  );
  const [characteristics, setCharacteristics] = useState(() =>
    initialCharacteristicsState(productType, holding)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [committedHolding, setCommittedHolding] = useState<Holding | null>(null);
  const [staleVersion, setStaleVersion] = useState<number | null>(null);
  const [staleCurrent, setStaleCurrent] = useState<Partial<Holding> | null>(null);
  const [staleProposed, setStaleProposed] = useState<Record<string, unknown> | null>(null);
  const [pendingRecategorisation, setPendingRecategorisation] = useState(false);
  const [deletedHoldingId, setDeletedHoldingId] = useState<string | null>(null);

  // Recategorizing changes which fields apply — a different product type's
  // characteristics aren't meaningful carried over, so the section resets.
  useEffect(() => {
    setCharacteristics(initialCharacteristicsState(productType, holding));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType]);

  const fields = CHARACTERISTICS_SCHEMA[productType] ?? [];
  const pickerTypes = isCreate ? familyTypes ?? ALL_PRODUCT_TYPES : ALL_PRODUCT_TYPES;

  const removedFields = holding && productType !== holding.product_type
    ? recategorisationFieldLoss(holding.characteristics, CHARACTERISTICS_SCHEMA[productType] ?? []).map((removed) => ({
        ...removed,
        label: CHARACTERISTICS_SCHEMA[holding.product_type]?.find((field) => field.key === removed.key)?.label ?? removed.label,
      }))
    : [];

  const save = async (confirmedVersion?: number, recategorisationConfirmed = false) => {
    if (!userId) return;
    if (removedFields.length > 0 && !recategorisationConfirmed) {
      setPendingRecategorisation(true);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const characteristicsPayload: Record<string, unknown> = {};
      for (const field of fields) {
        const raw = characteristics[field.key];
        if (raw === undefined || raw === '') continue;
        if (field.kind === 'number') {
          const parsed = Number(raw);
          if (!Number.isFinite(parsed) || parsed < 0) {
            setError(`${field.label} must be a non-negative number.`);
            setSaving(false);
            return;
          }
          if ((field.key.endsWith('_months') || field.key.endsWith('_day') || field.key === 'total_units_granted') && !Number.isInteger(parsed)) {
            setError(`${field.label} must be a whole number.`);
            setSaving(false);
            return;
          }
          if (field.key.endsWith('_day') && (parsed < 1 || parsed > 31)) {
            setError(`${field.label} must be between 1 and 31.`);
            setSaving(false);
            return;
          }
          characteristicsPayload[field.key] = parsed;
        } else characteristicsPayload[field.key] = raw;
      }
      if (isCreate) {
        const created = await createHolding(userId, {
          product_type: productType,
          display_name: displayName || null,
          characteristics: characteristicsPayload,
        });
        setCommittedHolding(created);
        try {
          await scheduleHoldingReminder(created);
        } catch {
          setNotice('Holding saved. Reminder was not scheduled. Retry only the reminder setup.');
          return;
        }
      } else {
        const updated = await updateHolding(userId, holding.id, {
          alias,
          display_name: displayName || null,
          product_type: productType,
          characteristics: characteristicsPayload,
        }, confirmedVersion ?? holding.version);
        setCommittedHolding(updated);
        try {
          await scheduleHoldingReminder(updated);
        } catch {
          setNotice('Holding saved. Reminder was not scheduled. Retry only the reminder setup.');
          return;
        }
      }
      onChanged();
      onClose();
    } catch (err) {
      if (isStaleWriteError<Holding, Record<string, unknown>>(err)) {
        setStaleVersion(Number(err.detail.current.version));
        setStaleCurrent(err.detail.current);
        setStaleProposed(err.detail.proposed);
        setError('This holding changed since you opened it. Review the refreshed version before saving again.');
      } else setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!holding) return;
    setSaving(true);
    setError(null);
    try {
      const impact = await fetchHoldingDeletionImpact(userId!, holding.id);
      const goalLine = impact.funding_links_removed > 0
        ? ` It also removes ${impact.funding_links_removed} goal funding link${impact.funding_links_removed === 1 ? '' : 's'} and recalculates goal progress.`
        : '';
      Alert.alert('Delete holding?', `This removes "${displayName || alias}" permanently.${goalLine}`, [
      { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => doDelete(impact.version) },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not check deletion impact.');
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async (expectedVersion: number) => {
    if (!userId || !holding) return;
    setSaving(true);
    setError(null);
    try {
      await deleteHolding(userId, holding.id, expectedVersion);
      setDeletedHoldingId(holding.id);
      try {
        await cancelHoldingReminder(holding.id);
      } catch {
        setNotice('Holding deleted. Its local reminder could not be cleared; retry reminder cleanup from this device.');
        return;
      }
      onChanged();
      onClose();
    } catch (err) {
      if (isStaleWriteError<{ version: number }, Record<string, unknown>>(err)) {
        setError('This holding or one of its goal links changed. Review deletion impact again before deleting.');
      } else setError(err instanceof Error ? err.message : 'Failed to delete');
      setSaving(false);
    }
  };

  const reconfirmStaleSave = async () => {
    if (!userId || !holding || staleVersion === null || !staleProposed) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateHolding(userId, holding.id, staleProposed as HoldingUpdate, staleVersion);
      setCommittedHolding(updated);
      setStaleVersion(null);
      setStaleCurrent(null);
      setStaleProposed(null);
      try { await scheduleHoldingReminder(updated); }
      catch { setNotice('Holding saved. Reminder was not scheduled. Retry only the reminder setup.'); return; }
      onChanged();
      onClose();
    } catch (err) {
      if (isStaleWriteError<Holding, Record<string, unknown>>(err)) {
        setStaleVersion(err.detail.current.version);
        setStaleCurrent(err.detail.current);
        setStaleProposed(err.detail.proposed);
        setError('The holding changed again. Review the newest saved version before reconfirming.');
      } else setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally { setSaving(false); }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          {isCreate ? `Add ${articleFor(noun)} ${noun}` : intent === 'recategorise' ? `Recategorise ${noun}` : `Edit ${noun}`}
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
          accessibilityLabel="Holding name"
        />
        <Text style={styles.fieldNote}>
          This name is stored in your FinTutor account and is never sent to the model.
        </Text>

        {!isCreate && !notice && (
          <>
            <Text style={styles.fieldLabel}>Alias</Text>
            <Text style={styles.fieldNote}>{alias} · generated by FinTutor for model-safe teaching context</Text>
          </>
        )}

        <Text style={styles.fieldLabel}>Type</Text>
        <View style={styles.chipRow}>
          {pickerTypes.map((type) => (
            <Pressable
              key={type}
              style={[styles.chip, type === productType && styles.chipSelected]}
              onPress={() => setProductType(type)}
              accessibilityRole="radio"
              accessibilityState={{ selected: type === productType }}
              accessibilityLabel={`Holding type ${chipLabel(type)}`}
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
                      accessibilityRole="radio"
                      accessibilityState={{ selected: characteristics[field.key] === option }}
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
                  accessibilityLabel={field.label}
                />
              )}
            </View>
          ))
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
        {staleVersion !== null && (
          <View style={styles.reviewBox} accessibilityLiveRegion="polite">
            <Text style={styles.fieldNote}>Current saved record: {staleCurrent?.display_name ?? staleCurrent?.alias ?? 'holding'} · {staleCurrent?.product_type ? chipLabel(staleCurrent.product_type) : 'type unavailable'} · version {staleVersion}.</Text>
            <Text style={styles.fieldNote}>Proposed action: {`${String(staleProposed?.display_name ?? staleProposed?.alias ?? 'unnamed')} · ${staleProposed?.product_type ? chipLabel(String(staleProposed.product_type)) : 'type unchanged'}`}.</Text>
            <Text style={styles.fieldNote}>Nothing has been overwritten. Reconfirm only after comparing the current and proposed records.</Text>
            <Pressable style={[styles.button, styles.saveButton]} onPress={reconfirmStaleSave} disabled={saving} accessibilityRole="button" accessibilityLabel="Reconfirm proposed changes using refreshed holding version">
              <Text style={styles.saveButtonText}>Reconfirm proposed changes</Text>
            </Pressable>
          </View>
        )}
        {pendingRecategorisation && (
          <View style={styles.reviewBox} accessibilityLiveRegion="polite">
            <Text style={styles.fieldLabel}>Review fields removed on save</Text>
            {removedFields.map((field) => <Text key={field.key} style={styles.fieldNote}>• {field.label}: {String(field.value)}</Text>)}
            <Text style={styles.fieldNote}>Cancel keeps the original type and all recorded fields.</Text>
            <Pressable style={[styles.button, styles.saveButton]} onPress={() => save(undefined, true)} disabled={saving} accessibilityRole="button" accessibilityLabel="Confirm recategorisation and remove listed fields">
              <Text style={styles.saveButtonText}>Confirm recategorisation</Text>
            </Pressable>
            <Pressable style={styles.cancel} onPress={() => {
              setProductType(holding?.product_type ?? productType);
              setCharacteristics(initialCharacteristicsState(holding?.product_type ?? productType, holding));
              setPendingRecategorisation(false);
            }} accessibilityRole="button"><Text style={styles.cancelText}>Cancel recategorisation</Text></Pressable>
          </View>
        )}

        {notice && (
          <View style={styles.reviewBox} accessibilityLiveRegion="polite">
            <Text style={styles.fieldNote}>{notice}</Text>
            {committedHolding && <Pressable style={[styles.button, styles.saveButton]} onPress={async () => {
              try { await scheduleHoldingReminder(committedHolding); setCommittedHolding(null); setNotice('Reminder scheduled. The holding was not created again.'); }
              catch { setNotice('Holding remains saved. Reminder setup still needs retrying.'); }
            }}><Text style={styles.saveButtonText}>Retry reminder only</Text></Pressable>}
            {deletedHoldingId && <Pressable style={[styles.button, styles.saveButton]} onPress={async () => {
              try { await cancelHoldingReminder(deletedHoldingId); setDeletedHoldingId(null); setNotice('Reminder cleanup completed. The holding remains deleted.'); }
              catch { setNotice('Holding remains deleted. Reminder cleanup still needs retrying.'); }
            }} accessibilityRole="button"><Text style={styles.saveButtonText}>Retry reminder cleanup only</Text></Pressable>}
            <Pressable style={styles.cancel} onPress={() => { onChanged(); onClose(); }}><Text style={styles.cancelText}>Done</Text></Pressable>
          </View>
        )}

        {!notice && !pendingRecategorisation && staleVersion === null && <Pressable style={[styles.button, styles.saveButton]} onPress={() => save()} disabled={saving} accessibilityRole="button">
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : isCreate ? `Save ${noun}` : 'Save changes'}
          </Text>
        </Pressable>}

        {!isCreate && !notice && staleVersion === null && (
          <Pressable style={[styles.button, styles.deleteButton]} onPress={confirmDelete} disabled={saving} accessibilityRole="button">
            <Text style={styles.deleteButtonText}>Delete holding</Text>
          </Pressable>
        )}

        <Pressable style={styles.cancel} onPress={onClose} accessibilityRole="button">
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
  reviewBox: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg },
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
