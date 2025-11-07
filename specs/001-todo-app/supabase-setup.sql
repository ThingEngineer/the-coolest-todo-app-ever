-- Quick Fix for Supabase Database Setup
-- Run this in your Supabase SQL Editor to fix the "Database error saving new user" issue
-- Step 1: Drop existing trigger if it exists (it might be causing signup failures)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Step 2: Drop existing tables if they exist (to recreate in correct order)
-- WARNING: This will delete all existing data. Skip if you have data you want to keep!
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
-- Step 3: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Step 4: Create categories table FIRST (tasks references this)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (
        char_length(trim(name)) > 0
        AND char_length(name) <= 50
    ),
    color TEXT NOT NULL DEFAULT 'gray',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    category_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, name)
);
CREATE INDEX idx_categories_user_id ON categories(user_id);
-- Step 5: Create tasks table (now that categories exists)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (
        char_length(trim(title)) > 0
        AND char_length(title) <= 500
    ),
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    category_id UUID REFERENCES categories(id) ON DELETE
    SET NULL,
        due_date TIMESTAMPTZ,
        task_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date)
WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_completed ON tasks(completed);
-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_tasks_updated_at BEFORE
UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Step 6: Enable RLS on both tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- Step 7: Create RLS policies for categories
CREATE POLICY "Users can view own categories" ON categories FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);
-- Step 8: Create RLS policies for tasks
CREATE POLICY "Users can view own tasks" ON tasks FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);
-- Step 9: Create function to seed default categories
CREATE OR REPLACE FUNCTION seed_user_categories() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO categories (user_id, name, color, category_order)
VALUES (NEW.id, 'Personal', 'blue', 1),
    (NEW.id, 'Work', 'purple', 2),
    (NEW.id, 'Shopping', 'green', 3),
    (NEW.id, 'Health', 'red', 4) ON CONFLICT (user_id, name) DO NOTHING;
RETURN NEW;
EXCEPTION
WHEN OTHERS THEN -- Don't fail user creation if category seeding fails
RAISE WARNING 'Failed to seed categories for user %: %',
NEW.id,
SQLERRM;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Step 10: Create trigger to auto-seed categories on signup
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION seed_user_categories();
-- Step 11: Verify setup
SELECT 'Tables created:' as status;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('tasks', 'categories');
SELECT 'RLS enabled:' as status;
SELECT tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('tasks', 'categories');
SELECT 'Policies created:' as status;
SELECT tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename;