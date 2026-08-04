# Wireframe: Holdings list (Investments / Loans / Insurance)

**Traces to:** BQ-019 (list view), BQ-027 (tap-to-edit/delete/recategorize), D-013/D-055 (product-type
taxonomy used to filter each family).
**Component(s):** `app/components/HoldingsList.tsx`, `app/components/HoldingEditModal.tsx`,
`app/screens/InvestmentsScreen.tsx` / `LoansScreen.tsx` / `InsuranceScreen.tsx` (each a thin wrapper
passing a family-specific `product_type` filter list).

## Purpose
Show every holding in one D-013 family (Investments, Loans, or Insurance), and let the user tap one to
edit, recategorize, or delete it (D-059/Path C).

## Elements
- Title — the family name (e.g. "Investments").
- List row — `display_name` (falls back to `alias`), plus the humanized `product_type` as a subtitle.
- Tap target — the whole row; opens `HoldingEditModal`.
- Edit modal — display name field, alias field, product-type chip picker (constrained to the known
  taxonomy, not free text), save button, destructive delete button behind an `Alert.alert` confirm.

## States
- **Loading** — a centered `ActivityIndicator`, title still shown.
- **Empty** — title shown, a hint string (per-family: "No investments/loans/insurance tracked yet — they'll
  show up here once surfaced or added").
- **Signed out** — "Signed out — no holdings to show." (shouldn't be reachable in practice — `MainTabs`
  only renders inside an authenticated session — but handled since `useAuth()` can return a null `userId`.)
- **Error** — title shown, error text in red ("Couldn't load holdings — [message]").
- **Populated** — scrollable `FlatList` of rows, tap any row to edit.

## Not yet covered by this screen
- Editing `characteristics` (interest rate, tenure, etc.) — `BQ-028`, deferred.
- A dedicated detail screen for teaching content to live on — `BQ-022`, separate from this list/modal
  pattern.
