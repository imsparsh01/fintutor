# Calculator Suite — Journey and State Matrix

**Status:** BQ-145 current-state reconciliation

## End-to-end journey

1. **Discover:** user enters from Tools, a representative Home preview or the optional Onboarding Tools handoff.
2. **Choose:** all nine tools remain equally reachable; FinTutor does not rank a question or infer intent.
3. **Orient:** calculator names its question, required inputs, authorship and what it will not decide.
4. **Load candidates where applicable:** each source settles independently as loading, ready, empty, failed, malformed or permission-lost.
5. **Author assumptions:** user enters values and explicitly includes any attributed recorded candidate; unknown never becomes zero.
6. **Validate:** whole-string grammar, units, domain, cross-field constraints and safe numerical bounds are checked with associated feedback.
7. **Calculate:** one deliberate action freezes the input snapshot; duplicate/busy activation cannot produce duplicate results/events.
8. **Understand:** current result shows figure/unit, input authorship, formula/timing, rounding/caps and omissions in neutral language.
9. **Continue optionally:** eligible current result may offer a confirmed masked Arya mechanism handoff; result completion may emit participation-only progression.
10. **Revise:** any dependent edit immediately removes the old result and downstream actions; rerun is explicit.
11. **Recover:** source/network/permission/offline failures retain safe manual drafts and expose only precise explicit recovery.
12. **Exit/return:** close/back restores the caller; reset/reopen is clean and account transitions expose only the destination account shell.

## Canonical suite states

| ID | State | Required behavior |
|---|---|---|
| CA-01 | Tools loading | Stable geometry; no false empty list |
| CA-02 | Tools ready | Exactly nine approved calculators, equal reachability |
| CA-03 | Entry from Home | Chosen preview opens; View all preserves catalogue |
| CA-04 | Entry from Onboarding | Tools opens without inferred calculator or disclosure |
| CA-05 | Calculator initial | One heading, scope, blank manual fields, no result |
| CA-06 | Manual-only calculator | No source/API call; all assumptions user-authored |
| CA-07 | Sources loading | Named source status; manual fields remain usable |
| CA-08 | Sources complete | Attributed editable candidates, explicit inclusion state |
| CA-09 | Sources partial | Good source retained; failed source named separately |
| CA-10 | Sources failed | Failure not empty; manual and explicit retry paths |
| CA-11 | No candidate records | Neutral absence of offered record, not real-world absence |
| CA-12 | Candidate stale/unknown freshness | Version/retrieval evidence without invented current timestamp |
| CA-13 | Candidate included | Exact source amount enters frozen calculation snapshot |
| CA-14 | Candidate excluded | Visible exclusion and arithmetic omission |
| CA-15 | Candidate edited | Draft authorship; no baseline write-back |
| CA-16 | Required blank/unknown | Calculate disabled or exact block; no coercion to zero |
| CA-17 | Partial numeric grammar | Associated error; no result/event |
| CA-18 | Non-finite/unsafe input | Exact bounded error; no NaN/Infinity render |
| CA-19 | Formula-domain edge | Contract-defined valid boundary computes |
| CA-20 | Just-outside domain | Contract-defined rejection with no output |
| CA-21 | Cross-field invalid | Exact relationship error; first-invalid focus |
| CA-22 | Ready to calculate | Complete visible inputs; explicit action enabled |
| CA-23 | Calculating | Busy/idempotent action; stable input summary |
| CA-24 | Single result | Current figure/unit plus frozen inputs and conventions |
| CA-25 | Multi-figure result | Primary and secondary figures share one current snapshot |
| CA-26 | Zero-rate branch | Explicit user-entered zero follows formula-specific contract |
| CA-27 | Zero/crossing/equality result | Factual signed/zero arithmetic without valence |
| CA-28 | Iteration cap/no result | Exact capped state; no partial or misleading figure |
| CA-29 | Numeric overflow | Bounded error before render/event |
| CA-30 | Inputs changed | Result, handoff and completion eligibility removed immediately |
| CA-31 | Rerun | One new result from current values; old snapshot absent |
| CA-32 | Reset | Draft/error/result cleared; candidates separately re-offered |
| CA-33 | Clean reopen | Fresh initial state; no prior account/draft/result residue |
| CA-34 | Progression success | One type/day and suite/day capped participation event |
| CA-35 | Progression duplicate/cap/failure | Result unchanged; no pressure or duplicate award |
| CA-36 | Arya handoff eligible | Exact bounded privacy-minimised payload shown before send |
| CA-37 | Arya handoff cancel | Zero navigation/model call; focus restored |
| CA-38 | Arya failure/retry | Existing explicit retry only; calculator result unchanged |
| CA-39 | Offline manual calculator | Pure local calculation works; nothing uploads later |
| CA-40 | Offline source calculator | Manual-only path; no fabricated/stale candidate claim |
| CA-41 | Reconnect | No silent refresh/upload/retry; user explicitly retries |
| CA-42 | Authentication loss | Draft/result/source data clears; reauthentication route |
| CA-43 | Account transition | Destination shell only; late prior responses discarded |
| CA-44 | Lost/late source response | Generation spy proves discard and zero side effects |
| CA-45 | Loading accessibility | Status semantics and stable geometry |
| CA-46 | Error accessibility | Associated alert/summary and logical invalid focus |
| CA-47 | Result accessibility | Named region, one announcement and native-safe focus |
| CA-48 | Keyboard/modal | Every action reachable; trap/Escape/restore where modal exists |
| CA-49 | Responsive/zoom | 320/phone/1440/200% reflow without clipping or dead end |
| CA-50 | Theme/motion/DOM | Meaning/contrast/focus persist; clean console and semantic DOM |
| CA-51 | Exit/return | Exact caller restored; result remains transient |

