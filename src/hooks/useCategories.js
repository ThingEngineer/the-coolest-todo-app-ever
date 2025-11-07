/**
 * useCategories Hook
 * Custom hook for managing category state and CRUD operations
 */

import { useState, useEffect } from "preact/hooks";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  initializeDemoCategories,
} from "../services/categoryService";

/**
 * Custom hook for category management
 * @returns {Object} Category state and operations
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * Load categories from storage
   */
  const loadCategories = () => {
    try {
      setLoading(true);
      const loadedCategories = getAllCategories();
      setCategories(loadedCategories);
      setError(null);
    } catch (err) {
      setError("Failed to load categories");
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
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
   * Add a new category
   * @param {Object} categoryData - Category data
   * @returns {Object} Result
   */
  const addCategory = (categoryData) => {
    const result = createCategory(categoryData);

    if (result.success) {
      loadCategories();
    } else {
      setError(result.error);
    }

    return result;
  };

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Result
   */
  const updateCategoryById = (id, updates) => {
    const result = updateCategory(id, updates);

    if (result.success) {
      loadCategories();
    } else {
      setError(result.error);
    }

    return result;
  };

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Object} Result
   */
  const removeCategory = (id) => {
    const result = deleteCategory(id);

    if (result.success) {
      loadCategories();
    } else {
      setError(result.error);
    }

    return result;
  };

  return {
    // State
    categories,
    loading,
    error,

    // Operations
    addCategory,
    updateCategory: updateCategoryById,
    removeCategory,
    loadCategories,
    initDemo,
    setError,
  };
}
