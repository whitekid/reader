# Theme API Contract

**Feature**: 001-theme-toggle
**Version**: 1.0
**Date**: 2025-11-06

## Overview

This document defines the contracts (interfaces) for the theme toggle feature. It specifies how different parts of the system communicate and what invariants must be maintained.

---

## 1. localStorage Interface

### Purpose
Persistent storage for user's theme preference across browser sessions.

### API Specification

**Read Operation**:
```javascript
/**
 * Read theme preference from persistent storage
 * @returns {string|null} Theme value or null if not set
 */
const theme = localStorage.getItem('theme');

// Return values:
// - "light": User selected light theme
// - "dark": User selected dark theme
// - "auto": User selected auto mode (system preference)
// - null: No preference stored (first visit)
```

**Write Operation**:
```javascript
/**
 * Save theme preference to persistent storage
 * @param {string} theme - Must be "light" | "dark" | "auto"
 * @throws {QuotaExceededError} If storage quota exceeded (rare)
 * @throws {SecurityError} If localStorage access denied (private browsing)
 */
localStorage.setItem('theme', theme);

// Expected exceptions:
// - QuotaExceededError: Storage full (handle gracefully)
// - SecurityError: Access denied (private browsing, handle gracefully)
// - TypeError: Invalid input (validate before calling)
```

### Contract Guarantees

**Preconditions**:
- Browser supports Web Storage API (all modern browsers)
- Input must be valid theme value: `"light" | "dark" | "auto"`
- Storage key is always `"theme"` (lowercase, no prefix)

**Postconditions**:
- Value persists across page refreshes and browser restarts
- Value accessible from any page on same origin
- Value can be cleared with `localStorage.removeItem('theme')`

**Invariants**:
- Only one theme value stored (no array or object)
- Value is plain string, not JSON-encoded
- Key is case-sensitive ("theme" ≠ "Theme")

**Error Handling**:
```javascript
// ✅ CORRECT: Always use try-catch
try {
  localStorage.setItem('theme', theme);
  return true; // Success
} catch (e) {
  console.warn('localStorage unavailable:', e.name);
  return false; // Graceful failure
}

// ❌ INCORRECT: No error handling
localStorage.setItem('theme', theme); // May throw!
```

---

## 2. DOM Attribute Interface

### Purpose
Current theme state visible to CSS for styling.

### API Specification

**Read Current Theme**:
```javascript
/**
 * Get current theme from DOM
 * @returns {string|null} "light" | "dark" | null (null = auto mode)
 */
const theme = document.documentElement.getAttribute('data-theme');

// Return values:
// - "light": Light theme active
// - "dark": Dark theme active
// - null: Auto mode (no attribute set)
```

**Set Theme**:
```javascript
/**
 * Apply theme by setting data-theme attribute
 * @param {string} theme - "light" | "dark"
 */
document.documentElement.setAttribute('data-theme', theme);

// CSS will immediately reflect the change via:
// :root[data-theme="light"] { ... }
// :root[data-theme="dark"] { ... }
```

**Clear Theme (Auto Mode)**:
```javascript
/**
 * Remove theme attribute to enable auto mode
 */
document.documentElement.removeAttribute('data-theme');

// CSS will fall back to @media (prefers-color-scheme) rules:
// @media (prefers-color-scheme: dark) {
//   :root:not([data-theme]) { ... }
// }
```

### Contract Guarantees

**Preconditions**:
- `document.documentElement` is available (after DOMContentLoaded or in `<head>` script)
- Input must be `"light"` or `"dark"` (not `"auto"` - use `removeAttribute()` for auto)

**Postconditions**:
- Attribute change triggers CSS re-evaluation
- All CSS variables update within 1 frame (~16ms)
- Attribute persists until page unload or manual change

**Invariants**:
- Only `"light"` or `"dark"` allowed as attribute values
- `"auto"` mode represented by NO attribute (null)
- Attribute name is always `"data-theme"` (lowercase, hyphenated)

**CSS Selector Contract**:
```css
/* Light theme */
:root[data-theme="light"] {
  --bg: #f8f9fa;
  --text: #212529;
}

/* Dark theme */
:root[data-theme="dark"] {
  --bg: #121212;
  --text: #e9ecef;
}

/* Auto mode (no attribute) */
:root:not([data-theme]) {
  /* Base light colors */
  --bg: #f8f9fa;
  --text: #212529;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* Dark colors when system preference is dark */
    --bg: #121212;
    --text: #e9ecef;
  }
}
```

