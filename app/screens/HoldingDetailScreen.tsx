import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EsopExerciseCostModal } from '../components/EsopExerciseCostModal';
import { HoldingEditModal } from '../components/HoldingEditModal';
import { LoanVsInvestModal } from '../components/LoanVsInvestModal';
import { TeachingBlock } from '../components/TeachingBlock';
import { colors, font, radius, spacing } from '../design/tokens';
import { typography } from '../design/typography';
import { useAuth } from '../lib/AuthContext';
import { CHARACTERISTICS_SCHEMA, type FieldSpec } from '../lib/characteristicsSchema';
import { formatRupees } from '../lib/format';
import type { Holding } from '../lib/holdings';
import { isLoanVsInvestEligible } from '../lib/loanVsInvest';
import { humanizeProductType, INVESTMENT_TYPES, LOAN_TYPES } from '../lib/taxonomy';
import type { HoldingsStackParamList, MainTabsParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HoldingsStackParamList, 'Detail'>;

// D-091: the "what we won't say" block goes wherever a verdict is the natural next
// thought. In the current taxonomy (lib/taxonomy.ts) that's specifically the mixed
// protection-and-savings insurance type — a term policy or a loan doesn't carry the
// same keep/surrender/paid-up fork. Scoped narrowly on purpose rather than shown for
// every product type, per D-091's "name the SPECIFIC verdict" requirement.
const WHAT_WE_WONT_SAY_TYPES = new Set(['endowment_ulip']);

// Which family tab (mockup 4.3's "‹ Insurance" back link) and which noun (mockup 4.4's
// "Add a policy" / "Save policy") a product type belongs to. Derived from the same
// taxonomy sets the three list screens already filter by — not a new grouping.
type Family = 'Investments' | 'Loans' | 'Insurance';

function familyOf(productType: string): Family {
  if (INVESTMENT_TYPES.includes(productType)) return 'Investments';
  if (LOAN_TYPES.includes(productType)) return 'Loans';
  return 'Insurance';
}

const NOUN_BY_FAMILY: Record<Family, string> = {
  Investments: 'investment',
  Loans: 'loan',
  Insurance: 'policy',
};

// "Endowment / ULIP" reads better than humanizeProductType's literal "Endowment Ulip" —
// a display-only override, not a taxonomy change (lib/taxonomy.ts is untouched). Mirrors
// the same override in InsuranceScreen.tsx.
function productLabel(productType: string): string {
  return productType === 'endowment_ulip' ? 'Endowment / ULIP' : humanizeProductType(productType);
}

// Ledger rows show the CHARACTERISTICS_SCHEMA fields for the holding's type, same as
// before, but reordered where the mockup specifies an order (4.3's insurance example:
// premium, sum assured, policy term, surrender value). Types without an explicit override
// keep the schema's own field order — nothing invented for them.
const LEDGER_ORDER: Partial<Record<string, string[]>> = {
  endowment_ulip: ['premium', 'sum_assured', 'policy_term', 'current_fund_value', 'maturity_value_estimate', 'start_date'],
  term_insurance: ['premium', 'sum_assured', 'policy_term', 'start_date'],
};

function orderedFields(productType: string): FieldSpec[] {
  const schema = CHARACTERISTICS_SCHEMA[productType] ?? [];
  const order = LEDGER_ORDER[productType];
  if (!order) return schema;
  const remaining = new Map(schema.map((field) => [field.key, field]));
  const ordered: FieldSpec[] = [];
  for (const key of order) {
    const field = remaining.get(key);
    if (field) {
      ordered.push(field);
      remaining.delete(key);
    }
  }
  for (const field of schema) {
    if (remaining.has(field.key)) ordered.push(field);
  }
  return ordered;
}

// premium_frequency's value is folded into the premium row's own label (see displayLabel)
// rather than shown as its own row — same content, no repetition, matching 4.3's 4-row
// ledger exactly.
const SUPPRESSED_FIELD_KEYS = new Set(['premium_frequency']);

// Fields that hold a rupee amount — formatted with formatRupees. Everything else (months,
// percentages, free-text term lengths) renders whatever was actually typed in, as-is;
// never a unit invented on top of it.
const MONEY_FIELD_KEYS = new Set([
  'invested_amount', 'current_value', 'principal', 'emi_amount', 'outstanding_balance',
  'principal_or_monthly_amount', 'current_balance', 'annual_contribution', 'credit_limit',
  'minimum_due', 'sum_assured', 'premium', 'current_fund_value', 'maturity_value_estimate',
  'strike_price', 'current_fmv',
]);

function stripLabelHint(label: string): string {
  // characteristicsSchema.ts's labels carry a form-input hint, e.g. "Sum assured (₹)" or
  // "Start date (YYYY-MM-DD)" — useful when typing a value in, redundant once it's
  // formatted and sitting on a ledger row next to its own ₹ figure.
  return label.replace(/\s*\([^)]*\)\s*$/, '');
}

