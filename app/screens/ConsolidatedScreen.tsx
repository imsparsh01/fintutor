import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Mascot } from '../components/Mascot';
import { pingBackendHealth } from '../lib/backend';
import { supabase } from '../lib/supabase';

// Placeholder (D-052/BQ-014 scope), plus the backend connectivity check this
// build task is scoped to include.
export function ConsolidatedScreen() {
  const [status, setStatus] = useState<{ ok: boolean; detail: string } | null>(null);

  useEffect(() => {
    pingBackendHealth().then(setStatus);
  }, []);

  return (
    <View style={styles.container}>
      <Mascot mood="neutral" />
      <Text style={styles.title}>Consolidated view</Text>
      <Text style={styles.body}>Whole-picture placeholder — net worth/portfolio will live here.</Text>

      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>Backend health</Text>
        <Text style={status?.ok ? styles.statusOk : styles.statusFail}>
          {status ? `${status.ok ? 'OK' : 'unreachable'} — ${status.detail}` : 'checking…'}
        </Text>
      </View>

      <Pressable style={styles.signOut} onPress={() => supabase?.auth.signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  body: { color: '#666', paddingHorizontal: 24, textAlign: 'center', marginBottom: 24 },
  statusBox: { alignItems: 'center', marginBottom: 32 },
  statusLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  statusOk: { color: '#116611', fontWeight: '600' },
  statusFail: { color: '#c00', fontWeight: '600' },
  signOut: { padding: 12 },
  signOutText: { color: '#c00' },
});
