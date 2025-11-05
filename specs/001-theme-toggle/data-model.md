# Data Model: Theme Toggle

**Feature**: 001-theme-toggle
**Date**: 2025-11-06
**Version**: 1.0

## Overview

The theme toggle feature uses a simple state machine with three theme modes and two storage locations (DOM attribute + localStorage). This document defines the data entities, state transitions, and validation rules.

---

## Entity: Theme Preference

### Description
Represents the user's selected color theme mode. Controls whether the application displays in light colors, dark colors, or follows the system preference.

### Properties

| Property | Type | Constraints | Default | Description |
|----------|------|-------------|---------|-------------|
| `theme` | `"light" \| "dark" \| "auto"` | Must be one of three values | `"auto"` | The selected theme mode |

### Storage Locations

**Primary Storage** (DOM):
```javascript
// Location: data-theme attribute on <html> element
document.documentElement.getAttribute('data-theme')
// Values: "light" | "dark" | null (null = auto mode)
// Scope: Current page session
// Lifetime: Until page unload
```

**Persistent Storage** (localStorage):
```javascript
// Location: localStorage key "theme"
localStorage.getItem('theme')
// Values: "light" | "dark" | "auto" | null (null = no preference stored)
// Scope: Origin (same domain)
// Lifetime: Until user clears browser data
```

**Storage Sync**:
- **On Page Load**: localStorage → DOM attribute
- **On User Action**: Button click → Update DOM → Save to localStorage
- **Priority**: DOM attribute is source of truth for current session

### Validation Rules

```javascript
// Valid theme values
const VALID_THEMES = ['light', 'dark', 'auto'];

// Validation function
function isValidTheme(value) {
  return typeof value === 'string' && VALID_THEMES.includes(value);
}

// Usage
const theme = localStorage.getItem('theme');
if (theme && isValidTheme(theme)) {
  // Valid theme - apply it
  applyTheme(theme);
} else {
  // Invalid or null - use default (auto)
  applyTheme('auto');
}
```

**Invalid Inputs**:
| Input | Handling |
|-------|----------|
| `null` | Treat as `"auto"` (default) |
| `""` (empty string) | Treat as invalid, fallback to `"auto"` |
| `"DARK"` (wrong case) | Treat as invalid, fallback to `"auto"` |
| `"system"` (wrong term) | Treat as invalid, fallback to `"auto"` |
| Any other string | Treat as invalid, fallback to `"auto"` |

---

## State Machine: Theme Cycling

### States

```
┌─────────┐
│  light  │ ← Default state when manually selected
└────┬────┘
     │ User clicks toggle
     ↓
┌─────────┐
│  dark   │ ← Dark mode manually selected
└────┬────┘
     │ User clicks toggle
     ↓
┌─────────┐
│  auto   │ ← System preference mode (default on first visit)
└────┬────┘
     │ User clicks toggle
     ↓
   (back to light)
```

### State Transitions

| Current State | Event | Next State | Actions |
|---------------|-------|------------|---------|
| `auto` | Button Click | `light` | Set DOM `data-theme="light"`, Save to localStorage, Update button icon to ☀️ |
| `light` | Button Click | `dark` | Set DOM `data-theme="dark"`, Save to localStorage, Update button icon to 🌙 |
| `dark` | Button Click | `auto` | Remove DOM `data-theme`, Save "auto" to localStorage, Update button icon to 💻 |
| `null` (first visit) | Page Load | `auto` | No DOM attribute, No localStorage, Button shows 💻 |
| Any state | localStorage Unavailable | Session-only state | DOM attribute works, localStorage write fails silently |
| `auto` | System Theme Changes | `auto` (refresh colors) | CSS `@media` query updates colors, Button stays 💻 |

### State Invariants

**Invariant 1**: `data-theme` attribute and button icon must always be in sync
```javascript
// ✅ GOOD: Consistent state
document.documentElement.getAttribute('data-theme') === 'dark'
button.textContent === '🌙'

// ❌ BAD: Inconsistent state
document.documentElement.getAttribute('data-theme') === 'dark'
button.textContent === '☀️' // WRONG!
```

