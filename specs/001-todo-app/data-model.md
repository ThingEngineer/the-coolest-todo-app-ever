# Data Model: Coolest Todo Application

**Feature**: Coolest Todo Application
**Date**: 2025-11-06
**Storage**: Browser localStorage (JSON serialization)

## Overview

The application uses a simple, flat data structure optimized for localStorage storage and client-side operations. All entities are stored as JSON and managed entirely in the browser with no backend synchronization.

## Core Entities

### Task

Represents a single todo item with all associated metadata.

**Properties**:

| Property    | Type    | Required | Default    | Description                                           |
| ----------- | ------- | -------- | ---------- | ----------------------------------------------------- |
| id          | string  | Yes      | UUID       | Unique identifier (generated via crypto.randomUUID()) |
| title       | string  | Yes      | -          | Task description (1-500 characters)                   |
| completed   | boolean | Yes      | false      | Completion status                                     |
| createdAt   | number  | Yes      | Date.now() | Unix timestamp (milliseconds) of creation             |
| completedAt | number  | No       | null       | Unix timestamp when task was marked complete          |
| categoryId  | string  | No       | null       | ID of associated category (P3 feature)                |
| dueDate     | number  | No       | null       | Unix timestamp of due date (P4 feature)               |
| order       | number  | Yes      | 0          | Sort order (higher = more recent)                     |

**Validation Rules**:

- `title`: Must be non-empty after trimming whitespace, max 500 characters
- `id`: Must be unique across all tasks
- `createdAt`: Must be valid timestamp
- `dueDate`: If present, must be valid future or past timestamp
- `categoryId`: If present, must reference existing category ID

**State Transitions**:

```
[Created] → completed: false
    ↓
[Active] ⇄ [Completed]  (toggle via user action)
    ↓
[Deleted] (removed from storage)
```

**Storage Key**: `todos_tasks`
**Storage Format**: JSON array of Task objects

**Example**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": 1699286400000,
  "completedAt": null,
  "categoryId": "cat_1",
  "dueDate": 1699372800000,
  "order": 100
}
```

---

### Category

Represents a grouping or classification for tasks (P3 feature).

**Properties**:

| Property  | Type   | Required | Default    | Description                                 |
| --------- | ------ | -------- | ---------- | ------------------------------------------- |
| id        | string | Yes      | UUID       | Unique identifier                           |
| name      | string | Yes      | -          | Category display name (1-50 characters)     |
| color     | string | Yes      | 'gray'     | Tailwind color name (e.g., 'blue', 'green') |
| createdAt | number | Yes      | Date.now() | Unix timestamp of creation                  |
| order     | number | Yes      | 0          | Display order in category list              |

**Validation Rules**:

- `name`: Must be non-empty, max 50 characters, unique across categories
- `color`: Must be valid Tailwind color name from predefined set
- `id`: Must be unique across all categories

**Predefined Categories** (seeded on first launch):

- Personal (color: 'blue')
- Work (color: 'purple')
- Shopping (color: 'green')
- Health (color: 'red')

**Storage Key**: `todos_categories`
**Storage Format**: JSON array of Category objects

**Example**:

```json
{
  "id": "cat_1",
  "name": "Personal",
  "color": "blue",
  "createdAt": 1699286400000,
  "order": 1
}
```

---

### Theme

Represents visual appearance settings (P5 feature).

**Properties**:

| Property    | Type   | Required | Default | Description                                 |
| ----------- | ------ | -------- | ------- | ------------------------------------------- |
| id          | string | Yes      | -       | Unique identifier ('light', 'dark', etc.)   |
| name        | string | Yes      | -       | Display name ('Light Mode', 'Dark Mode')    |
| colorScheme | object | Yes      | -       | CSS custom property values for theme colors |

**Predefined Themes**:

1. **Light** (id: 'light', default)

   - Background: white
   - Text: gray-900
   - Primary: blue-500
   - Secondary: gray-100

2. **Dark** (id: 'dark')

   - Background: gray-900
   - Text: gray-100
   - Primary: blue-400
   - Secondary: gray-800

3. **Ocean** (id: 'ocean')

   - Background: slate-50
   - Text: slate-900
   - Primary: cyan-500
   - Secondary: teal-100

4. **Sunset** (id: 'sunset')
   - Background: amber-50
   - Text: amber-900
   - Primary: orange-500
   - Secondary: rose-100

**Note**: Theme is not stored as entity array, but as active theme ID preference.

---

### UserPreferences

Stores user's application settings and preferences.

**Properties**:

| Property          | Type    | Required | Default | Description                                        |
| ----------------- | ------- | -------- | ------- | -------------------------------------------------- |
| themeId           | string  | Yes      | 'light' | Active theme ID                                    |
| defaultView       | string  | Yes      | 'all'   | Default filter view ('all', 'active', 'completed') |
| sortBy            | string  | Yes      | 'order' | Default sort ('order', 'dueDate', 'title')         |
| showCompleted     | boolean | Yes      | true    | Show completed tasks in list                       |
| animationsEnabled | boolean | Yes      | true    | Enable task completion animations                  |
| compactView       | boolean | Yes      | false   | Use compact task list layout                       |

**Validation Rules**:

- `themeId`: Must reference valid theme ID
- `defaultView`: Must be one of: 'all', 'active', 'completed'
- `sortBy`: Must be one of: 'order', 'dueDate', 'title', 'createdAt'

**Storage Key**: `todos_preferences`
**Storage Format**: Single JSON object (not array)

**Example**:

```json
{
  "themeId": "dark",
  "defaultView": "active",
  "sortBy": "dueDate",
  "showCompleted": false,
  "animationsEnabled": true,
  "compactView": false
}
```

---

## Relationships

```
Task ──> Category (many-to-one, optional)
  └─ Task.categoryId references Category.id

