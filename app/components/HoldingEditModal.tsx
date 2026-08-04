import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CHARACTERISTICS_SCHEMA } from '../lib/characteristicsSchema';
import { useAuth } from '../lib/AuthContext';
import { deleteHolding, updateHolding, type Holding } from '../lib/holdings';
import { ALL_PRODUCT_TYPES, humanizeProductType } from '../lib/taxonomy';

// Characteristics are form-edited as strings, converted to their real type on save.
// A field left blank is omitted from the payload rather than sent as an empty string.
function initialCharacteristicsState(
  productType: string,
  holding: Holding
): Record<string, string> {
  if (productType !== holding.product_type) return {};
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
export function HoldingEditModal({
  holding,
  onClose,
  onChanged,
}: {
  holding: Holding;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { userId } = useAuth();
  const [alias, setAlias] = useState(holding.alias);
  const [displayName, setDisplayName] = useState(holding.display_name ?? '');
  const [productType, setProductType] = useState(holding.product_type);
  const [characteristics, setCharacteristics] = useState(() =>
    initialCharacteristicsState(holding.product_type, holding)
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
      await updateHolding(userId, holding.id, {
        alias,
        display_name: displayName || null,
        product_type: productType,
        characteristics: characteristicsPayload,
      });
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete holding?', `This removes "${displayName || alias}" permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  };

  const doDelete = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      await deleteHolding(userId, holding.id);
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
        <Text style={styles.title}>Edit holding</Text>

        <Text style={styles.label}>Display name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="e.g. HDFC Home Loan"
        />

        <Text style={styles.label}>Alias</Text>
        <TextInput style={styles.input} value={alias} onChangeText={setAlias} placeholder="e.g. Loan-1" />

        <Text style={styles.label}>Product type</Text>
        <View style={styles.chipRow}>
          {ALL_PRODUCT_TYPES.map((type) => (
            <Pressable
              key={type}
              style={[styles.chip, type === productType && styles.chipSelected]}
              onPress={() => setProductType(type)}
            >
              <Text style={[styles.chipText, type === productType && styles.chipTextSelected]}>
                {humanizeProductType(type)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Characteristics</Text>
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
                />
              )}
            </View>
          ))
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable style={[styles.button, styles.saveButton]} onPress={save} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save changes'}</Text>
        </Pressable>

        <Pressable style={[styles.button, styles.deleteButton]} onPress={confirmDelete} disabled={saving}>
          <Text style={styles.deleteButtonText}>Delete holding</Text>
        </Pressable>

        <Pressable style={styles.cancel} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 48, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 24 },
  label: { fontSize: 13, color: '#666', marginBottom: 6, marginTop: 16 },
  fieldLabel: { fontSize: 13, color: '#666', marginBottom: 6, marginTop: 12 },
  noFieldsText: { fontSize: 13, color: '#888', fontStyle: 'italic' },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipSelected: { backgroundColor: '#116611', borderColor: '#116611' },
  chipText: { fontSize: 13, color: '#333' },
  chipTextSelected: { color: '#fff' },
  errorText: { color: '#c00', marginTop: 16 },
  button: { borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  saveButton: { backgroundColor: '#116611' },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  deleteButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#c00', marginTop: 12 },
  deleteButtonText: { color: '#c00', fontWeight: '600' },
  cancel: { alignItems: 'center', marginTop: 16 },
  cancelText: { color: '#888' },
});
