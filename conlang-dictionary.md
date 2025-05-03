# Project Overview

**Conlang Dictionary** is a web application for creating, managing, and sharing constructed languages (conlangs). Users can build dictionaries, define grammar and phonology, and collaborate or share their languages with others. The app is designed for conlangers to craft, refine, and showcase their languages with a suite of versatile tools.

**Key Features:**

- Create and manage multiple conlangs, each with its own lexicon and grammar
- Share conlangs publicly or collaborate with others
- Responsive design for desktop and mobile
- (Planned) Rule enforcement, inflection generation, and analytics

**Main Technologies Used:**

- **Next.js** v14.2.28 — React framework for production
- **React** v18.3.1 / **ReactDOM** v18.3.1 — UI library
- **Tailwind CSS** v3.4.3 — Utility-first CSS framework
- **tailwindcss-animate** v1.0.7 — Animation utilities for Tailwind
- **Drizzle ORM** v0.31.4 — TypeScript ORM for PostgreSQL
- **Drizzle Kit** v0.22.8 — Drizzle schema migration tool
- **PostgreSQL** — Relational database (version managed externally)
- **Clerk** v5.7.5 — Authentication and user management
- **Sentry** v7.120.3 — Error tracking and monitoring
- **@tanstack/react-query** v5.32.1 — Data fetching and caching
- **@tanstack/react-table** v8.16.0 — Table utilities
- **@tiptap/react** v2.4.0 — Rich text editor
- **lucide-react** v0.376.0 — Icon library
- **cmdk** v1.0.0 — Command menu component
- **zod** v3.23.4 — TypeScript-first schema validation
- **@t3-oss/env-nextjs** v0.10.1 — Environment variable validation
- **posthog-js** v1.130.0 / **posthog-node** v4.0.1 — Analytics
- **react-hook-form** v7.51.3 — Form state management
- **react-markdown** v10.1.0 — Markdown rendering
- **sharp** v0.33.4 — Image processing
- **TypeScript** v5.4.5 — Type safety
- **ESLint** v8.57.0 — Linting

---

# Database Schema

This section describes the current database schema for the Conlang Dictionary project. The schema is managed using Drizzle ORM and is designed to support conlangs, words, tags, lexical categories, and flexible word sections.

---

## Table Descriptions

### conlangs

- `id` (PK)
- `name` (unique)
- `ownerId`
- `isPublic`
- `description`
- `emoji`
- `createdAt`, `updatedAt`

### words

- `id` (PK)
- `conlangId` (FK → conlangs.id)
- `text`
- `createdAt`, `updatedAt`

### tags

- `id` (PK)
- `text`
- `type` (enum: word, conlang)
- `color` (enum: red, orange, yellow, green, blue, purple, neutral)
- `createdBy`
- `createdAt`, `updatedAt`

### wordsToTags (join table)

- `wordId` (FK → words.id)
- `tagId` (FK → tags.id)
- PK: (wordId, tagId)

### lexicalCategories

- `id` (PK)
- `category`
- `conlangId` (FK → conlangs.id)
- `ownerId`

### wordSections (legacy)

- `id` (PK)
- `wordId` (FK → words.id)
- `title`
- `order`

### customSections (legacy)

- `id` (PK)
- `wordSectionId` (FK → wordSections.id)
- `text`

### definitionSections (legacy)

- `id` (PK)
- `wordSectionId` (FK → wordSections.id)
- `lexicalCategoryId` (FK → lexicalCategories.id)

### definitions (legacy)

- `id` (PK)
- `definitionSectionId` (FK → definitionSections.id)
- `text`

### lexicalSections (new, flexible)

- `id` (UUID, PK)
- `wordId` (FK → words.id)
- `sectionType` (enum: definition, pronunciation, etymology, custom_text, custom_fields)
- `order`
- `properties` (JSONB, see below)
- `createdAt`, `updatedAt`

---

## Notes on `lexicalSections.properties` JSONB

