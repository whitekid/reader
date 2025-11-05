# Implementation Plan: 3-Way Theme Toggle

**Branch**: `001-theme-toggle` | **Date**: 2025-11-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-theme-toggle/spec.md`

## Summary

Add a 3-way theme toggle (Light/Dark/Auto) to the Reader application toolbar that allows users to manually override system theme preferences. The toggle button cycles through three states using visual indicators (☀️/🌙/💻), persists selections in localStorage, and applies themes immediately without page reload. The implementation extends the existing CSS variable system with data-theme attributes and includes inline initialization scripts to prevent FOUC (Flash of Unstyled Content).

**Technical Approach**:
- CSS: Extend existing `:root` CSS variables with `[data-theme="light"]`, `[data-theme="dark"]`, `[data-theme="auto"]` selectors
- Client-side: Vanilla JavaScript for theme management (no frameworks) with localStorage persistence
- Server-side: Add toggle button HTML to existing toolbar templates (reader.ts, list.ts)
- FOUC Prevention: Inline `<script>` in `<head>` to apply theme before CSS loads

## Technical Context

**Language/Version**: TypeScript 5.3.3, Vanilla JavaScript (ES2020+ for client-side)
**Primary Dependencies**:
- Existing: @mozilla/readability 0.6.0, linkedom 0.16.0
- New: None (vanilla JS for client-side theme management)
**Storage**: localStorage (browser-native, no server-side storage)
**Testing**: Vitest 2.0.0 (existing), manual browser testing for theme transitions
**Target Platform**: Cloudflare Workers (server-side), Modern browsers (client-side: Chrome, Firefox, Safari, Edge)
**Project Type**: Web application with server-side rendering (Cloudflare Workers + HTML templates)
**Performance Goals**:
- Theme switch: <100ms response time
- Inline script execution: <5ms
- Total JavaScript size: <3KB (inline + theme.js)
**Constraints**:
- Cloudflare Workers CPU limit: 50ms per request
- No server-side session storage (use localStorage only)
- Support JavaScript-disabled graceful degradation
- No build tools for client-side code (vanilla JS)
**Scale/Scope**:
- 2 templates to modify (list.ts, reader.ts)
- 1 new client JS file (public/theme.js)
- 1 CSS file to extend (templates/styles.ts)
- ~150 lines of new code total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. 단순성 우선 (Simplicity First)

**Compliance**:
- ✅ No new dependencies required (vanilla JavaScript)
- ✅ Affects 3 files (styles.ts, reader.ts, list.ts) + 1 new file (theme.js) - within 3-file guideline with justification
- ✅ No new abstraction layers - extends existing CSS variable system

**Justification for 4-file change**:
- All 4 files are tightly coupled to the same feature (theme toggle)
- styles.ts: CSS foundation (must change for theming)
- reader.ts + list.ts: Both need identical toggle button (unavoidable duplication for SSR)
- theme.js: Client-side logic (necessary for interactivity)
- Alternative (single template) would require complex template inheritance system (more complex)

### ✅ II. 웹 표준 준수 (Web Standards Compliance)

**Compliance**:
- ✅ Uses native localStorage API (Web Storage Standard)
- ✅ Uses CSS custom properties and data attributes (CSS Custom Properties Level 1)
- ✅ Vanilla JavaScript only (no frameworks, no transpilation)
- ✅ Semantic HTML button element
- ✅ CSS media query `prefers-color-scheme` for auto mode

### ✅ III. 성능과 효율성 (Performance & Efficiency)

**Compliance**:
- ✅ No server-side processing overhead (client-side only feature)
- ✅ Inline script executes in <5ms (localStorage read + attribute set)
- ✅ No additional HTTP requests (inline script + static JS file)
- ✅ CSS changes trigger only style recalc, no layout/reflow

**Performance Budget**:
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Theme switch time | <100ms | Browser DevTools Performance tab |
| Inline script execution | <5ms | `console.time()` in script |
| JavaScript file size | <3KB | `ls -lh public/theme.js` |
| FOUC occurrence | 0% | Manual visual testing |

### ✅ IV. 점진적 향상 (Progressive Enhancement)

**Compliance**:
- ✅ Core functionality (system preference) works without JavaScript via CSS `@media (prefers-color-scheme)`
- ✅ JavaScript only adds manual theme selection (enhancement)
- ✅ Toggle button gracefully hidden when JS disabled (CSS `display: none` fallback)

**Graceful Degradation Strategy**:
| Feature | JavaScript Enabled | JavaScript Disabled |
|---------|-------------------|---------------------|
| System theme | ✅ Works | ✅ Works (CSS @media query) |
| Manual theme selection | ✅ Works | ❌ Not available (acceptable) |
| Theme persistence | ✅ Works | ❌ Session-only (acceptable) |
| Toggle button | ✅ Visible & functional | ⚠️ Hidden (CSS) |

### ✅ V. 타입 안전성과 검증 (Type Safety & Validation)

**Compliance**:
- ✅ TypeScript for template changes (reader.ts, list.ts, styles.ts)
- ⚠️ Vanilla JavaScript for client-side (theme.js) - no TypeScript compilation
- ✅ Input validation: theme values restricted to "light" | "dark" | "auto"
- ✅ Error handling: localStorage unavailable → fallback to auto mode

**Type Safety Strategy**:
- Server-side: Full TypeScript with `npm run typecheck`
- Client-side: JSDoc comments + runtime validation
- Rationale: Avoid build complexity per constitution principle II (no transpilation for client code)

**Runtime Validation**:
```javascript
// theme.js will include:
const VALID_THEMES = ['light', 'dark', 'auto'];
function isValidTheme(theme) {
  return VALID_THEMES.includes(theme);
}
```

### Constitution Compliance Summary

**Status**: ✅ **APPROVED** with justified exceptions

**Exceptions**:
1. **4-file modification** (vs 3-file guideline): Justified by feature coupling and SSR requirements
2. **Client-side JavaScript without TypeScript**: Justified by constitution principle II (no build tools for client code)

**No Complexity Violations**: All principles followed within documented project standards.

## Project Structure

### Documentation (this feature)

```text
specs/001-theme-toggle/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0: CSS architecture & FOUC prevention research
├── data-model.md        # Phase 1: Theme state model
├── quickstart.md        # Phase 1: Developer guide
├── contracts/           # Phase 1: Theme API contract
│   └── theme-api.md     # localStorage interface + CSS contract
└── tasks.md             # Phase 2: Implementation tasks (/speckit.tasks output - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── templates/
│   ├── styles.ts        # ✏️ MODIFY: Add [data-theme] CSS selectors
│   ├── reader.ts        # ✏️ MODIFY: Add theme toggle button + inline script
│   └── list.ts          # ✏️ MODIFY: Add theme toggle button + inline script
├── handlers/            # ✅ NO CHANGE
├── services/            # ✅ NO CHANGE
└── types.ts             # ✅ NO CHANGE (no new server-side types needed)

