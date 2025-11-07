# Service Contracts: Category Operations

**Service**: `categoryService`
**Module**: `src/services/categoryService.js`
**Type**: Client-side JavaScript service

## Overview

Category service manages task categories stored in localStorage. Provides CRUD operations and predefined category seeding.

---

## Methods

### createCategory

Creates a new category.

**Signature**:

```javascript
createCategory(categoryData: CreateCategoryDTO): Category
```

**Input** (`CreateCategoryDTO`):

```javascript
{
  name: string,            // Required: 1-50 characters
  color: string,           // Required: Valid Tailwind color name
}
```

**Output** (`Category`):

```javascript
{
  id: string,              // Generated UUID
  name: string,            // Trimmed input
  color: string,           // Validated color
  createdAt: number,       // Current timestamp
  order: number            // Auto-incremented
}
```

**Validation**:

- `name`: Must be unique (case-insensitive), 1-50 chars
- `color`: Must be one of allowed colors (see below)

**Allowed Colors**:

- `'gray'`, `'red'`, `'orange'`, `'amber'`, `'yellow'`, `'lime'`, `'green'`
- `'emerald'`, `'teal'`, `'cyan'`, `'sky'`, `'blue'`, `'indigo'`, `'violet'`
- `'purple'`, `'fuchsia'`, `'pink'`, `'rose'`

**Errors**:

- `ValidationError`: Empty name, name too long, duplicate name, invalid color
- `StorageError`: localStorage save failed

**Example**:

```javascript
const category = categoryService.createCategory({
  name: "Urgent",
  color: "red",
});
```

---

### updateCategory

Updates an existing category.

**Signature**:

```javascript
updateCategory(categoryId: string, updates: UpdateCategoryDTO): Category
```

**Input** (`UpdateCategoryDTO`):

```javascript
{
  name?: string,           // 1-50 characters, must be unique
  color?: string,          // Valid Tailwind color
}
```

**Output**: Updated Category object

**Errors**: Same as createCategory

---

### deleteCategory

Deletes a category. Tasks in this category become uncategorized.

**Signature**:

```javascript
deleteCategory(categoryId: string): void
```

**Input**: Category ID

**Output**: void

**Side Effects**:

- All tasks with this categoryId have their categoryId set to null
- Category removed from storage

**Errors**:

- `NotFoundError`: Category doesn't exist
- `StorageError`: localStorage save failed

---

### getCategory

Retrieves a single category by ID.

**Signature**:

```javascript
getCategory(categoryId: string): Category | null
```

**Input**: Category ID

**Output**: Category object or null

---

### getAllCategories

Retrieves all categories, sorted by order.

**Signature**:

```javascript
getAllCategories(): Category[]
```

**Input**: None

**Output**: Array of Category objects sorted by `order` field

---

### reorderCategories

Updates the display order of categories.

**Signature**:

```javascript
reorderCategories(orderedIds: string[]): void
```

**Input**: Array of category IDs in desired order

**Output**: void

**Behavior**: Updates `order` field on each category to match array index

---

### initializeDemoCategories

Seeds predefined demo categories if none exist.

**Signature**:

```javascript
initializeDemoCategories(): Category[]
```

**Input**: None

**Output**: Array of created demo categories

**Behavior**:

- Only runs if categories array is empty
- Creates 4 predefined categories: Personal, Work, Shopping, Health
- Sets `todos_initialized` flag in localStorage

**Demo Categories**:

```javascript
[
  { name: "Personal", color: "blue" },
  { name: "Work", color: "purple" },
  { name: "Shopping", color: "green" },
  { name: "Health", color: "red" },
];
```

---

## Color Mapping

For rendering, map Tailwind color names to CSS classes:

```javascript
const colorClasses = {
  // Background classes
  bg: {
    blue: "bg-blue-100 dark:bg-blue-900",
    purple: "bg-purple-100 dark:bg-purple-900",
    green: "bg-green-100 dark:bg-green-900",
    // ... etc
  },
  // Text classes
  text: {
    blue: "text-blue-700 dark:text-blue-300",
    purple: "text-purple-700 dark:text-purple-300",
    // ... etc
  },
  // Border classes
  border: {
    blue: "border-blue-500",
    purple: "border-purple-500",
    // ... etc
  },
};
```
