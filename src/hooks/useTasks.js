/**
 * useTasks Hook
 * Custom hook for managing task state and CRUD operations
 */

import { useState, useEffect } from "preact/hooks";
import {
  getAllTasks,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
  clearCompletedTasks,
  getTaskStats,
  initializeDemoData,
} from "../services/taskService";

/**
 * Custom hook for task management
 * @returns {Object} Task state and operations
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    categoryId: undefined,
    sortBy: "order",
  });

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Reload tasks when filter changes
  useEffect(() => {
    if (!loading) {
      loadTasks();
    }
  }, [filter]);

  /**
   * Load tasks from storage
   */
  const loadTasks = () => {
    try {
      setLoading(true);
      const loadedTasks = getAllTasks(filter);
      setTasks(loadedTasks);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks");
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize demo data
   */
  const initDemo = () => {
    try {
      const demoTasks = initializeDemoData();
      setTasks(demoTasks);
      setError(null);
    } catch (err) {
      setError("Failed to initialize demo data");
      console.error("Error initializing demo:", err);
    }
  };

  /**
   * Add a new task
   * @param {Object} taskData - Task data
   * @returns {Object} Result
   */
  const addTask = (taskData) => {
    const result = createTask(taskData);

    if (result.success) {
      loadTasks();
    } else {
      setError(result.error);
    }

    return result;
  };

  /**
   * Update a task
   * @param {string} id - Task ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Result
   */
  const updateTaskById = (id, updates) => {
    const result = updateTask(id, updates);

    if (result.success) {
      loadTasks();
    } else {
      setError(result.error);
    }

    return result;
  };

  /**
   * Toggle task completion
   * @param {string} id - Task ID
   * @returns {Object} Result
   */
  const toggleTask = (id) => {
    const result = toggleTaskCompletion(id);

    if (result.success) {
      loadTasks();
    } else {
      setError(result.error);
    }

    return result;
  };

  /**
   * Delete a task
   * @param {string} id - Task ID
   * @returns {Object} Result
   */
  const removeTask = (id) => {
    const result = deleteTask(id);

    if (result.success) {
      loadTasks();
    } else {
      setError(result.error);
    }

    return result;
  };

  /**
   * Clear all completed tasks
   * @returns {Object} Result
   */
  const clearCompleted = () => {
    const result = clearCompletedTasks();

    if (result.success) {
      loadTasks();
    } else {
      setError(result.error);
    }

    return result;
  };

  /**
   * Get task statistics
   * @returns {Object} Stats
   */
  const stats = getTaskStats();

  /**
   * Update filter
   * @param {Object} newFilter - New filter options
   */
  const updateFilter = (newFilter) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  return {
    // State
    tasks,
    loading,
    error,
    filter,
    stats,

    // Operations
    addTask,
    updateTask: updateTaskById,
    toggleTask,
    removeTask,
    clearCompleted,
    loadTasks,
    initDemo,
    updateFilter,
    setError,
  };
}
