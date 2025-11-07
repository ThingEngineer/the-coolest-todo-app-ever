# Quick Start Guide: Coolest Todo Application

**Version**: 1.0.0  
**Last Updated**: 2025-11-06

## Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn/pnpm)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

## Installation

### 1. Clone and Install

```bash
# Navigate to project root
cd /Users/josh/data/www/vibeathon/demo1

# Install dependencies
npm install
```

### 2. Project Dependencies

The following will be installed:

**Production**:

- `preact` (^10.19.0) - UI framework
- No additional runtime dependencies

**Development**:

- `vite` (^5.0.0) - Build tool
- `@preact/preset-vite` (^2.7.0) - Preact plugin for Vite
- `tailwindcss` (^3.4.0) - CSS framework
- `autoprefixer` (^10.4.0) - CSS vendor prefixing
- `postcss` (^8.4.0) - CSS processing
- `vitest` (^1.0.0) - Unit testing
- `@playwright/test` (^1.40.0) - E2E testing

## Development

### Start Development Server

```bash
npm run dev
```

- Server starts at `http://localhost:5173`
- Hot Module Replacement (HMR) enabled
- Opens automatically in default browser

### Development Features

- **Instant HMR**: Changes reflect immediately without page reload
- **Fast Refresh**: Preserves component state during updates
- **Error Overlay**: Build errors shown in browser
- **Source Maps**: Debugging with original source code

## Building for Production

### Create Production Build

```bash
npm run build
```

Output: `dist/` directory with optimized bundles

### Preview Production Build

```bash
npm run preview
```

Serves production build locally at `http://localhost:4173`

## Testing

### Run Unit Tests

```bash
npm run test
```

Runs Vitest tests in `tests/unit/`

### Run Tests in Watch Mode

```bash
npm run test:watch
```

Re-runs tests on file changes

### Run E2E Tests

```bash
npm run test:e2e
```

Runs Playwright tests in `tests/integration/`

### View Test Coverage

```bash
npm run test:coverage
```

Generates coverage report in `coverage/` directory

## Project Structure

```
src/
├── components/          # Preact UI components
│   ├── TaskInput.jsx    # Task creation form
│   ├── TaskList.jsx     # Task list container
│   ├── TaskItem.jsx     # Individual task display
│   └── ...
├── hooks/               # Custom Preact hooks
│   ├── useTasks.js      # Task CRUD operations
│   ├── useLocalStorage.js
│   └── useTheme.js
├── services/            # Business logic
│   ├── taskService.js   # Task operations
│   ├── storageService.js
│   └── ...
├── styles/              # CSS files
│   ├── index.css        # Main styles
│   └── animations.css
├── utils/               # Utility functions
├── App.jsx              # Root component
└── main.jsx             # Entry point

tests/
├── unit/                # Vitest unit tests
└── integration/         # Playwright E2E tests

public/                  # Static assets
├── favicon.ico
└── demo-tasks.json
```

## Configuration Files

### `vite.config.js`

```javascript
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    target: "es2015",
    minify: "terser",
  },
});
```

### `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### `package.json` Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext js,jsx"
  }
}
```

## First Run Experience

On first application launch:

1. **Demo Data Loaded**: 5 sample tasks and 4 categories pre-populated
2. **Default Theme**: Light theme applied
3. **localStorage Initialized**: All keys created with default values

To reset and see first-run experience again:

```javascript
// In browser console
localStorage.clear();
location.reload();
```

## Browser localStorage Keys

The application uses these localStorage keys:

- `todos_tasks` - Task array
- `todos_categories` - Category array
- `todos_preferences` - User preferences object
- `todos_initialized` - First-run flag
- `todos_version` - Schema version

## Development Tips

### Hot Reload

Save any file to trigger instant reload. Component state is preserved.

### Debugging

1. Open browser DevTools
2. Navigate to Sources tab
3. Source maps enabled - set breakpoints in original JSX files
4. Use `debugger;` statement in code

### localStorage Inspection

1. Open DevTools → Application tab (Chrome) or Storage tab (Firefox)
2. Navigate to Local Storage → `http://localhost:5173`
3. View/edit all app data

### Tailwind IntelliSense

For VS Code:

1. Install "Tailwind CSS IntelliSense" extension
2. Get autocomplete for Tailwind classes

## Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview

# Clean install (if issues)
rm -rf node_modules package-lock.json
npm install
```

## Troubleshooting

### Port Already in Use

If port 5173 is busy:

```bash
# Kill process on port
lsof -ti:5173 | xargs kill -9

# Or specify different port
npm run dev -- --port 3000
```

### localStorage Not Persisting

- Check browser privacy settings
- Ensure not in private/incognito mode
- Clear browser cache and reload

### Build Errors

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall dependencies
npm clean-install
```

### Test Failures

```bash
# Update Playwright browsers
npx playwright install

# Run tests with UI for debugging
npm run test:e2e -- --ui
```

## Performance Monitoring

### Bundle Analysis

```bash
npm run build -- --mode analyze
```

View bundle size breakdown

### Lighthouse Audit

1. Build production version
2. Run preview server
3. Open Chrome DevTools → Lighthouse tab
4. Run audit

**Expected Scores**:

- Performance: 95+
- Accessibility: 100
- Best Practices: 95+
- SEO: 90+

## Next Steps

1. **Implement P1 (MVP)**: Start with `TaskInput` and `TaskList` components
2. **Add Tests**: Write tests alongside components (TDD approach)
3. **Iterate on P2-P5**: Add features incrementally
4. **Monitor Performance**: Test with 10,000 tasks periodically

## Resources

- [Preact Documentation](https://preactjs.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

## Support

For issues or questions:

1. Check specification docs in `specs/001-todo-app/`
2. Review contracts in `specs/001-todo-app/contracts/`
3. Consult data model in `specs/001-todo-app/data-model.md`
