# Feature Specification: 3-Way Theme Toggle

**Feature Branch**: `001-theme-toggle`
**Created**: 2025-11-06
**Status**: Draft
**Input**: User description: "Add 3-way theme toggle (Light/Dark/Auto) to Reader application toolbar. Users should be able to manually select theme preference which overrides system setting. Default behavior (no selection) uses system preference. Theme selection persists via localStorage across sessions and pages. Toggle button cycles through: ☀️ Light → 🌙 Dark → 💻 Auto. Prevent FOUC with inline script. All pages (list, reader) must apply theme consistently. Implementation uses data-theme attribute and extends existing CSS variable system."

## User Scenarios & Testing

### User Story 1 - Manual Theme Selection (Priority: P1)

As a reader, I want to manually select my preferred color theme (light, dark, or auto) so that I can read articles in my preferred visual mode regardless of my system settings.

**Why this priority**: This is the core functionality - without the ability to select a theme, the feature provides no value. This story delivers immediate user value by enabling manual theme control.

**Independent Test**: Can be fully tested by clicking the theme toggle button and observing the page appearance change. Delivers value by allowing users to override system preferences.

**Acceptance Scenarios**:

1. **Given** user is on any page with default (auto) theme, **When** user clicks the theme toggle button once, **Then** page switches to light theme and button shows ☀️ icon
2. **Given** page is in light theme, **When** user clicks the theme toggle button once, **Then** page switches to dark theme and button shows 🌙 icon
3. **Given** page is in dark theme, **When** user clicks the theme toggle button once, **Then** page switches to auto theme (system preference) and button shows 💻 icon
4. **Given** user has any theme selected, **When** theme changes, **Then** all page elements update their colors immediately (<100ms)
5. **Given** user is viewing an article, **When** user changes theme, **Then** article content remains readable with proper contrast

---

### User Story 2 - Theme Persistence Across Sessions (Priority: P2)

As a returning user, I want my theme selection to be remembered across browser sessions so that I don't need to reselect my preference every time I visit.

**Why this priority**: Persistence enhances usability but the feature is still functional without it. This prevents user frustration from repeatedly selecting the same preference.

**Independent Test**: Can be tested independently by selecting a theme, closing the browser, reopening, and verifying the theme persists. Delivers value by maintaining user preferences.

**Acceptance Scenarios**:

1. **Given** user selects light theme, **When** user closes and reopens browser, **Then** light theme is still active
2. **Given** user selects dark theme, **When** user refreshes the page, **Then** dark theme remains active
3. **Given** user selects auto theme, **When** user navigates between pages (list ↔ reader), **Then** auto theme is maintained
4. **Given** user has never selected a theme, **When** user first visits the site, **Then** system preference (auto mode) is used as default

---

### User Story 3 - Seamless Theme Application (Priority: P3)

As a user, I want the correct theme to be applied immediately when the page loads so that I never see a flash of the wrong colors.

**Why this priority**: This enhances user experience but the feature is still usable with minor visual glitches. Prevents jarring visual flashes that can be distracting.

**Independent Test**: Can be tested by setting a theme, hard refreshing the page multiple times, and verifying no flash of incorrect colors occurs. Delivers professional polish to the experience.

**Acceptance Scenarios**:

1. **Given** user has dark theme selected, **When** user loads any page, **Then** dark theme is applied before content renders (no FOUC)
2. **Given** user has light theme selected, **When** user navigates between pages, **Then** light theme is consistently applied on all pages
3. **Given** user's system is in dark mode with auto theme selected, **When** page loads, **Then** dark theme is applied matching system preference
4. **Given** user's localStorage is unavailable, **When** page loads, **Then** system preference is used as graceful fallback

---

### Edge Cases

- What happens when localStorage is disabled or unavailable (private browsing mode)?
  - System should gracefully fallback to auto mode (system preference)
  - Theme toggle should still work for the current session

- What happens when user changes system theme while auto mode is active?
  - Page should automatically reflect the new system theme
  - No manual refresh required

- What happens when JavaScript is disabled?
  - System preference (auto mode) should still work via CSS media queries
  - Manual toggle will not function (graceful degradation)

- What happens on first visit with no localStorage data?
  - Default to auto mode (system preference)
  - Button shows 💻 icon to indicate auto mode

- What happens when user rapidly clicks the toggle button?
  - System should handle rapid clicks gracefully
  - Each click should cycle to next theme without lag or skipped states

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a theme toggle button visible in the toolbar on all pages
- **FR-002**: System MUST cycle through three themes in order: Light → Dark → Auto → Light when button is clicked
- **FR-003**: System MUST display visual indicator (☀️ for light, 🌙 for dark, 💻 for auto) on the toggle button reflecting current theme
- **FR-004**: System MUST persist user's theme selection in browser's local storage
- **FR-005**: System MUST apply persisted theme preference on page load before rendering content
- **FR-006**: System MUST use system preference (prefers-color-scheme) when auto mode is selected or no preference is stored
- **FR-007**: System MUST apply theme consistently across all pages (list view and reader view)
- **FR-008**: System MUST apply theme changes immediately without page reload (<100ms)
- **FR-009**: System MUST maintain existing color scheme and design when switching themes (only color values change, not layout)
- **FR-010**: System MUST continue to function with graceful degradation when localStorage is unavailable (fallback to auto mode for session)
- **FR-011**: System MUST continue to support system preference when JavaScript is disabled (via CSS media queries)

### Key Entities

- **Theme Preference**: User's selected theme mode
  - Possible values: "light", "dark", "auto"
  - Stored in: localStorage key "theme"
  - Applied via: data-theme attribute on document root element
  - Default value: "auto" (no stored preference)

- **Theme State**: Current visual theme applied to the page
  - Determined by: User preference (if set) or system preference (if auto)
  - Affects: CSS custom properties (--bg, --text, --toolbar-bg, etc.)
  - Scope: All page elements using CSS variable system

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can switch between themes in under 100ms (instant visual feedback)
- **SC-002**: Theme preference persists across 100% of browser sessions (when localStorage is available)
- **SC-003**: Zero flash of incorrect theme (FOUC) occurs on page load
- **SC-004**: Theme appears consistently across all pages (list and reader views)
- **SC-005**: Users can complete theme change with a single click (cycle through all options)
- **SC-006**: System supports 100% of users regardless of localStorage availability (graceful degradation)
