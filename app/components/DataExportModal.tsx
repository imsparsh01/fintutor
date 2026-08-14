import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, radius, spacing } from '../design/tokens';
import { downloadCurrentUserData } from '../lib/dataExport';

export function DataExportModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) { setPassword(''); setError(null); setBusy(false); }
  }, [visible]);

  const close = () => { if (!busy) onClose(); };
  const download = async () => {
    if (!password) { setError('Enter your password to authenticate again.'); return; }
    setBusy(true); setError(null);
    try {
      await downloadCurrentUserData(password);
      setBusy(false);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your data export could not be prepared.');
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}><View style={styles.card}>
        <Text style={styles.title}>Download your data</Text>
        <Text style={styles.body}>FinTutor will prepare a JSON file containing the personal and financial information connected to your account. Passwords, authentication secrets and internal security data are excluded.</Text>
        <Text style={styles.label}>Re-enter your password</Text>
        <TextInput
          accessibilityLabel="Password"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={download}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          style={styles.input}
          editable={!busy}
        />
        {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <Pressable accessibilityRole="button" style={[styles.primary, busy && styles.disabled]} onPress={download} disabled={busy}>
          {busy ? <ActivityIndicator color={colors.screen} /> : <Text style={styles.primaryText}>Prepare and download JSON</Text>}
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.cancel} onPress={close} disabled={busy}><Text style={styles.cancelText}>Cancel</Text></Pressable>
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
  primary: { backgroundColor: colors.tutor, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', minHeight: 46, justifyContent: 'center' },
  primaryText: { fontFamily: font.uiSemibold, color: colors.screen },
  disabled: { opacity: 0.65 },
  cancel: { padding: spacing.sm, alignItems: 'center' },
  cancelText: { fontFamily: font.uiMedium, color: colors.inkSecondary },
  error: { fontFamily: font.ui, fontSize: 13, color: '#8B2E2E' },
});
