# XSS Prevention & Input Sanitization

**Implementation Date**: November 7, 2025  
**Status**: ✅ Implemented & Active

## Overview

This application implements comprehensive XSS (Cross-Site Scripting) prevention through multiple layers of defense:

1. **Input Sanitization** - DOMPurify sanitizes all user input
2. **Output Encoding** - Preact automatically escapes rendered content
3. **Content Security** - Validation before storage
4. **External Data Protection** - Sanitization of data from Supabase

## Dependencies

- **isomorphic-dompurify** - Industry-standard HTML sanitization library
  - Works in both browser and Node.js environments
  - Actively maintained and audited
  - Used by major companies and frameworks

## Sanitization Points

### 1. Task Titles

**File**: `src/services/taskService.js`

```javascript
import { sanitizeTaskTitle } from "../utils/sanitize";

// On creation
export function createTask(taskData) {
  const sanitizedTitle = sanitizeTaskTitle(taskData.title);
  // ... validation and storage
}

// On update
export function updateTask(id, updates) {
  if (updates.title !== undefined) {
    const sanitizedTitle = sanitizeTaskTitle(updates.title);
    // ... validation and storage
  }
}
```

**Protection**:

- Strips all HTML tags
- Removes dangerous attributes (onclick, onerror, etc.)
- Limits length to 500 characters
- Prevents script injection

### 2. Category Names

**File**: `src/services/categoryService.js`

```javascript
import { sanitizeCategoryName } from "../utils/sanitize";

// On creation
export function createCategory(categoryData) {
  const sanitizedName = sanitizeCategoryName(categoryData.name);
  // ... validation and storage
}

// On update
export function updateCategory(id, updates) {
  if (updates.name !== undefined) {
    const sanitizedName = sanitizeCategoryName(updates.name);
    // ... validation and storage
  }
}
```

**Protection**:

- Strips all HTML tags
- Removes dangerous attributes
- Limits length to 50 characters
- Prevents script injection

### 3. External Data (Supabase)

**File**: `src/services/supabaseStorageService.js`

```javascript
import { sanitizeTaskTitle, sanitizeCategoryName } from "../utils/sanitize";

// When fetching tasks
export async function fetchTasks(userId) {
  const tasks = data.map((task) => ({
    title: sanitizeTaskTitle(task.title), // Sanitize from database
    // ...
  }));
}

// When fetching categories
export async function fetchCategories(userId) {
  const categories = data.map((cat) => ({
    name: sanitizeCategoryName(cat.name), // Sanitize from database
    // ...
  }));
}
```

**Protection**:

- Sanitizes data from external database
- Prevents stored XSS attacks
- Protects against compromised database data

### 4. Component Rendering

**File**: `src/components/TaskItem.jsx`

```jsx
// Preact automatically escapes text content
<p>{task.title}</p>  {/* Safe - automatically escaped */}
```

**Protection**:

- Preact's JSX automatically escapes all text content
- No manual escaping needed for display
- Prevents XSS through template injection

## Sanitization Functions

**File**: `src/utils/sanitize.js`

### `sanitizeText(input)`

Base sanitization function that strips all HTML tags.

```javascript
sanitizeText("<script>alert('xss')</script>Hello");
// Returns: "Hello"
```

### `sanitizeTaskTitle(title)`

Task-specific sanitization with length limit.

```javascript
sanitizeTaskTitle("<img src=x onerror=alert('xss')>Buy milk");
// Returns: "Buy milk"
```

### `sanitizeCategoryName(name)`

Category-specific sanitization with length limit.

```javascript
sanitizeCategoryName("Work<script>alert('xss')</script>");
// Returns: "Work"
```

### `sanitizeHTML(html)`

For future rich text support (currently not used).

```javascript
sanitizeHTML("<p>Safe text</p><script>alert('xss')</script>");
// Returns: "<p>Safe text</p>"
```

### `sanitizeURL(url)`

Validates and sanitizes URLs to prevent dangerous protocols.

```javascript
sanitizeURL("javascript:alert('xss')");
// Returns: ""

sanitizeURL("https://example.com");
// Returns: "https://example.com"
```

### `containsXSS(input)`

Detects potential XSS attempts.

```javascript
containsXSS("<script>alert('xss')</script>");
// Returns: true

containsXSS("Normal text");
// Returns: false
```

## Test Cases

### XSS Attack Vectors Tested

1. **Script Tags**

   ```
   Input: "<script>alert('XSS')</script>Buy groceries"
   Output: "Buy groceries"
   ```

2. **Event Handlers**

   ```
   Input: "<img src=x onerror=alert('XSS')>Task"
   Output: "Task"
   ```

3. **JavaScript Protocol**

   ```
   Input: "<a href='javascript:alert(1)'>Click</a>"
   Output: "Click"
   ```

4. **Data URI**

   ```
   Input: "<img src='data:text/html,<script>alert(1)</script>'>"
   Output: ""
   ```

5. **Nested Tags**
   ```
   Input: "<<SCRIPT>alert('XSS')</SCRIPT>Work"
   Output: "Work"
   ```

## How to Test

### Manual Testing

1. Create a task with XSS payload:

   ```
   <script>alert('XSS')</script>Buy milk
   ```

2. Verify the task displays as:

   ```
   Buy milk
   ```

3. Check browser console - no errors, no alerts

4. Inspect element - no script tags in HTML

### Automated Testing (Future)

Add to `tests/unit/sanitize.test.js`:

```javascript
import { sanitizeTaskTitle, containsXSS } from "../utils/sanitize";

describe("XSS Prevention", () => {
  it("should remove script tags", () => {
    const result = sanitizeTaskTitle("<script>alert('xss')</script>Test");
    expect(result).toBe("Test");
  });

  it("should detect XSS attempts", () => {
    expect(containsXSS("<script>alert(1)</script>")).toBe(true);
    expect(containsXSS("Normal text")).toBe(false);
  });
});
```

## Security Best Practices

### ✅ Implemented

1. **Input Sanitization** - All user input sanitized before storage
2. **Output Encoding** - Preact automatically escapes output
3. **Validation** - Input validated after sanitization
4. **External Data** - Data from Supabase sanitized on fetch
5. **No innerHTML** - Using JSX/Preact (safe by default)
6. **No eval()** - No dynamic code execution
7. **URL Validation** - Dangerous protocols blocked

### 🔄 Recommended Future Enhancements

1. **Content Security Policy (CSP)**

   ```html
   <meta
     http-equiv="Content-Security-Policy"
     content="default-src 'self'; script-src 'self'"
   />
   ```

2. **Rate Limiting** - Prevent abuse through rapid requests

3. **Input Length Limits** - Already implemented (500 chars tasks, 50 chars categories)

4. **Audit Logging** - Log XSS attempts for security monitoring

5. **Regular Dependency Updates** - Keep DOMPurify updated

## Maintenance

### Regular Tasks

- [ ] Update DOMPurify monthly: `npm update isomorphic-dompurify`
- [ ] Review security advisories: `npm audit`
- [ ] Test XSS protection quarterly
- [ ] Review and update sanitization patterns

### Monitoring

Watch for:

- New XSS attack vectors (OWASP updates)
- DOMPurify security patches
- Preact security updates
- User reports of unusual behavior

## References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Preact Security](https://preactjs.com/guide/v10/differences-to-react#security)

## Incident Response

If XSS vulnerability is discovered:

1. **Immediate**: Deploy sanitization fix
2. **Notify**: Inform users if data compromised
3. **Audit**: Review all user-generated content
4. **Update**: Document vulnerability and fix
5. **Test**: Add test case to prevent regression
