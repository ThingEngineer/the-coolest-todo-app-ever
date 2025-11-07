/**
 * Category Service Tests
 * Test category CRUD operations and validation
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  initializeDemoCategories,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../src/services/categoryService";
import * as storageService from "../../src/services/storageService";
import * as validators from "../../src/utils/validators";
import * as helpers from "../../src/utils/helpers";

// Mock storage service
vi.mock("../../src/services/storageService", () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}));
vi.mock("../../src/utils/validators");
vi.mock("../../src/utils/helpers");

describe("categoryService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default mock implementation returns empty array
    storageService.getItem.mockReturnValue([]);
  });

  describe("initializeDemoCategories", () => {
    it("initializes demo categories on first launch", () => {
      storageService.getItem.mockReturnValueOnce(false); // not initialized
      storageService.setItem.mockReturnValue(true);

      const result = initializeDemoCategories();

      expect(storageService.setItem).toHaveBeenCalledWith(
        "categories-initialized",
        true
      );
      expect(result).toBeDefined();
    });

    it("returns existing categories if already initialized", () => {
      const existingCategories = [{ id: "1", name: "Work", color: "#3B82F6" }];

      // Set up mock to return different values for different keys
      storageService.getItem.mockImplementation((key, defaultValue) => {
        if (key === "categories-initialized") return true;
        if (key === "categories") return existingCategories;
        return defaultValue;
      });

      const result = initializeDemoCategories();

      expect(result).toEqual(existingCategories);
      expect(storageService.setItem).not.toHaveBeenCalled();
    });
  });

  describe("getAllCategories", () => {
    it("returns empty array when no categories exist", () => {
      storageService.getItem.mockReturnValue([]);

      const result = getAllCategories();

      expect(result).toEqual([]);
    });

    it("returns all categories", () => {
      const categories = [
        { id: "1", name: "Work", color: "#3B82F6" },
        { id: "2", name: "Personal", color: "#10B981" },
      ];
      storageService.getItem.mockReturnValue(categories);

      const result = getAllCategories();

      expect(result).toEqual(categories);
    });
  });

  describe("getCategoryById", () => {
    it("returns category when found", () => {
      const categories = [
        { id: "1", name: "Work", color: "#3B82F6" },
        { id: "2", name: "Personal", color: "#10B981" },
      ];
      storageService.getItem.mockReturnValue(categories);

      const result = getCategoryById("1");

      expect(result).toEqual(categories[0]);
    });

    it("returns null when category not found", () => {
      storageService.getItem.mockReturnValue([]);

      const result = getCategoryById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("createCategory", () => {
    beforeEach(() => {
      storageService.getItem.mockReturnValue([]);
      validators.validateCategoryName.mockReturnValue({ valid: true });
      validators.validateColor.mockReturnValue({ valid: true });
      helpers.generateId.mockReturnValue("new-id");
      storageService.setItem.mockReturnValue(true);
    });

    it("creates category with valid data", () => {
      const categoryData = {
        name: "Work",
        color: "#3B82F6",
      };

      const result = createCategory(categoryData);

      expect(result.success).toBe(true);
      expect(result.category).toMatchObject({
        id: "new-id",
        name: "Work",
        color: "#3B82F6",
      });
      expect(result.category.createdAt).toBeDefined();
      expect(result.error).toBeNull();
    });

    it("sanitizes category name", () => {
      const categoryData = {
        name: '<script>alert("xss")</script>Work',
        color: "#3B82F6",
      };

      createCategory(categoryData);

      // Should sanitize name before validation
      expect(validators.validateCategoryName).toHaveBeenCalled();
    });

    it("rejects invalid category name", () => {
      validators.validateCategoryName.mockReturnValue({
        valid: false,
        error: "Name is required",
      });

      const categoryData = {
        name: "",
        color: "#3B82F6",
      };

      const result = createCategory(categoryData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Name is required");
      expect(result.category).toBeNull();
    });

    it("rejects invalid color", () => {
      validators.validateColor.mockReturnValue({
        valid: false,
        error: "Invalid color format",
      });

      const categoryData = {
        name: "Work",
        color: "invalid",
      };

      const result = createCategory(categoryData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid color format");
      expect(result.category).toBeNull();
    });

    it("rejects duplicate category name", () => {
      const existingCategories = [{ id: "1", name: "Work", color: "#3B82F6" }];
      storageService.getItem.mockReturnValue(existingCategories);

      const categoryData = {
        name: "work", // case insensitive
        color: "#10B981",
      };

      const result = createCategory(categoryData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Category name already exists");
      expect(result.category).toBeNull();
    });

    it("returns error when storage fails", () => {
      storageService.setItem.mockReturnValue(false);

      const categoryData = {
        name: "Work",
        color: "#3B82F6",
      };

      const result = createCategory(categoryData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to save category");
      expect(result.category).toBeNull();
    });
  });

  describe("updateCategory", () => {
    const existingCategories = [
      { id: "1", name: "Work", color: "#3B82F6" },
      { id: "2", name: "Personal", color: "#10B981" },
    ];

    beforeEach(() => {
      storageService.getItem.mockReturnValue([...existingCategories]);
      validators.validateCategoryName.mockReturnValue({ valid: true });
      validators.validateColor.mockReturnValue({ valid: true });
      storageService.setItem.mockReturnValue(true);
    });

    it("updates category name", () => {
      const result = updateCategory("1", { name: "Business" });

      expect(result.success).toBe(true);
      expect(result.category.name).toBe("Business");
      expect(result.error).toBeNull();
    });

    it("updates category color", () => {
      const result = updateCategory("1", { color: "#EF4444" });

      expect(result.success).toBe(true);
      expect(result.category.color).toBe("#EF4444");
      expect(result.error).toBeNull();
    });

    it("sanitizes name on update", () => {
      updateCategory("1", { name: "<b>Work</b>" });

      expect(validators.validateCategoryName).toHaveBeenCalled();
    });

    it("rejects invalid name on update", () => {
      validators.validateCategoryName.mockReturnValue({
        valid: false,
        error: "Name is required",
      });

      const result = updateCategory("1", { name: "" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Name is required");
      expect(result.category).toBeNull();
    });

    it("rejects duplicate name on update", () => {
      const result = updateCategory("1", { name: "Personal" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Category name already exists");
      expect(result.category).toBeNull();
    });

    it("allows updating to same name (case change)", () => {
      const result = updateCategory("1", { name: "WORK" });

      // Should succeed since it's the same category
      expect(result.success).toBe(true);
    });

    it("rejects invalid color on update", () => {
      validators.validateColor.mockReturnValue({
        valid: false,
        error: "Invalid color",
      });

      const result = updateCategory("1", { color: "red" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid color");
      expect(result.category).toBeNull();
    });

    it("returns error when category not found", () => {
      const result = updateCategory("nonexistent", { name: "New" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Category not found");
      expect(result.category).toBeNull();
    });

    it("returns error when storage fails", () => {
      storageService.setItem.mockReturnValue(false);

      const result = updateCategory("1", { name: "New" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to update category");
      expect(result.category).toBeNull();
    });
  });

  describe("deleteCategory", () => {
    const existingCategories = [
      { id: "1", name: "Work", color: "#3B82F6" },
      { id: "2", name: "Personal", color: "#10B981" },
    ];

    beforeEach(() => {
      storageService.getItem.mockReturnValue([...existingCategories]);
      storageService.setItem.mockReturnValue(true);
    });

    it("deletes category successfully", () => {
      const result = deleteCategory("1");

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(storageService.setItem).toHaveBeenCalledWith(
        "categories",
        expect.arrayContaining([existingCategories[1]])
      );
    });

    it("returns error when category not found", () => {
      const result = deleteCategory("nonexistent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Category not found");
    });

    it("returns error when storage fails", () => {
      storageService.setItem.mockReturnValue(false);

      const result = deleteCategory("1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to delete category");
    });
  });
});
