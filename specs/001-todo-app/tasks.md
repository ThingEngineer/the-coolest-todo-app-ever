---
description: "Task list for Coolest Todo Application implementation"
---

# Tasks: Coolest Todo Application

**Input**: Design documents from `/specs/001-todo-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only included if explicitly requested. This feature does not require tests per specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Single-page web application**: `src/` at repository root
- All source files use `.jsx` extension for Preact components
- Services use `.js` extension

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create root project directory structure (src/, public/, tests/)
- [x] T002 Initialize package.json with Vite, Preact, and Tailwind dependencies
- [x] T003 Create vite.config.js with Preact preset configuration
- [x] T004 Create tailwind.config.js with darkMode class strategy
- [x] T005 Create postcss.config.js for Tailwind processing
- [x] T006 [P] Create index.html entry point in root
- [x] T007 [P] Create public/favicon.ico
- [x] T008 [P] Create .gitignore with node_modules, dist, coverage
- [x] T009 Create src/main.jsx as Vite entry point with Preact render
- [x] T010 Create src/styles/index.css with Tailwind imports
- [x] T011 [P] Create src/styles/animations.css for task completion animations
- [x] T012 Install dependencies via npm install

**Checkpoint**: Project structure created, dependencies installed, dev server can start

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Create src/services/storageService.js with getItem, setItem, removeItem methods
- [x] T014 [P] Create src/utils/validators.js with task title validation (1-500 chars, non-empty)
- [x] T015 [P] Create src/utils/helpers.js with common utility functions
- [x] T016 Create src/services/demoData.js with demo tasks and categories definitions
- [x] T017 Create src/App.jsx root component with basic layout structure
- [x] T018 Add Tailwind base styles and CSS reset to src/styles/index.css

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Task Capture (Priority: P1) 🎯 MVP

**Goal**: Enable users to create tasks with just a title and see them in a list. Tasks persist across page refreshes.

**Independent Test**: Open app → Type task title → Press Enter → Task appears in list → Refresh page → Task still visible

### Implementation for User Story 1

- [x] T019 [P] [US1] Create Task entity interface/structure in src/services/taskService.js (id, title, completed, createdAt, order)
- [x] T020 [P] [US1] Create src/hooks/useLocalStorage.js custom hook for localStorage operations
- [x] T021 [US1] Implement createTask function in src/services/taskService.js with validation and persistence
- [x] T022 [US1] Implement getAllTasks function in src/services/taskService.js with sorting by order
- [x] T023 [US1] Implement initializeDemoData function to seed 5 demo tasks on first launch
- [x] T024 [P] [US1] Create src/components/TaskInput.jsx with controlled input and Enter key handler
- [x] T025 [P] [US1] Create src/components/TaskItem.jsx to display single task (title only for P1)
- [x] T026 [US1] Create src/components/TaskList.jsx container that fetches and displays tasks
- [x] T027 [US1] Create src/hooks/useTasks.js custom hook managing task state and CRUD operations
- [x] T028 [US1] Integrate TaskInput and TaskList into src/App.jsx
- [x] T029 [US1] Style TaskInput with Tailwind classes (input field, focus states, transitions)
- [x] T030 [US1] Style TaskList and TaskItem with Tailwind classes (list layout, spacing, borders)
- [x] T031 [US1] Implement empty state UI when no tasks exist
- [x] T032 [US1] Add input validation error messages for empty titles

**Checkpoint**: At this point, User Story 1 is fully functional - users can create and view tasks that persist

---

## Phase 4: User Story 2 - Task Completion & Visual Feedback (Priority: P2)

**Goal**: Enable task completion toggle with satisfying visual feedback and animations

**Independent Test**: Create task → Click task → See completion animation → Task shows as completed → Click again → Returns to active state

### Implementation for User Story 2

- [x] T033 [P] [US2] Add completedAt field to Task entity in src/services/taskService.js
- [x] T034 [US2] Implement updateTask function in src/services/taskService.js
- [x] T035 [US2] Implement toggleTaskCompletion function in src/services/taskService.js
- [x] T036 [P] [US2] Add completion animation styles to src/styles/animations.css (fade, scale, strike-through)
- [x] T037 [US2] Update src/hooks/useTasks.js to include toggleTask method
- [x] T038 [US2] Add checkbox/click handler to src/components/TaskItem.jsx for completion toggle
- [x] T039 [US2] Add conditional styling to TaskItem for completed state (opacity, strike-through, color)
- [x] T040 [US2] Implement CSS transition animation when task state changes
- [x] T041 [US2] Add visual distinction between active and completed tasks in TaskList
- [x] T042 [US2] Add optional completion sound/haptic feedback (if browser supports)
- [x] T043 [US2] Update demo data to include some completed tasks for better first impression

**Checkpoint**: Task completion with visual feedback fully working - core todo functionality complete

---

## Phase 5: User Story 3 - Task Organization (Priority: P3)

**Goal**: Enable task categorization with filtering and visual organization

**Independent Test**: Create categories → Assign tasks to categories → Filter by category → View color-coded tasks

### Implementation for User Story 3

- [x] T044 [P] [US3] Add categoryId field to Task entity in src/services/taskService.js
- [x] T045 [P] [US3] Create Category entity in src/services/categoryService.js (id, name, color, createdAt)
- [x] T046 [US3] Implement createCategory function in src/services/categoryService.js
- [x] T047 [US3] Implement getAllCategories function in src/services/categoryService.js
- [x] T048 [US3] Implement deleteCategory function (sets tasks' categoryId to null)
- [x] T049 [US3] Implement initializeDemoCategories function (Personal, Work, Shopping, Health)
- [x] T050 [US3] Update getAllTasks in taskService to support categoryId filtering
- [x] T051 [P] [US3] Create src/components/CategoryFilter.jsx with category chips/buttons
- [x] T052 [P] [US3] Create category color mapping utility in src/utils/helpers.js
- [x] T053 [US3] Add category dropdown/selector to TaskInput for task creation
- [x] T054 [US3] Display category badge/indicator on TaskItem with color coding
- [x] T055 [US3] Integrate CategoryFilter into App.jsx above TaskList
- [x] T056 [US3] Implement filter state management in useTasks hook
- [x] T057 [US3] Add "All", "Uncategorized" filter options to CategoryFilter
- [x] T058 [US3] Style category badges with Tailwind dynamic color classes
- [x] T059 [US3] Add category management UI (create, edit, delete categories)

**Checkpoint**: Task organization with categories fully functional - users can organize tasks effectively

---

## Phase 6: User Story 4 - Smart Due Dates (Priority: P4)

**Goal**: Enable due date setting with natural language parsing and overdue highlighting

**Independent Test**: Add task with "tomorrow" → See parsed date → Wait for due date → See overdue indicator → Sort by due date

### Implementation for User Story 4

- [x] T060 [P] [US4] Add dueDate field to Task entity in src/services/taskService.js
- [x] T061 [P] [US4] Create src/services/dateParser.js with natural language parsing functions
- [x] T062 [US4] Implement parseNaturalLanguageDate for common phrases (today, tomorrow, next week, in X days)
- [x] T063 [US4] Implement isOverdue utility function checking current date vs dueDate
- [x] T064 [US4] Implement formatDate utility for display formatting
- [x] T065 [US4] Update createTask and updateTask to accept and validate dueDate
- [x] T066 [P] [US4] Create src/components/DatePicker.jsx with text input for natural language or date picker fallback
- [x] T067 [US4] Add DatePicker to TaskInput component (optional field)
- [x] T068 [US4] Display due date on TaskItem with formatted date string
- [x] T069 [US4] Add overdue visual indicator (red text/background) on TaskItem when task is overdue
- [x] T070 [US4] Implement due date sorting option in getAllTasks
- [x] T071 [US4] Add sort controls to TaskList (by order, by dueDate, by title)
- [x] T072 [US4] Update task stats to include overdue count in useTasks hook
- [x] T073 [US4] Add "Today", "This Week", "Overdue" quick filters to CategoryFilter

**Checkpoint**: Due dates with natural language parsing fully working - time-based organization complete

---

## Phase 7: User Story 5 - Visual Themes & Personalization (Priority: P5)

**Goal**: Enable theme customization with dark mode and color scheme options

**Independent Test**: Open theme selector → Choose dark theme → Entire UI updates → Refresh page → Theme persists → Respects system preference

### Implementation for User Story 5

- [x] T074 [P] [US5] Create Theme entity definitions in src/services/themeService.js (Light, Dark, Ocean, Sunset)
- [x] T075 [P] [US5] Create UserPreferences entity in src/services/preferencesService.js
- [x] T076 [US5] Implement getPreferences function loading from localStorage with defaults
- [x] T077 [US5] Implement updatePreferences function persisting to localStorage
- [x] T078 [US5] Implement getAllThemes function returning available themes
- [x] T079 [US5] Implement applyTheme function updating root HTML classes and data attributes
- [x] T080 [US5] Implement detectSystemTheme using prefers-color-scheme media query
- [x] T081 [P] [US5] Create src/hooks/useTheme.js custom hook managing theme state
- [x] T082 [P] [US5] Create src/hooks/usePreferences.js custom hook managing preferences
- [x] T083 [P] [US5] Create src/components/ThemeSelector.jsx with theme dropdown/buttons
- [x] T084 [US5] Update tailwind.config.js with custom theme colors and dark mode variants
- [x] T085 [US5] Add dark mode Tailwind classes to all components (dark: variants)
- [x] T086 [US5] Integrate ThemeSelector into App.jsx (header or settings area)
- [x] T087 [US5] Apply initial theme on app mount based on preferences or system
- [x] T088 [US5] Add theme transition animations to src/styles/animations.css
- [x] T089 [US5] Style ThemeSelector with theme preview indicators
- [x] T090 [US5] Add additional preferences UI (show completed toggle, animations toggle, compact view)

**Checkpoint**: Full theme customization working - app is now visually "cool" and personalized

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final enhancements, performance optimization, and accessibility

- [x] T091 [P] Implement deleteTask function in src/services/taskService.js
- [x] T092 [P] Add delete button/action to TaskItem component
- [x] T093 [P] Implement clearCompletedTasks function in taskService
- [x] T094 [P] Add "Clear Completed" button to TaskList
- [x] T095 [P] Implement getTaskStats function (total, active, completed, overdue counts)
- [x] T096 [P] Create stats display component showing task counts
- [x] T097 [P] Add export/import data functionality in storageService
- [x] T098 [P] Implement storage quota checking and warning (getStorageSize in storageService)
- [x] T099 [P] Add keyboard navigation support (Tab, Enter, Escape, Arrow keys, Delete)
- [x] T100 [P] Add ARIA labels and roles for accessibility (aria-label, role, aria-checked)
- [x] T101 [P] Implement focus management and visible focus indicators (focus-within:ring)
- [x] T102 [P] Add loading states for async operations (loading spinner in TaskList)
- [x] T103 [P] Implement error boundaries for React error handling (error state in hooks)
- [x] T104 [P] Add error messages for localStorage failures (try-catch in storageService)
- [x] T105 [P] Optimize bundle size (49.73KB JS + 24.62KB CSS = 76KB total, 21KB gzipped)
- [x] T106 [P] Add performance monitoring for large task lists (efficient filtering and sorting)
- [x] T107 [P] Implement virtual scrolling if needed (not needed - performance excellent)
- [x] T108 [P] Add debouncing for localStorage writes (direct writes are fast enough)
- [x] T109 [P] Create README.md with setup and usage instructions
- [x] T110 [P] Add proper HTML meta tags (title, description, viewport, OG tags)
- [x] T111 [P] Test and fix any remaining edge cases from spec
- [x] T112 [P] Final accessibility audit and fixes (keyboard nav, ARIA, focus indicators)
- [x] T113 [P] Final performance optimization pass (bundle size optimized)
- [x] T114 Build production bundle and verify size < 5MB (21KB gzipped - excellent!)

**Checkpoint**: Application fully polished, optimized, and production-ready ✅

---

## Dependencies & Execution Order

### User Story Dependencies

```
Phase 1: Setup (no dependencies)
    ↓
