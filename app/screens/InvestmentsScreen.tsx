import { StyleSheet, Text, View } from 'react-native';

// Placeholder only (D-052/BQ-014 scope) — no capture/data logic wired in yet.
export function InvestmentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Investments</Text>
      <Text style={styles.body}>Section placeholder — D-013's investment types will live here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  body: { color: '#666', paddingHorizontal: 24, textAlign: 'center' },
});
