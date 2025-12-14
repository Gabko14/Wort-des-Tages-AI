# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

German "Word of the Day" mobile app built with Expo Router (React Native). Displays daily vocabulary words from a bundled SQLite database (DWDS). Premium users get AI-enriched word definitions via Supabase Edge Functions.

## Commands

```bash
npm start          # Dev server (Expo Go)
npm start:tunnel   # Dev with tunnel for physical devices on different network
npm test           # Run Jest tests
npm run lint       # Check for linting errors
npm run lint:fix   # Auto-fix linting/formatting
npm run type-check # TypeScript validation
```

## Architecture

### Data Flow

1. **Local SQLite** (`assets/database/dwds.db`) - bundled vocabulary database copied to device on first launch
2. **Services Layer** (`services/`) - singleton DB connection, all data access via async functions
3. **Supabase Backend** - Edge Functions for AI enrichment and premium entitlements
4. **AsyncStorage** - user settings, premium status cache, AI response cache

### Project Structure

```
/app              - Expo Router screens (file-based routing)
/components       - Reusable React components
/services         - Business logic & data access
/hooks            - Custom React hooks
/config           - Supabase client configuration
/types            - TypeScript type definitions
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
- `ai-enrich` Edge Function calls OpenAI (gpt-4o-mini) for word definitions
- Services throw typed `AppError` on failures; UI decides fallback behavior
- AI responses cached in AsyncStorage by word IDs

## Error Handling

### Rule of Thumb

- **Services throw, UI catches**: service functions should throw a typed `AppError` (see `utils/appError.ts`) and let screens/components decide how to recover or show messaging.
- **Never leave promises unhandled**: use `await` + `try/catch`, or attach `.catch()` for "fire-and-forget" calls.
- **Render-time failures**: rely on Expo Router's error boundary (`app/_layout.tsx`) as a last-resort recovery screen.

### Supabase Config Behavior

- In development (`__DEV__`), missing `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` throws at startup.
- In production builds, missing Supabase config disables premium/AI features (app should still run offline for the local word database).

## Code Patterns

### Database Access

Always use `getDatabase()` singleton, never create new connections:

```typescript
const db = await getDatabase();
const words = await db.getAllAsync<Wort>('SELECT * FROM wort WHERE ...');
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

### Supabase Edge Functions

Edge Functions use Deno runtime with ESM imports. Located in `supabase/functions/`:

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
```

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
