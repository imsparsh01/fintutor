import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { TaxSavingRoomModal } from '../components/TaxSavingRoomModal';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { fetchBudget, type BudgetSummary } from '../lib/budget';
import {
  createDiscretionaryCategory,
  fetchDiscretionaryCategories,
  type DiscretionaryCategory,
} from '../lib/discretionaryCategories';
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
  const [discretionaryCategories, setDiscretionaryCategories] = useState<DiscretionaryCategory[]>([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checkingTaxSaving, setCheckingTaxSaving] = useState(false);

  const load = useCallback(() => {
    if (!userId) return;
    setError(null);
    Promise.all([
      fetchBudget(userId),
      fetchIncome(userId),
      fetchDiscretionaryCategories(userId),
      fetchGoals(userId),
    ])
      .then(([b, i, d, g]) => {
        setBudget(b);
        setIncome(i);
        setDiscretionaryCategories(d);
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
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  const hasVariableIncome = income
    .flatMap((record) => record.sources)
    .some((source) => source.amount_high != null);

  const incomeSources = income.flatMap((record) => record.sources);
  // Em-dash for "nothing recorded here yet" (D-086 register), distinct from a real
  // computed zero — these two rows are the ones directly backed by a list this screen
  // knows to be empty or not; recurring outflows and net are real computed totals
  // regardless, so they always render as a figure.
  const incomeDisplay = incomeSources.length === 0 ? '—' : formatRupees(budget.income_total);
  const discretionaryDisplay =
    discretionaryCategories.length === 0 ? '—' : formatRupees(budget.discretionary_total);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Budget</Text>
      <View>
        <BudgetRow label="Income" display={incomeDisplay} />
        <BudgetRow label="Recurring outflows" display={formatRupees(budget.recurring_outflows_total)} />
        <BudgetRow label="Discretionary" display={discretionaryDisplay} />
        <BudgetRow label="Net" display={formatRupees(budget.net)} bold />
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
      <View>
        {incomeSources.length === 0 ? (
          <Text style={styles.emptyText}>No income sources yet.</Text>
        ) : (
          incomeSources.map((source, idx) => (
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

      <Text style={styles.sectionTitle}>Discretionary spending</Text>
      <View>
        {discretionaryCategories.length === 0 ? (
          <Text style={styles.emptyText}>No discretionary categories yet.</Text>
        ) : (
          discretionaryCategories.map((cat) => (
            <View key={cat.id} style={styles.row}>
              <Text style={styles.rowLabel}>{cat.label}</Text>
              <Text style={styles.rowValue}>{formatRupees(cat.planned_amount)}</Text>
            </View>
          ))
        )}
      </View>
      <AddDiscretionaryCategoryForm userId={userId} onAdded={load} />

      <Text style={styles.sectionTitle}>Goals</Text>
      <View>
        {goals.length === 0 ? (
          <Text style={styles.emptyText}>No goals yet.</Text>
        ) : (
          goals.map((goal) => {
            const pct = goal.target_amount > 0
              ? Math.max(0, Math.min(100, (goal.progress / goal.target_amount) * 100))
              : 0;
            return (
              <View key={goal.id} style={styles.goalRow}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{goal.category}</Text>
                    <Text style={styles.rowSubtitle}>by {goal.target_date}</Text>
                  </View>
                  <Text style={styles.rowValue}>
                    {formatRupees(goal.progress)} / {formatRupees(goal.target_amount)}
                  </Text>
                </View>
                {/* Neutral ink fill on a lineSoft track (P10) — a goal at 27% is at 27%,
                    not "behind". No colour or gradient tied to how close it is. */}
                <View style={styles.goalTrack}>
                  <View style={[styles.goalFill, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })
        )}
      </View>
      <AddGoalForm userId={userId} onAdded={load} />

      {checkingTaxSaving && (
        <TaxSavingRoomModal userId={userId} onClose={() => setCheckingTaxSaving(false)} />
      )}
    </ScrollView>
  );
}

function BudgetRow({ label, display, bold }: { label: string; display: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{display}</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Label (e.g. Salary)"
        placeholderTextColor={colors.inkMuted}
        value={label}
        onChangeText={setLabel}
      />
      <TextInput
        style={styles.input}
        placeholder="Monthly amount you can count on (₹)"
        placeholderTextColor={colors.inkMuted}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Typical amount, if it varies (₹, optional)"
        placeholderTextColor={colors.inkMuted}
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

function AddDiscretionaryCategoryForm({ userId, onAdded }: { userId: string; onAdded: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const parsedAmount = Number(plannedAmount);
    if (!label.trim() || !parsedAmount) return;
    setSaving(true);
    setError(null);
    try {
      await createDiscretionaryCategory(userId, label.trim(), parsedAmount);
      setLabel('');
      setPlannedAmount('');
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
        <Text style={styles.addButtonText}>+ Add discretionary category</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Category (e.g. Eating out)"
        placeholderTextColor={colors.inkMuted}
        value={label}
        onChangeText={setLabel}
      />
      <TextInput
        style={styles.input}
        placeholder="Planned monthly amount (₹)"
        placeholderTextColor={colors.inkMuted}
        keyboardType="numeric"
        value={plannedAmount}
        onChangeText={setPlannedAmount}
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
        placeholderTextColor={colors.inkMuted}
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Target amount (₹)"
        placeholderTextColor={colors.inkMuted}
        keyboardType="numeric"
        value={targetAmount}
        onChangeText={setTargetAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Target date (YYYY-MM-DD)"
        placeholderTextColor={colors.inkMuted}
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
  container: { flex: 1, backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.screen },
  body: { fontFamily: font.ui, color: colors.inkSecondary, textAlign: 'center' },
  errorText: { fontFamily: font.ui, color: colors.danger, marginTop: spacing.xs },
  caption: { fontFamily: font.ui, fontSize: 12, color: colors.inkMuted, marginTop: spacing.xs },
  sectionTitle: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  taxSavingButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  taxSavingButtonText: { fontFamily: font.ui, color: colors.tutor, fontWeight: '600' },
  emptyText: { fontFamily: font.ui, color: colors.inkMuted, fontSize: 13 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  goalRow: { marginBottom: spacing.xs },
  goalTrack: {
    height: 4,
    backgroundColor: colors.lineSoft,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  goalFill: { height: '100%', backgroundColor: colors.ink },
  rowLabel: { fontFamily: font.mono, fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.inkMuted },
  rowSubtitle: { fontFamily: font.mono, fontSize: 11, color: colors.inkMuted, marginTop: 2 },
  rowValue: { fontFamily: font.mono, fontSize: 15, color: colors.ink },
  rowValueBold: { fontSize: 17, fontWeight: '600' },
  addButton: { paddingVertical: spacing.sm, marginTop: spacing.xs },
  addButtonText: { fontFamily: font.ui, color: colors.tutor, fontWeight: '600', fontSize: 14 },
  form: { marginTop: spacing.xs, gap: spacing.sm },
  input: {
    fontFamily: font.ui,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.ink,
  },
  saveButton: { backgroundColor: colors.tutor, borderRadius: radius.sm, paddingVertical: spacing.sm, alignItems: 'center' },
  saveButtonText: { fontFamily: font.ui, color: colors.screen, fontWeight: '600' },
});
