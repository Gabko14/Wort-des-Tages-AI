# UI/UX Improvement Plan

## Overview

This document outlines the planned UI/UX improvements for the Wort-des-Tages app. The goal is to create a more polished, engaging, and accessible user experience while maintaining the app's offline-first architecture.

---

## Implementation Checklist

**Work through these steps sequentially.** Each step has dependencies on previous ones - don't skip ahead!

### Step 1: Create Button Component 🎨 Core Component

**File:** `/components/Button.tsx` (new)

- [x] Implement basic button structure
- [x] Add variants (primary, secondary, ghost, danger)
- [x] Add states (default, pressed, disabled, loading)
- [x] Add icon support (left/right)
- [x] Add accessibility labels
- [x] Test all variants in light/dark mode

### Step 2: Add Haptic Feedback 📳 Interactions

**Files:** `/components/Button.tsx`, `/components/QuizCard.tsx` | **Depends on:** Step 1

- [x] Install `expo-haptics` package: `npx expo install expo-haptics`
- [x] Add light haptic on button press
- [x] Add success haptic on correct quiz answer
- [x] Add error haptic on wrong quiz answer
- [x] Test on physical device (haptics don't work in simulator)

### Step 3: Better Error State 🏠 Home Screen

**File:** `/components/ErrorState.tsx` (new), `/app/(tabs)/index.tsx` | **Depends on:** Step 1

- [x] Create ErrorState component
- [x] Add error icon from `@expo/vector-icons`
- [x] Add clear error message prop
- [x] Add retry button using Button component
- [x] Integrate into home screen
- [x] Test error scenarios

### Step 4: Better Empty State 🏠 Home Screen

**File:** `/components/EmptyState.tsx` (new), `/app/(tabs)/index.tsx` | **Depends on:** Step 1

- [x] Create EmptyState component
- [x] Add empty state icon
- [x] Add helpful message
- [x] Add action button to navigate to settings
- [x] Integrate into home screen
- [x] Test empty state (adjust settings to get no words)

### Step 5: Card Entrance Animations ✨ Animations

**Files:** `/app/(tabs)/index.tsx`, `/components/WordCard.tsx`

- [x] Add FadeInDown entering animation to WordCard
- [x] Add stagger delay based on card index (index \* 100ms)
- [x] Use `.springify()` for natural motion
- [x] Test animation on both platforms

### Step 6: Improved Link Button in WordCard 🏠 Home Screen

**File:** `/components/WordCard.tsx` | **Depends on:** Step 1

- [x] Replace plain text link with Button component (ghost variant)
- [x] Add external link icon from `@expo/vector-icons`
- [x] Ensure proper touch target size
- [x] Test link functionality

### Step 7: Collapsible Settings Sections ⚙️ Settings Screen

**File:** `/components/CollapsibleSection.tsx` (new), `/app/(tabs)/two.tsx` | **Depends on:** Step 5 (animations)

- [x] Create CollapsibleSection component with expand/collapse
- [x] Add rotation animation for chevron icon
- [x] Group settings into sections (Worteinstellungen, Benachrichtigungen, Premium, Über)
- [x] Integrate into settings screen
- [x] Test all sections

### Final Testing & Release 🚀

- [ ] Full test pass on iOS device
- [ ] Full test pass on Android device
- [ ] Test all features in light mode
- [ ] Test all features in dark mode
- [ ] Verify offline functionality maintained throughout
- [ ] Test with different settings combinations
- [ ] Performance check (animations smooth, no jank)
- [ ] Update documentation with new components
- [ ] Create release notes for users
- [ ] Tag release and push OTA update

---

## Phase 1: Core Components

### 1.1 Create Reusable Button Component

**File:** `/components/Button.tsx` (new)

**Variants:**

- `primary` - Solid blue background
- `secondary` - Outline style
- `ghost` - Text only, no background
- `danger` - Red for destructive actions

**States:**

- Default, pressed, disabled, loading

**Features:**

- Haptic feedback on press
- Loading spinner option
- Icon support (left/right)
- Accessibility labels

---

## Phase 2: Animations & Micro-interactions

### 2.1 Add Haptic Feedback

**Files:** `/components/Button.tsx`, `/components/QuizCard.tsx`

**Changes:**

- Use `expo-haptics` for tactile feedback
- Light haptic on button press
- Success/error haptic on quiz answer

```typescript
import * as Haptics from 'expo-haptics';

// On press
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// On success
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

### 2.2 Card Entrance Animations

**Files:** `/app/(tabs)/index.tsx`, `/components/WordCard.tsx`

**Changes:**

- Use `react-native-reanimated` (already installed)
- Staggered fade-in + slide-up animation for cards
- Each card delays slightly after the previous one

```typescript
// Using entering animation
<Animated.View entering={FadeInDown.delay(index * 100).springify()}>
  <WordCard ... />
</Animated.View>
```

### 2.3 Shimmer Effect for AI Loading

**File:** `/components/WordCard.tsx`, `/components/Skeleton.tsx` (new)

**Changes:**

- Create reusable `<Skeleton>` component with shimmer animation
- Replace "KI lädt..." text with skeleton placeholders
- Skeleton for definition text area
- Skeleton for quiz options

---

## Phase 3: Main Screen (Home) Improvements

### 3.1 Branded Loading State

**File:** `/app/(tabs)/index.tsx`

**Current state:** Plain `ActivityIndicator` with text.

**Changes:**

- Show app logo at top
- Show 2-3 skeleton WordCards below
- Keep the helpful loading message
- Remove elapsed time counter (skeleton feels faster)

```
┌─────────────────────────┐
│                         │
│        [App Logo]       │
│                         │
│   Lade Wörter des Tages │
│                         │
│  ┌───────────────────┐  │
│  │ ████████          │  │  <- Skeleton card
│  │ ██████  ████      │  │
│  │ █████████████████ │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ ████████          │  │  <- Skeleton card
│  │ ...               │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### 3.2 Better Error State

**File:** `/app/(tabs)/index.tsx`

**Current state:** Red text centered on screen.

**Changes:**

- Error card with consistent styling
- Error icon (using `@expo/vector-icons`)
- Clear error message
- "Erneut versuchen" (Retry) button

```
┌─────────────────────────┐
│                         │
│      [Error Icon]       │
│                         │
│  Fehler beim Laden      │
│  der Wörter             │
│                         │
│  [Erneut versuchen]     │
│                         │
└─────────────────────────┘
```

### 3.3 Better Empty State

**File:** `/app/(tabs)/index.tsx`

**Current state:** Plain text "Keine Wörter für heute gefunden."

**Changes:**

- Empty state illustration/icon
- Helpful message explaining why
- Action button to go to settings

```
┌─────────────────────────┐
│                         │
│     [Empty Icon]        │
│                         │
│  Keine Wörter gefunden  │
│                         │
│  Überprüfe deine        │
│  Filtereinstellungen    │
│                         │
│  [Zu Einstellungen]     │
│                         │
└─────────────────────────┘
```

### 3.4 Word Progress Indicator

**File:** `/app/(tabs)/index.tsx`

**Changes:**

- Add dot indicators or "1 von 5" text below header
- Visual indication of which word user is viewing
- Consider: scroll-based highlighting or swipe navigation (future)

```
Wörter des Tages
Samstag, 14. Dezember 2024
● ○ ○ ○ ○  (or "1 von 5")
```

### 3.5 Improved Link Button in WordCard

**File:** `/components/WordCard.tsx`

**Current state:** Plain text link "Im DWDS nachschlagen →"

**Changes:**

- Use new `<Button variant="ghost">` component
- Add external link icon from `@expo/vector-icons`
- Better touch target

---

## Phase 4: Settings Screen Improvements

### 4.1 Collapsible Settings Sections

**File:** `/app/(tabs)/two.tsx`

**Changes:**

- Group settings into logical sections:
  - Worteinstellungen (Word settings)
  - Benachrichtigungen (Notifications)
  - Premium / KI
  - Über die App (About)
- Each section is collapsible with expand/collapse animation
- Show summary of current settings when collapsed

```
┌─────────────────────────┐
│ ▼ Worteinstellungen     │
│   ├─ Anzahl: 5          │
│   ├─ Wortarten: ...     │
│   └─ Häufigkeit: ...    │
├─────────────────────────┤
│ ▶ Benachrichtigungen    │  <- Collapsed
│   Täglich um 08:00      │     (shows summary)
├─────────────────────────┤
│ ▶ Premium / KI          │
├─────────────────────────┤
│ ▶ Über die App          │
└─────────────────────────┘
```

---

## Phase 5: Accessibility

### 5.1 Add Accessibility Labels

**Files:** All interactive components

**Changes:**

- Add `accessibilityLabel` to all buttons
- Add `accessibilityHint` for non-obvious actions
- Add `accessibilityRole` where appropriate
- Test with screen reader

**Examples:**

```typescript
<Button
  accessibilityLabel="Im DWDS Wörterbuch nachschlagen"
  accessibilityHint="Öffnet die DWDS Webseite in einem Browser"
  accessibilityRole="link"
/>

<Pressable
  accessibilityLabel={`Antwort ${index + 1}: ${option}`}
  accessibilityRole="button"
/>
```

---

## Implementation Order

| Step | Task                          | Depends On | Estimated Complexity |
| ---- | ----------------------------- | ---------- | -------------------- |
| 1    | Create Button component       | -          | Medium               |
| 2    | Add haptic feedback           | 1          | Low                  |
| 3    | Create Skeleton component     | -          | Medium               |
| 4    | Branded loading state         | 3          | Low                  |
| 5    | Better error state            | 1          | Low                  |
| 6    | Better empty state            | 1          | Low                  |
| 7    | Card entrance animations      | -          | Medium               |
| 8    | Shimmer for AI loading        | 3          | Low                  |
| 9    | Word progress indicator       | -          | Low                  |
| 10   | Improved link button          | 1          | Low                  |
| 11   | Collapsible settings sections | 7          | Medium               |
| 12   | Add accessibility labels      | 1          | Low                  |

---

## Files to Create

- `/components/Button.tsx`
- `/components/Skeleton.tsx`
- `/components/CollapsibleSection.tsx`
- `/components/ErrorState.tsx`
- `/components/EmptyState.tsx`
- `/components/ProgressDots.tsx`

## Files to Modify

- `/app/(tabs)/index.tsx`
- `/app/(tabs)/two.tsx`
- `/components/WordCard.tsx`
- `/components/QuizCard.tsx`

---

## Notes

- All animations use `react-native-reanimated` (already installed)
- Haptics use `expo-haptics` (needs to be installed)
- Icons use `@expo/vector-icons` (already available via Expo)
- No new UI library dependencies - keeping it lightweight
- All changes must maintain offline-first functionality
