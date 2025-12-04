---
applyTo: components/**
---

# Component Instructions

## Overview

React Native components for the Wort des Tages app. Components should be reusable, typed, and follow established patterns.

## Component Structure

```typescript
import { StyleSheet, View, Text } from 'react-native';
// ... other imports

interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: number;
}

export function ComponentName({ requiredProp, optionalProp }: ComponentNameProps) {
  // 1. Hooks (useState, useCallback, useMemo, useEffect)
  // 2. Event handlers
  // 3. Early returns for loading/error states
  // 4. Main render

  return <View>...</View>;
}

const styles = StyleSheet.create({
  // Styles at end of file
});
```

## Key Rules

### Exports

- Use **named exports** for reusable components
- Use **default exports** only for screen components in `/app`

### Props

- Define an interface for all props with `ComponentNameProps` naming
- Use props destructuring in function parameters
- Document optional props with `?`

### Hooks Order

1. React hooks (useState, useReducer)
2. Custom hooks
3. useCallback for event handlers
4. useMemo for derived data
5. useEffect for side effects

### Styling

- Use `StyleSheet.create()` at the end of the file
- Use theme colors from `@/constants/Colors`
- Keep styles scoped to the component

## Testing

- Add component tests in `components/__tests__/`
- Test rendering with different props
- Test loading and error states
- Test user interactions where applicable
