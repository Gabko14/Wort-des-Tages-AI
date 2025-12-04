---
applyTo: services/**
---

# Service Layer Instructions

## Overview

The services layer handles all business logic and data access. It abstracts database operations and external API calls from the UI layer.

## Patterns to Follow

### Database Access

- Always use `getDatabase()` to get the singleton database connection
- Use generics for type-safe queries: `db.getAllAsync<Wort>(...)`
- Wrap database operations in try/catch blocks
- Re-throw errors to allow UI to handle them

### Function Structure

```typescript
export async function serviceFunctionName(): Promise<ReturnType> {
  try {
    const db = await getDatabase();
    // Perform operations
    return result;
  } catch (error) {
    console.error('Descriptive error message:', error);
    throw error;
  }
}
```

### Naming

- Export async functions with descriptive names (e.g., `getTodaysWords`, `saveSettings`)
- Keep internal helper functions private (not exported)
- Use camelCase for function names

### Dependencies

- Import types from `@/services/database`
- Import AsyncStorage from `@react-native-async-storage/async-storage`
- Use the `@/` path alias for all imports

## Testing Requirements

- Add tests in `services/__tests__/` for new service functions
- Mock database and AsyncStorage operations
- Test both success and error cases