---

## 3. CSS Variables Contract

### Purpose
Color values that theme switcher modifies.

### Variable Definitions

| Variable | Type | Light Value | Dark Value | Usage |
|----------|------|-------------|------------|-------|
| `--bg` | color | `#f8f9fa` | `#121212` | Page background |
| `--text` | color | `#212529` | `#e9ecef` | Body text |
| `--text-secondary` | color | `#6c757d` | `#adb5bd` | Secondary text |
| `--toolbar-bg` | color | `#ffffff` | `#1c1c1c` | Toolbar background |
| `--toolbar-border` | color | `#dee2e6` | `#343a40` | Toolbar border |
| `--card-bg` | color | `#ffffff` | `#1c1c1c` | Card background |
| `--card-border` | color | `#dee2e6` | `#343a40` | Card border |
| `--link` | color | `#007bff` | `#80bfff` | Hyperlinks |
| `--link-hover` | color | `#0056b3` | `#a8d8ff` | Hyperlink hover |
| `--button-bg` | color | `#e9ecef` | `#343a40` | Button background |
| `--button-hover` | color | `#d3d9df` | `#495057` | Button hover |

**Total**: 11 variables

### Contract Guarantees

**Preconditions**:
- Variables defined in `:root` scope (global)
- All values are valid CSS colors (hex format)
- Variables used consistently across all stylesheets

**Postconditions**:
- Variable values update when theme changes
- All elements using `var(--variable)` update automatically
- No layout shifts, only color changes

**Invariants**:
- Variable names are lowercase with hyphens (kebab-case)
- Values are always hex colors (`#RRGGBB` format)
- Light and dark values must have sufficient contrast (WCAG AA: 4.5:1 for text)

**Usage Example**:
```css
/* Component uses CSS variables */
.article-card {
  background: var(--card-bg);       /* Reads current theme value */
  border: 1px solid var(--card-border);
  color: var(--text);
}

/* When theme changes, all instances update automatically */
```

---

## 4. Button UI Contract

### Purpose
Visual element that triggers theme changes and shows current theme.

### HTML Structure

**Required Structure**:
```html
<button
  id="theme-toggle"
  class="theme-toggle-btn"
  title="Theme: auto"
  aria-label="Toggle theme (current: auto)"
  type="button"
>
  💻
</button>
```

**Required Attributes**:
| Attribute | Type | Purpose | Example |
|-----------|------|---------|---------|
| `id` | string | Unique identifier for script | `"theme-toggle"` |
| `title` | string | Tooltip on hover | `"Theme: dark"` |
| `aria-label` | string | Accessibility label | `"Toggle theme (current: dark)"` |
| `type` | string | Button type | `"button"` (prevent form submission) |

### Button State Mapping

**Icon and Label by Theme**:
```javascript
const THEME_DISPLAY = {
  light: {
    icon: '☀️',
    title: 'Theme: light',
    ariaLabel: 'Toggle theme (current: light, click for dark)'
  },
  dark: {
    icon: '🌙',
    title: 'Theme: dark',
    ariaLabel: 'Toggle theme (current: dark, click for auto)'
  },
  auto: {
    icon: '💻',
    title: 'Theme: auto',
    ariaLabel: 'Toggle theme (current: auto, click for light)'
  }
};

/**
 * Update button to reflect current theme
 * @param {string} theme - "light" | "dark" | "auto"
 */
function updateButton(theme) {
  const display = THEME_DISPLAY[theme];
  button.textContent = display.icon;
  button.setAttribute('title', display.title);
  button.setAttribute('aria-label', display.ariaLabel);
}
```

### Contract Guarantees

**Preconditions**:
- Button exists in DOM with id `"theme-toggle"`
- Button is clickable (not disabled, visible)
- Event listener attached after DOMContentLoaded

**Postconditions**:
- Click event cycles theme: light → dark → auto → light
- Icon updates within 1 frame (< 16ms)
- localStorage updated (if available)
- CSS theme applied immediately

**Invariants**:
- Icon always matches current theme state
- One click = one state change (no skip states)
- Button always keyboard-accessible (tabbable, activatable)

---

## 5. Theme JavaScript API

### Purpose
Client-side functions for theme management.

### Public Functions

**Get Current Theme**:
```javascript
/**
 * Get current theme mode
 * @returns {string} "light" | "dark" | "auto"
 */
function getCurrentTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') {
    return attr;
  }
  // No attribute or invalid = auto mode
  const stored = localStorage.getItem('theme');
  if (stored === 'auto') return 'auto';
  return 'auto'; // Default
}
```

