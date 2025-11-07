/**
 * Validators Tests
 * Test input validation functions
 */

import { describe, it, expect } from "vitest";
import {
  validateTaskTitle,
  validateCategoryName,
} from "../../src/utils/validators";

describe("validators", () => {
  describe("validateTaskTitle", () => {
    it("accepts valid title", () => {
      const result = validateTaskTitle("Buy milk");

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("rejects empty title", () => {
      const result = validateTaskTitle("");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("required");
    });
    it("rejects whitespace-only title", () => {
      const result = validateTaskTitle("   ");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("rejects null title", () => {
      const result = validateTaskTitle(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("rejects undefined title", () => {
      const result = validateTaskTitle(undefined);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("rejects title longer than 500 characters", () => {
      const longTitle = "a".repeat(501);
      const result = validateTaskTitle(longTitle);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("500");
    });

    it("accepts title with exactly 500 characters", () => {
      const title = "a".repeat(500);
      const result = validateTaskTitle(title);

      expect(result.valid).toBe(true);
    });

    it("accepts title with 1 character", () => {
      const result = validateTaskTitle("a");

      expect(result.valid).toBe(true);
    });

    it("accepts title with special characters", () => {
      const result = validateTaskTitle("Buy milk @ 3pm! 🥛");

      expect(result.valid).toBe(true);
    });

    it("trims whitespace before validation", () => {
      const result = validateTaskTitle("  Buy milk  ");

      expect(result.valid).toBe(true);
    });
  });

  describe("validateCategoryName", () => {
    it("accepts valid category name", () => {
      const result = validateCategoryName("Work");

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("rejects empty category name", () => {
      const result = validateCategoryName("");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("rejects whitespace-only category name", () => {
      const result = validateCategoryName("   ");

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("rejects category name longer than 50 characters", () => {
      const longName = "a".repeat(51);
      const result = validateCategoryName(longName);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("50");
    });

    it("accepts category name with exactly 50 characters", () => {
      const name = "a".repeat(50);
      const result = validateCategoryName(name);

      expect(result.valid).toBe(true);
    });

    it("accepts category name with emojis", () => {
      const result = validateCategoryName("💼 Work");

      expect(result.valid).toBe(true);
    });
  });
});
