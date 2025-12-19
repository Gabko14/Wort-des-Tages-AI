# CLAUDE.md (now AGENTS.md)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

German "Word of the Day" mobile app built with Expo Router (React Native). Displays daily vocabulary words from a bundled SQLite database (DWDS). Premium users get AI-enriched word definitions via Supabase Edge Functions.

## Non-Negotiables

- **Offline-first must always work**: the local word database and basic app flow must function without network.
- **Services throw, UI catches**: services never show UI, never `Alert.alert`, never navigate.
- **Type safety over speed**: no `any`, no silent `as unknown as X` casts to "make it compile".
- **No new dependencies by default**: add libs only when there is a clear, documented reason and a small API surface.

## Commands

```bash
npm test           # Run Jest tests
npm run lint       # Check for linting errors
npm run lint:fix   # Auto-fix linting/formatting
npm run type-check # TypeScript validation
npx expo install   # Install dependencies with version alignment
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

### Rule of Thumb

- **Services throw, UI catches**: service functions should throw a typed `AppError` (see `utils/appError.ts`) and let screens/components decide how to recover or show messaging.
- **Never leave promises unhandled**: use `await` + `try/catch`, or attach `.catch()` for "fire-and-forget" calls.
- **Render-time failures**: rely on Expo Router's error boundary (`app/_layout.tsx`) as a last-resort recovery screen.

### User Feedback & Error Tracking

- **User feedback**: Toast notifications (`config/toastConfig.tsx`), never `Alert.alert` or `console.error`
- **Production tracking**: Sentry in `app/_layout.tsx`, wrap all catch blocks:

  ```typescript
  catch (err) {
    if (!__DEV__) Sentry.captureException(err, { tags: { feature: 'x' }, level: 'error' });
    Toast.show({ type: 'error', text1: 'Title', text2: 'Message' });
  }
  ```

Wrap unknown errors at boundaries:

- **Service boundary**: convert raw errors → `AppError` using `asAppError()`
- **UI boundary**: convert `AppError` → user-friendly message + fallback (cached/offline/disabled)

### Supabase Config Behavior

- In development (`__DEV__`), missing `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` throws at startup.
- In production builds, missing Supabase config disables premium/AI features (app should still run offline for the local word database).

## Code Patterns

### Database Access

Always use `getDatabase()` singleton, never create new connections:

```typescript
import { getDatabase, Wort } from '@/services/database';

const db = await getDatabase();
// Use generic for type safety
const words = await db.getAllAsync<Wort>('SELECT * FROM wort WHERE id = ?', [id]);
```

**Do:**

- Use parameterized queries (no string interpolation for user-controlled values)
- Keep SQL in services, not in components
- Return domain objects (typed) rather than raw rows when logic grows

**Don't:**

- Run heavy queries on every render
- Store DB rows directly in global state without shaping/normalizing

### Component Structure

Use named exports and `StyleSheet.create`:

```typescript
import { StyleSheet, View, Text } from 'react-native';

interface WordCardProps {
  word: string;
  definition: string;
}

export function WordCard({ word, definition }: WordCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{word}</Text>
      <Text style={styles.body}>{definition}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold' },
  body: { fontSize: 14, color: '#333' },
});
```

### Component Exports

- **Named exports** for reusable components: `export function WordCard()`
- **Default exports** only for screens (Expo Router requirement): `export default function HomeScreen()`

### Path Alias

Use `@/` for all non-relative imports:

```typescript
import { WordCard } from '@/components/WordCard';
import { Wort } from '@/services/database';
```

### Expo Router & Navigation

**Do:**

- Use typed routes (`Href<T>`) for navigation safety
- Use `<Link href="/path" />` for static navigation links (better accessibility)
- Use `router.push()` or `router.replace()` only inside event handlers or callbacks
- Use `useLocalSearchParams` for accessing route parameters
- Use route params as strings and parse/validate them at the screen boundary

**Don't:**

- Use React Navigation props (`navigation.navigate`) directly; stick to Expo Router paradigms
- Depend on implicit navigation state to compute data (make it explicit via params)

### Hooks and State

**Do:**

- Keep screens thin: compose hooks + components, call services inside hooks/effects
- Use `useMemo`/`useCallback` only when there is a measurable reason (avoid cargo-cult memoization)
- Prefer derived state over duplicated state
- Use strict dependency arrays in `useEffect` and `useCallback`

**Don't:**

- Put network/DB calls directly in render
- Store "computed" values in state unless needed for user interaction

### Caching Strategy

- **AsyncStorage** is for small JSON and caches only (not large datasets)
- Cache keys should be stable and descriptive:
  - Current pattern: `enriched_words_${sortedWordIds.join('-')}`
- Always define invalidation rules:
  - TTL for AI responses (or manual invalidation version bump)
  - Premium status cache should have a short TTL and be revalidated

### Supabase Edge Functions

The Supabase CLI is not set up. The `supabase/` folder is reference code only. Use the Supabase MCP tools to deploy Edge Functions and apply migrations.

Edge Functions use Deno runtime with ESM imports. Located in `supabase/functions/`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  // Validate inputs, return 400 for invalid payloads
  return new Response(JSON.stringify({ data: '...' }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Do:**

- Validate inputs (JSON schema or manual checks) and return `400` for invalid payloads
- Verify auth/entitlements server-side (never trust the client)
- Add basic rate limiting / abuse controls where feasible
- Shape output; don't return raw OpenAI responses with unnecessary metadata

**Don't:**

- Expose `SUPABASE_SERVICE_ROLE_KEY` to the client (ever)
- Log secrets or full request payloads that may contain identifiers

## Performance

### Lists

For long or dynamic lists, use virtualized list components:

- **Prefer `<FlashList>`** (from `@shopify/flash-list`) when needed - significantly faster than FlatList. Install it when list performance becomes an issue.
- If using `<FlatList>`, optimize with these props:

```typescript
<FlatList
  data={words}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  getItemLayout={getItemLayout}      // Pre-calculate item sizes
  initialNumToRender={10}            // Reduce initial render count
  maxToRenderPerBatch={5}            // Control batch rendering
  windowSize={5}                     // Limit items in memory
  removeClippedSubviews={true}       // Free memory for off-screen items
