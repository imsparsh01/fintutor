import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, radius, spacing } from '../design/tokens';
import type { GoalFundingRecord } from '../lib/goals';
import type { Holding } from '../lib/holdings';
import { humanizeProductType } from '../lib/taxonomy';

export function GoalFundingFields({
  holdings,
  value,
  onChange,
  loadFailed = false,
}: {
  holdings: Holding[] | null;
  value: GoalFundingRecord[];
  onChange: (next: GoalFundingRecord[]) => void;
  loadFailed?: boolean;
}) {
  if (loadFailed) return <Text style={styles.note}>Holdings could not be loaded. Try reopening this screen.</Text>;
  if (holdings === null) return <Text style={styles.note}>Holdings are loading…</Text>;
  if (holdings.length === 0) {
    return <Text style={styles.note}>No holdings are recorded yet. You can leave this goal unfunded.</Text>;
  }
  return (
    <View style={styles.group}>
      <Text style={styles.label}>Holdings counted toward this goal (optional)</Text>
      <Text style={styles.note}>Choose only amounts you want counted here. This does not move or reserve money.</Text>
      {holdings.map((holding) => {
        const holdingName = holding.display_name || humanizeProductType(holding.product_type);
        const existing = value.find((item) => item.holding_id === holding.id);
        const selected = existing !== undefined;
        return (
          <View key={holding.id} style={styles.row}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={`Count ${holdingName} toward this goal`}
              accessibilityState={{ checked: selected }}
              style={[styles.check, selected && styles.checkSelected]}
              onPress={() => onChange(selected
                ? value.filter((item) => item.holding_id !== holding.id)
                : [...value, { holding_id: holding.id, earmarked_amount: 0 }])}
            >
              <View style={[styles.checkBox, selected && styles.checkSelected]}>
                <Text style={styles.checkText}>{selected ? '✓' : ''}</Text>
              </View>
            </Pressable>
            <View style={styles.copy}>
              <Text style={styles.name}>{holdingName}</Text>
              <Text style={styles.kind}>{humanizeProductType(holding.product_type)}</Text>
            </View>
            {selected && (
              <TextInput
                style={styles.amount}
                value={existing.earmarked_amount > 0 ? String(existing.earmarked_amount) : ''}
                onChangeText={(raw) => onChange(value.map((item) => item.holding_id === holding.id
                  ? { ...item, earmarked_amount: Number(raw) || 0 }
                  : item))}
                keyboardType="decimal-pad"
                accessibilityLabel={`Earmarked amount from ${holdingName}`}
                placeholder="₹ amount"
                placeholderTextColor={colors.inkMuted}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.sm, marginTop: spacing.md }, label: { fontFamily: font.uiSemibold, fontSize: 14, color: colors.ink },
  note: { fontFamily: font.ui, fontSize: 12, lineHeight: 17, color: colors.inkSecondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  check: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  checkBox: { width: 24, height: 24, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  checkSelected: { borderColor: colors.tutor }, checkText: { color: colors.tutor, fontFamily: font.uiSemibold },
  copy: { flex: 1 }, name: { fontFamily: font.uiMedium, fontSize: 13, color: colors.ink }, kind: { fontFamily: font.mono, fontSize: 10, color: colors.inkMuted },
  amount: { width: 108, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 8, fontFamily: font.mono, color: colors.ink },
});