- For `definition`: `{ lexicalCategoryId, definitionText, examples }`
- For `pronunciation`: `{ ipa, audioUrl, region, phonemeIds }`
- For `custom_fields`: `{ customFields: { ... } }`
- For `etymology`: `{ etymologyText }`
- For `custom_text`: `{ title, contentText }`

---

## Enums

- `tagType`: word, conlang
- `tagColor`: red, orange, yellow, green, blue, purple, neutral
- `sectionType`: definition, pronunciation, etymology, custom_text, custom_fields

---

## Relationships

- **conlangs** 1---n **words**
- **words** n---m **tags** (via **wordsToTags**)
- **conlangs** 1---n **lexicalCategories**
- **words** 1---n **lexicalSections**
- (Legacy) **words** 1---n **wordSections** 1---1 **definitionSections** 1---n **definitions**

---

This schema supports both legacy and new flexible section models for word entries. The new `lexicalSections` table is intended to replace the older `wordSections`, `definitionSections`, and `customSections` tables.

# Data Access Layer

- **Where to find query and mutation functions:**

  - All **database queries** (data fetching, "get" functions) are defined in [`src/server/queries.ts`](src/server/queries.ts).
  - All **mutations** (create, update, delete) are now defined in [`src/server/mutations.ts`](src/server/mutations.ts). **All new mutations must be added to this file going forward.** (Not all mutations have been moved yet, but this is the standard for new code.)