public/
├── theme.js             # ✨ NEW: Client-side theme management logic
├── list.js              # ✅ NO CHANGE
├── favicon.svg          # ✅ NO CHANGE
└── robots.txt           # ✅ NO CHANGE

tests/
└── (manual testing)     # Browser-based testing for theme transitions
```

**Structure Decision**: Single project (Option 1) - existing Cloudflare Workers application with server-side templates and static client assets. No backend/frontend split needed as this is a pure client-side enhancement to existing SSR templates.

**File Change Summary**:
| File | Change Type | Reason |
|------|-------------|--------|
| `src/templates/styles.ts` | Modify | Add theme-specific CSS variables |
| `src/templates/reader.ts` | Modify | Add toggle button + inline script to `<head>` |
| `src/templates/list.ts` | Modify | Add toggle button + inline script to `<head>` |
| `public/theme.js` | Create | Theme management logic (keep separate from page-specific list.js) |

## Complexity Tracking

> No violations requiring justification - all design decisions align with constitution principles.

**Design Rationale**:
- **No new dependencies**: Vanilla JS sufficient for theme toggle
- **Minimal file changes**: 3 template modifications + 1 new JS file (justified above)
- **No abstractions**: Direct CSS variable manipulation, no theme management library
- **Progressive enhancement**: System preference works without JS

**Simpler Alternatives Rejected**:

| Alternative | Why Rejected |
|-------------|--------------|
| CSS-only with `:has()` or checkboxes | Cannot persist across page loads without localStorage (JS required) |
| Server-side cookie for theme storage | Violates constitution I (adds server-side complexity) + unnecessary network overhead |
| Single template with shared component | Requires template inheritance system (more complex than duplicating 10-line button HTML) |
| React/Vue for theme management | Violates constitution II (frameworks not allowed for client code) |

## Phase 0: Research

### Research Questions

1. **CSS Architecture**: How to extend existing CSS variable system with data-theme attributes while preserving auto mode behavior?
2. **FOUC Prevention**: Where exactly to place inline script in `<head>` to prevent flash of wrong theme?
3. **localStorage Patterns**: Best practices for theme persistence with graceful degradation?
4. **CSS Selector Specificity**: How to ensure data-theme selectors override @media queries correctly?

### Research Plan

**R-001: CSS Theme Architecture**
- **Question**: How to structure CSS with `[data-theme]` selectors alongside existing `@media (prefers-color-scheme)`?
- **Method**: Review existing styles.ts structure, design selector specificity rules
- **Output**: CSS selector design pattern documented in research.md

**R-002: FOUC Prevention Strategies**
- **Question**: What's the optimal inline script placement and execution timing to prevent theme flash?
- **Method**: Research FOUC prevention techniques, analyze browser rendering pipeline
- **Output**: Inline script template and placement guidelines in research.md

**R-003: localStorage Best Practices**
- **Question**: How to handle localStorage unavailability (private browsing, quota exceeded, disabled)?
- **Method**: Review Web Storage API spec, common fallback patterns
- **Output**: Error handling strategy and fallback mechanism in research.md

**R-004: System Preference Detection**
- **Question**: How to detect and react to system theme changes in auto mode?
- **Method**: Research `matchMedia()` API and `change` event listeners
- **Output**: System theme listener implementation pattern in research.md

## Phase 1: Design & Contracts

### Data Model

**Entity**: Theme Preference
- **Properties**:
  - `theme`: "light" | "dark" | "auto"
  - Storage: localStorage key "theme"
- **State Transitions**:
  - light → dark → auto → light (cycle)
- **Validation**: Value must be one of three allowed themes
- **Default**: "auto" (when no localStorage value exists)

### API Contracts

**Contract**: Theme Management Interface

**localStorage Contract**:
```javascript
// Read theme preference
const theme = localStorage.getItem('theme'); // Returns: "light" | "dark" | "auto" | null

