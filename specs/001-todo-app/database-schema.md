# Database Schema: Coolest Todo Application with Supabase

**Feature**: Coolest Todo Application
**Date**: 2025-11-06
**Database**: Supabase (PostgreSQL)
**Storage Strategy**: Hybrid - Supabase (online) + localStorage (offline fallback)

## Overview

This document defines the database schema for Supabase backend storage. The app uses a hybrid approach:

- **Online**: Data stored in Supabase PostgreSQL with Row Level Security (RLS)
- **Offline**: Data cached in localStorage, synced when connection restored
- **Authentication**: Supabase Auth with email/password

## Schema Setup Instructions

Run these SQL commands in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql):

**⚠️ IMPORTANT: Run these commands in order, one section at a time!**

### 1. Enable UUID Extension

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Create Categories Table FIRST (tasks will reference this)

```sql
-- Categories table with user ownership
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0 AND char_length(name) <= 50),
  color TEXT NOT NULL DEFAULT 'gray',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  category_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, name)
);

-- Add index for user queries
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
```

### 3. Create Tasks Table (now that categories exists)

```sql
-- Tasks table with user ownership
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 500),
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  task_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4. Enable Row Level Security (RLS)

```sql
-- Enable RLS on categories table FIRST
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Category policies
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Task policies
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Seed Default Categories on User Signup (Optional but Recommended)

```sql
-- Function to seed default categories for new users
CREATE OR REPLACE FUNCTION seed_user_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default categories for the new user
  INSERT INTO categories (user_id, name, color, category_order) VALUES
    (NEW.id, 'Personal', 'blue', 1),
    (NEW.id, 'Work', 'purple', 2),
    (NEW.id, 'Shopping', 'green', 3),
    (NEW.id, 'Health', 'red', 4)
  ON CONFLICT (user_id, name) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to seed categories for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists (for re-running this script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to auto-create categories on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION seed_user_categories();
```

### 6. Verify Setup (Optional)

```sql
-- Check that tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('tasks', 'categories');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('tasks', 'categories');

-- Check policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

## Entity Definitions

### Task Entity

**Table**: `tasks`

| Column       | Type        | Nullable | Default         | Description                          |
| ------------ | ----------- | -------- | --------------- | ------------------------------------ |
| id           | UUID        | No       | uuid_generate() | Primary key                          |
| user_id      | UUID        | No       | -               | Foreign key to auth.users (owner)    |
| title        | TEXT        | No       | -               | Task description (1-500 chars)       |
| completed    | BOOLEAN     | No       | false           | Completion status                    |
| created_at   | TIMESTAMPTZ | No       | now()           | Task creation timestamp              |
| completed_at | TIMESTAMPTZ | Yes      | NULL            | Completion timestamp                 |
| category_id  | UUID        | Yes      | NULL            | Foreign key to categories            |
| due_date     | TIMESTAMPTZ | Yes      | NULL            | Due date timestamp                   |
| task_order   | INTEGER     | No       | 0               | Sort order (higher = more recent)    |
| updated_at   | TIMESTAMPTZ | No       | now()           | Last update timestamp (auto-updated) |

**Constraints**:

- `title` must be non-empty and <= 500 characters
- `user_id` references `auth.users(id)` with CASCADE delete
- `category_id` references `categories(id)` with SET NULL on delete
- RLS policies ensure users only access their own data

### Category Entity

**Table**: `categories`

| Column         | Type        | Nullable | Default         | Description                       |
| -------------- | ----------- | -------- | --------------- | --------------------------------- |
| id             | UUID        | No       | uuid_generate() | Primary key                       |
| user_id        | UUID        | No       | -               | Foreign key to auth.users (owner) |
| name           | TEXT        | No       | -               | Category name (1-50 chars)        |
| color          | TEXT        | No       | 'gray'          | Tailwind color name               |
| created_at     | TIMESTAMPTZ | No       | now()           | Category creation timestamp       |
| category_order | INTEGER     | No       | 0               | Display sort order                |

**Constraints**:

- `name` must be non-empty, <= 50 characters, unique per user
- `user_id` references `auth.users(id)` with CASCADE delete
- RLS policies ensure users only access their own data

## Data Migration Strategy

### From localStorage to Supabase

When a user signs up or logs in for the first time:

1. **Check for existing localStorage data**:

   - Read `todos_tasks` and `todos_categories` from localStorage

2. **Import to Supabase**:

   - Insert categories first (maintain name-to-ID mapping)
   - Insert tasks with updated category_id references
   - Preserve created_at timestamps from localStorage

3. **Maintain localStorage as cache**:
   - Keep localStorage synced with Supabase
   - Use localStorage as offline fallback
   - Implement conflict resolution (server wins on conflicts)

### Sync Strategy

**Online Mode**:

- All CRUD operations write to Supabase first
- Success → Update localStorage cache
- Failure → Queue operation for retry

**Offline Mode**:

- CRUD operations write to localStorage only
- Mark operations as "pending sync"
- On reconnection, sync pending operations to Supabase

**Conflict Resolution**:

- Use `updated_at` timestamps
- Server (Supabase) data takes precedence
- Client merges server changes into local state

## Authentication Schema

Uses Supabase Auth built-in tables:

- `auth.users` - User accounts (managed by Supabase)
- Email/password authentication
- Session tokens stored in localStorage
- Auto-refresh tokens enabled

## Performance Considerations

- Indexes on `user_id` for fast user data queries
- Indexes on `category_id` and `due_date` for filtering
- RLS policies use indexed `user_id` column
- Soft deletion possible via `deleted_at` column (optional enhancement)

## Security

- Row Level Security (RLS) enforces user data isolation
- All tables require authentication (`auth.uid()`)
- Foreign key constraints prevent orphaned data
- Check constraints validate data integrity
- Prepared statements prevent SQL injection (handled by Supabase client)
