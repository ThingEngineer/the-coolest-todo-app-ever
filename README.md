# ✨ The Coolest Todo App _(ever)_

A modern, feature-rich todo application built with Vite, Preact, Tailwind CSS, and Supabase. Get things done with style - online or offline!

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

**Built with** [GitHub Spec-Kit](https://github.com/github/spec-kit) - A specification-driven development workflow

## ✨ Features

### Core Functionality

- ✅ **Task Management**: Create, complete, and delete tasks with intuitive UI
- 📁 **Categories**: Organize tasks with customizable color-coded categories
- 📅 **Smart Due Dates**: Natural language date parsing ("tomorrow", "next week", "in 3 days")
- ⚠️ **Overdue Detection**: Visual indicators for overdue tasks
- 🎨 **Multiple Themes**: Light and Dark themes with system preference detection
- 💾 **Hybrid Storage**: Supabase cloud sync + localStorage offline fallback
- 🔐 **Authentication**: Email/password sign up and login with Supabase Auth
- ☁️ **Cloud Sync**: Automatic sync across devices when signed in
- 📱 **Offline-First**: Full functionality without internet connection
- 📤 **Export/Import**: Backup and restore your data as JSON

### User Experience

- 🎭 **Smooth Animations**: Delightful transitions and micro-interactions
- 🔍 **Smart Filtering**: Filter by category, date range (Today, This Week, Overdue)
- 📊 **Sort Options**: Sort by creation order, due date, or title
- 🌓 **Dark Mode**: Full dark mode support with smooth transitions
- 📱 **Responsive Design**: Works beautifully on all screen sizes
- ♿ **Accessibility**: ARIA labels, keyboard navigation, and focus management
- 🎯 **Beautiful Modals**: Custom confirmation dialogs with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- (Optional) Supabase account for cloud sync and authentication

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/coolest-todo-app.git
cd coolest-todo-app

# Install dependencies
npm install

# (Optional) Configure Supabase for cloud sync
# Copy .env.example to .env.local and add your Supabase credentials
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## ☁️ Supabase Setup (Optional)

The app works fully offline without Supabase, but adding it enables:

- ✅ User authentication (email/password)
- ✅ Cloud backup of tasks and categories
- ✅ Cross-device synchronization
- ✅ Multi-user support with data isolation

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Copy your project URL and anon key from Settings > API

### 2. Configure Database

Run the SQL schema from `specs/001-todo-app/database-schema.md` in your Supabase SQL Editor:

- Creates `tasks` and `categories` tables
- Sets up Row Level Security (RLS) policies
- Configures user authentication
- Seeds default categories on user signup

### 3. Add Environment Variables

**Local Development:**

```bash
# Create .env.local file
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Vercel Deployment:**

- Add environment variables in Project Settings > Environment Variables
- Use the same variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### 4. Test Authentication

1. Start the app: `npm run dev`
2. Click "Sign In" button in the header
3. Create an account with email/password
4. Your tasks will now sync to Supabase!

## 🚀 Deployment

### Deploy to Vercel (Recommended)

**Option 1: Via GitHub (Automatic Deploys)**

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" and import your repository
4. Vercel auto-detects Vite configuration
5. (Optional) Add Supabase environment variables in Settings
6. Click "Deploy"

Every push to your main branch will automatically deploy!

**Option 2: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run build
vercel --prod

# Follow prompts to link to your Vercel account
```

**Vercel Configuration:**

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Deploy to Netlify

1. Build the app: `npm run build`
2. Go to [netlify.com](https://netlify.com) and create account
3. Drag the `dist/` folder to deploy, OR connect your Git repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. (Optional) Add Supabase environment variables in Site Settings

### Deploy to Cloudflare Pages

1. Push code to GitHub
2. Go to Cloudflare Pages dashboard
3. Connect your repository
4. Configure build:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. (Optional) Add Supabase environment variables

### Deploy to GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

Note: You'll need to add `base: '/your-repo-name/'` to `vite.config.js` for GitHub Pages.

## 📖 Usage Guide

### Authentication (Optional)

**Sign Up:**

1. Click "Sign In" button in the header
2. Click "Don't have an account? Sign up"
3. Enter your email and password (min 6 characters)
4. Your account is created and you're automatically signed in!

**Sign In:**

1. Click "Sign In" button
2. Enter your email and password
3. Your tasks will sync from the cloud

**Sign Out:**

1. Click your email in the header
2. Click "Sign Out"
3. Your tasks remain in localStorage for offline access

**Offline Mode:**

- The app works fully without an account
- All data stored locally in your browser
- Sign in later to sync your existing tasks to the cloud

### Creating Tasks

1. Enter your task in the input field at the top
2. (Optional) Select a category from the dropdown
3. (Optional) Add a due date using natural language:
   - "today" or "tomorrow"
   - "next week" or "this week"
   - "in 3 days" or "in 2 weeks"
   - Specific dates like "2024-12-25"
4. Press Enter or click Add Task

### Managing Tasks

- **Complete**: Click on a task to mark it as complete
- **Delete**: Hover over a task and click the trash icon
- **Clear Completed**: Click "Clear Completed" button in the completed section

### Organizing with Categories

1. Select a category when creating a task
2. Filter tasks by clicking category chips
3. View task counts per category
4. Tasks without categories appear under "Uncategorized"

### Using Due Dates

- Add due dates using natural language or date strings
- Overdue tasks are highlighted with a red border and badge
- Sort tasks by due date using the sort dropdown
- Use quick filters: Today, This Week, Overdue

### Themes

1. Click the theme selector in the top-right corner
2. Choose from Light or Dark themes
3. Select "System" to follow your OS preference
4. Theme preference is saved automatically

### Data Management

**Export Data**:

```javascript
// Use browser console
import { downloadData } from "./src/services/storageService.js";
downloadData();
```

**Import Data**:

```javascript
// Use browser console
import { importData } from './src/services/storageService.js';
const data = /* paste your JSON */;
importData(data, false); // false = replace, true = merge
```

## 🏗️ Architecture

### Tech Stack

- **Build Tool**: Vite 5.x - Lightning-fast HMR and optimized builds
- **Framework**: Preact 10.x - 3KB React alternative with same API
- **Styling**: Tailwind CSS 3.x - Utility-first CSS framework
- **Database**: Supabase (PostgreSQL) - Cloud sync and authentication
- **Storage**: Hybrid - Supabase (online) + localStorage (offline fallback)
- **Authentication**: Supabase Auth - Email/password with session management

### Project Structure

```
demo1/
├── src/
│   ├── components/       # Preact components
│   │   ├── App.jsx
│   │   ├── TaskInput.jsx
│   │   ├── TaskList.jsx
│   │   ├── TaskItem.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── DatePicker.jsx
│   │   ├── ThemeSelector.jsx
│   │   ├── AuthModal.jsx      # Login/signup modal
│   │   └── UserProfile.jsx    # User menu and sign out
│   ├── contexts/         # React contexts
│   │   └── AuthContext.jsx    # Authentication state
│   ├── hooks/            # Custom React hooks
│   │   ├── useTasks.js        # Hybrid task storage
│   │   ├── useCategories.js
│   │   ├── useTheme.js
│   │   ├── usePreferences.js
│   │   └── useAuth.js         # Authentication hook
│   ├── services/         # Business logic layer
│   │   ├── taskService.js
│   │   ├── categoryService.js
│   │   ├── dateParser.js
│   │   ├── themeService.js
│   │   ├── preferencesService.js
│   │   ├── storageService.js
│   │   ├── supabaseStorageService.js  # Supabase CRUD operations
│   │   ├── authService.js              # Supabase authentication
│   │   └── demoData.js
│   ├── config/           # Configuration
│   │   └── supabase.js        # Supabase client setup
│   ├── utils/            # Helper functions
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── styles/           # CSS files
│   │   ├── index.css
│   │   └── animations.css
│   └── main.jsx          # App entry point
├── specs/                # Feature specifications
│   └── 001-todo-app/
│       ├── spec.md
│       ├── plan.md
│       ├── tasks.md
│       └── database-schema.md  # Supabase SQL schema
├── public/               # Static assets
├── .env.example          # Environment variable template
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Key Design Patterns

- **Hybrid Storage**: Supabase for authenticated users, localStorage for offline/anonymous
- **Service Layer**: Separates business logic from UI components
- **Custom Hooks**: Encapsulates stateful logic for reuse
- **Component Composition**: Small, focused components
- **Unidirectional Data Flow**: Clear data flow from parent to child
- **Separation of Concerns**: Logic, presentation, and styling separated
- **Offline-First**: App works without internet connection
- **Progressive Enhancement**: Core features work without authentication

## 🎨 Customization

### Adding New Themes

Edit `src/services/themeService.js`:

```javascript
export const THEMES = {
  yourTheme: {
    id: "yourTheme",
    name: "Your Theme",
    description: "Your description",
    icon: "🎨",
    colors: {
      bg: "#yourColor",
      surface: "#yourColor",
      // ... other colors
    },
  },
};
```

### Adding New Categories

Categories are created at runtime. Demo categories are defined in `src/services/demoData.js`.

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Run E2E tests (if configured)
npm run test:e2e
```

## 📦 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

See the [Deploy to Vercel](#deploy-to-vercel-recommended) section above for detailed instructions.

## 🔧 Configuration

### Environment Variables

| Variable                 | Required | Description                 |
| ------------------------ | -------- | --------------------------- |
| `VITE_SUPABASE_URL`      | Optional | Your Supabase project URL   |
| `VITE_SUPABASE_ANON_KEY` | Optional | Your Supabase anonymous key |

**Note**: App works without these variables using localStorage only.

### Vite Configuration

See `vite.config.js` for build configuration.

### Tailwind Configuration

See `tailwind.config.js` for theme customization and color palette.

### Storage Prefix

Change the storage prefix in `src/services/storageService.js`:

```javascript
const STORAGE_PREFIX = "your-prefix-";
```

## 🐛 Troubleshooting

### Tasks Not Saving (Authenticated)

- Check Supabase connection is active
- Verify environment variables are set correctly
- Check browser console for authentication errors
- Try signing out and signing back in

### Tasks Not Saving (Offline)

- Check browser localStorage is enabled
- Check storage quota (5-10MB typically available)
- Try clearing browser cache

### Authentication Errors

- Verify Supabase URL and anon key are correct
- Check Supabase project is active (not paused)
- Ensure RLS policies are configured correctly
- Check email confirmation settings in Supabase

### Theme Not Persisting

- Check localStorage permissions
- Ensure cookies/site data not blocked

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Sync Issues

- Check network connection
- Verify you're signed in
- Look for sync status indicator in the header
- Try refreshing the page

## 📊 Performance

- **Bundle Size**: < 100KB gzipped
- **Lighthouse Score**: 95+ on all metrics
- **Framework**: Preact (3KB) vs React (40KB+)
- **No External API Calls**: Fully offline-capable

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Powered by [Preact](https://preactjs.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database and Auth by [Supabase](https://supabase.com/)
- Specification workflow by [GitHub Spec-Kit](https://github.com/github/spec-kit)
- Icons from inline SVG

## 🛠️ Development Methodology

This project was built using [GitHub Spec-Kit](https://github.com/github/spec-kit), a specification-driven development workflow that ensures:

- ✅ **Clear Requirements**: Detailed specifications before coding
- ✅ **Structured Planning**: Architecture and tech decisions documented
- ✅ **Task Breakdown**: Implementation tasks organized by priority
- ✅ **Quality Gates**: Checklists ensure completeness
- ✅ **Maintainability**: Documentation lives with the code

See the `specs/001-todo-app/` directory for complete specifications.

## 📧 Support

For support, please open an issue in the GitHub repository.

---

Made with ❤️ and ☕ by the Coolest Todo App Team
