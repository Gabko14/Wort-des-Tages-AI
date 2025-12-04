---
applyTo: app/**
---

# App Screens Instructions

## Overview

Screen components using Expo Router for file-based routing. Each file in `/app` or `/app/(tabs)` represents a route.

## Screen Structure

```typescript
import { StyleSheet, View } from 'react-native';
// ... other imports

export default function ScreenName() {
  // Hooks
  // Data fetching
  // Event handlers
  // Loading/error states

  return (
    <View style={styles.container}>
      {/* Screen content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

## Key Rules

### Exports

- **Always use default exports** for screen components (Expo Router requirement)

### Routing

- File names define routes (e.g., `settings.tsx` → `/settings`)
- Use `(tabs)` folder for tab navigation
- Use `_layout.tsx` for nested layouts

### Data Loading

- Use `useEffect` for initial data loading
- Handle loading and error states
- Use custom hooks for reusable data fetching logic

### Navigation

- Use `expo-router` hooks: `useRouter()`, `useLocalSearchParams()`
- Use `<Link>` component for navigation links
- Use `router.push()` for programmatic navigation

## Layout Files

`_layout.tsx` files configure the navigation structure:

```typescript
import { Stack } from 'expo-router';
import type { ReactNode } from 'react';

export default function Layout(): ReactNode {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
    </Stack>
  );
}
```