function frequencyAdjective(freq: unknown): string | null {
  if (typeof freq !== 'string' || !freq.trim()) return null;
  const f = freq.trim().toLowerCase();
  if (f.startsWith('year') || f.startsWith('annual')) return 'Annual';
  if (f.startsWith('month')) return 'Monthly';
  if (f.startsWith('quarter')) return 'Quarterly';
  if (f.startsWith('half') || f.startsWith('semi')) return 'Half-yearly';
  // Unrecognised phrasing — use what was actually stored, not a guess.
  return f.charAt(0).toUpperCase() + f.slice(1);
}

function displayLabel(field: FieldSpec, holding: Holding): string {
  if (field.key === 'premium') {
    const adjective = frequencyAdjective(holding.characteristics.premium_frequency);
    return adjective ? `${adjective} premium` : 'Premium';
  }
  if (field.key === 'current_fund_value' && holding.product_type === 'endowment_ulip') {
    return 'Surrender value now';
  }
  return stripLabelHint(field.label);
}

function displayValue(field: FieldSpec, holding: Holding): string {
  const raw = holding.characteristics[field.key];
  if (MONEY_FIELD_KEYS.has(field.key) && typeof raw === 'number') {
    return formatRupees(raw);
  }
  return String(raw);
}

// "How this one works" (mockup 4.3) — mechanism-only, tutor voice, one entry per product
// type across the three sections this screen serves. Never a verdict on whether to hold,
// buy more, or exit — that line belongs to the "what we won't say" block below it, not here.
const MECHANISM_COPY: Record<string, string> = {
  equity_mutual_fund:
    "An equity mutual fund pools your money with other investors' and a fund manager buys a basket of stocks with it. Your return comes from how that basket performs — there's no fixed rate, and the value can fall as well as rise. A SIP just means you're contributing a fixed instalment on a schedule rather than one lump sum; the amount invested is the same, only the timing changes.",
  debt_mutual_fund:
    'A debt mutual fund holds bonds and other fixed-income instruments rather than stocks. Its return comes from interest income plus any change in bond prices, so it moves less than an equity fund but isn’t risk-free — bond prices fall when interest rates rise.',
  stocks:
    "A stock is direct ownership in one company. Its value moves with that company's performance and the market's view of it — there's no fixed return and no promise your principal comes back.",
  fd_rd:
    'A fixed or recurring deposit locks money with a bank in exchange for a rate set in advance. What you get back is known upfront and doesn’t move with the market — the trade is that rate for that certainty.',
  ppf_epf:
    'PPF and EPF are government-backed retirement accounts. Contributions earn a rate set periodically by the government, compounding over a long lock-in — the certainty is real, and so is the illiquidity until it matures.',
  esop:
    "Employee stock options give you the right to buy company shares at a fixed strike price once they vest. Their worth depends entirely on the share price staying above that strike price — below it, there's nothing to gain by exercising.",
  home_loan:
    'A home loan runs on an amortising schedule: each EMI is part interest, part principal, and the split shifts toward principal as the loan matures. On a floating rate, the rate moving changes either the EMI or the remaining tenure.',
  personal_loan:
    'A personal loan runs on the same amortising schedule as a home loan — part interest, part principal each EMI — just shorter, unsecured, and usually at a higher rate.',
  credit_card_debt:
    'Credit card debt has no fixed payoff date. Carry a balance past the due date and interest accrues on it daily, at a much higher rate than most other borrowing — the minimum due keeps the account current without ever paying it down.',
  term_insurance:
    "A term insurance policy pays a fixed sum to your family if you die within the policy period. It's pure protection — the premium buys that promise and nothing else, with no payout if the term ends without a claim.",
  endowment_ulip:
    'An endowment or ULIP wraps protection together with savings inside one premium. Part of what you pay funds the life cover, part accumulates — as invested units for a ULIP, at a set rate for an endowment. The same rupee is doing two jobs, which usually costs more than buying each separately.',
};

