import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, radius, spacing } from '../design/tokens';
import { deleteCurrentAccount } from '../lib/accountDeletion';

export function AccountDeletionModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => { if (!busy) { setConfirming(false); setPassword(''); setError(null); onClose(); } };
  const remove = async () => {
    if (!password) { setError('Enter your password to authenticate again.'); return; }
    setBusy(true); setError(null);
    try { await deleteCurrentAccount(password); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Account deletion could not be completed.'); setBusy(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}><View style={styles.card}>
        <Text style={styles.title}>Delete your account?</Text>
        <Text style={styles.body}>This permanently removes your holdings, income, goals, personalization and learning history. Encrypted recovery backups may retain a copy for up to seven days, but it cannot be used normally.</Text>
        {!confirming ? (
          <Pressable style={styles.dangerOutline} onPress={() => setConfirming(true)}><Text style={styles.dangerText}>Continue to deletion</Text></Pressable>
        ) : (
          <>
            <Text style={styles.label}>Re-enter your password</Text>
            <TextInput value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" style={styles.input} editable={!busy} />
            {error && <Text style={styles.error}>{error}</Text>}
            <Pressable style={styles.danger} onPress={remove} disabled={busy}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.dangerButtonText}>Delete my account permanently</Text>}</Pressable>
          </>
        )}
        <Pressable style={styles.cancel} onPress={close} disabled={busy}><Text style={styles.cancelText}>Keep my account</Text></Pressable>
      </View></View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(30,25,20,0.45)', justifyContent: 'center', padding: spacing.xl },
  card: { backgroundColor: colors.canvas, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  title: { fontFamily: font.uiSemibold, fontSize: 20, color: colors.ink },
  body: { fontFamily: font.tutor, fontSize: 15, lineHeight: 22, color: colors.inkSecondary },
  label: { fontFamily: font.uiMedium, fontSize: 13, color: colors.ink },
  input: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.md, padding: spacing.md, fontFamily: font.ui, color: colors.ink },
  dangerOutline: { borderWidth: 1, borderColor: '#8B2E2E', borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  dangerText: { fontFamily: font.uiSemibold, color: '#8B2E2E' },
  danger: { backgroundColor: '#8B2E2E', borderRadius: radius.md, padding: spacing.md, alignItems: 'center', minHeight: 46, justifyContent: 'center' },
  dangerButtonText: { fontFamily: font.uiSemibold, color: '#fff' },
  cancel: { padding: spacing.sm, alignItems: 'center' },
  cancelText: { fontFamily: font.uiMedium, color: colors.inkSecondary },
  error: { fontFamily: font.ui, fontSize: 13, color: '#8B2E2E' },
});
