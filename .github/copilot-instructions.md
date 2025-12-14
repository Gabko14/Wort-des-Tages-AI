# Wort des Tages AI - Coding Guidelines

## Project Overview

German "Word of the Day" mobile app built with **Expo Router** (React Native). Displays daily vocabulary words from a bundled SQLite database (DWDS - Digitales Wörterbuch der deutschen Sprache).

---

## Architecture

### Data Flow

1. **Database**: Pre-bundled SQLite (`assets/database/dwds.db`) copied to device on first launch
2. **Services Layer**: `services/` handles all data access (singleton DB connection, async/await)
3. **UI Layer**: Expo Router screens in `app/` consume services via hooks
4. **Settings**: User preferences stored in AsyncStorage via `settingsService.ts`

### Project Structure

```
/app            - Expo Router screens & layouts (file-based routing)
/components     - Reusable React components
/services       - Business logic & data access (database, API calls)
/hooks          - Custom React hooks
/constants      - App-wide constants (Colors, config)
/assets         - Static resources (fonts, images, database)
/types          - TypeScript type definitions
/__tests__      - Integration tests
```

### Key Files

- `services/database.ts` - Singleton SQLite connection, core type definitions
- `services/wordService.ts` - Daily word generation with settings-based filtering
- `services/settingsService.ts` - AsyncStorage-backed user preferences
- `hooks/useDailyRefresh.ts` - Auto-refresh when app returns from background

---

## TypeScript Best Practices

### Strict Typing (No `any`)

```typescript
// ❌ Bad - avoid any
function processData(data: any): any { ... }

// ✅ Good - explicit types
function processData(data: Wort[]): ProcessedWord[] { ... }
```

### Interface Definitions

```typescript
// Define interfaces for all data structures
interface WordCardProps {
  word: Wort;
  onPress?: () => void;
}

// Use type aliases for unions
type FrequencyRange = 'selten' | 'mittel' | 'haeufig';
```

### Generic Type-Safe Database Queries

```typescript
// Always use generics for type-safe queries
const words = await db.getAllAsync<Wort>('SELECT * FROM wort WHERE id = ?', [id]);
const setting = await db.getFirstAsync<UserSettings>('SELECT * FROM settings');
```

---

## React & React Native Patterns

### Component Structure

```typescript
// ✅ Named exports for reusable components
export function WordCard({ word }: WordCardProps) {
  // 1. Hooks first
  const theme = useThemeColor();
  const [isLoading, setIsLoading] = useState(false);

  // 2. Handlers/callbacks
  const handlePress = useCallback(() => { ... }, []);

  // 3. Effects
  useEffect(() => { ... }, [dependency]);

  // 4. Early returns for loading/error states
  if (isLoading) return <ActivityIndicator />;

  // 5. Main render
  return <View>...</View>;
}

// Styles at end of file
const styles = StyleSheet.create({ ... });
```

### Screen Components

```typescript
// ✅ Default exports ONLY for screens (Expo Router requirement)
export default function HomeScreen() { ... }
```

### State Management

```typescript
// ✅ Use functional updates for state depending on previous value
setCount((prev) => prev + 1);

// ✅ Use useCallback for handlers passed to children
const handleRefresh = useCallback(async () => {
  setRefreshing(true);
  await loadData();
  setRefreshing(false);
}, [loadData]);

// ✅ Use useMemo for expensive computations
const filteredWords = useMemo(
  () => words.filter((w) => w.frequenzklasse === range),
  [words, range]
);
```

### Loading & Error States

```typescript
// ✅ Always handle all UI states
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<Wort[]>([]);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
if (data.length === 0) return <EmptyState />;
return <DataList data={data} />;
```

---

## Service Layer Patterns

### Async Functions with Error Handling

```typescript
// ✅ Services are always async, use try/catch
export async function getTodaysWords(): Promise<Wort[]> {
  try {
    const db = await getDatabase();
    return await db.getAllAsync<Wort>('SELECT * FROM wort WHERE ...');
  } catch (error) {
    console.error('Failed to get words:', error);
    throw error; // Re-throw to let UI handle it
  }
}
```

### Singleton Pattern for Database

```typescript
// ✅ Use getDatabase() - never create new connections
let db: SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!db) {
    db = await initDatabase();
  }
  return db;
}
```

### Pure Helper Functions

