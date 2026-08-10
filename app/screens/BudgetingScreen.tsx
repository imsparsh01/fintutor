import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { TaxSavingRoomModal } from '../components/TaxSavingRoomModal';
import { colors, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';
import { useAuth } from '../lib/AuthContext';
import { fetchBudget, type BudgetSummary } from '../lib/budget';
import {
  createDiscretionaryCategory,
  fetchDiscretionaryCategories,
  type DiscretionaryCategory,
} from '../lib/discretionaryCategories';
import { formatRupees } from '../lib/format';
import { createGoal, fetchGoals, type GoalRecord } from '../lib/goals';
import { createIncome, fetchIncome, updateIncome, type IncomeRecord, type IncomeSource } from '../lib/income';

// D-038: budget is a fully computed view (nothing stored beyond Income/discretionary
// categories, both already backed — BQ-010); goals carry live-computed `progress`
// (BQ-017). This tab surfaces both plus the write paths BQ-016/BQ-017 added.
//
// Layout/register rebuild to Flow 06 (mockup v1). The "WHERE THE ₹X COMES FROM"
// provenance breakdown drawn in that mockup needs a per-line backend response the API
// does not return (BudgetSummary has totals only, no recurring-outflow line items) — it
// is deliberately omitted here rather than faked. Same for 6.3 (setting a goal in
// conversation), which needs a backend classifier that doesn't exist yet.
export function BudgetingScreen() {
  const { userId } = useAuth();
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [discretionaryCategories, setDiscretionaryCategories] = useState<DiscretionaryCategory[]>([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checkingTaxSaving, setCheckingTaxSaving] = useState(false);
  const [addingDiscretionary, setAddingDiscretionary] = useState(false);

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

  const incomeSources = income.flatMap((record) => record.sources);
  const hasVariableIncome = incomeSources.some((source) => source.amount_high != null);

  // Em-dash for "nothing recorded here yet" (D-086 register), distinct from a real
  // computed zero — these two rows are the ones directly backed by a list this screen
  // knows to be empty or not; recurring outflows and net are real computed totals
  // regardless, so they always render as a figure.
  const incomeDisplay = incomeSources.length === 0 ? '—' : formatRupees(budget.income_total);
  const discretionaryDisplay =
    discretionaryCategories.length === 0 ? '—' : formatRupees(budget.discretionary_total);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 6.1 — title + "computed, not stored" register, same header shape as Home's
          greeting/month pair (ConsolidatedScreen). */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Budget</Text>
        <Text style={styles.pageSub}>{currentMonthLabel()} · computed, not stored</Text>
      </View>

      <View style={styles.card}>
        <BudgetRow label="Income" display={incomeDisplay} />
        <BudgetRow label="Recurring outflows" display={formatRupees(budget.recurring_outflows_total)} />
        <BudgetRow label="Discretionary" display={discretionaryDisplay} />
        {/* Net is the emphasized row (6.1) — bigger figure, no bottom rule, no valence
            colour even when negative (P10): it renders in ink either way. */}
        <BudgetRow label="Net" display={formatRupees(budget.net)} emphasis last />
      </View>

      <Pressable style={styles.taxSavingButton} onPress={() => setCheckingTaxSaving(true)}>
        <Text style={styles.taxSavingButtonText}>Check my 80C room</Text>
      </Pressable>

      {/* DISCRETIONARY card — section label + inline "+ Add" (6.1), not a full-width
          button under the list. */}
      <View style={[styles.card, styles.cardSpaced]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionLabelInline}>Discretionary</Text>
          {!addingDiscretionary && (
            <Pressable onPress={() => setAddingDiscretionary(true)}>
              <Text style={styles.addInlineText}>+ Add</Text>
            </Pressable>
          )}
        </View>
        {discretionaryCategories.length === 0 ? (
          <Text style={styles.emptyText}>No discretionary categories yet.</Text>
        ) : (
          discretionaryCategories.map((cat, idx) => (
            <View
              key={cat.id}
              style={[styles.row, idx !== discretionaryCategories.length - 1 && styles.rowDivider]}
            >
              <Text style={styles.rowLabel}>{cat.label}</Text>
              <Text style={styles.rowValue}>{formatRupees(cat.planned_amount)}</Text>
            </View>
          ))
        )}
        {addingDiscretionary && (
          <DiscretionaryAddFields
            userId={userId}
            onDone={() => {
              setAddingDiscretionary(false);
              load();
            }}
            onCancel={() => setAddingDiscretionary(false)}
          />
        )}
      </View>

      {/* 6.2 — Income: FIXED · MONTHLY vs VARIABLE, count-on figure vs typical. */}
      <Text style={styles.sectionTitle}>Income</Text>
      <View style={styles.card}>
        {incomeSources.length === 0 ? (
          <Text style={styles.emptyText}>No income sources yet.</Text>
        ) : (
          incomeSources.map((source, idx) => (
            <IncomeSourceRow
              key={idx}
              source={source}
              bordered={idx !== incomeSources.length - 1}
            />
          ))
        )}
      </View>
      {hasVariableIncome && (
        <View style={styles.tutorCallout}>
          <Text style={styles.tutorCalloutText}>
            The budget above is built on the amount you can count on for any income you've marked as
            variable — never the typical figure shown alongside it. Months that come in above typical
            are surplus, not a shortfall avoided.
          </Text>
        </View>
      )}
      <AddIncomeForm userId={userId} existing={income[0] ?? null} onAdded={load} />

      {/* 6.2 — Goals: neutral ink progress, never green/red (P10). A goal at 27% is at
          27%, not "behind". */}
      <Text style={styles.sectionTitle}>Goals</Text>
      <View style={styles.card}>
        {goals.length === 0 ? (
          <Text style={styles.emptyText}>No goals yet.</Text>
        ) : (
          goals.map((goal, idx) => (
            <GoalRow key={goal.id} goal={goal} bordered={idx !== goals.length - 1} />
          ))
        )}
        {goals.length > 0 && (
          <Text style={styles.goalsCaption}>
            Progress is your earmarked holdings' live value — nothing is copied or stored.
          </Text>
        )}
      </View>
      <AddGoalForm userId={userId} onAdded={load} />

      {checkingTaxSaving && (
        <TaxSavingRoomModal userId={userId} onClose={() => setCheckingTaxSaving(false)} />
      )}
    </ScrollView>
  );
}

function BudgetRow({
  label,
  display,
  emphasis,
  last,
}: {
  label: string;
  display: string;
  emphasis?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Text style={emphasis ? styles.netLabel : styles.rowLabel}>{label}</Text>
      <Text style={emphasis ? styles.netValue : styles.rowValue}>{display}</Text>
    </View>
  );
}

function IncomeSourceRow({ source, bordered }: { source: IncomeSource; bordered: boolean }) {
  const isVariable = source.amount_high != null;
  const badge = isVariable ? 'Variable' : `Fixed · ${source.frequency}`;
  return (
    <View style={[styles.incomeRow, bordered && styles.rowDivider]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.incomeLabel}>{source.label}</Text>
        <Text style={styles.incomeBadge}>{badge}</Text>
      </View>
      <View style={styles.incomeValueColumn}>
        <Text style={styles.rowValue}>{formatRupees(source.amount)}</Text>
        {isVariable && (
          <Text style={styles.rowSubtitle}>typical ~{formatRupees(source.amount_high!)}</Text>
        )}
      </View>
    </View>
  );
}

function GoalRow({ goal, bordered }: { goal: GoalRecord; bordered: boolean }) {
  const pct =
    goal.target_amount > 0
      ? Math.max(0, Math.min(100, (goal.progress / goal.target_amount) * 100))
      : 0;
  return (
    <View style={[styles.goalRow, bordered && styles.rowDivider]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.incomeLabel}>{goal.category}</Text>
          <Text style={styles.incomeBadge}>{formatGoalSubline(goal)}</Text>
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
}

function formatGoalSubline(goal: GoalRecord): string {
  const parsed = new Date(goal.target_date);
  const monthYear = Number.isNaN(parsed.getTime())
    ? goal.target_date
    : parsed.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }).toUpperCase();
  if (goal.funded_by.length === 0) {
    return `By ${monthYear}`.toUpperCase();
  }
  const holdingsLabel = goal.funded_by.length === 1 ? '1 holding' : `${goal.funded_by.length} holdings`;
  return `By ${monthYear} · Funded by ${holdingsLabel}`.toUpperCase();
}

