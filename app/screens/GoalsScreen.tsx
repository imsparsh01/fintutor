import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TeachingBlock } from '../components/TeachingBlock';
import { colors, font, radius, spacing } from '../design/tokens';
import { useAuth } from '../lib/AuthContext';
import { createGoal, fetchGoals } from '../lib/goals';
import { fetchHoldings } from '../lib/holdings';
import { formatRupees } from '../lib/format';
import type { GoalRecord } from '../lib/goals';
import type { Holding } from '../lib/holdings';
import type { MainTabsParamList } from '../navigation/types';

// BQ-059 (D-106): Goals tab — goal-type cards, insurance coverage summary, emergency
// readiness CTA. Replaces the placeholder.
//
// Illustration approach: the goal-type marks are drawn from plain Views (hairline borders,
// rotated squares, a CSS-triangle roof). `react-native-svg` is not a dependency and adding
// one would be a hard stop, so no vector library is used — and the drawn-from-rules look
// sits closer to the warm-ledger register (D-086) than clip-art would anyway.
//
// P10 throughout: goal progress is an ink fill on a lineSoft track, never a green/red bar.
// A goal at 27% is at 27%. P2: nothing here says whether a number is adequate.

type GoalType = {
  key: string;
  label: string;
  // Stored as the goal's free-text `category` — the backend does not constrain it.
  category: string;
  prompt: string;
};

const GOAL_TYPES: GoalType[] = [
  {
    key: 'education',
    label: 'Higher education',
    category: 'Higher education',
    prompt: 'A course, a degree, a year abroad — for you or for someone you fund.',
  },
  {
    key: 'retirement',
    label: 'Secure retirement',
    category: 'Secure retirement',
    prompt: 'The corpus you want in place by the time the salary stops.',
  },
  {
    key: 'house',
    label: 'Dream house',
    category: 'Dream house',
    prompt: 'A down payment, a full purchase, or a renovation.',
  },
  {
    key: 'wedding',
    label: 'Perfect wedding',
    category: 'Perfect wedding',
    prompt: 'A date you already know, or one you are planning toward.',
  },
];

interface ScreenState {
  goals: GoalRecord[] | null;
  holdings: Holding[] | null;
  emergencyMonths: string | null;
  hasHealthIns: 'yes' | 'no' | null;
}

export function GoalsScreen() {
  const { userId } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList>>();
  const [state, setState] = useState<ScreenState>({
    goals: null,
    holdings: null,
    emergencyMonths: null,
    hasHealthIns: null,
  });
  const [openType, setOpenType] = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (!userId) return;
    Promise.all([
      fetchGoals(userId).catch((): GoalRecord[] | null => null),
      fetchHoldings(userId).catch((): Holding[] | null => null),
      // Same two keys the Health Score screen writes — one answer, read in both places,
      // rather than asking the user the same question twice.
      AsyncStorage.multiGet(['hs_emergency_months', 'hs_has_health_ins']),
    ]).then(([goals, holdings, stored]) => {
      const hi = stored[1][1];
      setState({
        goals,
        holdings,
        emergencyMonths: stored[0][1],
        hasHealthIns: hi === 'yes' || hi === 'no' ? hi : null,
      });
    });
  }, [userId]);

  useFocusEffect(loadData);

  const goals = state.goals ?? [];

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Goals</Text>

        {/* ── Existing goals ─────────────────────────────────────────────── */}
        {goals.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Your goals</Text>
            <View style={styles.card}>
              {goals.map((goal, idx) => (
                <GoalProgressRow key={goal.id} goal={goal} last={idx === goals.length - 1} />
              ))}
            </View>
            <Text style={styles.caption}>
              Progress counts only what you have earmarked against each goal. A holding you have
              not linked to a goal is still yours — it just is not counted here.
            </Text>
          </>
        )}

        {/* ── Goal types ─────────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, goals.length > 0 && styles.sectionLabelSpaced]}>
          {goals.length > 0 ? 'Start another' : 'Start a goal'}
        </Text>
        {goals.length === 0 && (
          // D-089: an empty section is a teaching surface, not a dead end. What lives here is
          // described as a mechanism, not as a product to buy.
          <Text style={styles.caption}>
            A goal is an amount and a date. Naming both is what lets the app show how far the
            holdings you already have carry you toward it, and what the gap costs per month.
          </Text>
        )}

        <View style={styles.grid}>
          {GOAL_TYPES.map((type) => (
            <Pressable
              key={type.key}
              style={[styles.gridCell, openType === type.key && styles.gridCellActive]}
              onPress={() => setOpenType(openType === type.key ? null : type.key)}
            >
              <GoalMark type={type.key} />
              <Text style={styles.gridLabel}>{type.label}</Text>
            </Pressable>
          ))}
        </View>

        {openType !== null && userId && (
          <NewGoalForm
            type={GOAL_TYPES.find((t) => t.key === openType)!}
            userId={userId}
            onSaved={() => {
              setOpenType(null);
              loadData();
            }}
            onCancel={() => setOpenType(null)}
          />
        )}

        {/* ── Insurance coverage ─────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Insurance coverage</Text>
        <InsuranceSummary
          holdings={state.holdings}
          hasHealthIns={state.hasHealthIns}
          onOpenInsurance={() => navigation.navigate('Insurance')}
          onOpenHealthScore={() => navigation.navigate('HealthScore')}
        />

        {/* ── Emergency readiness ────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Emergency readiness</Text>
        <EmergencyCard
          months={state.emergencyMonths}
          onOpenHealthScore={() => navigation.navigate('HealthScore')}
          onOpenScenario={() =>
            navigation.navigate('Scenario', {
              type: 'emergency_runway',
              label: 'Emergency runway',
            })
          }
        />

        {/* D-091 standing block */}
        <TeachingBlock heading="What we won't say" style={styles.teachingBlock}>
          {'Whether a goal is realistic, or whether your cover is enough. What this screen does: holds the amounts and dates you have named, and shows what is currently counted against them.'}
        </TeachingBlock>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Goal marks ───────────────────────────────────────────────────────────────