// Write theme preference
localStorage.setItem('theme', theme); // Accepts: "light" | "dark" | "auto"
```

**CSS Contract**:
```css
/* Selector specificity order (low to high): */
:root { /* Base variables (default/auto) */ }
:root[data-theme="light"] { /* Light theme override */ }
:root[data-theme="dark"] { /* Dark theme override */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) { /* Auto mode: system preference */ }
}
```

**DOM API Contract**:
```javascript
// Get current theme
const currentTheme = document.documentElement.getAttribute('data-theme') || 'auto';

// Set theme
document.documentElement.setAttribute('data-theme', theme);

// Remove theme (revert to auto)
document.documentElement.removeAttribute('data-theme');
```

**Button State Contract**:
```javascript
// Button icon mapping
const THEME_ICONS = {
  light: '☀️',
  dark: '🌙',
  auto: '💻'
};

// Button updates when theme changes
button.textContent = THEME_ICONS[theme];
button.setAttribute('title', `Theme: ${theme}`);
```

### Component Design

**Component**: Theme Toggle Button

**Location**: Toolbar (right side after existing buttons)
**HTML Structure**:
```html
<button
  id="theme-toggle"
  class="theme-toggle-btn"
  title="Theme: auto"
  aria-label="Toggle theme"
>
  💻