**Cycle to Next Theme**:
```javascript
/**
 * Cycle to next theme in sequence
 * @param {string} currentTheme - Current theme mode
 * @returns {string} Next theme in cycle
 */
function getNextTheme(currentTheme) {
  const cycle = { light: 'dark', dark: 'auto', auto: 'light' };
  return cycle[currentTheme] || 'light';
}
```

**Apply Theme**:
```javascript
/**
 * Apply theme to DOM and save to localStorage
 * @param {string} theme - "light" | "dark" | "auto"
 * @throws {TypeError} If theme is invalid
 */
function applyTheme(theme) {
  // Validate input
  if (!['light', 'dark', 'auto'].includes(theme)) {
    throw new TypeError(`Invalid theme: ${theme}`);
  }

  // Update DOM
  if (theme === 'auto') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Save to localStorage (with error handling)
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {
    console.warn('Failed to save theme preference:', e);
  }

  // Update button UI
  updateButton(theme);
}
```

### Contract Guarantees

**Preconditions**:
- Functions called after DOM ready
- Input validation performed before DOM manipulation

**Postconditions**:
- Theme applied consistently across DOM, localStorage, button
- Errors handled gracefully (no uncaught exceptions)

**Invariants**:
- All functions maintain DOM-localStorage-UI sync
- No side effects beyond theme management
- Functions are idempotent (safe to call multiple times)

---

## 6. System Preference Interface

### Purpose
Detect and respond to OS-level theme changes.

### API Specification

**Create Media Query Matcher**:
```javascript
/**
 * Create matcher for system dark mode preference
 * @returns {MediaQueryList} Media query object
 */
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Properties:
// - darkModeQuery.matches: boolean (true if system is dark mode)
// - darkModeQuery.media: string ("(prefers-color-scheme: dark)")
```

**Listen for System Changes**:
```javascript
/**
 * Set up listener for system theme changes
 */
darkModeQuery.addEventListener('change', (event) => {
  const isDarkMode = event.matches;
  const currentTheme = getCurrentTheme();

  // Only react if in auto mode
  if (currentTheme === 'auto') {
    // CSS automatically updates via @media query
    // Just update button icon
    updateButton('auto');
  }
});
```

### Contract Guarantees

**Preconditions**:
- Browser supports `matchMedia()` (all modern browsers)
- Event listener added only once (in theme.js initialization)

**Postconditions**:
- System theme changes reflected immediately (via CSS)
- Button icon stays as 💻 (auto mode indicator)

**Invariants**:
- Listener only affects auto mode (manual themes ignore system changes)
- CSS `@media` query provides visual update (JavaScript only updates button)
- No polling required (event-driven)

---

## 7. Integration Contract

### Purpose
Define how different components interact.

### Execution Order

**Page Load Sequence**:
```
1. HTML parsing starts
   ↓
2. Inline <script> in <head> executes (synchronous)
   - Reads localStorage
   - Sets data-theme attribute
   ↓
3. <style> tag parsed (CSS applies theme)
   ↓
4. DOM renders with correct theme (no FOUC)
   ↓
5. theme.js loads (defer attribute)
   - Attaches button click handler
   - Updates button icon
   - Sets up system preference listener
   ↓
6. User interaction enabled
```

**User Interaction Sequence**:
```
1. User clicks toggle button
   ↓
2. Click handler fires
   - Get current theme
   - Calculate next theme
   ↓
3. Apply theme
   - Update DOM attribute
   - Save to localStorage
   - Update button UI
   ↓
4. CSS reacts to attribute change
   - Re-evaluate CSS variables
   - Update all styled elements
   ↓
5. Visual theme change complete (<100ms)
```

### Component Dependencies

**Dependency Graph**:
```
localStorage (storage)
    ↓
Inline Script (init)
    ↓
DOM attribute (state)
    ↓
CSS (visual) ← matchMedia (system pref)
    ↑
theme.js (interaction)
    ↑
Button (UI)
```

**Required Files**:
1. `src/templates/styles.ts` - CSS variables and theme selectors
2. `src/templates/reader.ts` - Inline script + button HTML
3. `src/templates/list.ts` - Inline script + button HTML
4. `public/theme.js` - Client-side theme management

---

## 8. Error Handling Contract

### Purpose
Define graceful failure modes.

### Error Scenarios

