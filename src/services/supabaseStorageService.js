/**
 * Supabase Storage Service
 *
 * Provides Supabase database operations for tasks and categories.
 * Works alongside localStorage for offline fallback.
 */

import supabase, { isSupabaseAvailable } from "../config/supabase.js";

/**
 * Fetch all tasks for the current user from Supabase
 * @param {string} userId - User ID from auth
 * @returns {Promise<{data: Array, error: object|null}>}
 */
export async function fetchTasks(userId) {
  if (!isSupabaseAvailable() || !userId) {
    return {
      data: [],
      error: { message: "Supabase not available or no user ID" },
    };
  }

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("task_order", { ascending: false });

    if (error) {
      return { data: [], error };
    }

    // Transform Supabase format to app format
    const tasks = data.map((task) => ({
      id: task.id,
      title: task.title,
      completed: task.completed,
      createdAt: task.created_at,
      completedAt: task.completed_at,
      categoryId: task.category_id,
      dueDate: task.due_date,
      order: task.task_order,
    }));

    return { data: tasks, error: null };
  } catch (err) {
    return {
      data: [],
      error: { message: err.message || "Failed to fetch tasks" },
    };
  }
}

/**
 * Helper function to check if a string is a valid UUID
 * @param {string} str - String to check
 * @returns {boolean} True if valid UUID
 */
function isValidUUID(str) {
  if (!str) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Find a Supabase category by name for the current user
 * @param {string} userId - User ID
 * @param {string} categoryName - Category name to find
 * @returns {Promise<string|null>} Category UUID or null
 */
async function findCategoryIdByName(userId, categoryName) {
  if (!isSupabaseAvailable() || !userId || !categoryName) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("name", categoryName)
      .single();

    if (error || !data) {
      return null;
    }

    return data.id;
  } catch (err) {
    console.error("Error finding category by name:", err);
    return null;
  }
}

/**
 * Resolve category ID - if not a valid UUID, try to find or create matching category
 * @param {string} userId - User ID
 * @param {string} categoryId - Category ID (might be localStorage ID)
 * @param {Array} localCategories - Local categories for name lookup
 * @returns {Promise<string|null>} Valid UUID or null
 */
async function resolveCategoryId(userId, categoryId, localCategories = []) {
  if (!categoryId) return null;

  // If already a valid UUID, return it
  if (isValidUUID(categoryId)) {
    return categoryId;
  }

  // Not a UUID - try to find the category by name
  // First, find the category name in localStorage
  const localCategory = localCategories.find((cat) => cat.id === categoryId);
  if (!localCategory) {
    console.warn(
      `Category with ID ${categoryId} not found in local categories`
    );
    return null;
  }

  // Try to find the matching Supabase category by name
  let supabaseCategoryId = await findCategoryIdByName(
    userId,
    localCategory.name
  );

  if (supabaseCategoryId) {
    console.log(
      `Mapped localStorage category "${localCategory.name}" (${categoryId}) to Supabase UUID ${supabaseCategoryId}`
    );
    return supabaseCategoryId;
  }

  // Category doesn't exist in Supabase - create it
  console.log(`Creating category "${localCategory.name}" in Supabase`);
  const { data, error } = await createCategoryInSupabase(userId, {
    name: localCategory.name,
    color: localCategory.color,
    createdAt: localCategory.createdAt,
    order: localCategory.order || 0,
  });

  if (error) {
    console.error(
      `Failed to create category "${localCategory.name}" in Supabase:`,
      error
    );
    return null;
  }

  console.log(
    `Created category "${localCategory.name}" in Supabase with ID ${data.id}`
  );
  return data.id;
}