</button>
```

**CSS Styling**:
- Inherit toolbar button styles from existing `.toolbar button`
- Mobile: Show icon only (consistent with existing navigation buttons)
- Desktop: Show icon only (compact design)
- Hover: Same as existing toolbar buttons

**Behavior**:
- Click: Cycle to next theme + update localStorage + update icon
- Visual feedback: <100ms theme transition
- Keyboard accessible: Standard button focus/activation

### Integration Points

**Template Integration**:
1. **Inline Script** (in `<head>` before CSS):
   ```html
   <script>
   (function() {
     try {
       const theme = localStorage.getItem('theme');
       if (theme && ['light','dark','auto'].includes(theme)) {
         if (theme !== 'auto') {
           document.documentElement.setAttribute('data-theme', theme);
         }
       }
     } catch (e) {
       // localStorage unavailable, use auto mode
     }
   })();
   </script>
   ```

2. **Toggle Button** (in toolbar HTML):
   - Add to existing `<div class="toolbar">` after last navigation link
   - Duplicate in both reader.ts and list.ts templates

3. **Theme Script** (load at end of `<body>`):
   ```html
   <script src="/public/theme.js" defer></script>
   ```

**File Dependencies**:
```
styles.ts (CSS)
    ↓ provides variables
reader.ts (HTML) ← inline script (reads theme) + button HTML
    ↓ loads