/>
```

- Avoid `<ScrollView>` with `.map()` for large dynamic lists (acceptable for small, fixed-size lists)

### Images

When adding network images, prefer `expo-image` over React Native's built-in `Image` (better caching/performance). Install it when needed:

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  style={{ width: 200, height: 200 }}
  contentFit="cover"
  placeholder={blurhash}
  transition={200}
/>
```

### General

**Do:**

- Use `keyExtractor` with stable unique IDs (never array index)
- Debounce expensive operations triggered by text input
- Keep JSON payloads small (especially from Edge Functions)
- Define styles with `StyleSheet.create` outside components

**Don't:**

- Use inline functions in `renderItem` (recreated every render)
- Use inline style objects for complex styles (performance penalty)
- Recompute "word of the day" on every app start if it can be persisted with a date key
- Fetch AI enrichment repeatedly when a cached value exists and is valid
- Leave `console.log` in production code

## Styling & UI

**Do:**

- Respect platform safe areas (use safe area components where needed)
- Ensure touch targets are large enough (minimum 44x44 points) and accessible
- Use loading skeletons/spinners for async states; always handle empty states
- Test on both small and large screens

**Don't:**

- Block the UI thread with heavy computation in render
- Assume a single device size

## TypeScript Rules

**Do:**

- Use strict typing for all props and state
- Use `interface` for object shapes, `type` for unions/intersections
- Define children explicitly: `children: React.ReactNode`
- Use generics in database calls: `db.getAllAsync<Wort>(...)`

**Don't:**

- Use `any` - use `unknown` if necessary and narrow the type
- Use silent `as unknown as X` casts to bypass type errors

## Security & Privacy

### Sensitive Data Storage

| Data Type                  | Storage                | Notes                                                   |
| -------------------------- | ---------------------- | ------------------------------------------------------- |
| User preferences, UI state | AsyncStorage ✅        | Unencrypted, fine for non-sensitive                     |
| Auth tokens, API keys      | `expo-secure-store` ✅ | Encrypted, uses Keychain/Keystore (install when needed) |
| Premium status cache       | AsyncStorage ✅        | Not sensitive, just UX optimization                     |
| Passwords                  | `expo-secure-store` ✅ | Or don't store at all (install when needed)             |
| Payment info               | Never store locally ❌ | Handle server-side only                                 |

### General Rules

- Treat device identifiers and entitlement tokens as sensitive
- Edge Functions must enforce entitlement checks; client checks are only for UX
- Never print private tokens in logs; be careful with `console.log` in production
- Avoid storing anything in AsyncStorage that would be harmful if extracted

## Testing

**Do:**

- Unit test service logic (word selection, filtering, caching, error mapping)
- Mock SQLite and Supabase clients at the boundary
- Prefer deterministic tests (avoid time-based flakiness; mock `Date` when needed)
- Test behavior, not implementation details

**Don't:**

- Snapshot-test large UI trees unless there is a strong reason
- Leave tests that depend on real network or timing

## Environment Variables

Required in `.env.local`:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Edge Functions require (set in Supabase dashboard):

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## CI/CD

- Push/PR → CI runs (Lint, Tests, Type-Check)
- Tag `v*.*.*` → New APK build via GitHub Actions
- OTA updates can be done manually with `eas update --branch preview`

---

## Workflow Guidelines

### When Editing Code

**Do:**

- Keep changes small and focused; avoid drive-by refactors
- Update types alongside implementation
- Prefer explicitness over cleverness (readability wins)

**Don't:**

- Change public function signatures in services without updating all callers and tests
- Introduce new global singletons beyond the existing service patterns

### When Adding a New Feature

**Do:**

- Add a service method first, then a hook, then UI
- Define failure modes and offline fallback upfront
- Add analytics/logging only if it is privacy-safe and actionable

**Don't:**

- Build features that require login if the product model is device-entitlement based
- Make premium a hard dependency for the core app flow

### Before Finishing a Task

Run:

```bash
npm run lint
npm run type-check
npm test  # when relevant
```

And confirm:

- [ ] App still works with no network (offline-first)
- [ ] Missing Supabase config in production mode disables premium/AI gracefully
- [ ] No new warnings or noisy logs
- [ ] Types are complete (no new `any` or type errors)