// BQ-022: read-only home for teaching content about one specific holding, reached by
// tapping a row in HoldingsList. Full edit/delete/recategorize authority (BQ-027/D-059)
// is one tap deeper via the Edit/Recategorise buttons, not this screen's own job.
export function HoldingDetailScreen({ route, navigation }: Props) {
  const { holding } = route.params;
  const { userId } = useAuth();
  const accountAtEntry = useRef(userId);
  const [editing, setEditing] = useState<'edit' | 'recategorise' | null>(null);
  const [comparing, setComparing] = useState(false);
  const [checkingExerciseCost, setCheckingExerciseCost] = useState(false);
  const parentNavigation = navigation.getParent<BottomTabNavigationProp<MainTabsParamList>>();

  useEffect(() => {
    if (userId !== accountAtEntry.current) {
      setEditing(null);
      setComparing(false);
      setCheckingExerciseCost(false);
    }
  }, [userId]);

  // D-069/BRIEF-015's scope: ESOP options only, not RSU (no exercise decision for RSUs).
  const isEsopOptions =
    holding.product_type === 'esop' && holding.characteristics.grant_type === 'options';

  const showWontSayBlock = WHAT_WE_WONT_SAY_TYPES.has(holding.product_type);
  const family = familyOf(holding.product_type);
  const noun = NOUN_BY_FAMILY[family];
  const mechanism = MECHANISM_COPY[holding.product_type];

  const fields = orderedFields(holding.product_type).filter((field) => !SUPPRESSED_FIELD_KEYS.has(field.key));
  const filledFields = fields.filter((field) => {
    const value = holding.characteristics[field.key];
    return value !== null && value !== undefined && value !== '';
  });

  if (userId !== accountAtEntry.current) {
    return (
      <View style={[styles.screen, styles.accountUnavailable]}>
        <Text style={styles.emptyText}>This holding belongs to the previous account and is no longer displayed.</Text>
        <Pressable style={styles.editButton} onPress={() => navigation.goBack()} accessibilityRole="button">
          <Text style={styles.editButtonText}>Back to current account</Text>
        </Pressable>
      </View>
    );
  }

  const askAboutThis = () => {
    // Alias only, never display_name — /chat sends this question text to the LLM
    // verbatim (D-010: the app must never construct a message carrying a real name).
    // deepenAlias (D-071): this screen knows the holding with certainty (no inference),
    // so the backend can set `deepen` deterministically instead of leaving it absent.
    parentNavigation?.navigate('Chat', {
      prefillQuestion: `Can you help me understand ${holding.alias} better?`,
      deepenAlias: holding.alias,
    });
  };

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        {/* Mockup 4.3: "‹ Insurance" back link replaces the native stack header (each of
            the three list screens now renders this Detail route with headerShown: false). */}
        <Pressable onPress={() => navigation.goBack()} style={styles.backLink} hitSlop={8}>
          <Text style={styles.backLinkText}>‹ {family}</Text>
        </Pressable>

        <Text style={styles.title}>{holding.display_name ?? holding.alias}</Text>
        <Text style={styles.subtitle}>{productLabel(holding.product_type)}</Text>

        <View>
          {filledFields.length === 0 ? (
            <Text style={styles.emptyText}>No characteristic details recorded yet.</Text>
          ) : (
            filledFields.map((field) => (
              <View key={field.key} style={styles.row}>
                <Text style={styles.rowLabel}>{displayLabel(field, holding)}</Text>
                <Text style={styles.rowValue}>{displayValue(field, holding)}</Text>
              </View>
            ))
          )}
        </View>

        {mechanism && (
          <TeachingBlock heading="How this one works" style={styles.teachingBlockWrap}>
            {mechanism}
          </TeachingBlock>
        )}

        {showWontSayBlock && (
          <TeachingBlock heading="What we won't say" style={styles.teachingBlockWrap}>
            Whether to keep it, surrender it, or make it paid-up. We'll show what each of those does to
            your numbers, in the same detail, whenever you ask.
          </TeachingBlock>
        )}

        <Pressable style={styles.askButton} onPress={askAboutThis}>
          <Text style={styles.askButtonText}>Ask about this</Text>
        </Pressable>

        {isLoanVsInvestEligible(holding.product_type) && userId && (
          <Pressable style={styles.compareButton} onPress={() => setComparing(true)}>
            <Text style={styles.compareButtonText}>Compare: prepay vs. invest</Text>
          </Pressable>
        )}

        {isEsopOptions && userId && (
          <Pressable style={styles.compareButton} onPress={() => setCheckingExerciseCost(true)}>
            <Text style={styles.compareButtonText}>Cost of exercising today</Text>
          </Pressable>
        )}

        <Pressable style={styles.editButton} onPress={() => setEditing('edit')}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>

        {/* Recategorise (mockup 4.3) opens the same edit surface as Edit — recategorizing
            a holding already lives inside HoldingEditModal's product-type picker
            (BQ-027/D-059); this just gives it its own discoverable entry point instead of
            leaving it buried under a generically-labelled Edit button. */}
        <Pressable style={styles.editButton} onPress={() => setEditing('recategorise')}>
          <Text style={styles.editButtonText}>Recategorise</Text>
        </Pressable>
      </ScrollView>

      {editing && (
        <HoldingEditModal
          holding={holding}
          noun={noun}
          intent={editing}
          onClose={() => setEditing(null)}
          onChanged={() => {
            setEditing(null);
            navigation.goBack();
          }}
        />
      )}

      {comparing && userId && (
        <LoanVsInvestModal
          userId={userId}
          holdingId={holding.id}
          onClose={() => setComparing(false)}
          onExploreWithArya={(prompt) => { setComparing(false); parentNavigation?.navigate('Chat', { prefillQuestion: prompt }); }}
        />
      )}

      {checkingExerciseCost && userId && (
        <EsopExerciseCostModal
          userId={userId}
          holdingId={holding.id}
          onClose={() => setCheckingExerciseCost(false)}
          onExploreWithArya={(prompt) => { setCheckingExerciseCost(false); parentNavigation?.navigate('Chat', { prefillQuestion: prompt }); }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.screen },
  accountUnavailable: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  backLink: { alignSelf: 'flex-start', paddingVertical: spacing.xs, marginBottom: spacing.md },
  backLinkText: { fontFamily: font.ui, fontSize: 14, color: colors.inkSecondary },
  title: { fontFamily: font.uiSemibold, fontSize: 20, color: colors.ink },
  subtitle: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  emptyText: { fontFamily: font.ui, color: colors.inkMuted, fontSize: 13, fontStyle: 'italic' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowLabel: {
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    flex: 1,
  },
  rowValue: typography.ledgerValue,
  teachingBlockWrap: { marginTop: spacing.xl },
  askButton: {
    backgroundColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  askButtonText: typography.primaryButtonText,
  compareButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.tutor,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  compareButtonText: { fontFamily: font.uiSemibold, color: colors.tutor },
  // Tertiary/quiet tier (1F) — Edit/Recategorise are management actions, secondary to
  // Ask/Compare, not a bordered choice of their own. Borderless, muted, matches
  // addButtonSecondary elsewhere in the app.
  editButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  editButtonText: { fontFamily: font.ui, fontSize: 13, color: colors.inkSecondary },
});