```typescript
// ✅ Keep helper functions pure and non-exported if internal
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// ✅ Export only public API
export async function getOrGenerateTodaysWords(): Promise<Wort[]> { ... }
```

---

## Import Organization

### Order (enforced by ESLint)

```typescript
// 1. React & React Native
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';

// 2. Third-party libraries
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 3. Internal imports with @/ alias
import { WordCard } from '@/components/WordCard';
import { Wort } from '@/services/database';
import { useDailyRefresh } from '@/hooks/useDailyRefresh';

// 4. Relative imports (same directory)
import { styles } from './styles';
```

### Path Alias

```typescript
// ✅ Use @/ for all non-relative imports
import { WordCard } from '@/components/WordCard';

// ❌ Avoid deep relative paths
import { WordCard } from '../../../components/WordCard';
```

---

## Naming Conventions

| Element           | Convention                  | Example                              |
| ----------------- | --------------------------- | ------------------------------------ |
| Components        | PascalCase                  | `WordCard.tsx`, `SettingsScreen.tsx` |
| Hooks             | camelCase with `use` prefix | `useDailyRefresh.ts`                 |
| Services          | camelCase                   | `wordService.ts`, `database.ts`      |
| Interfaces/Types  | PascalCase                  | `WordCardProps`, `AppSettings`       |
| Constants         | UPPER_SNAKE_CASE            | `DEFAULT_SETTINGS`, `DATABASE_NAME`  |
| Functions         | camelCase                   | `getTodaysWords`, `handlePress`      |
| Boolean variables | `is`/`has`/`should` prefix  | `isLoading`, `hasError`              |

---

## Testing Guidelines

### File Organization

```
/services
  database.ts
  /__tests__
    database.test.ts    # Unit tests adjacent to source
/components
  WordCard.tsx
  /__tests__
    WordCard.test.tsx
/__tests__
  integration.test.ts   # Cross-module integration tests
```

### Test Structure

```typescript
describe('WordService', () => {
  describe('getTodaysWords', () => {
    it('should return empty array when no words exist', async () => {
      const result = await getTodaysWords();
      expect(result).toEqual([]);
    });

    it('should return words for current date', async () => {
      // Arrange
      await seedTestData();

      // Act
      const result = await getTodaysWords();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('lemma');
    });
  });
});
```

### What to Test

- ✅ Service functions (business logic)
- ✅ Custom hooks behavior
- ✅ Component rendering with different props
- ✅ Edge cases (empty data, errors, loading states)
- ❌ Don't test implementation details
- ❌ Don't test React Native internals

---

## Error Handling

### In Services

```typescript
export async function loadSettings(): Promise<AppSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS; // Graceful fallback
  }
}
```

### In Components

```typescript
const loadData = useCallback(async () => {
  try {
    setError(null);
    setLoading(true);
    const data = await fetchData();
    setData(data);
  } catch (err) {
    console.error('Load failed:', err);
    setError('Fehler beim Laden der Daten');
  } finally {
    setLoading(false);
  }
}, []);
```

---

## Code Style (Auto-enforced)

These are handled by ESLint/Prettier - just run `npm run lint:fix`:

- Single quotes for strings
- Semicolons required
- 2-space indentation
- Trailing commas (ES5 style)
- 80 character line width

---

## Commands

```bash
npm start          # Dev server (Expo Go)
npm start:tunnel   # Dev with tunnel (physical devices on different network)
npm test           # Run Jest tests
npm run lint       # Check for linting errors
npm run lint:fix   # Auto-fix linting errors
npm run type-check # TypeScript validation (no emit)
```

---

## CI/CD

| Trigger        | Action                                |
| -------------- | ------------------------------------- |
| Push to `main` | OTA Update (automatic on all devices) |
| Tag `v*.*.*`   | New APK build via GitHub Actions      |

### Creating a Release

```bash
git tag v1.0.1
git push --tags
```

---

## Key Domain Concepts

### Word Types (Wortklassen)

- `Substantiv` - Nouns
- `Verb` - Verbs
- `Adjektiv` - Adjectives

### Frequency Classes

- `selten` (rare): classes 0-1
- `mittel` (medium): classes 2-3
- `haeufig` (frequent): classes 4-6

### Daily Word Flow

1. App checks if words exist for today's date in `wort_des_tages` table
2. If not, generates random words based on user settings (word types, frequency)
3. Saves selection to database for consistency
4. `useDailyRefresh` hook triggers reload when app resumes on a new day