UserPreferences ──> Theme (one-to-one)
  └─ UserPreferences.themeId references Theme.id
```

**Notes**:

- No foreign key enforcement (client-side storage)
- Orphaned tasks (categoryId references deleted category) display as uncategorized
- Invalid themeId in preferences falls back to default 'light' theme

---

## Storage Schema

### localStorage Keys

| Key                 | Type   | Description                      |
| ------------------- | ------ | -------------------------------- |
| `todos_tasks`       | Array  | All tasks                        |
| `todos_categories`  | Array  | User-created categories          |
| `todos_preferences` | Object | User preferences                 |
| `todos_initialized` | String | Flag indicating demo data loaded |

### Size Calculations

**Single Task**: ~200 bytes average
**10,000 Tasks**: ~2MB
**Categories**: ~1KB (estimated 20 categories)
**Preferences**: <1KB

**Total Estimated**: ~2MB for 10,000 tasks (well within 5-10MB localStorage quota)

---

## Demo Data

**On First Launch** (when `todos_initialized` key not found):

**Demo Tasks** (5 tasks):

1. "Welcome to the coolest todo app! 👋" - completed: true
2. "Try creating your first task" - completed: false, categoryId: 'personal'
3. "Mark a task as complete by clicking it" - completed: false
4. "Organize tasks with categories" - completed: false, categoryId: 'work'
5. "Set due dates for important tasks" - completed: false, dueDate: tomorrow

**Demo Categories** (4 categories):

- Personal, Work, Shopping, Health (as defined above)

**Demo Preferences**: Default values as specified in UserPreferences

After loading demo data, set `todos_initialized` to `'true'`.

---

## Data Access Patterns

### Create Task

1. Generate UUID for id
2. Set createdAt to Date.now()
3. Set order to highest existing order + 1
4. Validate required fields
5. Append to tasks array
6. Save to localStorage

### Update Task

1. Find task by id in array
2. Update specified properties
3. If setting completed = true, set completedAt to Date.now()
4. If setting completed = false, clear completedAt
5. Save to localStorage

### Delete Task

1. Filter task out of array by id
2. Save updated array to localStorage

### Filter Tasks

1. Load tasks array from localStorage
2. Apply filters in memory (category, status, date range)
3. Sort by specified field
4. Return filtered/sorted array

**Performance Notes**:

- All operations are synchronous (localStorage is sync)
- Filtering/sorting done in memory (fast for 10,000 items in modern browsers)
- No need for indexing or query optimization at this scale

---

## Migration Strategy

**Version 1.0** (Initial): Schema as defined above

**Future Considerations**:

- If schema changes in future versions, implement migration function
- Check version key in localStorage, apply migrations sequentially
- Always backup data before migration
- Provide export/import functionality for user data portability

**Not Implemented Yet**: Cross-device sync, cloud backup, data encryption