**Invariant 2**: `localStorage.theme` and DOM `data-theme` must match (except "auto")
```javascript
// ✅ GOOD: auto mode
localStorage.getItem('theme') === 'auto'
document.documentElement.getAttribute('data-theme') === null // No attribute for auto

// ✅ GOOD: manual mode
localStorage.getItem('theme') === 'dark'
document.documentElement.getAttribute('data-theme') === 'dark'

// ❌ BAD: Mismatch
localStorage.getItem('theme') === 'light'
document.documentElement.getAttribute('data-theme') === 'dark' // WRONG!
```

**Invariant 3**: Only valid themes can be persisted
```javascript
// ✅ GOOD: Valid theme
localStorage.setItem('theme', 'light'); // OK

// ❌ BAD: Invalid theme
localStorage.setItem('theme', 'blue'); // INVALID!
```

---

## Entity: Theme State (Visual Representation)

### Description
The actual colors displayed on the page, derived from either manual selection or system preference.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `effectiveTheme` | `"light" \| "dark"` | The theme colors currently displayed (never "auto") |
| `isDark` | `boolean` | Whether dark colors are currently displayed |

### Derived Values

**Effective Theme Calculation**:
```javascript
function getEffectiveTheme() {
  const manualTheme = document.documentElement.getAttribute('data-theme');

  if (manualTheme === 'light') return 'light';
  if (manualTheme === 'dark') return 'dark';

  // Auto mode: check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

// Usage
const effectiveTheme = getEffectiveTheme();
const isDark = (effectiveTheme === 'dark');
```

**User Selection vs Effective Theme**:
| User Selection (`localStorage`) | System Preference | Effective Theme (Visual) |
|----------------------------------|-------------------|--------------------------|
| `"light"` | Dark | `"light"` (manual override) |
| `"light"` | Light | `"light"` |
| `"dark"` | Light | `"dark"` (manual override) |
| `"dark"` | Dark | `"dark"` |
| `"auto"` or `null` | Light | `"light"` (follows system) |
| `"auto"` or `null` | Dark | `"dark"` (follows system) |

---

## CSS Variables Affected

### Description
The theme changes the values of CSS custom properties (CSS variables) that control the application's colors.

### Variables

| Variable | Light Theme Value | Dark Theme Value | Used By |
|----------|-------------------|------------------|---------|
| `--bg` | `#f8f9fa` | `#121212` | Page background |
| `--text` | `#212529` | `#e9ecef` | Body text color |
| `--text-secondary` | `#6c757d` | `#adb5bd` | Meta text, labels |
| `--toolbar-bg` | `#ffffff` | `#1c1c1c` | Toolbar background |
| `--toolbar-border` | `#dee2e6` | `#343a40` | Toolbar border |
| `--card-bg` | `#ffffff` | `#1c1c1c` | Article cards background |
| `--card-border` | `#dee2e6` | `#343a40` | Article cards border |
| `--link` | `#007bff` | `#80bfff` | Hyperlinks |
| `--link-hover` | `#0056b3` | `#a8d8ff` | Hyperlink hover |
| `--button-bg` | `#e9ecef` | `#343a40` | Button background |
| `--button-hover` | `#d3d9df` | `#495057` | Button hover |

**Total**: 11 CSS variables controlled by theme

**CSS Application**:
```css
/* Values change based on data-theme attribute or @media query */
body {
  background: var(--bg);        /* Reads current theme value */
  color: var(--text);           /* Reads current theme value */
}

.toolbar {
  background: var(--toolbar-bg); /* Reads current theme value */
  border-bottom: 1px solid var(--toolbar-border);
}
```

---

## Button State

### Description
The theme toggle button displays an icon indicating the current theme mode.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `icon` | `string` | The emoji icon displayed in the button |
| `title` | `string` | The tooltip text shown on hover |
| `ariaLabel` | `string` | The accessible label for screen readers |

### Icon Mapping

| Theme Mode | Icon | Title | Aria-Label |
|------------|------|-------|------------|
| `"light"` | ☀️ | "Theme: light" | "Toggle theme (current: light)" |
| `"dark"` | 🌙 | "Theme: dark" | "Toggle theme (current: dark)" |
| `"auto"` | 💻 | "Theme: auto" | "Toggle theme (current: auto)" |

