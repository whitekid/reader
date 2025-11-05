# Quickstart: Theme Toggle Implementation

**Feature**: 001-theme-toggle
**For**: Developers implementing this feature
**Date**: 2025-11-06

## Overview

This guide walks you through implementing the 3-way theme toggle feature step-by-step. Follow these instructions in order for a smooth implementation.

**Estimated Time**: 2-3 hours
**Difficulty**: Intermediate
**Prerequisites**: Basic knowledge of TypeScript, CSS, vanilla JavaScript

---

## Before You Start

### Required Reading

1. ✅ [spec.md](./spec.md) - Feature requirements
2. ✅ [plan.md](./plan.md) - Technical approach
3. ✅ [research.md](./research.md) - Technical decisions
4. ✅ [data-model.md](./data-model.md) - State management
5. ✅ [contracts/theme-api.md](./contracts/theme-api.md) - API contracts

### Tools & Environment

```bash
# Navigate to project root
cd /Users/whitekid/work/reader

# Verify you're on the feature branch
git branch
# Should show: * 001-theme-toggle

# Install dependencies (if not already)
pnpm install

# Start development server
pnpm dev
# → Opens at http://localhost:8787
```

### File Overview

**Files you'll modify**:
- `src/templates/styles.ts` - Add theme CSS
- `src/templates/reader.ts` - Add toggle button + inline script
- `src/templates/list.ts` - Add toggle button + inline script

**Files you'll create**:
- `public/theme.js` - Client-side theme management

---

## Step 1: Extend CSS with Theme Styles

**File**: `src/templates/styles.ts`
**Estimated Time**: 30 minutes

### 1.1 Understand Current Structure

Open `src/templates/styles.ts` and locate the `globalStyles` constant:

```typescript
const globalStyles = `
  :root {
    --bg: #f8f9fa;
    --text: #212529;
    // ... other variables
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #121212;
      --text: #e9ecef;
      // ... other variables
    }
  }
`;
```

### 1.2 Add Theme Selectors

**Location**: After the existing `:root` and `@media` blocks, before `body` styles

**Code to Add**:
```css
/* Manual light theme - explicit override */
:root[data-theme="light"] {
  --bg: #f8f9fa;
  --text: #212529;
  --text-secondary: #6c757d;
  --toolbar-bg: #ffffff;
  --toolbar-border: #dee2e6;
  --card-bg: #ffffff;
  --card-border: #dee2e6;
  --link: #007bff;
  --link-hover: #0056b3;
  --button-bg: #e9ecef;
  --button-hover: #d3d9df;
}

/* Manual dark theme - explicit override */
:root[data-theme="dark"] {
  --bg: #121212;
  --text: #e9ecef;
  --text-secondary: #adb5bd;
  --toolbar-bg: #1c1c1c;
  --toolbar-border: #343a40;
  --card-bg: #1c1c1c;
  --card-border: #343a40;
  --link: #80bfff;
  --link-hover: #a8d8ff;
  --button-bg: #343a40;
  --button-hover: #495057;
}
```

### 1.3 Modify @media Query

**Find** this block:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #121212;
    // ...
  }
}
```

**Change To** (add `:not([data-theme])`):
```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {  /* ← Add :not([data-theme]) */
    --bg: #121212;
    --text: #e9ecef;
    --text-secondary: #adb5bd;
    --toolbar-bg: #1c1c1c;
    --toolbar-border: #343a40;
    --card-bg: #1c1c1c;
    --card-border: #343a40;
    --link: #80bfff;
    --link-hover: #a8d8ff;
    --button-bg: #343a40;
    --button-hover: #495057;
  }
}
```

**Why**: `:not([data-theme])` ensures auto mode only applies when no manual theme is set.

### 1.4 Add Button Styles

**Location**: In `toolbarStyles` constant, after existing `.toolbar button` styles

**Code to Add**:
```css
.toolbar .theme-toggle-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  margin-left: auto; /* Push to right side */
}