| Error | Detection | Handling | User Impact |
|-------|-----------|----------|-------------|
| localStorage unavailable | Try-catch on `setItem()` | Silent failure, session-only theme | Minor (theme persists within session) |
| Invalid theme value | Validation check | Fallback to "auto" | None (invalid values ignored) |
| DOM not ready | Execute after `<head>` parsed | N/A (inline script guarantees order) | None |
| Button missing | Null check in theme.js | Skip button updates | Theme still works via keyboard/system |
| matchMedia unsupported | Feature detection | Skip listener setup | Auto mode still works via CSS |

### Error Recovery

**localStorage Write Failure**:
```javascript
function saveTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
    return { success: true };
  } catch (e) {
    // Log warning, don't block UX
    console.warn('Theme preference not saved:', e.name);
    return { success: false, error: e.name };
  }
}
```

**Invalid Theme Recovery**:
```javascript
function validateAndApplyTheme(theme) {
  const validThemes = ['light', 'dark', 'auto'];

  if (!validThemes.includes(theme)) {
    console.warn(`Invalid theme "${theme}", using auto`);
    theme = 'auto';
  }

  applyTheme(theme);
}
```

---

## 9. Performance Contract

### Purpose
Define performance expectations.

### Performance Targets

| Operation | Target Time | Measurement Method |
|-----------|-------------|-------------------|
| Inline script execution | <5ms | `console.time()` in script |
| Theme switch (click → visual) | <100ms | Chrome DevTools Performance |
| Button icon update | <16ms (1 frame) | `requestAnimationFrame()` |
| CSS variable update | <16ms (1 frame) | Browser repaint |
| localStorage read | <1ms | Synchronous API |
| localStorage write | <1ms | Synchronous API |

### Performance Guarantees

**Preconditions**:
- Modern browser (Chrome/Firefox/Safari/Edge)
- No extreme CPU throttling

**Postconditions**:
- Theme changes perceived as instant (<100ms = human perception threshold)
- No layout shifts (only color changes, no reflow)
- No JavaScript blocking during theme switch

**Invariants**:
- Inline script blocks rendering <5ms (acceptable for FOUC prevention)
- Theme switch is single-threaded (no race conditions)
- Memory footprint <10KB (theme.js + inline script + variables)

---

## 10. Testing Contract

### Purpose
Define how to verify contracts are met.

### Test Cases

**localStorage Contract**:
```javascript
// Test: Read/write cycle
localStorage.setItem('theme', 'dark');
assert(localStorage.getItem('theme') === 'dark');

// Test: Error handling
// (simulate private browsing in browser DevTools)
try {
  localStorage.setItem('theme', 'light');
} catch (e) {
  assert(e.name === 'QuotaExceededError' || e.name === 'SecurityError');
}
```

**DOM Contract**:
```javascript
// Test: Attribute set/get
document.documentElement.setAttribute('data-theme', 'dark');
assert(document.documentElement.getAttribute('data-theme') === 'dark');

// Test: Auto mode (no attribute)
document.documentElement.removeAttribute('data-theme');
assert(document.documentElement.getAttribute('data-theme') === null);
```

**Button Contract**:
```javascript
// Test: Icon updates
updateButton('dark');
assert(button.textContent === '🌙');
assert(button.getAttribute('title') === 'Theme: dark');

// Test: Click cycles theme
simulateClick(button);
// Verify theme changed and localStorage updated
```

### Acceptance Criteria

All contracts verified when:
- [ ] localStorage read/write works with error handling
- [ ] DOM attribute sets/clears correctly
- [ ] CSS variables update on theme change
- [ ] Button icon matches current theme
- [ ] Theme cycles correctly: light → dark → auto → light
- [ ] System preference detected in auto mode
- [ ] FOUC does not occur on page load
- [ ] Performance targets met (<100ms theme switch)

---

## Summary

**8 Contracts Defined**:
1. localStorage Interface - Persistent storage API
2. DOM Attribute Interface - Current theme state
3. CSS Variables Contract - Color system
4. Button UI Contract - Visual control
5. Theme JavaScript API - Client-side functions
6. System Preference Interface - OS theme detection
7. Integration Contract - Component interaction
8. Error Handling Contract - Graceful failures
9. Performance Contract - Speed guarantees
10. Testing Contract - Verification methods

**All Guarantees Documented**:
- Preconditions, postconditions, invariants for each contract
- Error handling strategies
- Performance targets

---

**Status**: ✅ Contracts complete and validated
**Next**: Create quickstart.md developer guide
