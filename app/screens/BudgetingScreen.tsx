import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { TaxSavingRoomModal } from '../components/TaxSavingRoomModal';
import { colors, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { fetchBudget, type BudgetSummary } from '../lib/budget';
import { formatRupees } from '../lib/format';
import { createGoal, fetchGoals, type GoalRecord } from '../lib/goals';
import { createIncome, fetchIncome, updateIncome, type IncomeRecord } from '../lib/income';

// D-038: budget is a fully computed view (nothing stored beyond Income/discretionary
// categories, both already backed — BQ-010); goals carry live-computed `progress`
// (BQ-017). This tab surfaces both plus the write paths BQ-016/BQ-017 added.
export function BudgetingScreen() {
  const { userId } = useAuth();
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checkingTaxSaving, setCheckingTaxSaving] = useState(false);

  const load = useCallback(() => {
    if (!userId) return;
    setError(null);
    Promise.all([fetchBudget(userId), fetchIncome(userId), fetchGoals(userId)])
      .then(([b, i, g]) => {
        setBudget(b);
        setIncome(i);
        setGoals(g);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!userId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.body}>Signed out — nothing to show.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Couldn't load — {error}</Text>
      </View>
    );
  }

  if (budget === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const hasVariableIncome = income
    .flatMap((record) => record.sources)
    .some((source) => source.amount_high != null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Budget</Text>
      <View style={styles.card}>
        <BudgetRow label="Income" value={budget.income_total} />
        <BudgetRow label="Recurring outflows" value={budget.recurring_outflows_total} />
        <BudgetRow label="Discretionary" value={budget.discretionary_total} />
        <BudgetRow label="Net" value={budget.net} bold />
      </View>
      {hasVariableIncome && (
        <Text style={styles.caption}>
          Income uses the amount you can count on for any source you've marked as variable — not the
          typical figure shown below.
        </Text>
      )}
      <Pressable style={styles.taxSavingButton} onPress={() => setCheckingTaxSaving(true)}>
        <Text style={styles.taxSavingButtonText}>Check my 80C room</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Income</Text>
      <View style={styles.card}>
        {income.flatMap((record) => record.sources).length === 0 ? (
          <Text style={styles.emptyText}>No income sources yet.</Text>
        ) : (
          income
            .flatMap((record) => record.sources)
            .map((source, idx) => (
              <View key={idx} style={styles.row}>
                <Text style={styles.rowLabel}>{source.label}</Text>
                <View>
                  <Text style={styles.rowValue}>
                    {formatRupees(source.amount)} / {source.frequency}
                  </Text>
                  {source.amount_high != null && (
                    <Text style={styles.rowSubtitle}>typical ~{formatRupees(source.amount_high)}</Text>
                  )}
                </View>
              </View>
            ))
        )}
      </View>
      <AddIncomeForm
        userId={userId}
        existing={income[0] ?? null}
        onAdded={load}
      />

      <Text style={styles.sectionTitle}>Goals</Text>
      <View style={styles.card}>
        {goals.length === 0 ? (
          <Text style={styles.emptyText}>No goals yet.</Text>
        ) : (
          goals.map((goal) => (
            <View key={goal.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{goal.category}</Text>
                <Text style={styles.rowSubtitle}>by {goal.target_date}</Text>
              </View>
              <Text style={styles.rowValue}>
                {formatRupees(goal.progress)} / {formatRupees(goal.target_amount)}
              </Text>
            </View>
          ))
        )}
      </View>
      <AddGoalForm userId={userId} onAdded={load} />

      {checkingTaxSaving && (
        <TaxSavingRoomModal userId={userId} onClose={() => setCheckingTaxSaving(false)} />
      )}
    </ScrollView>
  );
}

function BudgetRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{formatRupees(value)}</Text>
    </View>
  );
}

function AddIncomeForm({
  userId,
  existing,
  onAdded,
}: {
  userId: string;
  existing: IncomeRecord | null;
  onAdded: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [amountHigh, setAmountHigh] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const parsedAmount = Number(amount);
    const parsedAmountHigh = amountHigh.trim() ? Number(amountHigh) : null;
    if (!label.trim() || !parsedAmount) return;
    setSaving(true);
    setError(null);
    try {
      const newSource = {
        label: label.trim(),
        amount: parsedAmount,
        frequency: 'monthly',
        amount_high: parsedAmountHigh,
      };
      if (existing) {
        await updateIncome(userId, existing.id, [...existing.sources, newSource]);
      } else {
        await createIncome(userId, [newSource]);
      }
      setLabel('');
      setAmount('');
      setAmountHigh('');
      setExpanded(false);
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!expanded) {
    return (
      <Pressable style={styles.addButton} onPress={() => setExpanded(true)}>
        <Text style={styles.addButtonText}>+ Add income source</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.form}>
      <TextInput style={styles.input} placeholder="Label (e.g. Salary)" value={label} onChangeText={setLabel} />
      <TextInput
        style={styles.input}
        placeholder="Monthly amount you can count on (₹)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Typical amount, if it varies (₹, optional)"
        keyboardType="numeric"
        value={amountHigh}
        onChangeText={setAmountHigh}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Pressable style={styles.saveButton} onPress={save} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save'}</Text>
      </Pressable>
    </View>
  );
}

function AddGoalForm({ userId, onAdded }: { userId: string; onAdded: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const parsedAmount = Number(targetAmount);
    if (!category.trim() || !parsedAmount || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      setError('Fill in a category, an amount, and a date as YYYY-MM-DD');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createGoal(userId, { category: category.trim(), target_amount: parsedAmount, target_date: targetDate });
      setCategory('');
      setTargetAmount('');
      setTargetDate('');
      setExpanded(false);
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!expanded) {
    return (
      <Pressable style={styles.addButton} onPress={() => setExpanded(true)}>
        <Text style={styles.addButtonText}>+ Add goal</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="What's this for? (e.g. Child's education)"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Target amount (₹)"
        keyboardType="numeric"
        value={targetAmount}
        onChangeText={setTargetAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Target date (YYYY-MM-DD)"
        value={targetDate}
        onChangeText={setTargetDate}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Pressable style={styles.saveButton} onPress={save} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  body: { color: colors.textSecondary, textAlign: 'center' },
  errorText: { color: colors.danger, marginTop: spacing.xs },
  caption: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  taxSavingButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.success,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  taxSavingButtonText: { color: colors.success, fontWeight: '600' },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: spacing.md,
  },
  emptyText: { color: colors.textMuted, fontSize: 13 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  rowLabel: { fontSize: 14, color: colors.textSecondary },
  rowSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  rowValueBold: { fontSize: 16 },
  addButton: { paddingVertical: spacing.sm, marginTop: spacing.xs },
  addButtonText: { color: colors.success, fontWeight: '600', fontSize: 14 },
  form: { marginTop: spacing.xs, gap: spacing.sm },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
  },
  saveButton: { backgroundColor: colors.success, borderRadius: 8, paddingVertical: spacing.sm, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: '600' },
});