// Four figures drawn from Views. Deliberately geometric and hairline-ruled — the same
// drawing vocabulary the rest of the app uses, at illustration scale.

function GoalMark({ type }: { type: string }) {
  return (
    <View style={styles.mark}>
      {type === 'education' && (
        <>
          <View style={styles.markDiamond} />
          <View style={styles.markBar} />
        </>
      )}
      {type === 'retirement' && (
        <View style={styles.markBarsRow}>
          <View style={[styles.markStep, { height: 8 }]} />
          <View style={[styles.markStep, { height: 14 }]} />
          <View style={[styles.markStep, { height: 20 }]} />
        </View>
      )}
      {type === 'house' && (
        <>
          <View style={styles.markRoof} />
          <View style={styles.markWalls} />
        </>
      )}
      {type === 'wedding' && (
        <View style={styles.markRingsRow}>
          <View style={styles.markRing} />
          <View style={[styles.markRing, styles.markRingOverlap]} />
        </View>
      )}
    </View>
  );
}

// ─── Goal progress ────────────────────────────────────────────────────────────

function GoalProgressRow({ goal, last }: { goal: GoalRecord; last: boolean }) {
  const pct =
    goal.target_amount > 0
      ? Math.max(0, Math.min(100, (goal.progress / goal.target_amount) * 100))
      : 0;

  return (
    <View style={[styles.goalRow, !last && styles.rowBorder]}>
      <View style={styles.goalRowHead}>
        <Text style={styles.rowLabel}>{goal.category}</Text>
        <Text style={styles.goalDate}>{formatTargetDate(goal.target_date)}</Text>
      </View>
      <Text style={styles.goalFigures}>
        {formatRupees(goal.progress)} / {formatRupees(goal.target_amount)}
      </Text>
      {/* P10: ink fill on a neutral track. No colour encodes whether 27% is good. */}
      <View style={styles.goalTrack}>
        <View style={[styles.goalFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

function formatTargetDate(raw: string): string {
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

// ─── New goal form ────────────────────────────────────────────────────────────
// Reuses the existing createGoal endpoint (D-038). Category comes from the card the user
// tapped, so only the amount and the date are asked for. A goal is created unfunded —
// linking holdings to it is BudgetingScreen's job, unchanged by this screen.

function NewGoalForm({
  type,
  userId,
  onSaved,
  onCancel,
}: {
  type: GoalType;
  userId: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('An amount above zero and a date as YYYY-MM-DD are both needed.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createGoal(userId, {
        category: type.category,
        target_amount: parsedAmount,
        target_date: date,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this goal.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>{type.label}</Text>
      <Text style={styles.formPrompt}>{type.prompt}</Text>

      <Text style={styles.fieldLabel}>Target amount</Text>
      <View style={styles.inputRow}>
        <Text style={styles.inputAdorn}>₹</Text>
        <TextInput
          style={[styles.input, styles.inputWithPrefix]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="e.g. 2500000"
          placeholderTextColor={colors.inkMuted}
        />
      </View>

      <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>Target date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.inkMuted}
      />

      {error !== null && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.formActions}>
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={save} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save goal'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Insurance coverage summary ───────────────────────────────────────────────

const num = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

function InsuranceSummary({
  holdings,
  hasHealthIns,
  onOpenInsurance,
  onOpenHealthScore,
}: {
  holdings: Holding[] | null;
  hasHealthIns: 'yes' | 'no' | null;
  onOpenInsurance: () => void;
  onOpenHealthScore: () => void;
}) {
  if (holdings === null) {
    return (
      <View style={styles.card}>
        <View style={styles.plainRow}>
          <Text style={styles.emptyText}>
            Cover could not be loaded just now. It will appear here once your holdings load.
          </Text>
        </View>
      </View>
    );
  }

  const term = holdings.filter((h) => h.product_type === 'term_insurance');
  const ulip = holdings.filter((h) => h.product_type === 'endowment_ulip');
  const termCover = term.reduce((sum, h) => sum + num(h.characteristics.sum_assured), 0);
  const ulipCover = ulip.reduce((sum, h) => sum + num(h.characteristics.sum_assured), 0);

  return (
    <>
      <View style={styles.card}>
        <CoverRow
          label="Term cover"
          detail={term.length === 0 ? 'No term policy recorded' : `${term.length} ${term.length === 1 ? 'policy' : 'policies'}`}
          value={term.length === 0 ? '—' : formatRupees(termCover)}
        />
        <CoverRow
          label="Endowment / ULIP"
          detail={ulip.length === 0 ? 'None recorded' : `${ulip.length} ${ulip.length === 1 ? 'policy' : 'policies'}`}
          value={ulip.length === 0 ? '—' : formatRupees(ulipCover)}
        />
        <CoverRow
          label="Health cover"
          detail={
            hasHealthIns === null
              ? 'Not answered yet'
              : hasHealthIns === 'yes'
                ? 'You told us you have health insurance'
                : 'You told us you do not have health insurance'
          }
          value={hasHealthIns === null ? '—' : hasHealthIns === 'yes' ? 'Yes' : 'No'}
          onPress={hasHealthIns === null ? onOpenHealthScore : undefined}
          last
        />
      </View>
      <Text style={styles.caption}>
        Sum assured is what a policy pays out, not what it has cost you or what it is worth today.
        Health cover is the yes/no you gave on the Health Score screen — the app does not hold a
        policy amount for it.
      </Text>
      <Pressable style={styles.linkRow} onPress={onOpenInsurance}>
        <Text style={styles.linkText}>Open Insurance holdings ›</Text>
      </Pressable>
    </>
  );
}

function CoverRow({
  label,
  detail,
  value,
  onPress,
  last,
}: {
  label: string;
  detail: string;
  value: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const body = (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{detail}</Text>
      </View>
      <Text style={styles.figure}>{value}</Text>
      {onPress && <Text style={styles.chevron}>›</Text>}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

// ─── Emergency readiness ──────────────────────────────────────────────────────

function EmergencyCard({
  months,
  onOpenHealthScore,
  onOpenScenario,
}: {
  months: string | null;
  onOpenHealthScore: () => void;
  onOpenScenario: () => void;
}) {
  const parsed = months === null ? NaN : parseFloat(months);
  const known = !isNaN(parsed) && parsed >= 0;

  return (
    <View style={styles.emergencyCard}>
      {known ? (
        <>
          <Text style={styles.emergencyValue}>{parsed % 1 === 0 ? parsed.toFixed(0) : parsed.toFixed(1)}</Text>
          <Text style={styles.emergencyUnit}>months of expenses covered</Text>
          <Text style={styles.emergencyBody}>
            This is the figure you entered on the Health Score screen. It is stored on this device
            only.
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.emergencyBody}>
            An emergency buffer is the number of months your existing balances would cover if income
            stopped. The app has no way to see your bank balance, so this one is yours to tell it.
          </Text>
        </>
      )}
      <View style={styles.emergencyActions}>
        <Pressable style={styles.ctaBtn} onPress={onOpenHealthScore}>
          <Text style={styles.ctaBtnText}>{known ? 'Update the figure' : 'Enter your buffer'}</Text>
        </Pressable>
        <Pressable style={styles.ctaBtnSecondary} onPress={onOpenScenario}>
          <Text style={styles.ctaBtnSecondaryText}>Work it out from balances</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const MARK_SIZE = 44;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.screen },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  heading: { fontFamily: font.uiSemibold, fontSize: 24, color: colors.ink, marginBottom: spacing.xl },

  sectionLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  sectionLabelSpaced: { marginTop: spacing.xxl },
  caption: {
    fontFamily: font.tutor,
    fontSize: 13,
    lineHeight: 19,
    color: colors.inkSecondary,
    marginTop: spacing.sm,
  },

  card: {
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  plainRow: { padding: spacing.lg },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowLabel: { fontFamily: font.uiSemibold, fontSize: 15, color: colors.ink },
  rowSub: { fontFamily: font.ui, fontSize: 12, color: colors.inkSecondary, marginTop: 2 },
  // P10: every real figure in ink, undecorated.
  figure: { fontFamily: font.mono, fontSize: 15, color: colors.ink, marginLeft: spacing.md },
  chevron: { fontFamily: font.ui, fontSize: 18, color: colors.inkMuted, marginLeft: spacing.sm },
  emptyText: { fontFamily: font.tutor, fontSize: 14, lineHeight: 20, color: colors.inkSecondary },

  // ── Goal progress rows
  goalRow: { paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  goalRowHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  goalDate: { fontFamily: font.mono, fontSize: 12, color: colors.inkMuted, marginLeft: spacing.sm },
  goalFigures: { fontFamily: font.mono, fontSize: 14, color: colors.ink, marginTop: spacing.xs },
  goalTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineSoft,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  goalFill: { height: '100%', backgroundColor: colors.ink },

  // ── Goal-type grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  gridCell: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'flex-start',
  },
  gridCellActive: { borderColor: colors.tutor, backgroundColor: colors.tutorSoft },
  gridLabel: {
    fontFamily: font.uiSemibold,
    fontSize: 14,
    color: colors.ink,
    marginTop: spacing.md,
  },

  // ── Drawn marks
  mark: { width: MARK_SIZE, height: MARK_SIZE, alignItems: 'center', justifyContent: 'center' },
  markDiamond: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: colors.tutor,
    transform: [{ rotate: '45deg' }],
  },
  markBar: {
    width: 26,
    height: 1.5,
    backgroundColor: colors.tutor,
    marginTop: 6,
  },
  markBarsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  markStep: { width: 7, borderWidth: 1.5, borderColor: colors.tutor, borderRadius: 1 },
  markRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.tutor,
  },
  markWalls: {
    width: 22,
    height: 16,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: colors.tutor,
  },
  markRingsRow: { flexDirection: 'row', alignItems: 'center' },
  markRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.tutor,
  },
  markRingOverlap: { marginLeft: -7 },

  // ── New goal form
  form: {
    marginTop: spacing.lg,
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: spacing.lg,
  },
  formTitle: { fontFamily: font.uiSemibold, fontSize: 16, color: colors.ink },
  formPrompt: {
    fontFamily: font.tutor,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: spacing.xs,
  },
  fieldLabelSpaced: { marginTop: spacing.lg },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputAdorn: {
    fontFamily: font.uiSemibold,
    fontSize: 15,
    color: colors.inkSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    backgroundColor: colors.screen,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  input: {
    flex: 1,
    fontFamily: font.mono,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.screen,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  inputWithPrefix: { borderLeftWidth: 0 },
  // colors.danger is for genuine failure states, which a rejected save is (tokens.ts).
  errorText: {
    fontFamily: font.ui,
    fontSize: 13,
    color: colors.danger,
    marginTop: spacing.md,
    lineHeight: 18,
  },
  formActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  cancelBtnText: { fontFamily: font.uiSemibold, fontSize: 14, color: colors.inkSecondary },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { fontFamily: font.uiSemibold, fontSize: 14, color: colors.canvas },

  linkRow: { marginTop: spacing.md },
  linkText: { fontFamily: font.ui, fontSize: 14, color: colors.tutor },

  // ── Emergency readiness
  emergencyCard: {
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: spacing.lg,
  },
  emergencyValue: { fontFamily: font.mono, fontSize: 32, color: colors.ink, lineHeight: 38 },
  emergencyUnit: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  emergencyBody: {
    fontFamily: font.tutor,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSecondary,
    marginTop: spacing.md,
  },
  emergencyActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  ctaBtn: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
  },
  ctaBtnText: { fontFamily: font.uiSemibold, fontSize: 13, color: colors.canvas },
  ctaBtnSecondary: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
  },
  ctaBtnSecondaryText: { fontFamily: font.uiSemibold, fontSize: 13, color: colors.tutor },

  teachingBlock: { marginTop: spacing.xxl },
});
