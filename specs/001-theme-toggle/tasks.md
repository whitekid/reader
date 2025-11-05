# Tasks: 3-Way Theme Toggle

**Input**: Design documents from `/specs/001-theme-toggle/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test tasks included per specification - manual browser testing only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project structure with `src/`, `public/` at repository root
- TypeScript templates in `src/templates/`
- Client JavaScript in `public/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create theme management JavaScript file structure

- [x] T001 Create public/theme.js file with IIFE wrapper and JSDoc comments

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: CSS foundation that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until CSS theme variables are defined

- [x] T002 Add [data-theme="light"] selector with 11 CSS variables to src/templates/styles.ts
- [x] T003 Add [data-theme="dark"] selector with 11 CSS variables to src/templates/styles.ts
- [x] T004 Modify @media (prefers-color-scheme: dark) to use :not([data-theme]) selector in src/templates/styles.ts

**Checkpoint**: CSS foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Manual Theme Selection (Priority: P1) 🎯 MVP

**Goal**: Enable users to manually select and immediately see light, dark, or auto theme

**Independent Test**: Click theme toggle button, observe immediate color change and button icon update (☀️/🌙/💻)

### Implementation for User Story 1

- [x] T005 [P] [US1] Implement getCurrentTheme() function in public/theme.js
- [x] T006 [P] [US1] Implement getNextTheme() function with light→dark→auto cycle logic in public/theme.js
- [x] T007 [US1] Implement applyTheme() function to update DOM data-theme attribute in public/theme.js
- [x] T008 [US1] Implement updateButtonState() function to update icon (☀️/🌙/💻) and aria-label in public/theme.js
- [x] T009 [US1] Implement handleToggleClick() event handler in public/theme.js
- [x] T010 [US1] Add theme toggle button HTML to toolbar in src/templates/reader.ts
- [x] T011 [US1] Add <script src="/public/theme.js" defer></script> to end of <body> in src/templates/reader.ts
- [x] T012 [US1] Add theme toggle button HTML to toolbar in src/templates/list.ts
- [x] T013 [US1] Add <script src="/public/theme.js" defer></script> to end of <body> in src/templates/list.ts
- [x] T014 [US1] Add DOMContentLoaded event listener to initialize button click handler in public/theme.js

**Checkpoint**: User Story 1 complete - manual theme selection works with immediate visual feedback

---

## Phase 4: User Story 2 - Theme Persistence (Priority: P2)

**Goal**: Remember user's theme selection across browser sessions and page navigation

**Independent Test**: Select theme, close browser, reopen, verify theme persists; navigate between pages, verify theme maintained

### Implementation for User Story 2

- [x] T015 [US2] Add localStorage.setItem('theme', theme) to applyTheme() function in public/theme.js
- [x] T016 [US2] Add try-catch error handling for localStorage write failures in public/theme.js
- [x] T017 [US2] Update getCurrentTheme() to read from localStorage as fallback in public/theme.js
- [x] T018 [US2] Add localStorage validation to only accept "light"|"dark"|"auto" values in public/theme.js

**Checkpoint**: User Story 2 complete - theme preference persists across sessions and pages

---

## Phase 5: User Story 3 - Seamless Theme Application (Priority: P3)

**Goal**: Apply theme before page renders to prevent FOUC (Flash of Unstyled Content)

**Independent Test**: Hard refresh page with theme selected, verify no flash of wrong colors occurs

### Implementation for User Story 3

- [x] T019 [US3] Add inline synchronous <script> to <head> before <style> in src/templates/reader.ts
- [x] T020 [US3] Implement IIFE in inline script to read localStorage and set data-theme attribute in src/templates/reader.ts
- [x] T021 [US3] Add try-catch to inline script for graceful localStorage failure handling in src/templates/reader.ts
- [x] T022 [US3] Add theme validation to inline script (only "light"|"dark"|"auto") in src/templates/reader.ts
- [x] T023 [US3] Add inline synchronous <script> to <head> before <style> in src/templates/list.ts
- [x] T024 [US3] Implement IIFE in inline script to read localStorage and set data-theme attribute in src/templates/list.ts
- [x] T025 [US3] Add try-catch to inline script for graceful localStorage failure handling in src/templates/list.ts
- [x] T026 [US3] Add theme validation to inline script (only "light"|"dark"|"auto") in src/templates/list.ts
- [x] T027 [US3] Implement initSystemThemeListener() function with matchMedia API in public/theme.js
- [x] T028 [US3] Add matchMedia 'change' event listener for auto mode system theme updates in public/theme.js

**Checkpoint**: User Story 3 complete - no FOUC occurs, system theme changes detected in auto mode

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, optimization, and documentation