/**
 * Create a new task in Supabase
 * @param {string} userId - User ID from auth
 * @param {object} taskData - Task data
 * @param {Array} localCategories - Optional: local categories for ID resolution
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function createTaskInSupabase(
  userId,
  taskData,
  localCategories = []
) {
  if (!isSupabaseAvailable() || !userId) {
    return {
      data: null,
      error: { message: "Supabase not available or no user ID" },
    };
  }

  try {
    // Resolve categoryId - if it's not a valid UUID, try to find matching category
    let categoryId = await resolveCategoryId(
      userId,
      taskData.categoryId,
      localCategories
    );

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: taskData.title,
        completed: taskData.completed || false,
        created_at: taskData.createdAt || new Date().toISOString(),
        completed_at: taskData.completedAt || null,
        category_id: categoryId,
        due_date: taskData.dueDate || null,
        task_order: taskData.order || 0,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // Transform to app format
    const task = {
      id: data.id,
      title: data.title,
      completed: data.completed,
      createdAt: data.created_at,
      completedAt: data.completed_at,
      categoryId: data.category_id,
      dueDate: data.due_date,
      order: data.task_order,
    };

    return { data: task, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err.message || "Failed to create task" },
    };
  }
}

/**
 * Update a task in Supabase
 * @param {string} taskId - Task ID
 * @param {object} updates - Fields to update
 * @param {string} userId - User ID for category resolution
 * @param {Array} localCategories - Optional: local categories for ID resolution
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateTaskInSupabase(
  taskId,
  updates,
  userId = null,
  localCategories = []
) {
  if (!isSupabaseAvailable()) {
    return { data: null, error: { message: "Supabase not available" } };
  }

  try {
    // Transform updates to Supabase format
    const supabaseUpdates = {};
    if (updates.title !== undefined) supabaseUpdates.title = updates.title;
    if (updates.completed !== undefined)
      supabaseUpdates.completed = updates.completed;
    if (updates.completedAt !== undefined)
      supabaseUpdates.completed_at = updates.completedAt;
    if (updates.categoryId !== undefined) {
      // Resolve categoryId - if it's not a valid UUID, try to find matching category
      if (userId) {
        const resolvedCategoryId = await resolveCategoryId(
          userId,
          updates.categoryId,
          localCategories
        );
        supabaseUpdates.category_id = resolvedCategoryId;
      } else {
        // Fallback to old behavior if userId not provided
        if (updates.categoryId && !isValidUUID(updates.categoryId)) {
          console.warn(
            `Invalid UUID format for categoryId: ${updates.categoryId}. Setting to null.`
          );
          supabaseUpdates.category_id = null;
        } else {
          supabaseUpdates.category_id = updates.categoryId;
        }
      }
    }
    if (updates.dueDate !== undefined)
      supabaseUpdates.due_date = updates.dueDate;
    if (updates.order !== undefined) supabaseUpdates.task_order = updates.order;

    const { data, error } = await supabase
      .from("tasks")
      .update(supabaseUpdates)
      .eq("id", taskId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // Transform to app format
    const task = {
      id: data.id,
      title: data.title,
      completed: data.completed,
      createdAt: data.created_at,
      completedAt: data.completed_at,
      categoryId: data.category_id,
      dueDate: data.due_date,
      order: data.task_order,
    };

    return { data: task, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err.message || "Failed to update task" },
    };
  }
}

/**
 * Delete a task from Supabase
 * @param {string} taskId - Task ID
 * @returns {Promise<{error: object|null}>}
 */
export async function deleteTaskFromSupabase(taskId) {
  if (!isSupabaseAvailable()) {
    return { error: { message: "Supabase not available" } };
  }

  try {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    return { error: { message: err.message || "Failed to delete task" } };
  }
}

/**
 * Clear all completed tasks for a user from Supabase
 * @param {string} userId - User ID from auth
 * @returns {Promise<{data: {count: number}|null, error: object|null}>}
 */
export async function clearCompletedTasksFromSupabase(userId) {
  if (!isSupabaseAvailable() || !userId) {
    return {
      data: null,
      error: { message: "Supabase not available or no user ID" },
    };
  }

  try {
    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", userId)
      .eq("completed", true)
      .select();

    if (error) {
      return { data: null, error };
    }

    return { data: { count: data?.length || 0 }, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err.message || "Failed to clear completed tasks" },
    };
  }
}