**Update Logic**:
```javascript
const THEME_CONFIG = {
  light: { icon: '☀️', title: 'Theme: light', aria: 'Toggle theme (current: light)' },
  dark:  { icon: '🌙', title: 'Theme: dark', aria: 'Toggle theme (current: dark)' },
  auto:  { icon: '💻', title: 'Theme: auto', aria: 'Toggle theme (current: auto)' }
};

function updateButton(theme) {
  const config = THEME_CONFIG[theme];
  button.textContent = config.icon;
  button.setAttribute('title', config.title);
  button.setAttribute('aria-label', config.aria);
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Page Load                                                    │
└───────────────────┬─────────────────────────────────────────┘
                    ↓
          ┌─────────────────────┐
          │ Inline Script       │
          │ (in <head>)         │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ Read localStorage   │
          │ theme = getItem()   │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ Validate theme      │
          │ isValid(theme)?     │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ Set DOM attribute   │
          │ if theme !== 'auto' │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ CSS applies theme   │
          │ (FOUC prevented)    │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ Page renders        │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ theme.js loads      │
          │ (defer)             │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ Button initialized  │
          │ Update icon         │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ User Ready          │
          └─────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ User Clicks Toggle Button                                    │
└───────────────────┬─────────────────────────────────────────┘
                    ↓
          ┌─────────────────────┐
          │ Get current theme   │
          │ from DOM attribute  │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ Calculate next      │
          │ light→dark→auto→... │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ Update DOM          │
          │ setAttribute()      │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ Save to localStorage│
          │ (try-catch)         │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ Update button icon  │
          │ updateButton()      │
          └──────────┬──────────┘
                     ↓
          ┌─────────────────────┐
          │ CSS applies new     │
          │ theme instantly     │
          └─────────────────────┘
```

---

## Edge Cases and Error States

### Case 1: localStorage Unavailable

**Scenario**: Private browsing, localStorage disabled, quota exceeded

**Behavior**:
```javascript
// localStorage.setItem() throws exception
try {
  localStorage.setItem('theme', 'dark');
} catch (e) {
  // Write failed - theme still works for session
  console.warn('Theme preference not saved');
}

// DOM attribute still set (session-only theme)
document.documentElement.getAttribute('data-theme') === 'dark' // true
```

**Result**: Theme works for current session, not persisted across sessions

### Case 2: Invalid Theme Value in localStorage

**Scenario**: User manually edits localStorage or bug writes invalid value

**Behavior**:
```javascript
// localStorage contains invalid value
localStorage.setItem('theme', 'blue'); // Invalid!

// On page load
const theme = localStorage.getItem('theme'); // Returns "blue"
if (!isValidTheme(theme)) {
  // Invalid - fallback to auto
  theme = 'auto';
}
```

**Result**: Invalid values ignored, fallback to auto mode

### Case 3: Rapid Button Clicks

**Scenario**: User clicks toggle button multiple times quickly

**Behavior**:
```javascript
// Click 1: auto → light (DOM + localStorage update)
// Click 2: light → dark (DOM + localStorage update)
// Click 3: dark → auto (DOM + localStorage update)

// Each click completes before next
// No race conditions (single-threaded JavaScript)
```

**Result**: Each click processed sequentially, final state is correct

### Case 4: System Theme Changes During Auto Mode

**Scenario**: User has auto mode selected, changes system theme (macOS: System Settings → Appearance)

**Behavior**:
```javascript
// matchMedia listener fires
mediaQuery.addEventListener('change', (event) => {
  if (getCurrentTheme() === 'auto') {
    // CSS automatically updates (no JS needed)
    // Just update button icon
    updateButton('auto');
  }
});
```

**Result**: Colors update automatically via CSS `@media` query, button stays as 💻

---

## Summary

**Entities**:
1. **Theme Preference**: User's selected mode (`light` | `dark` | `auto`)
2. **Theme State**: Effective visual theme (`light` | `dark` only)
3. **Button State**: Visual representation (icon, title, aria-label)

**Storage**:
- **Primary**: DOM `data-theme` attribute (session)
- **Persistent**: localStorage `theme` key (cross-session)

**States**: 3 modes (light, dark, auto) with cycle transition

**Validation**: Strict enum validation, fallback to auto on invalid

**Data Flow**: localStorage → DOM attribute → CSS variables → Visual theme

---

**Status**: ✅ Data model complete and validated
**Next**: Create API contracts in `contracts/` directory
