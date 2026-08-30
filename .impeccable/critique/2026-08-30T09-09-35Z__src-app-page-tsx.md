---
target: landing page (src/app/page.tsx)
total_score: 20
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 3
timestamp: 2026-08-30T09-09-35Z
slug: src-app-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2/4 | Table's Suspense fallback is a bare empty div — no skeleton, just a blank gap while it loads |
| 2 | Match Between System & Real World | 3/4 | Domain vocabulary (phonotactics, declensions, inflections) is genuinely conlang-literate |
| 3 | User Control and Freedom | 3/4 | No dead ends; fine for a landing page |
| 4 | Consistency and Standards | 2/4 | "Sign up" is a bare text link while the lower-priority "View All Conlangs" gets a full Button; raw slate-700/200 in the nav bypasses the ink/paper token system |
| 5 | Error Prevention | 3/4 | Acceptable for a marketing surface |
| 6 | Recognition Rather Than Recall | 3/4 | Opacity + "Coming soon" badges make shipped-vs-planned reasonably scannable |
| 7 | Flexibility and Efficiency | n/a | Not applicable to a persuade-mode landing page |
| 8 | Aesthetic and Minimalist Design | 2/4 | Six-tile grid + four visually-identical rounded-rectangle callouts isn't minimal; confirmed by the detector: muted-foreground body text renders at 4.3:1 contrast (below WCAG AA's 4.5:1) on the mist background used across all six feature-tile descriptions |
| 9 | Error Recovery | 2/4 | The table's literal "No results." empty state is dashboard-grade language leaking into marketing copy |
| 10 | Help and Documentation | n/a | Not applicable to a persuade-mode landing page |

Total: 20/32 (63%) — Acceptable band.

## Design Specificity Verdict

LLM assessment: Reads as conlang words poured into a stock SaaS template. The 3x2 icon-tile-with-"Coming soon"-badge grid is a generic "AI-generated landing page" pattern. The "Share your conlangs with the world!" panel and the "Ready to create your own language?" panel are the same component pattern copy-pasted twice — identical wrapper, heading layout, and right-aligned icon badge. Dropping the literal internal ConlangTable/TanStack DataTable into hero-adjacent marketing content is the strongest "admin tool, not marketing" signal. What is specific: the copy itself (phonotactics, declensions, LangTime-adjacent vocabulary) and the restrained orange wordmark tint.

Deterministic scan: CLI detector (detect.mjs) came back clean (0 findings, exit 0). Browser overlay (detect.js injected live) found 3 anti-patterns at desktop, 13 at mobile width, dominated by a repeated low-contrast finding — muted-foreground text (#64748b) on mist background (#f1f5f9) measures 4.3:1, under WCAG AA's 4.5:1 floor — on all six feature-card descriptions plus the "Share your conlangs" paragraph at mobile width. Also 2x cramped-padding around the Recent Conlangs table, 1x layout-transition (transition: height). One finding (clipped-overflow-container on Clerk's avatar button) is third-party markup.

Visual overlays: captured as evidence then stopped per protocol, not left running.

## Overall Impression

The hero is genuinely good — confident type, correct restrained brand color, honest alpha-warning copy. Everything after it flattens into a stack of same-shaped gray rounded rectangles that could belong to almost any product, and the page's two most important jobs — proving the product is alive, and asking someone to sign up — are both handled by the weakest elements on the page: a table full of test data, and a text link with no visual weight.

## What's Working

1. The hero and alpha-warning banner — bold, correctly-scaled display type, translucent orange tint keeps the "one mark" restraint at rest, honest copy.
2. Icon-family discipline — hand-authored Heroicons-outline for editorial content, Lucide reserved for functional table-row actions, no mixing.
3. The homepage table hides dashboard-only columns (isPublic, ownerId, timestamps, actions) even though the component's underlying identity still shows through.

## Priority Issues

[P0] Sign-up has no visual weight — the page's only conversion action is a plain text link
- Why it matters: "View All Conlangs" (a browse action) gets a full primary Button; "Sign up" is a text-sm text-muted-foreground sentence with only a hover-underline.
- Fix: Promote Sign up to a primary button; consider a second instance near the hero.
- Suggested command: /impeccable clarify or /impeccable layout

[P0] The only social proof on the page is visibly test data
- Why it matters: "Test Language" and "A new language~" are what every visitor sees under "Share your conlangs with the world!" — undercuts the pitch to exactly the hobbyist persona evaluating seriousness.
- Fix: Seed real, presentable example conlangs, or suppress/replace this section below a minimum real-conlang threshold.
- Suggested command: /impeccable harden

[P1] Confirmed WCAG AA contrast failure on body text across every feature tile — detector-verified
- Why it matters: 4.3:1 against a 4.5:1 floor is a real accessibility failure, systemic across the callouts.
- Fix: Darken --muted-foreground slightly or use a different token for body copy on bg-accent/mist surfaces.
- Suggested command: /impeccable audit

[P1] The "Recent Conlangs" table is the wrong instrument, and its failure modes leak dashboard language into marketing
- Why it matters: literal internal ConlangTable component; empty state renders "No results."; name column has no truncation guard.
- Fix: Build a small card-based "recent conlangs" showcase for marketing use with its own on-brand empty state.
- Suggested command: /impeccable layout

[P1] Callouts read as one repetitive stack, not four purposeful moments
- Why it matters: Share panel and closing CTA panel are the same component copy-pasted, including an orange-on-hover icon treatment that breaks the "no orange as interactive UI accent" rule; three of six feature tiles are full-size "Coming soon" placeholders at equal weight to the two shipped features.
- Fix: Give the closing CTA a genuinely distinct, higher-contrast treatment; shrink roadmap items into a compact list.
- Suggested command: /impeccable distill or /impeccable bolder

## Persona Red Flags

Jordan (confused first-timer): No "start here" cue among 6 tiles; table's only click affordance is a small unlabeled circular arrow icon; "Sign up" small enough to miss entirely.

Riley (deliberate stress-tester): Predicts long conlang names will break the table row (only description is truncation-guarded); catches that text-md isn't a real Tailwind class and silently no-ops on all six tile headings.

Casey (distracted mobile user): Must scroll past headline, banner, and six full-height stacked cards (three faded "Coming soon") before reaching table or CTA — plausible bail-out point.

The LangTime Studio hobbyist (project-specific): Test-data table and generic tile-grid layout both read as "not a crafted tool" to exactly the persona whose trust this product most needs.

## Minor Observations

- text-md (used on all six feature-tile headings) isn't a real Tailwind utility in this config — silently no-ops.
- topnav.tsx uses raw slate-700/slate-200 instead of the documented ink/paper/hairline tokens.
- The Suspense fallback for the table is a bare empty div — visible layout jump, no loading indicator.
- The "Features" h2 is sr-only — screen-reader users get a section label sighted users never see.
- Detector also flagged 2x cramped-padding around the table container and 1x layout-transition (transition: height) — minor relative to the above.

## Questions to Consider

1. If the table is showing test fixtures to every visitor, has anyone on the team looked at this page logged-out recently?
2. The Share panel and the closing CTA are the same component with different words — deliberate, or a symptom of building section-by-section?
3. PRODUCT.md's differentiator is "more flexible and modern than older desktop tools" — where does a visitor actually feel that on this page, versus just reading it? Right now the proof is a spreadsheet.
