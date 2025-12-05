---
applyTo: hooks/**
---

# Custom Hooks Instructions

## Overview

Custom React hooks for the Wort des Tages app. Hooks encapsulate reusable stateful logic and side effects.

## Naming Convention

- Files: `use<HookName>.ts`
- Function: `use<HookName>`
- Always start with `use` prefix (React convention)

## Hook Structure

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';

// Private helper functions (not exported)
function helperFunction(): string {
  return 'helper';
}

// Main hook (exported)
export function useCustomHook(param: ParamType): ReturnType {
  // 1. State declarations
  const [state, setState] = useState<StateType>(initialValue);

  // 2. Refs for mutable values
  const ref = useRef<RefType>(initialValue);

  // 3. Callbacks
  const handleSomething = useCallback(() => {
    // ...
  }, [dependency]);

  // 4. Effects
  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup logic
    };
  }, [dependencies]);

  // 5. Return value
  return { state, handleSomething };
}
```

## Key Rules

### Return Types

- Always explicitly type the return value
- Return an object for multiple values: `{ data, isLoading, error }`
- Return void for hooks that only trigger side effects

### Dependencies

- Include all dependencies in useEffect/useCallback arrays
- Use refs for values that shouldn't trigger re-renders
- Memoize callbacks passed to children with useCallback

### Cleanup

- Always clean up subscriptions, timers, and event listeners
- Return cleanup function from useEffect when needed

### Error Handling

- Expose error state: `const [error, setError] = useState<string | null>(null)`
- Let consumers decide how to display errors

## Testing

- Add tests in `hooks/__tests__/`
- Test return values and state changes
- Mock external dependencies (AppState, AsyncStorage, etc.)
- Test cleanup functions are called

## Example: useDailyRefresh

```typescript
export function useDailyRefresh(onNewDay: () => void): void {
  const lastLoadedDate = useRef<string>(getTodayDateString());
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const today = getTodayDateString();
        if (today !== lastLoadedDate.current) {
          lastLoadedDate.current = today;
          onNewDay();
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [onNewDay]);
}
```
