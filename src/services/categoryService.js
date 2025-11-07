/**
 * Category Service
 * Business logic for category operations (CRUD)
 */

import { getItem, setItem } from "./storageService";
import { validateCategoryName, validateColor } from "../utils/validators";
import { generateId } from "../utils/helpers";
import { getDemoCategories } from "./demoData";

const CATEGORIES_KEY = "categories";
const CATEGORIES_INITIALIZED_KEY = "categories-initialized";

/**
 * Category Entity Structure
 * @typedef {Object} Category
 * @property {string} id - Unique identifier
 * @property {string} name - Category name (1-50 chars)
 * @property {string} color - Hex color code (#RRGGBB)
 * @property {string} createdAt - ISO timestamp
 */

/**
 * Initialize demo categories on first launch
 */
export function initializeDemoCategories() {
  const initialized = getItem(CATEGORIES_INITIALIZED_KEY, false);

  if (!initialized) {
    const demoCategories = getDemoCategories();
    setItem(CATEGORIES_KEY, demoCategories);
    setItem(CATEGORIES_INITIALIZED_KEY, true);
    return demoCategories;
  }

  return getAllCategories();
}

/**
 * Get all categories
 * @returns {Array<Category>} Array of categories
 */
export function getAllCategories() {
  return getItem(CATEGORIES_KEY, []);
}

/**
 * Get category by ID
 * @param {string} id - Category ID
 * @returns {Category|null} Category object or null
 */
export function getCategoryById(id) {
  const categories = getAllCategories();
  return categories.find((category) => category.id === id) || null;
}

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.name - Category name (required)
 * @param {string} categoryData.color - Hex color code (required)
 * @returns {Object} { success: boolean, category: Category, error: string }
 */
export function createCategory(categoryData) {
  // Validate name
  const nameValidation = validateCategoryName(categoryData.name);
  if (!nameValidation.valid) {
    return { success: false, category: null, error: nameValidation.error };
  }

  // Validate color
  const colorValidation = validateColor(categoryData.color);
  if (!colorValidation.valid) {
    return { success: false, category: null, error: colorValidation.error };
  }

  const categories = getAllCategories();

  // Check for duplicate name
  const duplicate = categories.find(
    (cat) => cat.name.toLowerCase() === categoryData.name.trim().toLowerCase()
  );
  if (duplicate) {
    return {
      success: false,
      category: null,
      error: "Category name already exists",
    };
  }

  const newCategory = {
    id: generateId(),
    name: categoryData.name.trim(),
    color: categoryData.color,
    createdAt: new Date().toISOString(),
  };

  categories.push(newCategory);
  const saved = setItem(CATEGORIES_KEY, categories);

  if (!saved) {
    return { success: false, category: null, error: "Failed to save category" };
  }

  return { success: true, category: newCategory, error: null };
}

/**
 * Update an existing category
 * @param {string} id - Category ID
 * @param {Object} updates - Fields to update
 * @returns {Object} { success: boolean, category: Category, error: string }
 */
export function updateCategory(id, updates) {
  const categories = getAllCategories();
  const index = categories.findIndex((category) => category.id === id);

  if (index === -1) {
    return { success: false, category: null, error: "Category not found" };
  }

  // Validate name if being updated
  if (updates.name !== undefined) {
    const validation = validateCategoryName(updates.name);
    if (!validation.valid) {
      return { success: false, category: null, error: validation.error };
    }

    // Check for duplicate name (excluding current category)
    const duplicate = categories.find(
      (cat) =>
        cat.id !== id &&
        cat.name.toLowerCase() === updates.name.trim().toLowerCase()
    );
    if (duplicate) {
      return {
        success: false,
        category: null,
        error: "Category name already exists",
      };
    }

    updates.name = updates.name.trim();
  }

  // Validate color if being updated
  if (updates.color !== undefined) {
    const validation = validateColor(updates.color);
    if (!validation.valid) {
      return { success: false, category: null, error: validation.error };
    }
  }

  categories[index] = { ...categories[index], ...updates };
  const saved = setItem(CATEGORIES_KEY, categories);

  if (!saved) {
    return {
      success: false,
      category: null,
      error: "Failed to update category",
    };
  }

  return { success: true, category: categories[index], error: null };
}

/**
 * Delete a category
 * Sets all tasks with this categoryId to null
 * @param {string} id - Category ID
 * @returns {Object} { success: boolean, error: string }
 */
export function deleteCategory(id) {
  const categories = getAllCategories();
  const filtered = categories.filter((category) => category.id !== id);

  if (filtered.length === categories.length) {
    return { success: false, error: "Category not found" };
  }

  const saved = setItem(CATEGORIES_KEY, filtered);

  if (!saved) {
    return { success: false, error: "Failed to delete category" };
  }

  // Note: Tasks with this categoryId should be updated by the calling code
  return { success: true, error: null };
}
