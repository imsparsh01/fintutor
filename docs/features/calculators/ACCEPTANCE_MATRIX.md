# Calculator Suite — Acceptance Matrix

**Status:** BQ-147 contract/evidence map  
**Scope:** nine Calculators, 51 canonical states

## Stable acceptance criteria

| Criterion | Trigger | Required evidence |
|---|---|---|
| AC-A01 | Tools ready | Exactly nine approved equal entries; no deferred calculator |
| AC-A02 | Home/Onboarding entry | Chosen destination opens without inferred calculator/assumption |
| AC-A03 | Open/reopen/back | Clean draft and exact caller restoration; no cross-account residue |
| AC-A04 | Manual calculator | Network spy proves no API/storage/model call before confirmed handoff |
| AC-P01 | Candidate sources load | Independent typed loading/ready/empty/failure states |
| AC-P02 | Candidate offered | Source field/version/retrieval evidence; excluded by default |
| AC-P03 | Candidate included/edited | Frozen authorship is recorded vs entered; no write-back |
| AC-P04 | Refresh/retry | Touched draft preserved; explicit source-local retry; no silent replay |
| AC-P05 | Account/generation changes | Synchronous clear and late-response discard |
| AC-N01 | Numeric input | Whole-string grammar; blank/malformed/non-finite never zero |
| AC-N02 | Exact boundary | Approved minimum/maximum computes; just-outside rejects |
| AC-N03 | Conversion/intermediate/output | Every value finite and safe before render |
| AC-N04 | Invalid submit | Associated exact error, first-invalid focus, no result/event |
| AC-R01 | Calculate | Deliberate busy/idempotent action freezes inputs |
| AC-R02 | Result | Named unit, inputs, formula/timing, rounding/caps/omissions |
| AC-R03 | Dependent edit | Result/handoff/completion removed immediately with exact rerun copy |
| AC-R04 | Reset/reopen | Draft/error/result cleared; candidates separately offered |
| AC-R05 | Equality/zero/loss/crossing | Factual neutral signed output without judgment |
| AC-R06 | Cap/overflow | Exact no-result state; no partial/NaN/Infinity/event |
| AC-SIP01 | SIP positive rate | Exact inverse month-end annuity fixture |
| AC-SIP02 | SIP zero rate | Exact target/month branch |
| AC-SIP03 | SIP period/domain | Rounded 1..2,400 months and approved ceilings |
| AC-EMI01 | EMI positive rate | Exact amortisation fixture and total interest |
| AC-EMI02 | EMI zero rate | Exact principal/month branch |
| AC-EMI03 | EMI period/domain | Rounded 1..600 months and approved ceilings |
| AC-INF01 | Inflation positive/zero | Exact annual power fixtures |
| AC-INF02 | Inflation negative | -100% boundary/fractional horizon and invalid base guards |
| AC-INF03 | Inflation safety | Approved amount/rate/horizon/output bounds |
| AC-STEP01 | Step-up timing | Month-end and new 12-month-block contribution fixture |
| AC-STEP02 | Step-up zeros | Explicit 0% return and 0% step fixtures |
| AC-STEP03 | Step-up domain | Positive integer 1..200 years and safe intermediates |
| AC-CAGR01 | CAGR gain/equality/loss | Exact signed historical annualised fixtures |
| AC-CAGR02 | CAGR period/domain | Positive values, fractional 0..200 years, safe root/output |
| AC-CG01 | Compound Growth | Existing zero-rate/month-end/rounded-month exact fixtures |
| AC-CG02 | Compound Growth safety | Existing amount/rate/200-year/overflow guards |
| AC-CC01 | Card payoff | Monthly interest then payment and partial final payment |
| AC-CC02 | Card non-clearing/cap | Exact non-clearing and 1,200-month no-result states |
| AC-CC03 | Card safety | Zero-rate and input/intermediate/output guards; manual-only |
| AC-EC01 | Emergency formula | Included accessible sum ÷ positive outgoings; real zero result |
| AC-EC02 | Emergency provenance | Budget/FD candidates attributed, editable, excluded until included |
| AC-EC03 | Emergency recovery | Partial/failure/offline/account transitions without fabricated values |
| AC-GG01 | Goal gap | Exact modeled month-end contribution and signed difference |
| AC-GG02 | Goal reached/equality | Zero modeled contribution and neutral signed/equal output |
| AC-GG03 | Goal safety | Existing domain/overflow guards; manual-only |
| AC-X01 | Result completion | Stable type-only event after valid render; caps/failure isolated |
| AC-X02 | Arya eligible result | Exact confirmed privacy-minimised payload; cancel sends nothing |
| AC-X03 | Invalid/changed/capped | No handoff or completion event |
| AC-X04 | Privacy/storage audit | No raw inputs/results in persistence, logs, analytics or progression |
| AC-F01 | Offline/reconnect | Local-only manual run; no queue/replay; explicit source retry |
| AC-F02 | 401/403/404/5xx | Typed ownership/absence/retry behavior without disclosure |
| AC-C01 | Semantics | One heading; named units/controls/states/errors/status/result region |
| AC-C02 | Result focus | One announcement; native-safe focus; no web imperative crash |
| AC-C03 | Keyboard/modal | Logical order, visible focus, trap/Escape/restore, ≥44px targets |
| AC-C04 | 320/phone/1440/200% | Reflow without clipping/overlap/horizontal page scroll |
| AC-C05 | Themes/motion/DOM | Contrast/focus/meaning persist; clean console/DOM/static audit |

## Canonical-state coverage

Every `CA-01..CA-51` row in `JOURNEY_AND_STATES.md` is binding. Coverage groups:

| States | Criteria |
|---|---|
| CA-01..CA-06 | AC-A01..A04, AC-C01 |
| CA-07..CA-15 | AC-P01..P05, AC-EC02..EC03 |
| CA-16..CA-23 | AC-N01..N04, AC-R01, AC-R06 |
| CA-24..CA-33 | AC-R02..R06 plus every formula-specific row |
| CA-34..CA-38 | AC-X01..X04, AC-C03 |
| CA-39..CA-44 | AC-F01..F02, AC-P04..P05 |
| CA-45..CA-51 | AC-C01..C05, AC-A03 |

## Critical owner-validation tasks

1. Explain what owns each assumption and identify one thing FinTutor refuses to decide.
2. Run one growth, debt, resilience, historical-rate and goal calculator; explain formula timing and one omission.
3. Exercise zero, equality/loss, non-clearing/cap, overflow and changed-input states without interpreting valence.
4. Include/edit/exclude an Emergency candidate; recover from partial/failure/offline and verify no write-back.
5. Inspect the exact Arya payload, cancel it, then confirm a separate run; verify no product/source identity crosses.
6. Verify progression is participation-only and cannot alter a result.
7. Complete keyboard, result announcement/focus, 320/390/1440/200%, themes/high contrast/reduced motion and clean-console tasks.

Each task records coaching needed, assumption/provenance understanding, confusion, trust surprises and dead ends, then receives PASS / REVISE / PARK / ESCALATE.