.toolbar .theme-toggle-btn:hover {
  background: var(--button-bg);
}

.toolbar .theme-toggle-btn:focus {
  outline: 2px solid var(--link);
  outline-offset: 2px;
}
```

### 1.5 Verify CSS Changes

```bash
# Run type check
pnpm typecheck
# Should pass with no errors

# View in browser
pnpm dev
# → Changes will hot-reload
```

**Manual Test**:
1. Open DevTools Console
2. Run: `document.documentElement.setAttribute('data-theme', 'dark')`
3. Verify colors change to dark theme
4. Run: `document.documentElement.setAttribute('data-theme', 'light')`
5. Verify colors change to light theme

✅ **Checkpoint**: CSS theme switching works manually via DevTools

---

## Step 2: Create Theme JavaScript

**File**: `public/theme.js` (NEW FILE)
**Estimated Time**: 45 minutes

### 2.1 Create File

```bash
# Create file
touch public/theme.js
```

### 2.2 Add Theme Management Code

**Copy this entire code** into `public/theme.js`:

```javascript
/**
 * Theme Toggle - Client-side theme management
 * Handles button clicks, localStorage persistence, system preference detection
 */

(function() {
  'use strict';

  // Theme constants
  const VALID_THEMES = ['light', 'dark', 'auto'];
  const THEME_KEY = 'theme';
  const THEME_ICONS = {
    light: '☀️',
    dark: '🌙',
    auto: '💻'
  };
  const THEME_LABELS = {
    light: { title: 'Theme: light', aria: 'Toggle theme (current: light, click for dark)' },
    dark: { title: 'Theme: dark', aria: 'Toggle theme (current: dark, click for auto)' },
    auto: { title: 'Theme: auto', aria: 'Toggle theme (current: auto, click for light)' }
  };

  /**
   * Get current theme from DOM or localStorage
   * @returns {string} "light" | "dark" | "auto"
   */
  function getCurrentTheme() {
    // Check DOM attribute first (source of truth for current session)
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') {
      return attr;
    }

    // No attribute = auto mode, check localStorage for confirmation
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored && VALID_THEMES.includes(stored)) {
        return stored;
      }
    } catch (e) {
      // localStorage unavailable, default to auto
    }

    return 'auto';
  }

  /**
   * Get next theme in cycle
   * @param {string} current - Current theme
   * @returns {string} Next theme
   */
  function getNextTheme(current) {
    const cycle = { light: 'dark', dark: 'auto', auto: 'light' };
    return cycle[current] || 'light';
  }

  /**
   * Apply theme to DOM and save to localStorage
   * @param {string} theme - Theme to apply
   */
  function applyTheme(theme) {
    if (!VALID_THEMES.includes(theme)) {
      console.warn(`Invalid theme: ${theme}, using auto`);
      theme = 'auto';
    }

    // Update DOM attribute
    if (theme === 'auto') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }

    // Save to localStorage (with error handling)
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Theme preference not saved (localStorage unavailable):', e.name);
    }

    // Update button UI
    updateButtonState(theme);
  }

  /**
   * Update button icon and labels
   * @param {string} theme - Current theme
   */
  function updateButtonState(theme) {
    const button = document.getElementById('theme-toggle');
    if (!button) return; // Button not found (shouldn't happen)

    const icon = THEME_ICONS[theme];
    const labels = THEME_LABELS[theme];

    button.textContent = icon;
    button.setAttribute('title', labels.title);
    button.setAttribute('aria-label', labels.aria);
  }

  /**
   * Handle toggle button click
   */
  function handleToggleClick() {
    const current = getCurrentTheme();
    const next = getNextTheme(current);
    applyTheme(next);
  }

  /**
   * Set up system preference listener (for auto mode)
   */
  function initSystemThemeListener() {
    // Check if matchMedia is supported
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Listen for system theme changes
    darkModeQuery.addEventListener('change', (event) => {
      const currentTheme = getCurrentTheme();

      // Only react if in auto mode
      if (currentTheme === 'auto') {
        // CSS automatically updates via @media query
        // Just update button icon to ensure it's correct
        updateButtonState('auto');
      }
    });
  }

  /**
   * Initialize theme toggle
   */
  function init() {
    const button = document.getElementById('theme-toggle');
    if (!button) {
      console.warn('Theme toggle button not found');
      return;
    }

    // Set initial button state
    const currentTheme = getCurrentTheme();
    updateButtonState(currentTheme);

    // Attach click handler
    button.addEventListener('click', handleToggleClick);

    // Set up system preference listener
    initSystemThemeListener();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

### 2.3 Verify JavaScript

```bash
# Check file exists
ls -lh public/theme.js
# Should show file size ~4KB

# Check syntax (optional, no build step needed for vanilla JS)
node -c public/theme.js
# No output = no syntax errors
```

✅ **Checkpoint**: theme.js created with all functions

---

## Step 3: Add Toggle to Reader Template

**File**: `src/templates/reader.ts`
**Estimated Time**: 30 minutes

### 3.1 Add Inline Script to `<head>`

**Find** this section in `renderReader()` function:
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(article.title)} - Reader</title>
```

**Add** inline script **AFTER** viewport meta, **BEFORE** title:
```typescript
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Theme initialization (FOUC prevention) -->
  <script>
  (function(){try{const t=localStorage.getItem('theme');if(t&&['light','dark','auto'].includes(t)&&t!=='auto'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();
  </script>

  <title>${escapeHtml(article.title)} - Reader</title>
```

**Note**: Script is minified (single line, no spaces) to reduce size.

### 3.2 Add Toggle Button to Toolbar

**Find** this section:
```html
<div class="toolbar">
  <a href="/"><span class="toolbar-icon">←</span><span class="toolbar-text"> Back</span></a>
  <a href="${escapeHtml(article.url)}" target="_blank">...</a>
  <!-- ... other buttons ... -->
  <form method="POST" action="/r/${article.id}" ...>
    <button type="submit" class="delete">...</button>
  </form>
</div>
```

**Add** theme button **AFTER** last form, **BEFORE** closing `</div>`:
```html
  </form>
  <button
    id="theme-toggle"
    class="theme-toggle-btn"
    title="Theme: auto"
    aria-label="Toggle theme"
    type="button"
  >
    💻
  </button>
</div>
```

### 3.3 Load theme.js

**Find** closing `</body>` tag:
```html
  </div>
</body>
</html>
```

**Add** script tag **BEFORE** `</body>`:
```html
  </div>

  <script src="/public/theme.js" defer></script>
</body>
</html>
```

### 3.4 Verify Reader Template

```bash
# Type check
pnpm typecheck
# Should pass

# Test in browser
pnpm dev
# → Navigate to any article (e.g., http://localhost:8787/r/1)
```

**Manual Test**:
1. Click theme toggle button (💻)
2. Verify it cycles: 💻 → ☀️ → 🌙 → 💻
3. Verify colors change with each click
4. Refresh page - verify theme persists

✅ **Checkpoint**: Theme toggle works in reader view

---

## Step 4: Add Toggle to List Template

**File**: `src/templates/list.ts`
**Estimated Time**: 30 minutes

### 4.1 Add Inline Script to `<head>`

**Find** this section in `renderList()` function:
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reader - ${titleText}</title>
```

**Add** same inline script as in reader.ts:
```typescript
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Theme initialization (FOUC prevention) -->
  <script>
  (function(){try{const t=localStorage.getItem('theme');if(t&&['light','dark','auto'].includes(t)&&t!=='auto'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();
  </script>

  <title>Reader - ${titleText}</title>
```

### 4.2 Add Toggle Button to Toolbar

**Find** this section:
```html
<div class="toolbar">
  <h1 style="margin: 0; font-size: 20px;">📚 Reader</h1>
  <div class="nav-menu" style="display: flex; gap: 10px;">
    <!-- navigation links -->
  </div>
</div>
```

**Add** theme button **AFTER** nav-menu, **BEFORE** closing toolbar `</div>`:
```html
  </div>
  <button
    id="theme-toggle"
    class="theme-toggle-btn"
    title="Theme: auto"
    aria-label="Toggle theme"
    type="button"
  >
    💻
  </button>
</div>
```

### 4.3 Load theme.js

**Find** this line (near end of template):
```html
  <script src="/public/list.js" defer></script>
</body>
</html>
```

**Add** theme.js **BEFORE** list.js:
```html
  <script src="/public/theme.js" defer></script>
  <script src="/public/list.js" defer></script>
</body>
</html>
```

### 4.4 Verify List Template

```bash
# Type check
pnpm typecheck
# Should pass

# Test in browser
pnpm dev
# → Navigate to list (e.g., http://localhost:8787/)
```

**Manual Test**:
1. Click theme toggle button
2. Verify cycling works
3. Navigate to an article (reader view)
4. Verify theme persists
5. Navigate back to list
6. Verify theme still matches

✅ **Checkpoint**: Theme toggle works in list view and persists across pages

---

## Step 5: Testing & Validation

**Estimated Time**: 30 minutes

### 5.1 Functional Testing

**Theme Cycling**:
- [ ] Click toggle 3 times cycles through all themes
- [ ] Each theme displays correct icon (☀️/🌙/💻)
- [ ] Colors update instantly (<100ms perceived)

**Persistence**:
- [ ] Select dark theme → refresh → still dark
- [ ] Select light theme → navigate to article → still light
- [ ] Select auto → close browser → reopen → still auto

**Auto Mode**:
- [ ] Set auto mode → matches system preference
- [ ] Change system theme (OS settings) → colors update
- [ ] Button icon stays as 💻

**Cross-Page**:
- [ ] Set theme on list page → navigate to article → theme persists
- [ ] Set theme on article → back to list → theme persists

### 5.2 Edge Case Testing

**localStorage Errors**:
```javascript
// In DevTools Console:
// 1. Block localStorage (Application tab → Storage → Local Storage → Block)
// 2. Click toggle button
// 3. Verify: Theme changes (session-only), no errors thrown
```

**JavaScript Disabled**:
```javascript
// In DevTools:
// 1. Settings → Debugger → Disable JavaScript
// 2. Refresh page
// 3. Verify: System preference (auto mode) still works
```

**Private Browsing**:
- [ ] Open in private/incognito window
- [ ] Click toggle → verify theme changes
- [ ] Close window → reopen → theme resets (expected, no localStorage)

**Rapid Clicking**:
- [ ] Click toggle button 10 times rapidly
- [ ] Verify: No errors, theme cycles correctly, button icon matches

### 5.3 Performance Testing

**FOUC Test** (most important!):
```bash
# In DevTools:
# 1. Network tab → Throttling → Slow 3G
# 2. Set dark theme via toggle
# 3. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R) 10 times
# 4. Verify: No flash of light colors on any refresh
```

**Theme Switch Speed**:
```javascript
// In DevTools Console:
console.time('themeSwitch');
document.getElementById('theme-toggle').click();
console.timeEnd('themeSwitch');
// Should show: themeSwitch: <100ms
```

**Inline Script Speed**:
```html
<!-- Add to inline script (temporarily): -->
<script>
console.time('init');
(function(){try{const t=localStorage.getItem('theme');if(t&&['light','dark','auto'].includes(t)&&t!=='auto'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();
console.timeEnd('init');
</script>
<!-- Should show: init: <5ms -->
```

### 5.4 Accessibility Testing

**Keyboard Navigation**:
- [ ] Tab to toggle button → Focus visible
- [ ] Press Enter → Theme changes
- [ ] Press Space → Theme changes

**Screen Reader**:
- [ ] Toggle button has `aria-label`
- [ ] Label describes current theme
- [ ] Label updates after each click

**Touch Targets** (mobile):
- [ ] Button is at least 44x44px (inspect in DevTools)
- [ ] Adequate spacing from other buttons

### 5.5 Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS) - if available
- [ ] Mobile Chrome (Android) - if available

**Expected**: Works identically in all browsers

---

## Step 6: Final Verification

### 6.1 Run Project Tests

```bash
# Type check
pnpm typecheck
# Expected: ✅ No errors

# Run tests (if any exist)
pnpm test
# Expected: ✅ All pass
```

### 6.2 Code Review Checklist

**CSS** (`styles.ts`):
- [ ] `[data-theme="light"]` selector exists
- [ ] `[data-theme="dark"]` selector exists
- [ ] `@media` query uses `:not([data-theme])`
- [ ] Button styles added to toolbar

**JavaScript** (`public/theme.js`):
- [ ] IIFE wraps all code (no global pollution)
- [ ] Try-catch on localStorage access
- [ ] Input validation for theme values
- [ ] Button state updates on theme change
- [ ] System preference listener set up

**Templates** (reader.ts, list.ts):
- [ ] Inline script in `<head>` before CSS
- [ ] Toggle button in toolbar
- [ ] theme.js loaded with `defer` attribute
- [ ] Button has `id="theme-toggle"`

### 6.3 Constitution Compliance

Review against project constitution:

**I. Simplicity**:
- [ ] No new dependencies added
- [ ] Minimal file changes (4 files)
- [ ] No complex abstractions

**II. Web Standards**:
- [ ] Vanilla JavaScript (no frameworks)
- [ ] Native APIs only (localStorage, matchMedia)
- [ ] Semantic HTML

**III. Performance**:
- [ ] Inline script <5ms
- [ ] Theme switch <100ms
- [ ] No server-side overhead

**IV. Progressive Enhancement**:
- [ ] Auto mode works without JavaScript
- [ ] Manual toggle is enhancement

**V. Type Safety**:
- [ ] TypeScript type checks pass
- [ ] Runtime validation in JavaScript

---

## Troubleshooting

### Issue: FOUC (Flash of Unstyled Content)

**Symptoms**: Brief flash of wrong theme on page load

**Solution**:
1. Verify inline script is **before** `<style>` tag
2. Check script executes synchronously (no `async`/`defer`)
3. Test with slow network throttling

### Issue: Theme doesn't persist

**Symptoms**: Theme resets to auto on page refresh

**Solution**:
1. Check localStorage in DevTools (Application tab)
2. Verify `localStorage.setItem()` is called
3. Look for localStorage errors in Console

### Issue: Button icon doesn't update

**Symptoms**: Icon stuck on one emoji

**Solution**:
1. Verify `updateButtonState()` is called in `applyTheme()`
2. Check button `id="theme-toggle"` exists
3. Inspect button in Elements tab to see attributes

### Issue: Colors don't change

**Symptoms**: Theme button cycles but colors stay same

**Solution**:
1. Verify CSS `[data-theme]` selectors exist
2. Check `data-theme` attribute in Elements tab
3. Inspect computed CSS variables in DevTools

---

## What's Next?

After completing this quickstart:

1. **Run `/speckit.tasks`** to generate detailed task list
2. **Follow TDD cycle** for any refinements
3. **Update CLAUDE.md** with theme toggle documentation
4. **Create PR** with thorough testing evidence

---

## Quick Reference

**Key Files**:
- `src/templates/styles.ts` - Theme CSS
- `src/templates/reader.ts` - Reader view integration
- `src/templates/list.ts` - List view integration
- `public/theme.js` - Theme management logic

**localStorage Key**: `"theme"`
**Valid Values**: `"light"` | `"dark"` | `"auto"`
**Default**: `"auto"` (system preference)

**Button ID**: `"theme-toggle"`
**Icons**: ☀️ (light), 🌙 (dark), 💻 (auto)

**Testing URL**: http://localhost:8787

---

**Quickstart Complete!** 🎉

You've successfully implemented the theme toggle feature. Proceed to `/speckit.tasks` for detailed task breakdown.
