---
target: "whole app: homepage, dashboard, lexicon"
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-29T22-42-17Z
slug: whole-app-homepage-dashboard-lexicon
---
Method: dual-agent (A: design-review subagent · B: detector+browser-evidence subagent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2/4 | Dashboard's "View" and "Delete" dropdown items fire a raw `alert("...not implemented")` — looks like a real action, does nothing |
| 2 | Match Between System and Real World | 3/4 | Vocabulary (IPA, lexical sections, etymology) correctly assumes conlanger fluency; copy tone fits the hobbyist audience |
| 3 | User Control and Freedom | 2/4 | No way to actually delete a conlang exists yet (stub alert) — the single highest-stakes action in the product |
| 4 | Consistency and Standards | 1/4 | Four undocumented ad hoc colors in active use alongside the documented tokens; two conflicting "view conlang" affordances in the same table row (one works, one alerts "not implemented") |
| 5 | Error Prevention | 2/4 | Word/section deletion has a proper named confirm dialog; conlang deletion has none because it doesn't exist |
| 6 | Recognition Rather Than Recall | 3/4 | State lives in URL search params (`?view=lexicon&word=3`) — bookmarkable, recall-free; a few icon-only buttons rely on sr-only labels only |
| 7 | Flexibility and Efficiency of Use | 2/4 | Drag-to-reorder sections with a mobile chevron fallback is a real accelerator; no bulk word actions, no keyboard shortcuts anywhere |
| 8 | Aesthetic and Minimalist Design | 2/4 | Lexicon/WordView is genuinely clean; homepage's orange overuse and six simultaneous "Coming soon" badges create real visual noise |
| 9 | Error Recovery | 2/4 | Toast errors are specific where they exist; the `alert()` stubs are the ugliest possible error surface — native, unstyled, breaks the visual system |
| 10 | Help and Documentation | 1/4 | Zero contextual help anywhere despite asking users to learn a 5-type section model with zero onboarding |
| **Total** | | **20/40** | **Acceptable (borderline Poor)** |

## Design Specificity Verdict

**Mixed, trending toward generic-CRUD in execution despite a genuinely specific data model.** The lexical-section content model — definition/pronunciation/etymology/custom_text/custom_fields, rendered with numbered senses, italicized examples, monospace IPA — is authored for this product, and the live word-view page ("look") proves the core promise (Wiktionary depth, more polish) actually works. That's the strongest specificity signal in the app.

But the chrome around it doesn't hold up DESIGN.md's own system. DESIGN.md stakes the identity on one accent color ("The One Mark Rule") — the live homepage violates it in the first viewport: Signal Orange tints all six feature-tile icons, the headline span, a solid-orange "View All Conlangs" button, and a hover state, for 8+ simultaneous orange touches against a documented budget of one or two. Once orange is everywhere it stops being a mark and becomes wallpaper — the exact failure the rule exists to prevent. Compounding it, destructive actions across the app use raw `text-red-700/600/800` instead of the documented Alarm token, the dashboard's "Public" indicator uses an undocumented blue, and the "Add Section" icon uses an undocumented green — none of these four colors exist in DESIGN.md. The *documented* system is more disciplined than the *shipped* product, which is backwards for a design-system audit.

**Deterministic scan**: the static CLI detector (`detect.mjs`) scanned 62 source files across the homepage, dashboard, lexicon, and shared UI primitives and returned **zero findings** — a clean static-analysis pass. The live browser overlay (a separate, DOM/computed-style-based engine) found real issues the static pass couldn't see:

- **Homepage** (5 findings): line-length (~94 chars/line, aim for <80), cramped-padding on two containers, **low-contrast: white text on `#ff5600` measuring 3.2:1 against a 4.5:1 requirement** (`text-sm font-semibold` is below the large-text bold threshold, so 4.5:1 genuinely applies — confirmed, not a false positive), and a `transition: height` layout-transition flag.
- **`/search`** (3 findings): the same two cramped-padding containers, plus the same layout-transition flag.
- **`/lang/1`** (1 finding): the layout-transition flag only.
- **`/dashboard`**: not scanned — correctly gated behind Clerk auth for a signed-out visitor; the redirect itself was recorded as expected behavior, not a failure.

**Where the two assessments corroborate each other**: the detector's measured 3.2:1 contrast failure is on the same `bg-dictionary` "View All Conlangs" button the design review flagged for violating the One Mark Rule — hard numeric evidence for a qualitative read. No overlay is still open in the browser; both tabs and the live-server used for injection were closed at the end of the evidence-gathering pass.

## Overall Impression

The product's actual content engine — the lexical-section renderer — is the best-designed part of the app and genuinely differentiated. Everything wrapped around it (dashboard actions, color discipline, the sign-in screen) reads like a different, less-considered project. The single biggest opportunity: two `alert()` stubs and an over-applied accent color are doing more damage to the perceived quality of this app than the actual hard problem (structured lexicon data) that's already solved well.

## What's Working

1. **The word content rendering (`section-views.tsx`)** — numbered definitions, italicized examples, monospace IPA with rhyme lists, prose etymology — verified live and free of the orange overuse elsewhere. This is where the "Modern Reference Shelf" north star is fully realized.
2. **URL-driven state for the lexicon view** (`?view=&word=&edit=`) — bookmarkable, refresh-safe, satisfies "recognition over recall" for free.
3. **The Add Section two-step picker** — icon + label + description, then a focused form — is the strongest cognitive-load design in the codebase, a textbook progressive-disclosure pattern.

## Priority Issues

**[P0] The Dashboard's "View" and "Delete" conlang actions are non-functional `alert()` stubs**
- **What**: In `src/app/dashboard/_components/conlang-table.tsx` (lines ~158–180), the dropdown's "View" item runs `alert("Conlang page not implemented")` and "Delete" runs `alert("Delete not implemented")`.
- **Why it matters**: Delete is the highest-stakes action in the product; shipping it as a raw browser `alert()` blocks the core "manage your conlangs" workflow and leaves users unsure whether anything happened. It's also an internal inconsistency: the same row already has a *working* way to open a conlang (the row click / arrow button), so "View" existing as a second, broken control next to a working one reads as a bug.
- **Fix**: Wire "View" to the same `/lang/{id}` navigation already used elsewhere (or remove the redundant menu item), and build real conlang deletion using the confirm-dialog pattern already proven in `delete-word.tsx`/`delete-section.tsx` (typed-name confirmation, destructive-variant button, disabled-while-deleting state). If not ready to ship, remove both menu items rather than leaving dead affordances live.
- **Suggested command**: `/impeccable harden`

**[P1] Signal Orange is used 8+ times on the homepage, violating DESIGN.md's own One Mark Rule — and the CTA using it fails contrast**
- **What**: `src/app/page.tsx` tints all six feature-tile icons, the headline span, a hover state, and the solid "View All Conlangs" button with Signal Orange. The detector independently measured that button's white-on-orange text at 3.2:1 contrast, below the 4.5:1 WCAG requirement for its size/weight.
- **Why it matters**: DESIGN.md is explicit that more than one or two orange elements per screen "is a violation, not a stylistic choice" — the accent's job is to draw the eye to one thing, and with orange everywhere it draws the eye nowhere. This is a direct, measurable contradiction between the documented system and the shipped homepage, and it's failing an accessibility check on top of it.
- **Fix**: Restrict Signal Orange to the wordmark/headline (its current documented use), swap the six feature-icon tints to Ink or Muted Ink, and change "View All Conlangs" to the documented `button-primary` (Ink/Paper) or `button-outline` treatment.
- **Suggested command**: `/impeccable quieter`

**[P1] Four undocumented ad hoc colors are in active use alongside the token system**
- **What**: `text-blue-500` for the dashboard's public/private indicator, `text-red-700/600/800` for delete triggers in three files instead of the documented Alarm token, and `text-green-600` for the "Add Section" icon.
- **Why it matters**: DESIGN.md documents exactly one semantic family (Alarm) and explicitly says not to invent a second. The app has quietly grown a red, blue, and green that aren't in that system — so a contributor reading DESIGN.md to learn "how do I color a destructive action" would write code unlike what already ships (raw `red-700` vs. the `destructive` button variant correctly used for the *confirm* button in the same files).
- **Fix**: Replace the ad hoc reds with the Alarm token, fold the public/private blue into a neutral treatment, and drop the green icon to Ink/Muted Ink.
- **Suggested command**: `/impeccable audit`

**[P2] The Custom Fields section type — a named product differentiator — is silently unreachable from the UI**
- **What**: `forms/add-section.tsx` hard-codes a `return null` for `custom_fields` with a `// TODO: Integrate custom fields form later`, even though the renderer fully supports it and PRODUCT.md names custom fields as part of what differentiates this product from older tools like PolyGlot.
- **Why it matters**: The positioning copy brags about a feature users have no way to actually create — exactly the "promises something but doesn't deliver" pattern a stress-testing user would flag.
- **Fix**: Finish wiring the existing `custom-fields-section-form.tsx` into the picker (the switcher already routes to it), or soften the positioning claim until it's reachable.
- **Suggested command**: `/impeccable clarify`

**[P2] The Clerk sign-in screen is unthemed and breaks dark mode**
- **What**: Signed-out visitors hitting `/dashboard` redirect to `/sign-in`, which renders Clerk's default light-mode card — white background, black text — floating on the app's dark ink background.
- **Why it matters**: This is the exact moment a prospective user judges whether the product feels trustworthy and finished; an unbranded widget here undercuts both product specificity and basic visual consistency.
- **Fix**: Apply Clerk's `appearance` theming API to map its variables to the DESIGN.md ink/paper/mist tokens, matching light/dark mode.
- **Suggested command**: `/impeccable adapt`

## Persona Red Flags

**Homepage — Jordan (First-Timer), Riley (Stress Tester), Casey (Mobile)**
- **Jordan**: "Coming soon" tiles sit at full visual weight next to working features, distinguished only by a small corner badge — easy to mistake for shipped functionality.
- **Riley**: A real public word with zero lexical sections (`/lang/1/?view=lexicon&word=3`, "bunnyi") renders a bare headword and nothing else — no "no content yet" messaging, at the exact moment a stranger is evaluating content quality.
- **Casey**: The mobile search trigger (36px) and the section-editing edit/delete/drag cluster (32px icons packed in a tight row) fall below the 44×44pt touch-target minimum — a thumb on a moving bus mis-taps delete instead of the drag handle.

**Dashboard — Alex (Power User), Sam (Accessibility)**
- **Alex**: No bulk actions, no keyboard shortcuts, and the primary Delete action does nothing (`alert()` stub) — "abandons if anything feels slow or patronizing," except here it's broken, not slow.
- **Sam**: The "View" dropdown item is keyboard-focusable and announces as a real action to a screen reader, but activating it fires an unexplained, unlabeled `alert()` — a jarring system interruption with no indication of what happened.

**Lexicon — Riley (Stress Tester), Sam (Accessibility)**
- **Riley**: Custom Fields renders correctly if data exists but can't be created through any UI path — a feature that "appears to work but silently isn't reachable."
- **Sam**: Edit/delete icon buttons in each section card are absolutely positioned with no consistently visible text label — a keyboard-only user tabs past every drag handle and chevron pair to reach each one, with no skip mechanism.

## Minor Observations

- The homepage's `RecentConlangs` Suspense fallback is a bare blank rectangle — zero loading indication.
- `WordList` renders twice in the DOM simultaneously (desktop `aside` + mobile wrapper), toggled via `hidden`/`sr-only` rather than conditional mounting — harmless visually, but duplicates interactive links in the accessibility tree.
- `/lang` (no id) is a live, reachable route that renders literally `<div>Language Page</div>` with a `// TODO: something` comment — currently unlinked from nav, but a stray inbound link or crawler would surface it as a broken page.
- The `NewConlangForm`'s emoji-validation copy ("Too many emojis. Calm down.") is a genuinely good hobbyist-tone moment worth reusing elsewhere — most other error copy is more clinical.
- Detector-only findings not folded into the priority list above: ~94-char/line paragraph text on the homepage (aim for <80), two containers with no top/bottom inset padding (shared between homepage and `/search`), and a `transition: height` flag present on homepage, `/search`, and `/lang/1` alike (likely a shared component/animation, worth a quick look but not blocking).
- The static CLI detector's clean 0-finding result across 62 source files is not a contradiction with the live findings above — it's a different engine (regex/static-markup vs. live DOM/computed-style) catching a different class of issue; both are legitimate evidence.

## Questions to Consider

- If Signal Orange were pulled back to strictly the wordmark, is Ink-on-Paper (the documented `button-primary`) confident enough for the homepage CTA, or does it need a different kind of emphasis that doesn't reach for color?
- The word/section deletion flow is clearly the app's best-designed destructive-action pattern — why doesn't conlang deletion, the higher-stakes twin of that same action, reuse it yet?
- Is the `// TODO` blocking Custom Fields from the picker a deliberate scope cut, or did it get lost — and should the homepage's positioning copy be softened until it ships?
- Is the app's real color vocabulary (Signal Orange + Alarm + ad hoc red/blue/green) actually what DESIGN.md should document, or is DESIGN.md's stricter two-color system the target the code should be pulled back toward? Right now neither is true, and that ambiguity is producing the consistency findings above.
