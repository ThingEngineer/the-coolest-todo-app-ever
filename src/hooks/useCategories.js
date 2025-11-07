/**
 * useCategories Hook
 * Custom hook for managing category state and CRUD operations
 * Now supports hybrid storage: Supabase (when authenticated) + localStorage (offline fallback)
 */

import { useState, useEffect } from "preact/hooks";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  initializeDemoCategories,
} from "../services/categoryService";
import {
  fetchCategories,
  createCategoryInSupabase,
  updateCategoryInSupabase,
  deleteCategoryFromSupabase,
} from "../services/supabaseStorageService";
import { useAuth } from "./useAuth";
import { setItem, getItem } from "../services/storageService";

/**
 * Custom hook for category management with hybrid storage
 * @returns {Object} Category state and operations
 */
export function useCategories() {
  const { user, isAuthenticated, isOnline } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Load categories on mount and when user changes
  useEffect(() => {
    loadCategories();
  }, [user?.id]);

  // Auto-sync categories when user first authenticates
  useEffect(() => {
    if (isAuthenticated && user?.id && !syncing) {
      syncCategoriesToSupabase();
    }
  }, [isAuthenticated, user?.id]);

  /**
   * Load categories from appropriate storage (Supabase if authenticated, localStorage otherwise)
   */
  const loadCategories = async () => {
    try {
      setLoading(true);

      if (isAuthenticated && isOnline && user?.id) {
        // Load from Supabase
        const { data, error: fetchError } = await fetchCategories(user.id);

        if (fetchError) {
          console.error("Failed to load categories from Supabase:", fetchError);
          // Fall back to localStorage
          const localCategories = getAllCategories();
          setCategories(localCategories);
        } else {
          // Cache in localStorage
          setItem("categories", data);
          setCategories(data);
        }
      } else {
        // Use localStorage
        const localCategories = getAllCategories();
        setCategories(localCategories);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load categories");
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sync local categories to Supabase
   * This ensures demo categories and any user-created categories are available in Supabase
   */
  const syncCategoriesToSupabase = async () => {
    if (!isAuthenticated || !user?.id || syncing || !isOnline) return;

    try {
      setSyncing(true);

      // Get categories from localStorage
      let localCategories = getItem("categories", []);

      // If localStorage is empty, initialize with demo categories
      if (localCategories.length === 0) {
        console.log(
          "No local categories found, initializing demo categories..."
        );
        localCategories = initializeDemoCategories();
      }

      // Get categories from Supabase
      const { data: supabaseCategories, error: fetchError } =
        await fetchCategories(user.id);

      if (fetchError) {
        console.error(
          "Failed to fetch Supabase categories for sync:",
          fetchError
        );
        return;
      }

      // Find categories that exist in localStorage but not in Supabase
      const categoriesToSync = localCategories.filter((localCat) => {
        // Check if this category name already exists in Supabase
        return !supabaseCategories.some(
          (supaCat) => supaCat.name === localCat.name
        );
      });

      if (categoriesToSync.length > 0) {
        console.log(
          `Syncing ${categoriesToSync.length} categories to Supabase:`,
          categoriesToSync.map((c) => c.name)
        );

        // Create each missing category in Supabase
        for (const category of categoriesToSync) {
          const { error: createError } = await createCategoryInSupabase(
            user.id,
            {
              name: category.name,
              color: category.color,
              createdAt: category.createdAt,
              order: category.order || 0,
            }
          );

          if (createError) {
            console.error(
              `Failed to sync category "${category.name}":`,
              createError
            );
          } else {
            console.log(`✓ Synced category "${category.name}" to Supabase`);
          }
        }

        // Reload categories from Supabase to get the new UUIDs
        await loadCategories();
        console.log("Category sync complete!");
      } else {
        console.log("All local categories already in Supabase, no sync needed");
      }
    } catch (err) {
      console.error("Category sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Initialize demo categories
   */
  const initDemo = () => {
    try {
      const demoCategories = initializeDemoCategories();
      setCategories(demoCategories);
      setError(null);
    } catch (err) {
      setError("Failed to initialize demo categories");
      console.error("Error initializing demo:", err);
    }
  };

  /**
   * Add a new category (hybrid: try Supabase first, fall back to localStorage)
   * @param {Object} categoryData - Category data
   * @returns {Object} Result
   */
  const addCategory = async (categoryData) => {
    if (isAuthenticated && isOnline && user?.id) {
      // Try Supabase first
      const { data, error: createError } = await createCategoryInSupabase(
        user.id,
        categoryData
      );

      if (createError) {
        console.error("Failed to create category in Supabase:", createError);
        // Fall back to localStorage
        const result = createCategory(categoryData);
        if (result.success) {
          loadCategories();
        }
        return result;
      }

      // Success - reload from Supabase
      await loadCategories();
      return { success: true, category: data, error: null };
    } else {
      // Use localStorage
      const result = createCategory(categoryData);
      if (result.success) {
        loadCategories();
      } else {
        setError(result.error);
      }
      return result;
    }
  };

  /**
   * Update a category (hybrid storage)
   * @param {string} id - Category ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Result
   */
  const updateCategoryById = async (id, updates) => {
    if (isAuthenticated && isOnline && user?.id) {
      // Try Supabase first
      const { data, error: updateError } = await updateCategoryInSupabase(
        id,
        updates
      );

      if (updateError) {
        console.error("Failed to update category in Supabase:", updateError);
        // Fall back to localStorage
        const result = updateCategory(id, updates);
        if (result.success) {
          loadCategories();
        }
        return result;
      }

      // Success - reload
      await loadCategories();
      return { success: true, category: data, error: null };
    } else {
      // Use localStorage
      const result = updateCategory(id, updates);
      if (result.success) {
        loadCategories();
      } else {
        setError(result.error);
      }
      return result;
    }
  };

  /**
   * Delete a category (hybrid storage)
   * @param {string} id - Category ID
   * @returns {Object} Result
   */
  const removeCategory = async (id) => {
    if (isAuthenticated && isOnline && user?.id) {
      // Try Supabase first
      const { error: deleteError } = await deleteCategoryFromSupabase(id);

      if (deleteError) {
        console.error("Failed to delete category from Supabase:", deleteError);
        // Fall back to localStorage
        const result = deleteCategory(id);
        if (result.success) {
          loadCategories();
        }
        return result;
      }

      // Success - reload
      await loadCategories();
      return { success: true, error: null };
    } else {
      // Use localStorage
      const result = deleteCategory(id);
      if (result.success) {
        loadCategories();
      } else {
        setError(result.error);
      }
      return result;
    }
  };

  return {
    // State
    categories,
    loading,
    error,
    syncing,

    // Operations
    addCategory,
    updateCategory: updateCategoryById,
    removeCategory,
    loadCategories,
    syncCategoriesToSupabase,
    initDemo,
    setError,
  };
}
