# Research: Coolest Todo Application

**Feature**: Coolest Todo Application
**Date**: 2025-11-06
**Status**: Complete

## Technology Stack Decisions

### 1. Build Tool: Vite

**Decision**: Use Vite 5.x as the build tool and development server

**Rationale**:

- Lightning-fast HMR (Hot Module Replacement) for excellent developer experience
- Near-instant server start (< 1 second) regardless of project size
- Optimized production builds with automatic code splitting
- Native ES modules support aligns with modern JavaScript best practices
- Minimal configuration required - follows Simplicity principle
- Excellent TypeScript/JSX support out of the box
- Built-in support for CSS, assets, and static file handling

**Alternatives Considered**:

- **Create React App**: Rejected due to slow build times, webpack complexity, and deprecated status
- **Webpack**: Rejected due to complex configuration and slower development experience
- **Parcel**: Considered but Vite has better Preact ecosystem support and faster performance

### 2. UI Framework: Preact

**Decision**: Use Preact 10.x as the UI framework

**Rationale**:

- Ultra-lightweight (3KB gzipped) vs React's 40KB+ - critical for fast initial load
- Same API as React - familiar mental model, easy to learn
- Excellent performance due to minimal overhead
- Perfect for this project's scale (no need for React's complexity)
- Strong ecosystem and compatibility with React libraries via preact/compat
- Smaller bundle size directly supports performance goals (< 5MB total)
- Native hooks support matches modern React patterns

**Alternatives Considered**:

- **React**: Rejected due to larger bundle size without additional benefits for this use case
- **Vue 3**: Rejected as team specified Preact preference, and Preact is lighter
- **Solid.js**: Considered but smaller ecosystem and less familiar to most developers
- **Vanilla JavaScript**: Rejected as component model significantly improves maintainability

### 3. Styling: Tailwind CSS

**Decision**: Use Tailwind CSS 3.x for styling

**Rationale**:

- Utility-first approach enables rapid UI development
- Excellent for prototyping and iterating on designs (perfect for "coolest" requirement)
- Built-in design system ensures visual consistency
- JIT (Just-In-Time) compilation generates only used styles - minimal CSS output
- Easy to create satisfying animations and transitions for task completion
- Responsive design utilities simplify mobile/desktop adaptation
- No CSS-in-JS runtime overhead - all styles compile at build time
- Strong theme customization support (important for P5 user story)

**Alternatives Considered**:

- **CSS Modules**: Rejected as more verbose and less flexible for rapid iteration
- **Styled Components**: Rejected due to runtime overhead and larger bundle size
- **Plain CSS**: Rejected as harder to maintain consistency and responsive design
- **Bootstrap**: Rejected as too opinionated and larger file size

### 4. Data Storage: localStorage

**Decision**: Use browser localStorage for all data persistence

**Rationale**:

- Zero backend complexity - aligns perfectly with Simplicity principle
- Works completely offline - meets offline-first constraint
- Synchronous API simplifies state management (no async complexity)
- Available in all target browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- 5-10MB storage limit sufficient for 10,000+ tasks requirement
- Instant persistence with no network latency
- Easy to implement demo data seeding on first launch

**Alternatives Considered**:

- **IndexedDB**: Rejected as unnecessarily complex for simple key-value storage needs
- **Backend API + Database**: Rejected to minimize complexity and maintain offline capability
- **sessionStorage**: Rejected as data would be lost on browser close
- **In-memory only**: Rejected as data must persist across sessions per requirements

### 5. Testing Strategy

**Decision**: Vitest for unit tests, Playwright for integration tests

**Rationale**:

- **Vitest**: Vite-native test runner with same config, instant feedback, excellent DX
- **Playwright**: Cross-browser testing, reliable E2E automation, excellent developer experience
- Minimal setup required - both integrate easily with Vite + Preact
- Vitest provides fast unit tests for business logic (services, utilities, date parser)
- Playwright validates user stories end-to-end across browsers

**Alternatives Considered**:

- **Jest**: Rejected as Vitest is faster and better integrated with Vite
- **Cypress**: Considered but Playwright has better cross-browser support
- **Testing Library**: May use alongside Vitest for component tests

## Technical Approach by User Story

### P1: Quick Task Capture

**Approach**:

- Single `<TaskInput>` component with controlled input
- Keyboard event handler for Enter key submission
- `taskService.createTask()` validates and persists to localStorage
- Optimistic UI update (add to state immediately, no loading state)
- Auto-focus input after task creation for continuous entry

**Key Considerations**:

- Input validation: trim whitespace, reject empty titles
- localStorage key structure: `todos_tasks` for task array
- Default demo tasks loaded only on first app launch (check localStorage empty)

### P2: Task Completion & Visual Feedback

**Approach**:

- Toggle completion state on task click or checkbox
- CSS animations using Tailwind's transition utilities
- Strike-through text transform for completed tasks
- Optional: Confetti animation library (lightweight) or custom CSS animation
- Visual distinction: opacity reduction, separate "Completed" section

**Key Considerations**:

