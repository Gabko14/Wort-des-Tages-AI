# AGENTS.md

Guidance for Claude Code (claude.ai/code) and other ai agents when working in this repository. Propose updates to AGENTS.md as the project evolves.

## Project Overview

German "Word of the Day" mobile app built with Expo Router (React Native). Displays daily vocabulary words from a bundled SQLite database (DWDS). Premium users get AI-enriched word definitions via Supabase Edge Functions.

## Mission

Sprache als Werkzeug für Präzision, Überzeugung und Eloquenz schärfen.

## Zielgruppe

Menschen mit guten Deutschkenntnissen, die Sprache als Wettbewerbsvorteil nutzen wollen – um präziser zu denken, besser zu überzeugen und eloquenter aufzutreten.

## Non-Negotiables

- **Offline-first must always work**: the local word database and basic app flow must function without network.
- **Services throw, UI catches**: services never show UI, never `Alert.alert`, never navigate.
- **No new dependencies by default**: add libs only when there is a clear, documented reason and a small API surface.

## Commands

```bash
npm test               # Run Jest tests
npm run lint           # Check for linting errors
npm run type-check     # TypeScript validation

# Supabase
npm run supabase:link:dev   # Link CLI to development project
npm run supabase:link:prod  # Link CLI to production project
npm run supabase:push       # Apply migrations to linked project
npm run supabase:deploy     # Deploy Edge Functions to linked project
npm run supabase:status     # Show currently linked project
```

## Architecture

### Data Flow

1. **Local SQLite** (`assets/database/dwds.db`) - bundled vocabulary database copied to `FileSystem.documentDirectory` on first launch
2. **Services Layer** (`services/`) - singleton DB connection, all data access via async functions
3. **Supabase Backend** - Edge Functions for AI enrichment and premium entitlements
4. **AsyncStorage** - user settings, premium status cache, AI response cache

### Project Structure

```
/app              - Expo Router screens (file-based routing)
/components       - Reusable React components (named exports)
/services         - Business logic & data access (throw errors)
/hooks            - Custom React hooks (UI logic)
/config           - Supabase client, Toast customization
/constants        - Colors, Layout, Fonts
/types            - TypeScript type definitions
/assets           - Images, Fonts, bundled DB
/utils            - Error handling utilities (AppError)
/supabase
  /functions      - Deno Edge Functions (ai-enrich, check-entitlement, grant-premium)
  /migrations     - Database migrations for Supabase
```

### Key Services

- `database.ts` - Singleton SQLite connection, `Wort` and `WortDesTages` types
- `wordService.ts` - Daily word generation with settings-based filtering
- `settingsService.ts` - AsyncStorage-backed user preferences
- `premiumService.ts` - Premium status checking via Supabase (throws on failure), cached locally
- `aiService.ts` - AI word enrichment with caching/retry (throws on failure)

### Premium/AI System

- Device-based entitlements stored in Supabase `entitlements` table
- `ai-enrich` Edge Function calls OpenAI for word definitions
- Services throw typed `AppError` on failures; UI decides fallback behavior
- AI responses cached in AsyncStorage by word IDs

## Error Handling

Services throw typed `AppError` (see `utils/appError.ts`). Screens catch and decide recovery/messaging.

### User Feedback Pattern

```typescript
catch (err) {
  if (!__DEV__) Sentry.captureException(err, { tags: { feature: 'x' }, level: 'error' });
  Toast.show({ type: 'error', text1: 'Title', text2: 'Message' });
}
```

Never use `Alert.alert` or `console.error` for user feedback. Use `asAppError()` at service boundaries to normalize errors.

## Code Patterns

### Database Access

Always use `getDatabase()` singleton. Keep SQL in services, not components. Use parameterized queries.

```bash
sqlite3 assets/database/dwds.db  # for direct database inspection or manual edits
```

**Tables:** `wort` – 258k words with lemma, wortklasse, frequenzklasse (0=rare, 6=common), DWDS URL

### Component Exports

- **Named exports** for components: `export function WordCard()`
- **Default exports** only for screens (Expo Router requirement)

### Navigation

Use Expo Router paradigms (`<Link>`, `router.push()`, `useLocalSearchParams`). Don't use React Navigation props directly. Parse route params as strings at the screen boundary.

### Hooks and State