- [ ] T029 [P] Manual browser testing: Chrome, Firefox, Safari, Edge (theme cycling works)
- [ ] T030 [P] Manual browser testing: Theme persistence across refresh and browser restart
- [ ] T031 [P] Manual browser testing: No FOUC on hard refresh with slow 3G simulation
- [ ] T032 [P] Manual browser testing: Cross-page navigation (list ↔ reader) maintains theme
- [ ] T033 [P] Manual browser testing: Private browsing mode graceful fallback to auto
- [ ] T034 [P] Manual browser testing: Rapid button clicking stability
- [ ] T035 Measure inline script execution time (<5ms target) with console.time()
- [ ] T036 Measure theme switch time (<100ms target) with Chrome DevTools Performance
- [ ] T037 Verify theme.js file size (<3KB target) with ls -lh
- [ ] T038 Test keyboard accessibility (Tab navigation, Enter to activate button)
- [ ] T039 Verify button touch target size (44x44px minimum) on mobile
- [ ] T040 Test with JavaScript disabled (auto mode CSS @media query still works)
- [x] T041 Code review: verify THEME_ICONS constant matches spec (☀️/🌙/💻)
- [x] T042 Code review: verify button title attributes update correctly
- [x] T043 Run TypeScript type check with npm run typecheck for template files
- [x] T044 Validate quickstart.md implementation guide matches actual code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can proceed after Phase 2
  - User Story 2 (Phase 4): Depends on User Story 1 (modifies applyTheme from T007)
  - User Story 3 (Phase 5): Independent of US1/US2 but requires CSS from Phase 2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Core theme switching
- **User Story 2 (P2)**: Depends on User Story 1 (T007 applyTheme must exist) - Adds persistence
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent FOUC prevention

### Within Each User Story

**User Story 1**:
- T005, T006 (functions) can run parallel
- T007 (applyTheme) depends on T005, T006
- T008 (button state) parallel to T007
- T009 (click handler) depends on T007, T008
- T010, T012 (HTML) parallel to JS functions
- T011, T013 (script tags) after T010, T012
- T014 (event listener) must be last

**User Story 2**:
- All tasks modify applyTheme (T007) and getCurrentTheme (T005)
- T015-T018 are sequential refinements to existing functions

**User Story 3**:
- T019-T022 (reader.ts inline script) parallel to T023-T026 (list.ts inline script)
- T027-T028 (system theme listener) parallel to inline scripts
- All depend on CSS from Phase 2

### Parallel Opportunities

- **Phase 1**: Only 1 task (T001) - no parallelization
- **Phase 2**: T002, T003, T004 can run parallel (different CSS blocks)
- **Phase 3**: T005, T006, T008, T010, T012 can run parallel (different functions/files)
- **Phase 5**: T019-T022 parallel to T023-T026 (reader.ts vs list.ts), both parallel to T027-T028
- **Phase 6**: T029-T034, T041-T042 all parallel (different test scenarios/reviews)

---

## Parallel Example: User Story 1

```bash
# Launch parallel JS function implementations:
Task: "Implement getCurrentTheme() function in public/theme.js"
Task: "Implement getNextTheme() function with light→dark→auto cycle logic in public/theme.js"
Task: "Implement updateButtonState() function in public/theme.js"

# Launch parallel HTML additions:
Task: "Add theme toggle button HTML to toolbar in src/templates/reader.ts"
Task: "Add theme toggle button HTML to toolbar in src/templates/list.ts"
```

## Parallel Example: User Story 3

```bash
# Launch both template inline scripts in parallel:
Task: "Add inline synchronous <script> to <head> before <style> in src/templates/reader.ts"
Task: "Add inline synchronous <script> to <head> before <style> in src/templates/list.ts"

# Launch system theme listener in parallel:
Task: "Implement initSystemThemeListener() function with matchMedia API in public/theme.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T004) - CRITICAL
3. Complete Phase 3: User Story 1 (T005-T014)
4. **STOP and VALIDATE**: Test theme toggle works with immediate visual feedback
5. Demo: Users can now manually select themes

### Incremental Delivery

1. **Foundation**: Setup + Foundational (T001-T004) → CSS variables ready
2. **MVP (US1)**: Add User Story 1 (T005-T014) → Test theme cycling → Deploy/Demo
3. **Enhancement (US2)**: Add User Story 2 (T015-T018) → Test persistence → Deploy/Demo
4. **Polish (US3)**: Add User Story 3 (T019-T028) → Test FOUC prevention → Deploy/Demo
5. **Quality (Phase 6)**: Comprehensive testing and validation (T029-T044)

### Parallel Team Strategy

With 2 developers:

1. Both complete Setup + Foundational together (T001-T004)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T005-T014) - Core functionality
   - **Developer B**: User Story 3 inline scripts (T019-T028) - FOUC prevention
3. After US1 complete:
   - **Developer A**: User Story 2 (T015-T018) - Persistence
   - **Developer B**: Testing and validation (T029-T044)

---

## Notes

- [P] tasks = different files/functions, no dependencies
- [Story] label maps task to specific user story (US1, US2, US3)
- Each user story should be independently testable
- No automated tests per spec - all testing is manual browser validation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Performance targets: <100ms theme switch, <5ms inline script, <3KB theme.js
- CSS variables: 11 total (--bg, --text, --text-secondary, --toolbar-bg, --toolbar-border, --card-bg, --card-border, --link, --link-hover, --button-bg, --button-hover)
- Button icons: ☀️ (light), 🌙 (dark), 💻 (auto)
- localStorage key: "theme"
- Valid theme values: "light" | "dark" | "auto"
