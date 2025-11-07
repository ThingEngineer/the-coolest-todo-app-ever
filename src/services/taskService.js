/**
 * Task Service
 * Business logic for task operations (CRUD)
 */

import { getItem, setItem } from "./storageService";
import { validateTaskTitle } from "../utils/validators";
import { generateId } from "../utils/helpers";
import { getDemoTasks } from "./demoData";

const TASKS_KEY = "tasks";
const INITIALIZED_KEY = "initialized";

/**
 * Task Entity Structure
 * @typedef {Object} Task
 * @property {string} id - Unique identifier
 * @property {string} title - Task title (1-500 chars)
 * @property {boolean} completed - Completion status
 * @property {string} createdAt - ISO timestamp
 * @property {number} order - Display order
 * @property {string|null} categoryId - Category reference
 * @property {string|null} dueDate - Due date ISO timestamp
 * @property {string|null} completedAt - Completion timestamp
 */

/**
 * Initialize demo data on first launch
 */
export function initializeDemoData() {
  const initialized = getItem(INITIALIZED_KEY, false);

  if (!initialized) {
    const demoTasks = getDemoTasks();
    setItem(TASKS_KEY, demoTasks);
    setItem(INITIALIZED_KEY, true);
    return demoTasks;
  }

  return getAllTasks();
}

/**
 * Get all tasks
 * @param {Object} options - Query options
 * @param {string} options.categoryId - Filter by category
 * @param {string} options.sortBy - Sort field (order, dueDate, title, createdAt)
 * @param {string} options.sortDirection - Sort direction (asc, desc)
 * @returns {Array<Task>} Array of tasks
 */
export function getAllTasks(options = {}) {
  const tasks = getItem(TASKS_KEY, []);
  let filtered = [...tasks];

  // Filter by category
  if (options.categoryId !== undefined) {
    filtered = filtered.filter(
      (task) => task.categoryId === options.categoryId
    );
  }

  // Sort
  const sortBy = options.sortBy || "order";
  const sortDirection = options.sortDirection || "asc";

  filtered.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Special handling for dueDate sorting - tasks without due dates go to end
    if (sortBy === "dueDate") {
      if (!aVal && !bVal) return 0; // Both null, keep original order
      if (!aVal) return 1; // a is null, move to end
      if (!bVal) return -1; // b is null, move to end

      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    // Handle other date fields
    else if (sortBy === "createdAt" || sortBy === "completedAt") {
      // Handle null values
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    // Handle title sorting case-insensitively
    else if (sortBy === "title") {
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    // Handle other fields
    else {
      if (aVal == null) return 1;
      if (bVal == null) return -1;
    }

    // Compare
    let result = 0;
    if (aVal < bVal) result = -1;
    if (aVal > bVal) result = 1;

    return sortDirection === "desc" ? -result : result;
  });

  return filtered;
}

/**
 * Get task by ID
 * @param {string} id - Task ID
 * @returns {Task|null} Task object or null
 */
export function getTaskById(id) {
  const tasks = getAllTasks();
  return tasks.find((task) => task.id === id) || null;
}

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @param {string} taskData.title - Task title (required)
 * @param {string} taskData.categoryId - Category ID (optional)
 * @param {string} taskData.dueDate - Due date ISO string (optional)
 * @returns {Object} { success: boolean, task: Task, error: string }
 */
export function createTask(taskData) {
  // Validate title
  const validation = validateTaskTitle(taskData.title);
  if (!validation.valid) {
    return { success: false, task: null, error: validation.error };
  }

  const tasks = getAllTasks();
  const maxOrder =
    tasks.length > 0 ? Math.max(...tasks.map((t) => t.order)) : -1;

  const newTask = {
    id: generateId(),
    title: taskData.title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    order: maxOrder + 1,
    categoryId: taskData.categoryId || null,
    dueDate: taskData.dueDate || null,
    completedAt: null,
  };

  tasks.push(newTask);
  const saved = setItem(TASKS_KEY, tasks);

  if (!saved) {
    return { success: false, task: null, error: "Failed to save task" };
  }

  return { success: true, task: newTask, error: null };
}

/**
 * Update an existing task
 * @param {string} id - Task ID
 * @param {Object} updates - Fields to update
 * @returns {Object} { success: boolean, task: Task, error: string }
 */
export function updateTask(id, updates) {
  const tasks = getAllTasks();
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return { success: false, task: null, error: "Task not found" };
  }

  // Validate title if being updated
  if (updates.title !== undefined) {
    const validation = validateTaskTitle(updates.title);
    if (!validation.valid) {
      return { success: false, task: null, error: validation.error };
    }
    updates.title = updates.title.trim();
  }

  tasks[index] = { ...tasks[index], ...updates };
  const saved = setItem(TASKS_KEY, tasks);

  if (!saved) {
    return { success: false, task: null, error: "Failed to update task" };
  }

  return { success: true, task: tasks[index], error: null };
}

/**
 * Toggle task completion status
 * @param {string} id - Task ID
 * @returns {Object} { success: boolean, task: Task, error: string }
 */
export function toggleTaskCompletion(id) {
  const tasks = getAllTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return { success: false, task: null, error: "Task not found" };
  }

  const updates = {
    completed: !task.completed,
    completedAt: !task.completed ? new Date().toISOString() : null,
  };

  return updateTask(id, updates);
}

/**
 * Delete a task
 * @param {string} id - Task ID
 * @returns {Object} { success: boolean, error: string }
 */
export function deleteTask(id) {
  const tasks = getAllTasks();
  const filtered = tasks.filter((task) => task.id !== id);

  if (filtered.length === tasks.length) {
    return { success: false, error: "Task not found" };
  }

  const saved = setItem(TASKS_KEY, filtered);

  if (!saved) {
    return { success: false, error: "Failed to delete task" };
  }

  return { success: true, error: null };
}

/**
 * Get task statistics
 * @returns {Object} Statistics object
 */
export function getTaskStats() {
  const tasks = getAllTasks();

  return {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    overdue: tasks.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
    ).length,
  };
}

/**
 * Clear completed tasks
 * @returns {Object} { success: boolean, count: number, error: string }
 */
export function clearCompletedTasks() {
  const tasks = getAllTasks();
  const activeTasks = tasks.filter((task) => !task.completed);
  const clearedCount = tasks.length - activeTasks.length;

  const saved = setItem(TASKS_KEY, activeTasks);

  if (!saved) {
    return {
      success: false,
      count: 0,
      error: "Failed to clear completed tasks",
    };
  }

  return { success: true, count: clearedCount, error: null };
}