function currentMonthLabel(): string {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
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

// Header-level "+ Add" trigger lives in the DISCRETIONARY card's own row (6.1) now, so
// this is just the field set — expand/collapse is driven by the parent's state.
function DiscretionaryAddFields({
  userId,
  onDone,
  onCancel,
}: {
  userId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
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
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

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
      <View style={styles.formActionsRow}>
        <Pressable style={styles.saveButtonFlex} onPress={save} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save'}</Text>
        </Pressable>
        <Pressable style={styles.cancelButton} onPress={onCancel} disabled={saving}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
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
        <Text style={styles.addButtonText}>+ Add a goal</Text>
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
  header: { marginBottom: spacing.lg },
  pageTitle: { fontFamily: font.uiSemibold, fontSize: 22, color: colors.ink },
  pageSub: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  // The bordered ledger/list card (6.1/6.2) — hairline box, no fill, no shadow.
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardSpaced: { marginTop: spacing.xl },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabelInline: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
  addInlineText: { fontFamily: font.uiSemibold, fontSize: 14, color: colors.tutor },
  taxSavingButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  taxSavingButtonText: { fontFamily: font.uiSemibold, color: colors.tutor },
  emptyText: { fontFamily: font.ui, color: colors.inkMuted, fontSize: 13 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineSoft },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  incomeValueColumn: { alignItems: 'flex-end' },
  // Item-name pattern (label + mono meta line) reused from InsuranceScreen's
  // rowTitle/rowSubtitle — used here for income source names and goal names, which are
  // user-typed labels, not ledger-row categories (those stay on typography.ledgerLabel).
  incomeLabel: { fontFamily: font.uiMedium, fontSize: 15, color: colors.ink },
  incomeBadge: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  goalRow: { paddingTop: spacing.sm, paddingBottom: spacing.sm },
  goalTrack: {
    height: 5,
    backgroundColor: colors.lineSoft,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  goalFill: { height: '100%', backgroundColor: colors.ink },
  goalsCaption: {
    fontFamily: font.ui,
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  rowLabel: typography.ledgerLabel,
  rowSubtitle: { fontFamily: font.mono, fontSize: 11, color: colors.inkMuted, marginTop: 2 },
  // Ledger-row value spec (1E) — font.mono 15/600/ink.
  rowValue: typography.ledgerValue,
  // Net (6.1) is the one emphasized row on the screen — bigger figure, plain-weight
  // label (not the uppercase mono ledger label), no bottom rule. Still plain ink even
  // when negative (P10) — no red, no green.
  netLabel: { fontFamily: font.uiMedium, fontSize: 14, color: colors.ink },
  netValue: { fontFamily: font.monoSemibold, fontSize: 20, color: colors.ink },
  // Teaching-voice callout (P11: font.tutor for generated/explanatory copy only) — the
  // count-on-vs-typical explainer, styled like ConsolidatedScreen's tutorCard.
  tutorCallout: {
    backgroundColor: colors.tutorSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  tutorCalloutText: { fontFamily: font.tutor, fontSize: 15, lineHeight: 23, color: colors.ink },
  addButton: { paddingVertical: spacing.sm, marginTop: spacing.md },
  addButtonText: { fontFamily: font.uiSemibold, color: colors.tutor, fontSize: 14 },
  form: { marginTop: spacing.sm, gap: spacing.sm },
  formActionsRow: { flexDirection: 'row', gap: spacing.sm },
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
  // Primary button spec (1C).
  saveButton: { backgroundColor: colors.tutor, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  saveButtonFlex: {
    flex: 1,
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: typography.primaryButtonText,
  cancelButton: { paddingVertical: 14, paddingHorizontal: spacing.lg, alignItems: 'center' },
  cancelButtonText: { fontFamily: font.ui, fontSize: 14, color: colors.inkMuted },
});
