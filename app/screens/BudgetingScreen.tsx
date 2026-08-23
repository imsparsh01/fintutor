import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { TaxSavingRoomModal } from '../components/TaxSavingRoomModal';
import { GoalFundingFields } from '../components/GoalFundingFields';
import { colors, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';
import { useAuth } from '../lib/AuthContext';
import { fetchBudget, type BudgetSummary } from '../lib/budget';
import {
  createDiscretionaryCategory,
  deleteDiscretionaryCategory,
  fetchDiscretionaryCategoryDeletionImpact,
  fetchDiscretionaryCategories,
  updateDiscretionaryCategory,
  type DiscretionaryCategory,
} from '../lib/discretionaryCategories';
import { formatRupees } from '../lib/format';
import { createGoal, fetchGoals, type GoalProgressProvenance, type GoalRecord } from '../lib/goals';
import type { GoalFundingRecord } from '../lib/goals';
import { fundingAmountsValid } from '../lib/goalFundingValidation';
import { fetchHoldings, type Holding } from '../lib/holdings';
import {
  createIncome, deleteIncomeSource, fetchIncome, fetchIncomeSourceDeletionImpact,
  updateIncome, updateIncomeSource, type IncomeRecord, type IncomeSource,
} from '../lib/income';
import { isStaleWriteError } from '../lib/apiResponse';
import { humanizeProductType } from '../lib/taxonomy';

// D-038: budget is a fully computed view (nothing stored beyond Income/discretionary
// categories, both already backed — BQ-010); goals carry live-computed `progress`
// (BQ-017). This tab surfaces both plus the write paths BQ-016/BQ-017 added.
//
// Layout/register rebuild to Flow 06 (mockup v1). The "WHERE THE ₹X COMES FROM"
// provenance breakdown drawn in that mockup needs a per-line backend response the API
// does not return (BudgetSummary has totals only, no recurring-outflow line items) — it
// is deliberately omitted here rather than faked. Same for 6.3 (setting a goal in
// conversation), which needs a backend classifier that doesn't exist yet.
type SectionName = 'budget' | 'income' | 'discretionary' | 'goals' | 'holdings';
type SectionLoadState = { status: 'loading' | 'ready' | 'error'; error: string | null };
const loadingState = (): SectionLoadState => ({ status: 'loading', error: null });

export function BudgetingScreen() {
  const { userId } = useAuth();
  const [dataAccountId, setDataAccountId] = useState<string | null>(userId);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [discretionaryCategories, setDiscretionaryCategories] = useState<DiscretionaryCategory[]>([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [sectionState, setSectionState] = useState<Record<SectionName, SectionLoadState>>({
    budget: loadingState(), income: loadingState(), discretionary: loadingState(),
    goals: loadingState(), holdings: loadingState(),
  });
  const generation = useRef(0);
  const [checkingTaxSaving, setCheckingTaxSaving] = useState(false);
  const [addingDiscretionary, setAddingDiscretionary] = useState(false);
  const [editingIncomeSourceId, setEditingIncomeSourceId] = useState<string | null>(null);

  const loadSection = useCallback(async (name: SectionName, accountGeneration = generation.current) => {
    if (!userId) return;
    setSectionState((state) => ({ ...state, [name]: loadingState() }));
    try {
      const result = name === 'budget' ? await fetchBudget(userId)
        : name === 'income' ? await fetchIncome(userId)
        : name === 'discretionary' ? await fetchDiscretionaryCategories(userId)
        : name === 'goals' ? await fetchGoals(userId)
        : await fetchHoldings(userId);
      if (generation.current !== accountGeneration) return;
      if (name === 'budget') setBudget(result as BudgetSummary);
      if (name === 'income') setIncome(result as IncomeRecord[]);
      if (name === 'discretionary') setDiscretionaryCategories(result as DiscretionaryCategory[]);
      if (name === 'goals') setGoals(result as GoalRecord[]);
      if (name === 'holdings') setHoldings(result as Holding[]);
      setSectionState((state) => ({ ...state, [name]: { status: 'ready', error: null } }));
    } catch (caught) {
      if (generation.current !== accountGeneration) return;
      if (name === 'holdings') setHoldings(null);
      setSectionState((state) => ({
        ...state,
        [name]: { status: 'error', error: caught instanceof Error ? caught.message : 'Could not load' },
      }));
    }
  }, [userId]);

  const load = useCallback(() => {
    const current = generation.current;
    (['budget', 'income', 'discretionary', 'goals', 'holdings'] as SectionName[])
      .forEach((name) => void loadSection(name, current));
  }, [loadSection]);

  useEffect(() => {
    generation.current += 1;
    setDataAccountId(userId);
    setBudget(null); setIncome([]); setDiscretionaryCategories([]); setGoals([]); setHoldings(null);
    load();
  }, [load]);

  if (!userId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.body}>Signed out — nothing to show.</Text>
      </View>
    );
  }

  if (dataAccountId !== userId) {
    return <View style={styles.centered}><ActivityIndicator color={colors.ink} accessibilityLabel="Changing account and loading budget" /></View>;
  }

  const incomeSources = income.flatMap((record) => record.sources);
  const hasVariableIncome = incomeSources.some((source) => source.amount_high != null);

  // Em-dash for "nothing recorded here yet" (D-086 register), distinct from a real
  // computed zero — these two rows are the ones directly backed by a list this screen
  // knows to be empty or not; recurring outflows and net are real computed totals
  // regardless, so they always render as a figure.
  const incomeDisplay = incomeSources.length === 0 ? '—' : formatRupees(budget?.income_total ?? 0);
  const discretionaryDisplay =
    discretionaryCategories.length === 0 ? '—' : formatRupees(budget?.discretionary_total ?? 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 6.1 — title + "computed, not stored" register, same header shape as Home's
          greeting/month pair (ConsolidatedScreen). */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Budget</Text>
        <Text style={styles.pageSub}>{currentMonthLabel()} · computed, not stored</Text>
      </View>

      <View style={styles.card}>
        {sectionState.budget.status !== 'ready' || budget === null ? (
          <SectionRecovery state={sectionState.budget} label="budget summary" onRetry={() => loadSection('budget')} />
        ) : <>
        <BudgetRow label="Income" display={incomeDisplay} />
        {budget.invalid_income_sources.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit excluded income source"
            onPress={() => {
              const invalid = budget.invalid_income_sources[0];
              const matching = incomeSources.find((source) => source.label === invalid.label);
              if (matching?.id) setEditingIncomeSourceId(matching.id);
            }}
          >
            <Text style={styles.validationWarning}>
              {budget.invalid_income_sources.length} income source
              {budget.invalid_income_sources.length === 1 ? ' is' : 's are'} excluded because a recognised
              cadence is missing. Open the relevant income editor to correct it.
            </Text>
          </Pressable>
        )}
        <BudgetRow label="Recurring outflows" display={formatRupees(budget.recurring_outflows_total)} />
        {budget.recurring_outflows.length > 0 && (
          <View style={styles.provenance}>
            <Text style={styles.provenanceTitle}>Where this comes from</Text>
            {budget.recurring_outflows.map((item, index) => (
              <BudgetRow
                key={`${item.product_type}-${item.source_field}-${index}`}
                label={`${humanizeProductType(item.product_type)} · ${item.frequency}`}
                display={formatRupees(item.monthly_amount)}
              />
            ))}
          </View>
        )}
        <BudgetRow label="Discretionary" display={discretionaryDisplay} />
        {/* Net is the emphasized row (6.1) — bigger figure, no bottom rule, no valence
            colour even when negative (P10): it renders in ink either way. */}
        <BudgetRow label="Net" display={formatRupees(budget.net)} emphasis last />
        </>}
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
        {sectionState.discretionary.status !== 'ready' ? (
          <SectionRecovery state={sectionState.discretionary} label="discretionary categories" onRetry={() => loadSection('discretionary')} />
        ) : discretionaryCategories.length === 0 ? (
          <Text style={styles.emptyText}>No discretionary categories yet.</Text>
        ) : (
          discretionaryCategories.map((cat, idx) => (
            <DiscretionaryRow key={cat.id} userId={userId} category={cat}
              bordered={idx !== discretionaryCategories.length - 1}
              onChanged={(updated) => {
                setDiscretionaryCategories((items) => items.map((item) => item.id === updated.id ? updated : item));
                void loadSection('budget');
              }}
              onDeleted={() => {
                setDiscretionaryCategories((items) => items.filter((item) => item.id !== cat.id));
                void loadSection('budget');
              }} />
          ))
        )}
        {addingDiscretionary && (
          <DiscretionaryAddFields
            userId={userId}
            onDone={() => {
              setAddingDiscretionary(false);
              void loadSection('discretionary'); void loadSection('budget');
            }}
            onCancel={() => setAddingDiscretionary(false)}
          />
        )}
      </View>

      {/* 6.2 — Income: FIXED · MONTHLY vs VARIABLE, count-on figure vs typical. */}
      <Text style={styles.sectionTitle}>Income</Text>
      <View style={styles.card}>
        {sectionState.income.status !== 'ready' ? (
          <SectionRecovery state={sectionState.income} label="income sources" onRetry={() => loadSection('income')} />
        ) : incomeSources.length === 0 ? (
          <Text style={styles.emptyText}>No income sources yet.</Text>
        ) : (
          income.flatMap((record) => record.sources.map((source) => ({ record, source }))).map(({ record, source }, idx) => (
            <IncomeSourceRow
              key={source.id ?? `${record.id}-${idx}`}
              userId={userId}
              record={record}
              source={source}
              forceEdit={source.id === editingIncomeSourceId}
              onEditOpened={() => setEditingIncomeSourceId(null)}
              onChanged={(updated) => {
                setIncome((items) => items.map((item) => item.id === updated.id ? updated : item));
                void loadSection('budget');
              }}
              onDeleted={(updated) => {
                setIncome((items) => items.map((item) => item.id === updated.id ? updated : item));
                void loadSection('budget');
              }}
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
      <AddIncomeForm userId={userId} existing={income[0] ?? null} onAdded={() => { void loadSection('income'); void loadSection('budget'); }} />

      {/* 6.2 — Goals: neutral ink progress, never green/red (P10). A goal at 27% is at
          27%, not "behind". */}
      <Text style={styles.sectionTitle}>Goals</Text>
      <View style={styles.card}>
        {sectionState.goals.status !== 'ready' ? (
          <SectionRecovery state={sectionState.goals} label="goals" onRetry={() => loadSection('goals')} />
        ) : goals.length === 0 ? (
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
      {sectionState.goals.status === 'ready' && <AddGoalForm userId={userId} holdings={holdings} holdingsError={sectionState.holdings.status === 'error'} onAdded={() => { void loadSection('goals'); void loadSection('budget'); }} />}

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

function SectionRecovery({ state, label, onRetry }: { state: SectionLoadState; label: string; onRetry: () => void }) {
  if (state.status === 'loading') return <ActivityIndicator color={colors.ink} accessibilityLabel={`Loading ${label}`} />;
  return <View accessibilityLiveRegion="polite">
    <Text style={styles.errorText}>Couldn't load {label}{state.error ? `: ${state.error}` : '.'}</Text>
    <Pressable accessibilityRole="button" style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.addInlineText}>Retry {label}</Text>
    </Pressable>
  </View>;
}

function IncomeSourceRow({ userId, record, source, bordered, forceEdit, onEditOpened, onChanged, onDeleted }: {
  userId: string; record: IncomeRecord; source: IncomeSource; bordered: boolean;
  forceEdit: boolean; onEditOpened: () => void;
  onChanged: (record: IncomeRecord) => void; onDeleted: (record: IncomeRecord) => void;
}) {
  const isVariable = source.amount_high != null;
  const badge = isVariable ? 'Variable' : `Fixed · ${source.frequency}`;
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(source.label);
  const [amount, setAmount] = useState(String(source.amount));
  const [amountHigh, setAmountHigh] = useState(source.amount_high == null ? '' : String(source.amount_high));
  const [frequency, setFrequency] = useState(source.frequency);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshedVersion, setRefreshedVersion] = useState<number | null>(null);

  useEffect(() => {
    if (forceEdit) { setEditing(true); onEditOpened(); }
  }, [forceEdit, onEditOpened]);

  const save = async () => {
    if (!source.id) { setError('Refresh this income source before editing.'); return; }
    const numeric = parseMoneyInput(amount, false);
    const high = parseMoneyInput(amountHigh, true);
    if (!label.trim() || !numeric.ok || !high.ok || !isRecognisedCadence(frequency)) {
      setError('Enter a label, a non-negative amount, and a recognised cadence. Typical amount is optional.'); return;
    }
    setSaving(true); setError(null);
    try {
      const updated = await updateIncomeSource(userId, record.id, source.id, {
        id: source.id, label: label.trim(), amount: numeric.value, amount_high: high.value,
        frequency: frequency.trim().toLowerCase(),
      }, refreshedVersion ?? record.version);
      onChanged(updated); setEditing(false); setRefreshedVersion(null);
    } catch (caught) {
      if (isStaleWriteError<IncomeRecord, unknown>(caught)) {
        setRefreshedVersion(caught.detail.current.version);
        const refreshed = caught.detail.current.sources.find((item) => item.id === source.id);
        setError(`This source changed elsewhere. Refreshed value: ${refreshed ? `${refreshed.label}, ${formatRupees(refreshed.amount)}, ${refreshed.frequency}` : 'source unavailable'}. Review your draft, then save again to confirm.`);
      } else setError(caught instanceof Error ? caught.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  const requestDelete = async () => {
    if (!source.id) { setError('Refresh this income source before deleting.'); return; }
    try {
      const impact = await fetchIncomeSourceDeletionImpact(userId, record.id, source.id);
      Alert.alert('Delete income source?', `${impact.label ?? 'This source'} will be removed and the computed budget will refresh.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void performDelete(impact.version ?? record.version) },
      ]);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not check deletion impact'); }
  };

  const performDelete = async (version: number) => {
    if (!source.id) return;
    setSaving(true); setError(null);
    try { onDeleted((await deleteIncomeSource(userId, record.id, source.id, version)).current); }
    catch (caught) {
      if (isStaleWriteError<IncomeRecord, unknown>(caught)) {
        const refreshed = caught.detail.current.sources.find((item) => item.id === source.id);
        const summary = refreshed ? `${refreshed.label}, ${formatRupees(refreshed.amount)}, ${refreshed.frequency}` : 'The source is no longer available.';
        Alert.alert('Income source changed', `Refreshed record: ${summary} Review it before confirming deletion again.`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete refreshed source', style: 'destructive', onPress: () => void performDelete(caught.detail.current.version) },
        ]);
        setError('This source changed elsewhere. Deletion needs refreshed confirmation.');
      } else setError(caught instanceof Error ? caught.message : 'Failed to delete');
    } finally { setSaving(false); }
  };

  if (editing) return <View style={[styles.form, bordered && styles.rowDivider]}>
    <TextInput accessibilityLabel="Income source label" style={styles.input} value={label} onChangeText={setLabel} />
    <TextInput accessibilityLabel="Income amount" style={styles.input} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
    <TextInput accessibilityLabel="Typical income amount optional" style={styles.input} keyboardType="decimal-pad" value={amountHigh} onChangeText={setAmountHigh} placeholder="Typical amount (optional)" placeholderTextColor={colors.inkMuted} />
    <TextInput accessibilityLabel="Income cadence" style={styles.input} value={frequency} onChangeText={setFrequency} placeholder="monthly, weekly, quarterly..." placeholderTextColor={colors.inkMuted} />
    {error && <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text>}
    <View style={styles.formActionsRow}>
      <Pressable style={styles.saveButtonFlex} disabled={saving} onPress={save}><Text style={styles.saveButtonText}>{saving ? 'Saving…' : refreshedVersion ? 'Confirm refreshed save' : 'Save changes'}</Text></Pressable>
      <Pressable style={styles.cancelButton} disabled={saving} onPress={() => { setEditing(false); setError(null); setRefreshedVersion(null); }}><Text style={styles.cancelButtonText}>Cancel</Text></Pressable>
    </View>
  </View>;
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
        <View style={styles.inlineActions}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${source.label}`} onPress={() => setEditing(true)}><Text style={styles.actionText}>Edit</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${source.label}`} disabled={saving} onPress={requestDelete}><Text style={styles.actionText}>Delete</Text></Pressable>
        </View>
        {error && <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
}

function DiscretionaryRow({ userId, category, bordered, onChanged, onDeleted }: {
  userId: string; category: DiscretionaryCategory; bordered: boolean;
  onChanged: (category: DiscretionaryCategory) => void; onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(category.label);
  const [amount, setAmount] = useState(String(category.planned_amount));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshedVersion, setRefreshedVersion] = useState<number | null>(null);

  const save = async () => {
    const parsed = parseMoneyInput(amount, false);
    if (!label.trim() || !parsed.ok) { setError('Enter a label and a non-negative planned amount.'); return; }
    setSaving(true); setError(null);
    try {
      const updated = await updateDiscretionaryCategory(
        userId, category.id, label.trim(), parsed.value, refreshedVersion ?? category.version,
      );
      onChanged(updated); setEditing(false); setRefreshedVersion(null);
    } catch (caught) {
      if (isStaleWriteError<DiscretionaryCategory, unknown>(caught)) {
        setRefreshedVersion(caught.detail.current.version);
        setError(`This category changed elsewhere. Refreshed value: ${caught.detail.current.label}, ${formatRupees(caught.detail.current.planned_amount)}. Review your draft, then save again to confirm.`);
      } else setError(caught instanceof Error ? caught.message : 'Failed to save');
    } finally { setSaving(false); }
  };

  const requestDelete = async () => {
    try {
      const impact = await fetchDiscretionaryCategoryDeletionImpact(userId, category.id);
      Alert.alert('Delete discretionary category?', `${impact.label} will be removed from the computed budget.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void performDelete(impact.version) },
      ]);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not check deletion impact'); }
  };
  const performDelete = async (version: number) => {
    setSaving(true); setError(null);
    try { await deleteDiscretionaryCategory(userId, category.id, version); onDeleted(); }
    catch (caught) {
      if (isStaleWriteError<DiscretionaryCategory, unknown>(caught)) {
        Alert.alert('Category changed', `Refreshed record: ${caught.detail.current.label}, ${formatRupees(caught.detail.current.planned_amount)}. Review it before confirming deletion again.`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete refreshed category', style: 'destructive', onPress: () => void performDelete(caught.detail.current.version) },
        ]);
        setError('This category changed elsewhere. Deletion needs refreshed confirmation.');
      } else setError(caught instanceof Error ? caught.message : 'Failed to delete');
    } finally { setSaving(false); }
  };

  if (editing) return <View style={[styles.form, bordered && styles.rowDivider]}>
    <TextInput accessibilityLabel="Discretionary category label" style={styles.input} value={label} onChangeText={setLabel} />
    <TextInput accessibilityLabel="Planned monthly amount" style={styles.input} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
    {error && <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text>}
    <View style={styles.formActionsRow}>
      <Pressable style={styles.saveButtonFlex} disabled={saving} onPress={save}><Text style={styles.saveButtonText}>{saving ? 'Saving…' : refreshedVersion ? 'Confirm refreshed save' : 'Save changes'}</Text></Pressable>
      <Pressable style={styles.cancelButton} disabled={saving} onPress={() => { setEditing(false); setError(null); setRefreshedVersion(null); }}><Text style={styles.cancelButtonText}>Cancel</Text></Pressable>
    </View>
  </View>;

  return <View style={[styles.row, bordered && styles.rowDivider]}>
    <View><Text style={styles.rowLabel}>{category.label}</Text><View style={styles.inlineActions}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${category.label}`} onPress={() => setEditing(true)}><Text style={styles.actionText}>Edit</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${category.label}`} disabled={saving} onPress={requestDelete}><Text style={styles.actionText}>Delete</Text></Pressable>
    </View>{error && <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text>}</View>
    <Text style={styles.rowValue}>{formatRupees(category.planned_amount)}</Text>
  </View>;
}

function parseMoneyInput(raw: string, optional: false): { ok: true; value: number } | { ok: false };
function parseMoneyInput(raw: string, optional: true): { ok: true; value: number | null } | { ok: false };
function parseMoneyInput(raw: string, optional: boolean): { ok: true; value: number | null } | { ok: false } {
  const trimmed = raw.trim();
  if (!trimmed && optional) return { ok: true, value: null };
  if (!/^\d{1,12}(?:\.\d{1,2})?$/.test(trimmed)) return { ok: false };
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 ? { ok: true, value } : { ok: false };
}

function isRecognisedCadence(raw: string): boolean {
  return ['monthly', 'weekly', 'fortnightly', 'quarterly', 'half_yearly', 'half-yearly', 'annual', 'annually', 'yearly']
    .includes(raw.trim().toLowerCase());
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
      {goal.progress_is_partial && (
        <Text accessibilityLiveRegion="polite" style={styles.validationWarning}>
          Progress is partial because {goal.progress_provenance.filter((item) => item.status === 'unknown').length}
          {' '}linked holding value{goal.progress_provenance.filter((item) => item.status === 'unknown').length === 1 ? ' is' : 's are'} unknown. Unknown values are not counted as zero.
        </Text>
      )}
      {goal.progress_provenance.length > 0 && <View style={styles.goalProvenance}>
        {goal.progress_provenance.map((item) => <GoalProvenanceLine key={item.holding_id} item={item} />)}
      </View>}
    </View>
  );
}

function GoalProvenanceLine({ item }: { item: GoalProgressProvenance }) {
  const label = item.holding_display_name ?? item.holding_alias ?? 'Linked holding';
  const detail = item.status === 'unknown'
    ? `value unknown (${(item.reason ?? 'unavailable').replaceAll('_', ' ')})`
    : `${formatRupees(item.applied_amount ?? 0)} applied from ${formatRupees(item.earmarked_amount)} earmarked${item.was_proportionally_adjusted ? ' after shared proportional allocation' : ''}`;
  return <Text style={styles.provenanceLine}>{label}: {detail}</Text>;
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
  const [staleBase, setStaleBase] = useState<IncomeRecord | null>(null);

  const save = async () => {
    const parsedAmount = parseMoneyInput(amount, false);
    const parsedAmountHigh = parseMoneyInput(amountHigh, true);
    if (!label.trim() || !parsedAmount.ok || !parsedAmountHigh.ok) {
      setError('Enter a label and a non-negative amount with at most two decimal places.'); return;
    }
    setSaving(true);
    setError(null);
    try {
      const newSource = {
        label: label.trim(),
        amount: parsedAmount.value,
        frequency: 'monthly',
        amount_high: parsedAmountHigh.value,
      };
      const base = staleBase ?? existing;
      if (base) {
        await updateIncome(userId, base.id, [...base.sources, newSource], base.version);
      } else {
        await createIncome(userId, [newSource]);
      }
      setLabel('');
      setAmount('');
      setAmountHigh('');
      setExpanded(false);
      setStaleBase(null);
      onAdded();
    } catch (err) {
      if (isStaleWriteError<IncomeRecord, unknown>(err)) {
        setStaleBase(err.detail.current);
        setError(`Income changed elsewhere and your new source is still unsaved. The refreshed record has ${err.detail.current.sources.length} source${err.detail.current.sources.length === 1 ? '' : 's'} at version ${err.detail.current.version}. Review your draft, then explicitly confirm the refreshed save.`);
      } else setError(err instanceof Error ? err.message : 'Failed to save');
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
      {error && <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text>}
      <Pressable accessibilityRole="button" accessibilityLabel={staleBase ? 'Confirm adding income source using refreshed income record' : 'Save income source'} style={styles.saveButton} onPress={save} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Saving…' : staleBase ? 'Confirm refreshed save' : 'Save'}</Text>
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
    const parsedAmount = parseMoneyInput(plannedAmount, false);
    if (!label.trim() || !parsedAmount.ok) {
      setError('Enter a category and a non-negative amount with at most two decimal places.'); return;
    }
    setSaving(true);
    setError(null);
    try {
      await createDiscretionaryCategory(userId, label.trim(), parsedAmount.value);
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

function AddGoalForm({ userId, holdings, holdingsError, onAdded }: { userId: string; holdings: Holding[] | null; holdingsError: boolean; onAdded: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fundedBy, setFundedBy] = useState<GoalFundingRecord[]>([]);

  const save = async () => {
    const parsedAmount = parseMoneyInput(targetAmount, false);
    if (!category.trim() || !parsedAmount.ok || parsedAmount.value <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      setError('Fill in a category, an amount, and a date as YYYY-MM-DD');
      return;
    }
    if (!fundingAmountsValid(fundedBy)) {
      setError('Use a positive amount with at most 12 whole digits and 2 decimal places for each selected holding.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createGoal(userId, { category: category.trim(), target_amount: parsedAmount.value, target_date: targetDate, funded_by: fundedBy });
      setCategory('');
      setTargetAmount('');
      setTargetDate('');
      setFundedBy([]);
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
      <GoalFundingFields holdings={holdings} loadFailed={holdingsError} value={fundedBy} onChange={setFundedBy} />
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
  goalProvenance: { marginTop: spacing.sm, gap: spacing.xs },
  provenanceLine: { fontFamily: font.ui, fontSize: 11, lineHeight: 16, color: colors.inkSecondary },
  rowLabel: typography.ledgerLabel,
  provenance: { marginTop: spacing.sm, marginBottom: spacing.sm, paddingLeft: spacing.md, borderLeftWidth: 2, borderLeftColor: colors.line },
  provenanceTitle: { fontFamily: font.uiMedium, fontSize: 13, color: colors.inkSecondary, marginBottom: spacing.xs },
  validationWarning: {
    fontFamily: font.ui,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkSecondary,
    marginBottom: spacing.sm,
  },
  retryButton: { paddingVertical: spacing.sm, alignSelf: 'flex-start' },
  inlineActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  actionText: { fontFamily: font.uiMedium, fontSize: 12, color: colors.tutor },
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
