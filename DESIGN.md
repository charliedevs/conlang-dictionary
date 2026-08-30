---
name: Conlang Dictionary
description: A modern, mobile-first reference shelf for building and sharing constructed languages.
colors:
  signal-orange: "#ff5600"
  paper: "hsl(210, 40%, 98%)"
  ink: "hsl(222.2, 47.4%, 11.2%)"
  surface: "hsl(0, 0%, 100%)"
  surface-ink: "hsl(222.2, 84%, 4.9%)"
  mist: "hsl(210, 40%, 96.1%)"
  mist-ink: "hsl(222.2, 47.4%, 11.2%)"
  muted-ink: "hsl(215.4, 16.3%, 46.9%)"
  hairline: "hsl(214.3, 31.8%, 91.4%)"
  focus-ring: "hsl(222.2, 84%, 4.9%)"
  alarm: "hsl(0, 84.2%, 60.2%)"
  alarm-ink: "hsl(210, 40%, 98%)"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  input-default:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
    height: "2.5rem"
---

# Design System: Conlang Dictionary

## Overview

**Creative North Star: "The Modern Reference Shelf"**

Conlang Dictionary reads as the reference work it's trying to become: the structural seriousness of Wiktionary — categorized definitions, pronunciation, etymology, custom fields, all per word — rebuilt for a screen a hobbyist actually wants to open on their phone. The system is quiet by design: a near-monochrome slate-and-paper surface carries almost all of the interface, so that the one saturated color in the whole app — Signal Orange — reads as a mark, not decoration. Nothing about the visual language claims more finish than the product has; this is an honest early-alpha reference tool, not a polished consumer product wearing a Wiktionary costume.

Mobile-first is structural, not cosmetic: the top nav collapses its search field into an icon button under `md`, the homepage feature grid drops from three columns to one, and layout decisions default to stacking before they default to arranging side-by-side.

**Key Characteristics:**
- Cool, low-saturation slate/paper neutrals carry ~95% of every screen
- One warm, saturated accent (Signal Orange) used only for brand marks and rare emphasis — never for general UI chrome
- Flat surfaces, hairline borders instead of shadows — depth comes from background-color steps (paper → mist → ink), not elevation
- Heroicons-style 1.5px outline icons for editorial/marketing content, Lucide icons for functional UI controls
- Mobile-first responsive rules throughout, not a desktop layout patched down

## Colors

The palette is almost entirely a cool, low-chroma slate scale; color is spent on exactly one thing.

### Primary
- **Signal Orange** (`#ff5600`): The brand mark. Used to tint the product name in the homepage headline and to color a translucent alpha-warning banner background. This is the only saturated hue in the system — it should stay rare. It is not used for buttons, links, or general interactive chrome; those are carried by the ink/paper neutrals below.

### Neutral
- **Paper** (`hsl(210, 40%, 98%)`): Page background (light mode); also the text/foreground color used *on* dark ink surfaces (e.g. primary-button text).
- **Ink** (`hsl(222.2, 47.4%, 11.2%)`): Body text color, and — inverted — the fill color of primary buttons and the default page background in dark mode. Ink and Paper are a matched swap pair across light/dark.
- **Surface** (`hsl(0, 0%, 100%)`) / **Surface Ink** (`hsl(222.2, 84%, 4.9%)`): Card, popover, and table-wrapper background/text — a step whiter than Paper in light mode, for content that should read as "raised" without a shadow.
- **Mist** (`hsl(210, 40%, 96.1%)`): Secondary/muted/accent-role background — feature tiles on the homepage, hover states, badges. Text on Mist uses Ink.
- **Muted Ink** (`hsl(215.4, 16.3%, 46.9%)`): De-emphasized text — helper copy, metadata, unselected list items, footer text.
- **Hairline** (`hsl(214.3, 31.8%, 91.4%)`): Borders and dividers — the nav's bottom border, input strokes, table rules.
- **Focus Ring** (`hsl(222.2, 84%, 4.9%)`): The `focus-visible` ring color on all interactive controls.

### Semantic
- **Alarm** (`hsl(0, 84.2%, 60.2%)` / text `hsl(210, 40%, 98%)`): Destructive actions only (delete confirmations, destructive buttons). Not used for warnings.
- Ad hoc in-product notices (e.g. the lexicon-format notice) currently reach outside this token system to raw Tailwind `yellow-50/300/900`, not a themed token. Treat this as a gap to fold into the token system on the next notice/alert component pass, not a second sanctioned semantic family.

### Named Rules
**The One Mark Rule.** Signal Orange appears in at most one or two places per screen — a wordmark, a single banner tint. If a screen has more than one orange element competing for attention, that's a violation, not a stylistic choice.

## Typography

**Body & Display Font:** Inter (with `ui-sans-serif, system-ui, sans-serif` fallback) — a single typeface for the whole system, no serif or mono pairing.

**Character:** One workhorse grotesque carrying both the marketing headline and the densest table cell. Weight and size do the differentiating work instead of a second typeface — display leans heavy and tight (`font-extrabold`, `tracking-tight`), UI text stays light and unadorned.

### Hierarchy
- **Display** (800, `clamp(2.5rem, 6vw, 4rem)`, line-height 1.05, tracking -0.02em): Homepage hero headline only.
- **Title** (500, 1.5rem/24px, line-height 1.3): Section and entity titles — a word's headword in the lexicon view, dashboard headers.
- **Body** (400, 0.875rem/14px, line-height 1.5): Default UI text — table cells, form fields, nav links, most copy.
- **Body — loose** (500, 1rem–1.25rem, tracking-wide): The homepage's persuasive lede paragraph steps up in size and adds letter-spacing; reserve this heavier/wider body treatment for marketing copy, not app chrome.
- **Label** (500, 0.75rem/12px): Metadata, search-result counts, footer links, badge text.