- Animation performance: use CSS transforms (translate, scale) not layout properties
- Accessibility: proper aria-labels, keyboard navigation support
- Undo consideration: toggle allows easy reversal

### P3: Task Organization

**Approach**:

- Categories stored as array property on task object
- Simple tag-based system (not nested folders - Simplicity principle)
- Filter UI: category chips/buttons toggle active filters
- Client-side filtering: filter array in memory (fast for 10,000 items)

**Key Considerations**:

- Predefined categories vs user-created: user-created for flexibility
- Color coding: Tailwind color classes assigned per category
- Multiple categories per task or single: single category (simpler UX)

### P4: Smart Due Dates

**Approach**:

- Natural language parser using simple regex + Date manipulation
- Common phrases: "today", "tomorrow", "next week", "in X days"
- Fallback to date picker for precision
- Overdue check: compare `Date.now()` with task.dueDate on each render
- Visual indicator: red text/background for overdue tasks

**Key Considerations**:

- Library options: chrono-node (122KB) vs custom parser (< 5KB)
- Decision: Custom parser for common cases, sufficient for 95% accuracy goal
- Timezone handling: use browser local timezone (simpler than UTC conversion)

### P5: Visual Themes

**Approach**:

- Theme stored in localStorage under `todos_theme` key
- Tailwind dark mode variant classes toggle based on theme state
- CSS custom properties for dynamic color schemes
- Theme context/hook provides theme state to all components
- System preference detection: `window.matchMedia('(prefers-color-scheme: dark)')`

**Key Considerations**:

- Theme options: Light, Dark, plus 2-3 custom color schemes
- Apply theme: add class to root `<html>` element
- Smooth transitions: Tailwind transition classes on theme change

## Best Practices & Patterns

### State Management

**Decision**: Native Preact hooks only (useState, useEffect, useContext)

**Rationale**:

- App complexity doesn't warrant Redux/Zustand
- Context API sufficient for theme and task state sharing
- Custom hooks encapsulate reusable logic
- Follows Simplicity principle - no external state library needed

### Component Architecture

**Pattern**: Container/Presentational component separation

**Structure**:

- Smart components (hooks, state): `App.jsx`, `TaskList.jsx`
- Presentational components (props only): `TaskItem.jsx`, `ThemeSelector.jsx`
- Custom hooks handle business logic: `useTasks`, `useLocalStorage`, `useTheme`

### Performance Optimization

**Approach**:

- Lazy load P3/P4/P5 features (code splitting by user story)
- Memoization with `useMemo` for filtered/sorted task lists
- Virtual scrolling IF needed (test with 10,000 tasks first)
- Debounce localStorage writes on rapid task creation

**Rationale**: Start simple, optimize only if performance tests show issues

### Accessibility

**Standards**: WCAG 2.1 AA compliance

**Key Features**:

- Semantic HTML: `<main>`, `<section>`, `<button>`, `<input>`
- Keyboard navigation: Tab order, Enter/Space for actions, Escape to cancel
- ARIA labels: `aria-label`, `aria-checked`, `role` attributes
- Focus management: visible focus indicators, proper focus trap in modals
- Color contrast: Tailwind's default colors meet AA standards

### Error Handling

**Approach**:

- localStorage quota exceeded: show user warning, implement cleanup
- Invalid date input: fallback to date picker or show error message
- Corrupted localStorage data: reset to empty state with user confirmation

## Dependencies List

### Production Dependencies

```json
{
  "preact": "^10.19.0",
  "preact-router": "^4.1.2" (if multi-page needed later),
  "@preact/signals": "^1.2.0" (for reactive state if needed)
}
```

### Development Dependencies

```json
{
  "vite": "^5.0.0",
  "@preact/preset-vite": "^2.7.0",
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "vitest": "^1.0.0",
  "@playwright/test": "^1.40.0"
}
```

**Bundle Size Estimate**:

- Preact: 3KB
- Preact hooks/utilities: 2KB
- Application code: ~15KB
- Tailwind CSS (purged): ~10KB
- **Total**: ~30KB gzipped (well under 5MB constraint)

## Risk Assessment

### Technical Risks

1. **localStorage quota (5-10MB)**

   - Mitigation: 10,000 tasks @ ~200 bytes each = ~2MB, safe margin
   - Fallback: Implement old task archival/export if needed

2. **Browser compatibility**

   - Mitigation: Target modern browsers (90+ versions), no IE11 support needed
   - localStorage and ES6 supported in all target browsers

3. **Performance with 10,000 tasks**
   - Mitigation: Test early with generated data, implement virtual scrolling if needed
   - Preact's diff algorithm efficient for large lists

### Implementation Risks

1. **Natural language date parsing accuracy**

   - Mitigation: Start with common cases, gather user feedback, iterate
   - Acceptable: 95% accuracy goal allows for edge cases

2. **Animation smoothness**
   - Mitigation: Use CSS animations (GPU-accelerated), test on mid-range devices
   - Fallback: Reduce animation complexity on lower-end devices

## Open Questions

None - all technical decisions resolved. Ready for Phase 1 design.
