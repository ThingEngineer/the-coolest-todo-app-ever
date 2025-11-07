# Service Contracts: Theme & Preferences

**Service**: `themeService` and `preferencesService`
**Modules**: `src/services/themeService.js`, `src/services/preferencesService.js`

## Theme Service

### Overview

Manages visual theme switching and persistence.

---

### Methods

#### getTheme

Retrieves theme configuration by ID.

**Signature**:

```javascript
getTheme(themeId: string): Theme | null
```

**Input**: Theme ID ('light', 'dark', 'ocean', 'sunset')

**Output**: Theme object or null

**Theme Structure**:

```javascript
{
  id: string,
  name: string,
  colorScheme: {
    background: string,     // Tailwind class
    text: string,          // Tailwind class
    primary: string,       // Tailwind class
    secondary: string,     // Tailwind class
    accent: string,        // Tailwind class
  }
}
```

---

#### getAllThemes

Retrieves all available themes.

**Signature**:

```javascript
getAllThemes(): Theme[]
```

**Output**: Array of theme objects

**Available Themes**:

1. Light (default)
2. Dark
3. Ocean
4. Sunset

---

#### applyTheme

Applies theme to the application.

**Signature**:

```javascript
applyTheme(themeId: string): void
```

**Input**: Theme ID

**Output**: void

**Behavior**:

- Updates root `<html>` element classes
- Sets data attribute: `data-theme="[themeId]"`
- Applies Tailwind dark mode if themeId is 'dark'
- Saves preference to localStorage
- Triggers CSS custom property updates

**Example**:

```javascript
themeService.applyTheme("dark");
// <html data-theme="dark" class="dark"> with dark mode styles applied
```

---

#### getActiveTheme

Gets currently active theme.

**Signature**:

```javascript
getActiveTheme(): Theme
```

**Output**: Current theme object (never null, defaults to 'light')

---

#### detectSystemTheme

Detects system/browser theme preference.

**Signature**:

```javascript
detectSystemTheme(): 'light' | 'dark'
```

**Output**: 'light' or 'dark' based on `prefers-color-scheme` media query

**Example**:

```javascript
const systemTheme = themeService.detectSystemTheme();
if (!preferencesService.getPreferences().themeId) {
  themeService.applyTheme(systemTheme);
}
```

---

## Preferences Service

### Overview

Manages user preferences and application settings.

---

### Methods

#### getPreferences

Retrieves current user preferences.

**Signature**:

```javascript
getPreferences(): UserPreferences
```

**Input**: None

**Output**: UserPreferences object (see data-model.md)

**Defaults** (if not set):

```javascript
{
  themeId: 'light',
  defaultView: 'all',
  sortBy: 'order',
  showCompleted: true,
  animationsEnabled: true,
  compactView: false,
}
```

---

#### updatePreferences

Updates one or more preference values.

**Signature**:

```javascript
updatePreferences(updates: Partial<UserPreferences>): UserPreferences
```

**Input**: Object with preference keys to update

**Output**: Updated preferences object

**Validation**:

- `themeId`: Must reference valid theme
- `defaultView`: Must be 'all', 'active', or 'completed'
- `sortBy`: Must be 'order', 'createdAt', 'dueDate', or 'title'

**Example**:

```javascript
preferencesService.updatePreferences({
  themeId: "dark",
  showCompleted: false,
});
```

---

#### resetPreferences

Resets all preferences to defaults.

**Signature**:

```javascript
resetPreferences(): UserPreferences
```

**Input**: None

**Output**: Default preferences object

---

## Integration with Components

### Using Theme in Components

Via custom hook `useTheme`:

```javascript
import { useTheme } from "../hooks/useTheme";

function ThemeSelector() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <select value={theme.id} onChange={(e) => setTheme(e.target.value)}>
      {availableThemes.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
```

### Using Preferences in Components

Via custom hook `usePreferences`:

```javascript
import { usePreferences } from "../hooks/usePreferences";

function Settings() {
  const { preferences, updatePreferences } = usePreferences();

  return (
    <label>
      <input
        type="checkbox"
        checked={preferences.showCompleted}
        onChange={(e) => updatePreferences({ showCompleted: e.target.checked })}
      />
      Show completed tasks
    </label>
  );
}
```

---

## Tailwind Dark Mode Configuration

In `tailwind.config.js`:

```javascript
module.exports = {
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom theme colors if needed
      },
    },
  },
};
```

Apply via HTML class:

```javascript
// Light mode
<html class="">

// Dark mode
<html class="dark">
```

All Tailwind `dark:` variants automatically apply when `.dark` class present.