Keep screens thin: compose hooks + components, call services inside hooks/effects. Prefer derived state.

### Caching Strategy

AsyncStorage for small JSON only. Cache keys should be stable and descriptive:

- Pattern: `enriched_words_${sortedWordIds.join('-')}`
- Define invalidation rules (TTL or version bump)
- Premium status cache: short TTL, revalidate often

### Supabase Edge Functions

Edge Functions use Deno runtime with ESM imports. Located in `supabase/functions/`.

- Validate inputs server-side, return `400` for invalid payloads
- Verify entitlements server-side (never trust the client)
- Shape output; don't return raw OpenAI responses
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client

### Supabase Multi-Project Setup

We use two separate Supabase projects to isolate production from development/preview:

| Environment | Project Ref            | Usage                   |
| ----------- | ---------------------- | ----------------------- |
| Production  | `otiioifscvmgcsywiarz` | Live app, real users    |
| Development | `dclszvpstwnkzqfjvxwa` | Local dev, EAS previews |

**Switching Projects:**

```bash
npm run supabase:link:prod   # Link to production
npm run supabase:link:dev    # Link to development
```

**Deploying Changes:**

```bash
# 1. Link to target project
npm run supabase:link:dev

# 2. Push database migrations
npm run supabase:push

# 3. Deploy Edge Functions
npm run supabase:deploy
```

**Important Workflow Rules:**

1. **Always deploy to dev first** — test migrations and functions before touching production
2. **Migrations are append-only** — never edit existing migration files; create new ones
3. **Edge Function secrets are per-project** — set `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, etc. in each project's dashboard
4. **Client credentials differ per environment** — update `.env.local` with the correct project's URL and anon key when switching

**Creating New Migrations:**

```bash
npx supabase migration new <descriptive_name>
# Edit the generated file in supabase/migrations/
npm run supabase:push  # Apply to currently linked project
```

**CI/CD Automation:**

Supabase deployments are fully automated via GitHub Actions:

| Trigger                | Target       | Workflow                               |
| ---------------------- | ------------ | -------------------------------------- |
| PR / non-main branch   | Dev project  | `ci.yml` (only if `supabase/` changed) |
| Version tag (`v*.*.*`) | Prod project | `eas-build.yml` (before EAS build)     |

For local testing before pushing, use `npm run supabase:link:dev` + `npm run supabase:push`.

## Performance

### Lists

Prefer `<FlashList>` for long lists. If using `<FlatList>`, apply standard virtualization optimizations. Avoid `<ScrollView>` with `.map()` for dynamic data.

### Images

Use `expo-image` over React Native's `Image` when adding network images.

### General

Debounce expensive text input operations. Keep Edge Function payloads small. Persist "word of the day" with date key instead of recomputing. Use cached AI responses when valid.

## Styling & UI

Use `StyleSheet.create`. Respect safe areas. Handle loading/empty states. Test on multiple screen sizes.

## TypeScript

Strict typing, no `any`, no silent casts. Use generics in DB calls: `db.getAllAsync<Wort>(...)`.

## Security & Privacy

| Data Type                  | Storage             | Notes                  |
| -------------------------- | ------------------- | ---------------------- |
| User preferences, UI state | AsyncStorage        | Fine for non-sensitive |
| Auth tokens, API keys      | `expo-secure-store` | Install when needed    |
| Premium status cache       | AsyncStorage        | Just UX optimization   |
| Payment info               | Never store locally | Server-side only       |

Edge Functions must enforce entitlement checks; client checks are only for UX. Never log tokens.

## Testing

Unit test service logic. Mock SQLite and Supabase at the boundary. Mock `Date` for determinism.

## Environment Variables

Required in `.env.local`:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Edge Functions require (set in Supabase dashboard):

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## Workflow Guidelines

### When Editing

Keep changes small and focused. Update types alongside implementation. Don't change service signatures without updating callers and tests.

### When Adding Features

Add service method → hook → UI. Define failure modes and offline fallback upfront. Don't make premium a hard dependency for core app flow.

### Before Finishing

```bash
npm run lint
npm run type-check
npm test  # when relevant
```

Confirm:

- [ ] App works offline
- [ ] Missing Supabase config disables premium/AI gracefully
- [ ] No new warnings or noisy logs
- [ ] Types complete (no `any` or errors)