/**
 * Fetch all categories for the current user from Supabase
 * @param {string} userId - User ID from auth
 * @returns {Promise<{data: Array, error: object|null}>}
 */
export async function fetchCategories(userId) {
  if (!isSupabaseAvailable() || !userId) {
    return {
      data: [],
      error: { message: "Supabase not available or no user ID" },
    };
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("category_order", { ascending: true });

    if (error) {
      return { data: [], error };
    }

    // Transform to app format
    const categories = data.map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      createdAt: cat.created_at,
      order: cat.category_order,
    }));

    return { data: categories, error: null };
  } catch (err) {
    return {
      data: [],
      error: { message: err.message || "Failed to fetch categories" },
    };
  }
}

/**
 * Create a new category in Supabase
 * @param {string} userId - User ID from auth
 * @param {object} categoryData - Category data
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function createCategoryInSupabase(userId, categoryData) {
  if (!isSupabaseAvailable() || !userId) {
    return {
      data: null,
      error: { message: "Supabase not available or no user ID" },
    };
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: userId,
        name: categoryData.name,
        color: categoryData.color || "gray",
        created_at: categoryData.createdAt || new Date().toISOString(),
        category_order: categoryData.order || 0,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // Transform to app format
    const category = {
      id: data.id,
      name: data.name,
      color: data.color,
      createdAt: data.created_at,
      order: data.category_order,
    };

    return { data: category, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err.message || "Failed to create category" },
    };
  }
}

/**
 * Update a category in Supabase
 * @param {string} categoryId - Category ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateCategoryInSupabase(categoryId, updates) {
  if (!isSupabaseAvailable()) {
    return { data: null, error: { message: "Supabase not available" } };
  }

  try {
    const supabaseUpdates = {};
    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.color !== undefined) supabaseUpdates.color = updates.color;
    if (updates.order !== undefined)
      supabaseUpdates.category_order = updates.order;

    const { data, error } = await supabase
      .from("categories")
      .update(supabaseUpdates)
      .eq("id", categoryId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    const category = {
      id: data.id,
      name: data.name,
      color: data.color,
      createdAt: data.created_at,
      order: data.category_order,
    };

    return { data: category, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err.message || "Failed to update category" },
    };
  }
}

/**
 * Delete a category from Supabase
 * @param {string} categoryId - Category ID
 * @returns {Promise<{error: object|null}>}
 */
export async function deleteCategoryFromSupabase(categoryId) {
  if (!isSupabaseAvailable()) {
    return { error: { message: "Supabase not available" } };
  }

  try {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    return { error: { message: err.message || "Failed to delete category" } };
  }
}

/**
 * Sync local data to Supabase (for data migration on first login)
 * @param {string} userId - User ID from auth
 * @param {Array} localTasks - Tasks from localStorage
 * @param {Array} localCategories - Categories from localStorage
 * @returns {Promise<{success: boolean, error: object|null}>}
 */
export async function syncLocalDataToSupabase(
  userId,
  localTasks = [],
  localCategories = []
) {
  if (!isSupabaseAvailable() || !userId) {
    return {
      success: false,
      error: { message: "Supabase not available or no user ID" },
    };
  }

  try {
    // First, sync categories (tasks reference them)
    const categoryIdMap = {}; // old ID -> new ID mapping

    for (const category of localCategories) {
      const { data, error } = await createCategoryInSupabase(userId, category);
      if (error) {
        console.error("Failed to sync category:", category.name, error);
      } else {
        categoryIdMap[category.id] = data.id;
      }
    }

    // Then sync tasks with updated category IDs
    for (const task of localTasks) {
      const taskData = { ...task };

      // Update category ID if it was remapped
      if (taskData.categoryId && categoryIdMap[taskData.categoryId]) {
        taskData.categoryId = categoryIdMap[taskData.categoryId];
      }

      const { error } = await createTaskInSupabase(userId, taskData);
      if (error) {
        console.error("Failed to sync task:", task.title, error);
      }
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: { message: err.message || "Sync failed" } };
  }
}
