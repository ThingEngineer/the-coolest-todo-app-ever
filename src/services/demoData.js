/**
 * Demo Data
 * Default tasks and categories loaded on first app launch
 */

import { generateId } from "../utils/helpers";

/**
 * Get demo tasks
 * @returns {Array} Array of demo task objects
 */
export function getDemoTasks() {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: generateId(),
      title: "👋 Welcome to the Coolest Todo App!",
      completed: true,
      completedAt: yesterday.toISOString(),
      createdAt: yesterday.toISOString(),
      order: 0,
      categoryId: null,
      dueDate: null,
    },
    {
      id: generateId(),
      title: "Try creating your first task by typing above",
      completed: false,
      completedAt: null,
      createdAt: now.toISOString(),
      order: 1,
      categoryId: null,
      dueDate: null,
    },
    {
      id: generateId(),
      title: "Click on this task to mark it as complete",
      completed: false,
      completedAt: null,
      createdAt: now.toISOString(),
      order: 2,
      categoryId: null,
      dueDate: null,
    },
    {
      id: generateId(),
      title: "Organize your tasks with categories",
      completed: false,
      completedAt: null,
      createdAt: now.toISOString(),
      order: 3,
      categoryId: null,
      dueDate: tomorrow.toISOString(),
    },
    {
      id: generateId(),
      title: "Customize the theme to match your style",
      completed: false,
      completedAt: null,
      createdAt: now.toISOString(),
      order: 4,
      categoryId: null,
      dueDate: nextWeek.toISOString(),
    },
  ];
}

/**
 * Get demo categories
 * @returns {Array} Array of demo category objects
 */
export function getDemoCategories() {
  const now = new Date();

  return [
    {
      id: generateId(),
      name: "💼 Work",
      color: "#3b82f6", // blue
      createdAt: now.toISOString(),
    },
    {
      id: generateId(),
      name: "🏠 Personal",
      color: "#10b981", // green
      createdAt: now.toISOString(),
    },
    {
      id: generateId(),
      name: "🛒 Shopping",
      color: "#f59e0b", // amber
      createdAt: now.toISOString(),
    },
    {
      id: generateId(),
      name: "💪 Health",
      color: "#ef4444", // red
      createdAt: now.toISOString(),
    },
  ];
}

/**
 * Get default user preferences
 * @returns {Object} Default preferences object
 */
export function getDefaultPreferences() {
  return {
    theme: "light",
    showCompleted: true,
    animationsEnabled: true,
    compactView: false,
    defaultCategoryId: null,
  };
}

/**
 * Get available themes
 * @returns {Array} Array of theme objects
 */
export function getThemes() {
  return [
    {
      id: "light",
      name: "Light",
      description: "Clean and bright",
    },
    {
      id: "dark",
      name: "Dark",
      description: "Easy on the eyes",
    },
    {
      id: "ocean",
      name: "Ocean",
      description: "Deep blue calm",
    },
    {
      id: "sunset",
      name: "Sunset",
      description: "Warm and cozy",
    },
  ];
}
