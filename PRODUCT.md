# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two user tiers, both served by the same tool:

- **Casual conlangers** — want to document their constructed language: build a lexicon, write definitions, tag and organize words.
- **Pro/serious conlangers** — build a full phonological inventory with phonotactic rulesets, and a grammar database with generative morphology (declensions, conjugations, exceptions).

Community context: the project is rooted in the LangTime Studio conlanging community (credited in the README), so users are likely to already know conlanging terminology and workflows from that space.

## Product Purpose

A web app to store, build, and share constructed languages (conlangs): lexicon, phonology, and grammar in one place, with public sharing/collaboration on top.

## Positioning

A flexible, modern, web-based lexicon and dictionary builder — free and actively maintained (Next.js), with a flexible per-word section model (definitions, pronunciation, custom fields, etc.) that older desktop-era conlang tools (e.g. PolyGlot) don't match. Public sharing/discovery of conlangs is part of the product, not bolted on.

## Operating Context

**Content and interaction standard: replicate Wiktionary's functionality** (multi-section word entries: definitions by lexical category, pronunciation/IPA, etymology, examples, custom fields) — that is the bar for depth and completeness. But presentation must be more polished than Wiktionary's plain/dense layout, and the experience is **mobile-first**, not desktop-reference-site-first the way Wiktionary is.

Core workflows: create/manage a conlang → build its lexicon (add words, definitions, tags, custom sections) → build phonology (phonemic inventory, phonotactic rules — planned) → build grammar (create and browse lexical categories and the words in each — live; rules and generative morphology/inflection — planned) → share the conlang publicly or collaborate with others.

## Capabilities and Constraints

- Auth via Clerk; conlangs have an owner and an `isPublic` flag for sharing.
- Data model (Drizzle/Postgres) already supports: conlangs, words, tags (word/conlang-scoped, colored), lexical categories, and a flexible `lexicalSections` model per word (definition, pronunciation, etymology, custom_text, custom_fields) that is replacing an older fixed word/definition-section schema.
- Planned, not yet built: phonotactic rule enforcement (with warnings when a word breaks a rule) and generative inflection (regular declension/conjugation patterns with manual exceptions).
- Responsive design across desktop/tablet/mobile is an explicit product requirement, with mobile-first priority.

## Brand Commitments

- Name: Conlang Dictionary. Acknowledges/credits the LangTime Studio community (Jessie Peterson, David Peterson) as originating inspiration — keep that attribution.
- **Early alpha status is real, not a false-modesty banner**: the homepage explicitly warns the site is in early development. Design and copy should stay honest about incompleteness rather than presenting unfinished areas as polished/complete.
- Free and open-source under GPLv3 (per LICENSE) — no paywalled core-feature framing.

## Evidence on Hand

- Homepage (`src/app/page.tsx`) already states positioning copy ("Build and share your conlangs... Craft the phonology, lexicon, and grammar...") and lists features, including two marked "Coming soon": rule enforcement ("Set Rules") and inflection generation ("Generate inflections"). Treat those as real planned features, not to be built without a separate design pass, but safe to reference as roadmap.
- No testimonials, customer logos, press, or usage benchmarks exist — do not fabricate any.

## Product Principles

1. Match Wiktionary's depth of structured word data, but present it with modern, mobile-first polish Wiktionary itself doesn't have.
2. Serve casual documentation and pro-level linguistic modeling (phonology/grammar) as one continuum, not two separate products.
3. Sharing and collaboration are core, not an add-on — conlangs are meant to be shown, not just privately stored.
4. Stay honest about alpha status; don't let visual polish imply more completeness than the product has.
5. Free/open-source and community-rooted (LangTime Studio) — the tone should stay approachable to hobbyists, not enterprise-flavored.
