# Service Contracts: Storage Operations

**Service**: `storageService`
**Module**: `src/services/storageService.js`
**Type**: localStorage abstraction layer

## Overview

Storage service provides a clean abstraction over browser localStorage with error handling, validation, and migration support.

---

## Methods

### getItem

Retrieves and parses data from localStorage.

**Signature**:

```javascript
getItem<T>(key: string, defaultValue?: T): T
```

**Input**:

- `key`: localStorage key
- `defaultValue`: Value to return if key not found or parse fails

**Output**: Parsed JSON data or default value

**Behavior**:

- Retrieves item from localStorage
- Parses JSON
- Returns defaultValue if key not found or JSON parse fails
- Logs parse errors for debugging

**Example**:

```javascript
const tasks = storageService.getItem("todos_tasks", []);
// Returns: Array of tasks or empty array if not found
```

---

### setItem

Serializes and stores data in localStorage.

**Signature**:

```javascript
setItem(key: string, value: any): void
```

**Input**:

- `key`: localStorage key
- `value`: Data to store (must be JSON-serializable)

**Output**: void

**Errors**:

- `StorageError`: Quota exceeded or serialization failed

**Example**:

```javascript
storageService.setItem("todos_tasks", tasks);
// Tasks saved to localStorage
```

---

### removeItem

Removes an item from localStorage.

**Signature**:

```javascript
removeItem(key: string): void
```

**Input**: localStorage key

**Output**: void

---

### clear

Clears all app data from localStorage.

**Signature**:

```javascript
clear(): void
```

**Input**: None

**Output**: void

**Behavior**: Removes only app-specific keys (todos\_\*)

---

### getStorageUsage

Calculates current localStorage usage.

**Signature**:

```javascript
getStorageUsage(): StorageUsage
```

**Input**: None

**Output** (`StorageUsage`):

```javascript
{
  used: number,            // Bytes used by app data
  available: number,       // Estimated available space
  percentage: number,      // Usage percentage (0-100)
  isNearLimit: boolean,    // True if > 80% full
}
```

**Example**:

```javascript
const usage = storageService.getStorageUsage();
if (usage.isNearLimit) {
  console.warn("localStorage nearly full");
}
```

---

### exportData

Exports all app data as JSON.

**Signature**:

```javascript
exportData(): string
```

**Input**: None

**Output**: JSON string containing all app data

**Format**:

```javascript
{
  version: "1.0",
  exportedAt: 1699286400000,
  data: {
    tasks: [...],
    categories: [...],
    preferences: {...}
  }
}
```

**Example**:

```javascript
const json = storageService.exportData();
const blob = new Blob([json], { type: "application/json" });
// Can trigger download
```

---

### importData

Imports previously exported data.

**Signature**:

```javascript
importData(jsonString: string, options?: ImportOptions): ImportResult
```

**Input**:

- `jsonString`: Exported JSON data
- `options`: Import options

```javascript
{
  merge?: boolean,         // If true, merge with existing data; if false, replace
  validateOnly?: boolean,  // If true, only validate without importing
}
```

**Output** (`ImportResult`):

```javascript
{
  success: boolean,
  tasksImported: number,
  categoriesImported: number,
  errors: string[],
}
```

**Errors**:

- `ValidationError`: Invalid JSON format or data structure
- `StorageError`: Import would exceed quota

---

### migrateData

Migrates data from old schema version to current.

**Signature**:

```javascript
migrateData(fromVersion: string): void
```

**Input**: Source version string (e.g., "1.0")

**Output**: void

**Behavior**: Applies sequential migrations to bring data to current schema

**Note**: Not used in v1.0 (initial version), prepared for future updates

---

## Storage Keys

```javascript
const STORAGE_KEYS = {
  TASKS: "todos_tasks",
  CATEGORIES: "todos_categories",
  PREFERENCES: "todos_preferences",
  INITIALIZED: "todos_initialized",
  VERSION: "todos_version",
};
```

---

## Error Handling

### Quota Exceeded

When localStorage quota is exceeded:

1. Catch `QuotaExceededError`
2. Calculate current usage
3. Suggest actions:
   - Clear completed tasks
   - Delete old tasks
   - Export and clear data
4. Provide export option to user

**Example**:

```javascript
try {
  storageService.setItem(key, value);
} catch (error) {
  if (
    error.name === "StorageError" &&
    error.cause?.name === "QuotaExceededError"
  ) {
    // Show user warning with options
  }
}
```

---

## Data Corruption Recovery

If JSON parse fails (corrupted data):

1. Log error with details
2. Attempt to recover from backup (if exists)
3. If recovery fails, return default value
4. Optionally prompt user to reset data

**Example**:

```javascript
// In getItem method
try {
  return JSON.parse(localStorage.getItem(key));
} catch (error) {
  console.error("Failed to parse", key, error);
  return defaultValue;
}
```

---

## Testing Helpers

### mockLocalStorage

Creates in-memory localStorage mock for testing.

**Signature**:

```javascript
mockLocalStorage(): Storage
```

**Usage**:

```javascript
// In tests
const mockStorage = storageService.mockLocalStorage();
global.localStorage = mockStorage;
```

---

### clearTestData

Clears only test data keys.

**Signature**:

```javascript
clearTestData(): void
```