## Calculator-specific branches

| Calculator | Required branches visible in later contracts/acceptance |
|---|---|
| SIP Goal | positive target; zero/positive rate ruling; month conversion; inverse annuity timing; unsafe output |
| Home Loan EMI | positive principal/months; zero/positive rate ruling; monthly amortisation; total-interest safety |
| Inflation Impact | positive present cost; zero/positive/negative-rate ruling; fractional horizon; unsafe power/output |
| Step-up SIP | month-end contribution; zero/positive return ruling; zero/positive step; integer horizon; overflow |
| CAGR | positive initial/final; gain/equality/loss; fractional years; signed rate; unsafe ratio/root |
| Compound Growth | lump/monthly combinations; zero rate; rounded months; amount/rate/horizon ceilings; overflow |
| Credit-card Payoff | zero rate; clearing/non-clearing; partial final payment; 1,200-month cap; unsafe totals |
| Emergency Coverage | cash/FD/other inclusion; zero accessible result; positive outgoings; source partial/failure |
| Goal contribution gap | current≥target; zero/positive rate; planned below/equal/above modeled; signed difference; overflow |

## Current-state gap map

| Area | Current production state | BQ-146/BQ-147 requirement |
|---|---|---|
| Old formula engines | Embedded `parseFloat`, incomplete guards/fixtures | Exact formula/domain/rounding contract and decision routing |
| Result lifecycle | Mixed; several tools retain stale results | One immediate-invalidation/reset/reopen contract |
| Prefills | Present only on selected tools | Explicit eligibility, attribution, inclusion and recovery contract |
| Result explanation | Mechanism copy exists but structure varies | Frozen inputs + formula/timing + rounding/caps + omissions |
| Arya | No calculator handoff | Decide eligible bounded mechanisms and exact confirmation contract |
| Progression | Valid render emitters exist | Type-only key, no nonqualifying event, cap/failure evidence |
| Accessibility | Shared native-safe result focus; gaps elsewhere | Full keyboard/error/result/modal/responsive evidence |
| QA | Pure tests concentrated in newer calculators | Exact fixtures and all 51 canonical states across all nine |

## Explicitly deferred

Tax/HRA, XIRR, rent-versus-buy, transaction-history persistence, saved result history, new catalogue entries, automatic assumption selection and financial-outcome rewards are not states of this workstream.
