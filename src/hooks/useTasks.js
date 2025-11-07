/**
 * useTasks Hook
 * Custom hook for managing task state and CRUD operations
 * Now supports hybrid storage: Supabase (when authenticated) + localStorage (offline fallback)
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
import {
  fetchTasks,
  createTaskInSupabase,
  updateTaskInSupabase,
  deleteTaskFromSupabase,
  clearCompletedTasksFromSupabase,
  syncLocalDataToSupabase,
} from "../services/supabaseStorageService";
import { useAuth } from "./useAuth";
import { setItem, getItem } from "../services/storageService";
import { getAllCategories } from "../services/categoryService";

/**
 * Custom hook for task management with hybrid storage
 * @returns {Object} Task state and operations
 */
export function useTasks() {
  const { user, isAuthenticated, isOnline } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState({
    categoryId: undefined,
    sortBy: "order",
  });

  // Load tasks on mount and when user changes
  useEffect(() => {
    loadTasks();
  }, [user?.id]);

  // Reload tasks when filter changes
  useEffect(() => {
    if (!loading) {
      loadTasks();
    }
  }, [filter]);

  /**
   * Load tasks from appropriate storage (Supabase if authenticated, localStorage otherwise)
   */
  const loadTasks = async () => {
    try {
      setLoading(true);

      if (isAuthenticated && isOnline && user?.id) {
        // Load from Supabase
        const { data, error: fetchError } = await fetchTasks(user.id);

        if (fetchError) {
          console.error("Failed to load from Supabase:", fetchError);
          // Fall back to localStorage
          const localTasks = getAllTasks(filter);
          setTasks(localTasks);
        } else {
          // Cache in localStorage
          setItem("tasks", data);

          // Apply filter
          let filtered = data;
          if (filter.categoryId !== undefined) {
            filtered = data.filter((t) => t.categoryId === filter.categoryId);
          }
          setTasks(filtered);
        }
      } else {
        // Load from localStorage
        const localTasks = getAllTasks(filter);
        setTasks(localTasks);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load tasks");
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sync local data to Supabase (called on first login)
   */
  const syncToSupabase = async () => {
    if (!isAuthenticated || !user?.id || syncing) return;

    try {
      setSyncing(true);

      const localTasks = getItem("tasks", []);
      const localCategories = getItem("categories", []);

      if (localTasks.length > 0 || localCategories.length > 0) {
        const { success, error: syncError } = await syncLocalDataToSupabase(
          user.id,
          localTasks,
          localCategories
        );

        if (success) {
          console.log("Successfully synced local data to Supabase");
          await loadTasks();
        } else {
          console.error("Failed to sync:", syncError);
        }
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncing(false);
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
   * Add a new task (hybrid: try Supabase first, fall back to localStorage)
   * @param {Object} taskData - Task data
   * @returns {Object} Result
   */
  const addTask = async (taskData) => {
    if (isAuthenticated && isOnline && user?.id) {
      // Get local categories for ID resolution
      const localCategories = getAllCategories();

      // Try Supabase first
      const { data, error: createError } = await createTaskInSupabase(
        user.id,
        taskData,
        localCategories
      );

      if (createError) {
        console.error("Failed to create in Supabase:", createError);
        // Fall back to localStorage
        const result = createTask(taskData);
        if (result.success) {
          loadTasks();
        }
        return result;
      }

      // Success - reload from Supabase
      await loadTasks();
      return { success: true, task: data, error: null };
    } else {
      // Use localStorage
      const result = createTask(taskData);
      if (result.success) {
        loadTasks();
      } else {
        setError(result.error);
      }
      return result;
    }
  };

  /**
   * Update a task (hybrid storage)
   * @param {string} id - Task ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Result
   */
  const updateTaskById = async (id, updates) => {
    if (isAuthenticated && isOnline && user?.id) {
      // Get local categories for ID resolution
      const localCategories = getAllCategories();

      // Try Supabase first
      const { data, error: updateError } = await updateTaskInSupabase(
        id,
        updates,
        user.id,
        localCategories
      );

      if (updateError) {
        console.error("Failed to update in Supabase:", updateError);
        // Fall back to localStorage
        const result = updateTask(id, updates);
        if (result.success) {
          loadTasks();
        }
        return result;
      }

      // Success - reload
      await loadTasks();
      return { success: true, task: data, error: null };
    } else {
      // Use localStorage
      const result = updateTask(id, updates);
      if (result.success) {
        loadTasks();
      } else {
        setError(result.error);
      }
      return result;
    }
  };

  /**
   * Toggle task completion (hybrid storage)
   * @param {string} id - Task ID
   * @returns {Object} Result
   */
  const toggleTask = async (id) => {
    // Get current task state
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      return { success: false, error: "Task not found" };
    }

    const updates = {
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : null,
    };

    return updateTaskById(id, updates);
  };

  /**
   * Delete a task (hybrid storage)
   * @param {string} id - Task ID
   * @returns {Object} Result
   */
  const removeTask = async (id) => {
    if (isAuthenticated && isOnline && user?.id) {
      // Try Supabase first
      const { error: deleteError } = await deleteTaskFromSupabase(id);

      if (deleteError) {
        console.error("Failed to delete from Supabase:", deleteError);
        // Fall back to localStorage
        const result = deleteTask(id);
        if (result.success) {
          loadTasks();
        }
        return result;
      }

      // Success - reload
      await loadTasks();
      return { success: true, error: null };
    } else {
      // Use localStorage
      const result = deleteTask(id);
      if (result.success) {
        loadTasks();
      } else {
        setError(result.error);
      }
      return result;
    }
  };

  /**
   * Clear all completed tasks (hybrid storage)
   * @returns {Object} Result
   */
  const clearCompleted = async () => {
    if (isAuthenticated && isOnline && user?.id) {
      // Try Supabase first
      const { data, error: clearError } = await clearCompletedTasksFromSupabase(
        user.id
      );

      if (clearError) {
        console.error("Failed to clear from Supabase:", clearError);
        // Fall back to localStorage
        const result = clearCompletedTasks();
        if (result.success) {
          await loadTasks();
        }
        return result;
      }

      // Success - reload from Supabase
      await loadTasks();
      return { success: true, count: data?.count || 0, error: null };
    } else {
      // Use localStorage
      const result = clearCompletedTasks();
      if (result.success) {
        loadTasks();
      } else {
        setError(result.error);
      }
      return result;
    }
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
    syncing,
    isOnline,

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
    syncToSupabase,
  };
}