- **How to query data:**

  - Uses [Drizzle ORM](https://orm.drizzle.team/) for type-safe SQL queries.
  - Query functions are always asynchronous and return plain objects.
  - Most queries are server-only and enforce authentication where needed (using Clerk).
  - Example:
    ```ts
    // Get all public conlangs
    await db.query.conlangs.findMany({
      where: (c, { eq }) => eq(c.isPublic, true),
    });
    ```

- **How to mutate data:**

  - All mutation logic (create, update, delete) is now in [`src/server/mutations.ts`](src/server/mutations.ts).
  - Mutations require user authentication (`auth()` from Clerk).
  - Example:
    ```ts
    // Create a new conlang (requires auth)
    await createConlang(name, description, emoji, isPublic);
    ```

- **Schema definition:**
  - All table schemas are defined in [`src/server/db/schema.ts`](src/server/db/schema.ts).
  - The Drizzle ORM instance is set up in [`src/server/db/index.ts`](src/server/db/index.ts).

---

# API Layer

- **API routes location:**

  - All API endpoints are in `src/app/api/` (e.g., `conlang/`, `tags/`, `lexical-categories/`, `users/`), each with a `route.ts` implementing REST handlers.

- **Purpose:**

  - API routes provide a stable HTTP interface for client-side code and external integrations, handling validation, auth, and error formatting before calling query/mutation functions.
  - API endpoints (e.g., [`src/app/api/conlang/route.ts`](src/app/api/conlang/route.ts)) call into the query/mutation functions for all DB access.
  - Input validation is handled with [zod](https://zod.dev/) schemas before calling query/mutation functions.

- **Current usage:**

  - The app uses API routes for most client-side data access and mutations (via React Query or fetch), but uses direct DB queries in server components for server-side rendering.

- **Best practices to move toward:**
  - Prefetch data in server components and hydrate it for React Query in client components to flatten request waterfalls and improve performance ([TanStack Query Advanced SSR Guide](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)).
  - Use direct DB queries in server components for initial loads; use API routes for client-side interactivity and live updates.

# Frontend Architecture

- **App structure:**

  - Uses Next.js App Router (`src/app/`) with a mix of server and client components.
  - Main layout (`src/app/layout.tsx`) is a server component; global providers (React Query, theming, analytics) are set up in a client component (`src/app/providers.tsx`).

- **Component organization:**

  - Shared/layout components: `src/app/_components/` (e.g., navigation, footer).
  - Feature-specific components: within feature folders (e.g., `src/app/dashboard/_components/`, `src/app/lang/_components/lexicon/`).
  - Reusable UI primitives ([shadcn](https://ui.shadcn.com/docs) components): `src/components/ui/` (e.g., buttons, forms, dialogs).
  - Icons ([heroicons](https://heroicons.com/)): `src/components/icons/`.

- **State and data fetching:**
  - Server components fetch data directly for initial page loads.
  - Client components use React Query for client-side data fetching, caching, and mutations.
  - Providers for React Query and theming are set up in `src/app/providers.tsx` and injected at the root.

# Auth & Permissions

- **Current authentication:**

  - Uses [Clerk](https://clerk.com/) for authentication.
  - Server components and API routes check authentication status and get the current user ID via `auth()` from Clerk.
  - Middleware (`src/middleware.ts`) enforces authentication for all `/dashboard` routes and restricts `/admin` routes to users with the `org:admin` role.

- **Permissions and access control:**

  - Access to non-public conlangs is restricted:
    - On fetch, if a conlang is not public, the server checks if the current Clerk user ID matches the `ownerId` field on the conlang.
    - Mutations (create, update, delete) require the user to be authenticated and, for updates/deletes, to be the owner.
  - All permission checks are enforced in server-side query functions and API routes.
  - Middleware ensures only signed-in users can access the dashboard UI.

- **Current user model:**

  - The app uses Clerk user IDs directly as the `ownerId` for conlangs and other resources.
  - User data (beyond Clerk) is not currently stored in a local database table.

- **Improvements needed:**
  - Move away from using Clerk user IDs directly for ownership and permissions.
  - Add a local `users` table to store app-specific user data and relationships.
  - Implement ownership and permission checks based on the local user table for more flexible and robust access control.

# Coding Standards & File Organization

- **File and folder naming:**

  - Uses `kebab-case` for files and folders (e.g., `edit-word.tsx`, `add-definition-section.tsx`).
  - Feature folders are nested by route and function (e.g., `src/app/lang/_components/lexicon/`).
  - Dynamic routes use `[param]` syntax (e.g., `src/app/lang/[id]/page.tsx`).

- **Component and hook organization:**

  - Feature-specific components are grouped in subfolders (e.g., `lexicon/` for lexicon-related components).
  - Custom hooks are placed in a `hooks/` subfolder within the relevant feature (e.g., `lexicon/hooks/useSortableSections.ts`).
  - Components are defined in their own files, named after the component (e.g., `edit-word.tsx` for `EditWord`).

- **Action and utility files:**

  - Server actions are grouped in `_actions/` folders and use descriptive function names (e.g., `createWord`, `editWordSection`).
  - Action files export async functions for mutations and CRUD operations, and may define related TypeScript interfaces.

- **Component style:**

  - Components are typically function components, using named exports.
  - File names match the main export for clarity.

- **General standards:**
  - TypeScript is used throughout for type safety.
  - Imports use absolute paths (with `~` alias) for clarity.
  - UI primitives and icons are imported from centralized locations (`src/components/ui/`, `src/components/icons/`).

---

# Glossary

- **Conlang**: A constructed language; an intentionally created language, often for artistic, experimental, or fictional purposes.
- **Lexicon**: The vocabulary of a language; a collection of words and their meanings.
- **Word**: The basic unit of the lexicon, representing a single concept or item in the language.
- **Definition**: An explanation of the meaning of a word.
- **Lexical Category**: A grammatical category (e.g., noun, verb, adjective) that a word belongs to.
- **Section**: A modular part of a word entry, such as definition, pronunciation, etymology, or custom notes.
- **Etymology**: The origin and historical development of a word.
- **Pronunciation**: The way a word is spoken, often represented in IPA (International Phonetic Alphabet).
- **Tag**: A label used to categorize or group words or conlangs for easier searching and filtering.
- **Custom Section**: A user-defined section for additional notes or information about a word.
- **Inflection**: A change in the form of a word to express grammatical features such as tense, mood, voice, aspect, person, number, gender, or case.
- **Phonology**: The system of sounds in a language, including their organization and rules.
- **Grammar**: The set of structural rules governing the composition of clauses, phrases, and words in a language.

---
