# Service Contracts: Task Operations

**Service**: `taskService`
**Module**: `src/services/taskService.js`
**Type**: Client-side JavaScript service (not HTTP API)

## Overview

Task service provides all CRUD operations for managing tasks in localStorage. All methods are synchronous and return data immediately or throw errors.

---

## Methods

### createTask

Creates a new task and persists to localStorage.

**Signature**:

```javascript
createTask(taskData: CreateTaskDTO): Task
```

**Input** (`CreateTaskDTO`):

```javascript
{
  title: string,           // Required: 1-500 characters
  categoryId?: string,     // Optional: Must reference valid category
  dueDate?: number,        // Optional: Unix timestamp
}
```

**Output** (`Task`):

```javascript
{
  id: string,              // Generated UUID
  title: string,           // Trimmed input
  completed: false,        // Always false for new tasks
  createdAt: number,       // Current timestamp
  completedAt: null,       // Always null for new tasks
  categoryId: string | null,
  dueDate: number | null,
  order: number            // Auto-incremented
}
```

**Errors**:

- `ValidationError`: Empty title, title > 500 chars, invalid categoryId
- `StorageError`: localStorage quota exceeded or unavailable

**Example**:

```javascript
const task = taskService.createTask({
  title: "Buy groceries",
  categoryId: "cat_1",
  dueDate: Date.now() + 86400000, // tomorrow
});
// Returns: { id: "uuid...", title: "Buy groceries", completed: false, ... }
```

---

### updateTask

Updates an existing task's properties.

**Signature**:

```javascript
updateTask(taskId: string, updates: UpdateTaskDTO): Task
```

**Input** (`UpdateTaskDTO`):

```javascript
{
  title?: string,          // 1-500 characters
  completed?: boolean,     // Toggle completion
  categoryId?: string | null,  // Change category or clear
  dueDate?: number | null, // Update or clear due date
}
```

**Output**: Updated `Task` object

**Side Effects**:

- If `completed` changed to `true`: sets `completedAt` to current timestamp
- If `completed` changed to `false`: clears `completedAt` to null

**Errors**:

- `NotFoundError`: Task with taskId doesn't exist
- `ValidationError`: Invalid update values
- `StorageError`: localStorage save failed

**Example**:

```javascript
const task = taskService.updateTask("uuid-123", {
  completed: true,
});
// Returns: { id: "uuid-123", completed: true, completedAt: 1699286400000, ... }
```

---

### deleteTask

Permanently deletes a task.

**Signature**:

```javascript
deleteTask(taskId: string): void
```

**Input**: Task ID to delete

**Output**: void (no return value)

**Errors**:

- `NotFoundError`: Task with taskId doesn't exist
- `StorageError`: localStorage save failed

**Example**:

```javascript
taskService.deleteTask("uuid-123");
// Task removed from storage
```

---

### getTask

Retrieves a single task by ID.

**Signature**:

```javascript
getTask(taskId: string): Task | null
```

**Input**: Task ID

**Output**: Task object or null if not found

**Errors**: None (returns null instead of throwing)

**Example**:

```javascript
const task = taskService.getTask("uuid-123");
// Returns: Task object or null
```

---

### getAllTasks

Retrieves all tasks with optional filtering and sorting.

**Signature**:

```javascript
getAllTasks(options?: GetTasksOptions): Task[]
```

**Input** (`GetTasksOptions`):

```javascript
{
  status?: 'all' | 'active' | 'completed',  // Default: 'all'
  categoryId?: string | null,                // Filter by category
  sortBy?: 'order' | 'createdAt' | 'dueDate' | 'title',  // Default: 'order'
  sortDirection?: 'asc' | 'desc',           // Default: 'desc'
}
```

**Output**: Array of Task objects

**Behavior**:

- `status: 'active'`: Returns only tasks where `completed = false`
- `status: 'completed'`: Returns only tasks where `completed = true`
- `status: 'all'`: Returns all tasks regardless of completion
- `categoryId`: If provided, filters to tasks in that category; if null, shows uncategorized
- Sorting applied after filtering

**Errors**: None (returns empty array if no tasks match)

**Example**:

```javascript
const activeTasks = taskService.getAllTasks({
  status: "active",
  categoryId: "cat_1",
  sortBy: "dueDate",
});
// Returns: Array of active tasks in category cat_1, sorted by due date
```

---

### toggleTaskCompletion

Convenience method to toggle a task's completion status.

**Signature**:

```javascript
toggleTaskCompletion(taskId: string): Task
```

**Input**: Task ID

**Output**: Updated Task object

**Behavior**:

- If `completed = false`, sets to `true` and records `completedAt`
- If `completed = true`, sets to `false` and clears `completedAt`

**Errors**: Same as `updateTask`

**Example**:

```javascript
const task = taskService.toggleTaskCompletion("uuid-123");
// Task completion toggled
```

---

### clearCompletedTasks

Deletes all completed tasks.

**Signature**:

```javascript
clearCompletedTasks(): number
```

**Input**: None

**Output**: Number of tasks deleted

**Errors**:

- `StorageError`: localStorage save failed

**Example**:

```javascript
const count = taskService.clearCompletedTasks();
// Returns: 5 (if 5 completed tasks were deleted)
```

---

### getTaskStats

Retrieves statistics about tasks.

**Signature**:

```javascript
getTaskStats(): TaskStats
```

**Input**: None

**Output** (`TaskStats`):

```javascript
{
  total: number,           // Total tasks
  active: number,          // Incomplete tasks
  completed: number,       // Completed tasks
  overdue: number,         // Active tasks past due date
  dueToday: number,        // Tasks due today
  dueThisWeek: number,     // Tasks due within 7 days
}
```

**Example**:

```javascript
const stats = taskService.getTaskStats();
// Returns: { total: 42, active: 30, completed: 12, overdue: 3, ... }
```

---

## Data Validation Rules

### Task Title

- **Required**: Must not be empty after trimming
- **Length**: 1-500 characters
- **Sanitization**: Trim leading/trailing whitespace

### Category ID

- **Optional**: Can be null/undefined
- **Validation**: If provided, must reference existing category in `categoryService.getCategory()`

### Due Date

- **Optional**: Can be null/undefined
- **Type**: Must be valid Unix timestamp (number)
- **Range**: No past date restriction (users can set tasks overdue intentionally)

---

## Error Types

```javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(message, id) {
    super(message);
    this.name = "NotFoundError";
    this.id = id;
  }
}

class StorageError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "StorageError";
    this.cause = cause;
  }
}
```

---

## Performance Characteristics

- **createTask**: O(n) - must read all tasks to get max order
- **updateTask**: O(n) - must find and update task in array
- **deleteTask**: O(n) - must filter task from array
- **getTask**: O(n) - linear search by ID
- **getAllTasks**: O(n log n) - includes sorting
- **toggleTaskCompletion**: O(n) - same as updateTask

**Note**: For 10,000 tasks, these operations complete in < 10ms on modern browsers.

---

## Storage Implementation

All methods interact with localStorage via:

```javascript
// Read
const tasks = JSON.parse(localStorage.getItem("todos_tasks") || "[]");

// Write
localStorage.setItem("todos_tasks", JSON.stringify(tasks));
```

**Error Handling**:

- Wrap all localStorage operations in try-catch
- On quota exceeded: throw `StorageError` with guidance to clear completed tasks
- On parse error: log error, reset to empty array (data corruption recovery)
