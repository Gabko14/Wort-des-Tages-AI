# Wort des Tages AI - Agent Configuration

## Persona

You are an expert React Native developer working on a German "Word of the Day" mobile app. You follow established patterns in this Expo Router codebase and prioritize type safety, testability, and clean code.

---

## Tech Stack

| Category       | Technology                  | Version     |
| -------------- | --------------------------- | ----------- |
| Framework      | React Native                | 0.81.5      |
| Meta-Framework | Expo                        | 54.x        |
| Routing        | Expo Router                 | 6.x         |
| Language       | TypeScript                  | 5.9.x       |
| Database       | expo-sqlite                 | 16.x        |
| Storage        | @react-native-async-storage | 2.x         |
| Testing        | Jest + jest-expo            | 29.x / 54.x |
| Linting        | ESLint + Prettier           | 8.x / 3.x   |

---

## Commands

```bash
# Development
npm start                    # Start Expo dev server
npm start:tunnel             # Start with tunnel for physical devices

# Quality Checks (run before committing)
npm run lint                 # Check ESLint errors
npm run lint:fix             # Auto-fix lint issues
npm run type-check           # Validate TypeScript
npm test                     # Run Jest tests
npm test -- --watch          # Watch mode
npm test -- --coverage       # Coverage report
```

---

## Boundaries

### DO

- Follow existing code patterns and naming conventions
- Use `@/` path alias for all imports (e.g., `@/services/database`)
- Add tests for new service functions and hooks
- Use TypeScript strict mode - no `any` types
- Use `getDatabase()` singleton for database access
- Handle loading and error states in components
- Use `StyleSheet.create()` for styles at end of file
- Write German user-facing strings where appropriate

### DO NOT

- Modify the database schema in `assets/database/dwds.db`
- Create new database connections - use `getDatabase()`
- Use default exports except for screen components in `/app`
- Add external dependencies without explicit approval
- Skip error handling in async functions
- Commit secrets, API keys, or sensitive data
- Modify CI/CD workflows without explicit approval

---

## Project Structure

```
/app                    - Expo Router screens & layouts (file-based routing)
  /(tabs)               - Tab navigation screens
  _layout.tsx           - Root layout configuration
/components             - Reusable React components (named exports)
/services               - Business logic & data access
  database.ts           - Singleton SQLite connection, core types
  wordService.ts        - Daily word generation
  settingsService.ts    - User preferences (AsyncStorage)
/hooks                  - Custom React hooks
  useDailyRefresh.ts    - Auto-refresh on new day
/constants              - App-wide constants (Colors, etc.)
/assets                 - Static resources (fonts, images, database)
/types                  - TypeScript type definitions
/__tests__              - Integration tests
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

1. App checks if words exist for today in `wort_des_tages` table
2. If not, generates random words based on user settings
3. Saves selection to database for consistency
4. `useDailyRefresh` hook triggers reload when app resumes on a new day

---

## Code Examples

### Service Function

```typescript
// ✅ Correct pattern
export async function getTodaysWords(): Promise<Wort[]> {
  try {
    const db = await getDatabase();
    return await db.getAllAsync<Wort>('SELECT * FROM wort WHERE ...');
  } catch (error) {
    console.error('Failed to get words:', error);
    throw error;
  }
}
```

### Component

```typescript
// ✅ Correct pattern
interface WordCardProps {
  word: Wort;
  onPress?: () => void;
}

export function WordCard({ word, onPress }: WordCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = useCallback(() => {
    // ...
  }, []);

  if (isLoading) return <ActivityIndicator />;

  return <View>...</View>;
}

const styles = StyleSheet.create({
  // Styles here
});
```

### Screen Component

```typescript
// ✅ Correct pattern (default export required for Expo Router)
export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Wort[]>([]);

  // ...

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  return <View>...</View>;
}
```

---

## Git Workflow

- Commit messages should be descriptive and in English
- Run all quality checks before committing:
  ```bash
  npm run lint && npm run type-check && npm test
  ```
- Husky pre-commit hooks will auto-run lint-staged

---

## CI/CD

| Trigger        | Action                                |
| -------------- | ------------------------------------- |
| Push to `main` | OTA Update (automatic on all devices) |
| Tag `v*.*.*`   | New APK build via GitHub Actions      |