## Layout

Centered container (`max-width: 1400px` at the `2xl` breakpoint, `2rem` side padding), otherwise fluid. The dominant responsive pattern is **swap, not shrink**: the top-nav search field becomes an icon-triggered control below `md` rather than compressing in place, and the homepage feature grid steps `1 → 2 → 3` columns at `sm`/`md`. The lexicon page is a two-pane layout (scrollable word list + word detail) that is expected to stack on narrow viewports given the mobile-first commitment, even where current screens haven't fully executed it yet.

Vertical rhythm leans on `gap`/`p-4`–`p-6` (1rem–1.5rem) for grouped content and `p-6` to `py-16` for page-level breathing room; the top nav is `sticky top-0` and persists across scroll.

## Elevation & Depth

Currently flat: no `box-shadow` anywhere in the codebase. Depth is conveyed purely by background-color steps (Paper → Mist → Surface → Ink) and hairline borders — a table wrapper sits on `Surface` at 80% opacity over `Paper`, a feature tile sits on `Mist` over `Paper`, and that contrast alone reads as "raised."

This is an **unreviewed default inherited from shadcn/ui**, not a confirmed invariant — a future `polish` or `bolder` pass is free to introduce restrained shadow or elevation language if it earns its place. Don't treat "no shadows" as a rule to defend; treat it as the current state.

## Shapes

Radius scale is small and consistent: `4px` / `6px` / `8px` (`sm`/`md`/`lg`, all derived from a single `--radius: 0.5rem` root value) for buttons, inputs, and hairline-bordered containers, stepping up to `12px` (`rounded-xl`, plain Tailwind default) for larger marketing-style content blocks — homepage feature tiles, the alpha-warning banner. Avatars/logos are fully circular (`rounded-full`) with a 1px outline ring. No sharp corners, no aggressively pill-shaped controls; corners are gently softened throughout, never a design statement in themselves.

## Components

### Buttons
- **Shape:** `rounded-md` (6px), `h-10` default / `h-9` small / `h-11` large / `h-10 w-10` icon-only.
- **Primary (`default`):** Ink background, Paper text — an inverted-ink button, not a colored one. Hover drops to 90% opacity of the same fill; no hue shift.
- **Destructive:** Alarm background, Alarm-ink text — reserved for irreversible actions.
- **Outline:** Hairline border, Paper background, Mist background on hover.
- **Secondary:** Mist background, Ink text, deepens toward `Mist/80%` on hover.
- **Ghost:** Transparent at rest, Mist background on hover — used for low-emphasis icon actions (e.g. "Edit" on a word).
- **Link:** No fill; Ink text with underline-on-hover.
- **Focus:** 2px Focus Ring with 2px offset on every variant, `focus-visible` only.

### Cards / Containers
There is no dedicated Card primitive; the same effect is composed ad hoc from color + radius:
- **Feature tiles / grouped content** (e.g. homepage feature grid): `Mist` background, `rounded-xl` (12px), `p-6` internal padding, no border.
- **Table wrapper**: `Surface` at 80% opacity, no border, relies on the `DataTable` component's own row hairlines.
- **Alert / notice banners**: currently step outside the token system (raw `yellow-50/300/900`), `rounded-md`, bordered, icon + text + dismiss action.

### Inputs / Fields
- **Style:** `h-10`, `rounded-md`, Hairline border, Paper background, `text-sm`.
- **Adornments:** supports an inline trailing icon and/or an inline ghost-button (the search box's "search" affordance lives inside the field, not beside it).
- **Focus:** same 2px Focus Ring treatment as buttons.
- **Disabled:** 50% opacity, `cursor-not-allowed`.

### Navigation
`sticky top-0`, `Paper` background, single `Hairline` bottom border, no shadow. Logo is a circular avatar-style image (36px mobile / 48px desktop) with a 1px outline; wordmark sits beside it as bold text (`text-sm` mobile → `text-xl` desktop). Search collapses from an inline field to an icon-triggered control below `md`. Right-aligned cluster: search → auth state (sign-in button or user menu) → dark-mode toggle.

### Icons
Two deliberate families, not a mixing accident: **Lucide** for functional UI chrome (edit, warning, dropdown affordances), and a **hand-authored Heroicons-outline set** (`1.5` stroke width, `currentColor`, `24×24` viewBox) for editorial/marketing content like the homepage feature grid. Keep that split — don't introduce a third icon library.

## Do's and Don'ts

### Do:
- **Do** keep Signal Orange to one or two touches per screen (see The One Mark Rule).
- **Do** default new layouts to stacked/mobile behavior first, then widen — this product's mobile-first commitment is a product principle, not just a media query habit.
- **Do** use background-color steps (Paper/Mist/Surface/Ink) to convey grouping and depth before reaching for a shadow.
- **Do** keep marketing/editorial icon needs on the hand-authored Heroicons-outline set, and functional UI icon needs on Lucide.

### Don't:
- **Don't** use Signal Orange as a general interactive color (links, buttons, active states) — it is a brand mark, not a UI accent.
- **Don't** add drop shadows reflexively; the system is currently flat by (unconfirmed) default — introducing elevation is a deliberate design decision for a future pass, not a one-off.
- **Don't** present incomplete or "coming soon" functionality (e.g. rule enforcement, inflection generation) with the same visual finish as shipped features — the product is genuinely early-alpha and the UI shouldn't oversell it.
- **Don't** invent a second semantic-alert color family beyond Alarm; fold the existing yellow-notice pattern into the token system rather than adding a third ad hoc one.
