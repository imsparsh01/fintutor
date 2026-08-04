import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { deleteHolding, updateHolding, type Holding } from '../lib/holdings';
import { ALL_PRODUCT_TYPES, humanizeProductType } from '../lib/taxonomy';

// Edit/delete/recategorize UI (D-059, Path C) — full direct-manipulation authority
// over a holding. Characteristics (the per-type field blob) aren't editable here yet;
// the backend PATCH already accepts them, this is a UI scoping choice for a first pass.
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      await updateHolding(userId, holding.id, {
        alias,
        display_name: displayName || null,
        product_type: productType,
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