theme.js (JS) ← button click handler (writes theme)
```

## Phase 2: Task Planning

> **Note**: Detailed tasks will be generated by `/speckit.tasks` command after Phase 1 is complete.

**Task Categories** (Preview):
1. **Setup** (1 task): Create theme.js file structure
2. **CSS Foundation** (3 tasks): Add data-theme selectors to styles.ts
3. **Template Integration** (4 tasks): Add inline scripts + buttons to reader.ts and list.ts
4. **Client Logic** (3 tasks): Implement theme.js functionality
5. **Testing** (3 tasks): Manual browser testing across themes/browsers
6. **Polish** (2 tasks): Mobile responsive tweaks, icon refinement

**Estimated Total**: ~16 atomic tasks across 6 phases

**Parallel Opportunities**:
- Tasks 2.1-2.3 (CSS) can run parallel to Tasks 3.1-3.4 (Templates)
- Tasks 4.1-4.3 (Client Logic) depend on Task 1.1 (file creation)
- Tasks 5.1-5.3 (Testing) must run after all implementation complete

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| FOUC on page load | Medium | High (poor UX) | Inline script in `<head>` + thorough testing |
| localStorage quota exceeded | Low | Low (fallback to auto) | Try-catch with graceful degradation |
| CSS selector specificity conflicts | Low | Medium (theme not applied) | Careful selector design + testing |
| System theme change not detected | Low | Low (auto mode stale) | matchMedia listener in theme.js |
| Rapid clicking causes race condition | Medium | Low (wrong icon) | Debounce or single-event-loop guarantee |

### Mitigation Strategies

**FOUC Prevention**:
- Inline script executes synchronously before CSS loads
- Only set attribute if valid theme exists (avoid null/undefined flash)
- Test with slow 3G network simulation

**localStorage Errors**:
```javascript
function saveTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {
    console.warn('Theme preference not saved:', e);
    // Continue with in-memory theme (session only)
  }
}
```

**CSS Specificity**:
```css
/* ✅ GOOD: Explicit data-theme overrides auto mode */
:root[data-theme="light"] { --bg: #f8f9fa; } /* Specificity: [0,1,0,1] */

/* ✅ GOOD: Auto mode with media query */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) { --bg: #121212; } /* Only when no data-theme */
}
```

**System Theme Listener**:
```javascript
// Listen for system theme changes (auto mode only)
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', () => {
  const currentTheme = getCurrentTheme();
  if (currentTheme === 'auto') {
    // System theme changed, CSS will update automatically
    updateButtonIcon('auto'); // Update button to show correct state
  }
});
```

## Performance Optimization

### Bundle Size

| File | Size | Optimization |
|------|------|--------------|
| Inline script | ~150 bytes | Minified IIFE, no comments |
| theme.js | <3KB | Vanilla JS, no dependencies, minification-ready |
| CSS additions | ~500 bytes | Reuse existing variables, minimal new rules |
| Button HTML | ~100 bytes | Simple `<button>` element |
| **Total overhead** | **<4KB** | Acceptable for feature value |

### Execution Performance

**Critical Path**:
1. HTML parse → inline script executes (~1-2ms)
2. Attribute set on `<html>` → CSS applies theme (~1-2ms)
3. Render with correct theme (no FOUC)

**Non-Critical Path**:
1. theme.js loads (defer, after DOM ready)
2. Button click handler attached
3. User interaction triggers theme change

**Performance Targets**:
- Inline script: <5ms (measured via `console.time()`)
- Theme switch: <100ms (perceived as instant)
- No layout thrashing (only color changes)

### Caching Strategy

- theme.js: Static file, cache with long TTL (1 year)
- Inline script: Embedded in HTML, no caching needed
- localStorage: Persistent across sessions, no expiration

## Rollback Plan

### Graceful Degradation Path

**If feature must be disabled**:
1. Remove toggle button from templates (2 line changes in reader.ts, list.ts)
2. Remove inline script from `<head>` (remove `<script>` blocks)
3. Keep data-theme CSS (harmless if unused)
4. Keep theme.js (won't execute if button missing)

**Rollback Effort**: <10 minutes (2 git reverts)

### Backward Compatibility

**Before Feature**: System preference via `@media (prefers-color-scheme)`
**After Feature**: Same behavior + optional manual override

**No Breaking Changes**:
- Existing CSS variables unchanged
- No server-side API changes
- No database schema changes
- Pure client-side enhancement

### A/B Testing Possibility

**Feature Flag Option** (if needed):
```typescript
// In template rendering
const THEME_TOGGLE_ENABLED = env.FEATURE_THEME_TOGGLE === 'true';
if (THEME_TOGGLE_ENABLED) {
  // Include toggle button HTML + scripts
}
```

**Not required for initial rollout**: Low-risk client-side-only feature

## Success Metrics

### Acceptance Criteria (from spec)

- ✅ SC-001: Theme switches in <100ms
- ✅ SC-002: 100% persistence (when localStorage available)
- ✅ SC-003: Zero FOUC on page load
- ✅ SC-004: Consistent across all pages
- ✅ SC-005: Single click to cycle themes
- ✅ SC-006: Graceful degradation for all users

### Validation Methods

| Criterion | Test Method | Pass Condition |
|-----------|-------------|----------------|
| SC-001 (Speed) | Chrome DevTools Performance | Paint time <100ms after click |
| SC-002 (Persistence) | Browser close/reopen | Theme same after restart |
| SC-003 (No FOUC) | Hard refresh 10x | Zero visual flash observed |
| SC-004 (Consistency) | Navigate list ↔ reader | Theme unchanged on navigation |
| SC-005 (Single click) | Manual interaction | 3 clicks cycle through all themes |
| SC-006 (Degradation) | Private browsing + JS off | Auto mode still works |

### Testing Checklist

**Browser Compatibility**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**Functionality**:
- [ ] Light → Dark → Auto cycling works
- [ ] localStorage saves and loads correctly
- [ ] Page refresh maintains theme
- [ ] Cross-page navigation maintains theme
- [ ] Private browsing mode falls back to auto
- [ ] System theme change detected in auto mode
- [ ] Rapid clicking doesn't break state

**Performance**:
- [ ] Theme switch <100ms (measured)
- [ ] No FOUC on page load (visual test)
- [ ] No layout shifts during theme change
- [ ] Inline script <5ms (measured)

**Accessibility**:
- [ ] Button keyboard accessible (Tab + Enter)
- [ ] Button has accessible label (`aria-label`)
- [ ] Focus indicator visible
- [ ] Icon size adequate for touch targets (44x44px minimum)

## Next Steps

### Phase 0: Research (Immediate)
1. Run research agents to resolve NEEDS CLARIFICATION items
2. Document findings in `research.md`
3. Finalize CSS architecture and FOUC prevention strategy

### Phase 1: Design (After Research)
1. Create `data-model.md` with theme state transitions
2. Create `contracts/theme-api.md` with localStorage + CSS contracts
3. Create `quickstart.md` with developer implementation guide
4. Run agent context update script

### Phase 2: Tasks (After Design)
1. Run `/speckit.tasks` to generate atomic task list
2. Review and adjust task dependencies
3. Proceed to `/speckit.implement` for execution

### Ready for Implementation When:
- [x] Specification approved (spec.md complete)
- [ ] Research complete (research.md generated)
- [ ] Design complete (data-model.md + contracts/ generated)
- [ ] Tasks generated (tasks.md from `/speckit.tasks`)

---

**Plan Status**: ✅ Phase 0 & 1 structure defined, ready for research execution
**Next Command**: Continue with Phase 0 research execution (automated by this command)
