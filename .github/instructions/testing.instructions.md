---
applyTo:
  - '**/__tests__/**'
  - '**/*.test.ts'
  - '**/*.test.tsx'
---

# Testing Instructions

## Overview

This project uses Jest with jest-expo for testing. Tests should be placed in `__tests__` directories adjacent to the code they test.

## Test Structure

```typescript
import { functionToTest } from '../functionToTest';

describe('FunctionOrComponent', () => {
  describe('methodOrBehavior', () => {
    it('should describe expected behavior', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionToTest(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Describe blocks: match the function/component name
- It blocks: start with "should" and describe the behavior

## What to Test

### Services

- Business logic functions
- Database query results
- Error handling paths
- Edge cases (empty arrays, null values)

### Hooks

- Return values
- State changes
- Side effects

### Components

- Rendering with required props
- Rendering with optional props
- Loading states
- Error states
- User interactions (if applicable)

## Mocking

### Database

```typescript
jest.mock('@/services/database', () => ({
  getDatabase: jest.fn().mockResolvedValue({
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
  }),
}));
```

### AsyncStorage

```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));
```

## Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # With coverage
```

## Best Practices

### DO

- Use descriptive test names that explain the expected behavior
- Follow the Arrange-Act-Assert pattern
- Test edge cases (empty arrays, null values, errors)
- Mock external dependencies (database, AsyncStorage, API calls)
- Test both success and error paths

### DO NOT

- Test implementation details (internal function calls)
- Test React Native internals
- Write tests that depend on each other
- Skip error handling tests