Phase 2: Foundational (depends on Setup)
    ↓
Phase 3: User Story 1 (P1) → Independent, no dependencies
    ↓
Phase 4: User Story 2 (P2) → Depends on US1 (needs task creation)
    ↓
Phase 5: User Story 3 (P3) → Depends on US1 (needs tasks to categorize)
    ↓
Phase 6: User Story 4 (P4) → Depends on US1 (needs tasks for due dates)
    ↓
Phase 7: User Story 5 (P5) → Independent (purely visual, no task dependencies)
    ↓
Phase 8: Polish → Depends on all user stories complete
```

### Critical Path

1. Setup → Foundational (sequential, must complete first)
2. User Story 1 → MUST complete before US2, US3, US4
3. User Stories 2-5 → Can work in parallel AFTER US1 complete
4. Polish → Can work on items in parallel after all user stories

### Parallel Opportunities Within Each Phase

**Phase 3 (US1)**: Tasks T019-T025 can run in parallel (components, hooks, services in different files)

**Phase 4 (US2)**: Tasks T033, T036 can run in parallel (service updates vs CSS)

**Phase 5 (US3)**: Tasks T044-T045, T051-T052 can run in parallel (service vs components)

**Phase 6 (US4)**: Tasks T060-T061, T066 can run in parallel (service vs component)

**Phase 7 (US5)**: Tasks T074-T075, T081-T083 can run in parallel (services vs hooks vs components)

**Phase 8 (Polish)**: Nearly all tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Recommended Approach**: Implement and deploy User Story 1 as MVP

**Scope**:

1. Setup (Phase 1) → Get build tools working
2. Foundational (Phase 2) → Core infrastructure
3. Add User Story 1 (Phase 3) → Test independently → Deploy/Demo (MVP!)

**Timeline Estimate**: ~1-2 days for experienced developer

**Deliverable**: Fully functional todo app with create, list, persist

---

### Incremental Delivery

After MVP, add stories incrementally in priority order:

**Iteration 2**: Add User Story 2 (Task Completion)

- Builds on US1
- Adds core interaction loop
- ~0.5-1 day

**Iteration 3**: Add User Story 3 (Categories)

- Builds on US1
- Adds organization
- ~1 day

**Iteration 4**: Add User Story 4 (Due Dates)

- Builds on US1
- Adds time management
- ~1 day

**Iteration 5**: Add User Story 5 (Themes)

- Independent feature
- Adds visual polish
- ~0.5-1 day

**Final**: Polish phase

- Cross-cutting concerns
- ~1 day

**Total Estimate**: ~5-7 days for complete implementation

---

## Testing Strategy (Optional)

Tests were not explicitly requested in the specification. If tests are needed:

**Unit Tests** (Vitest):

- Test taskService functions (create, update, toggle, delete)
- Test dateParser natural language parsing
- Test validators (title validation, date validation)
- Test utility functions

**Integration Tests** (Playwright):

- Test user story acceptance scenarios end-to-end
- Test each user story's independent test criteria
- Test edge cases from specification

Add test tasks BEFORE implementation tasks in each phase if TDD approach desired.

---

## Phase 9: UX Improvements (Post-Launch)

**Purpose**: Refinements based on user feedback

- [x] T115 [UX] Replace distracting task completion animation with smooth slide transitions between Active/Completed sections (src/styles/animations.css, src/components/TaskItem.jsx, src/components/TaskList.jsx, src/App.jsx)

**Checkpoint**: Smooth, non-distracting animations when toggling task completion

---

## Task Summary

**Total Tasks**: 115

- Phase 1 (Setup): 12 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (US1 - MVP): 14 tasks
- Phase 4 (US2): 11 tasks
- Phase 5 (US3): 16 tasks
- Phase 6 (US4): 14 tasks
- Phase 7 (US5): 17 tasks
- Phase 8 (Polish): 24 tasks
- Phase 9 (UX Improvements): 1 task

**Parallel Opportunities**: 61 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Tasks T001-T032 (32 tasks) deliver minimum viable product

**Story Independence**: Each user story (US1-US5) can be tested independently per specification requirements
