/**
 * Storage Service Tests
 * Test localStorage abstraction layer
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  getItem,
  setItem,
  removeItem,
  clearAll,
  isAvailable,
  getStorageSize,
} from "../../src/services/storageService";

describe("storageService", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("getItem", () => {
    it("returns default value when key does not exist", () => {
      const result = getItem("nonexistent", "default");

      expect(result).toBe("default");
    });

    it("returns stored value when key exists", () => {
      localStorage.setItem("coolest-todo-test", JSON.stringify("value"));

      const result = getItem("test");

      expect(result).toBe("value");
    });

    it("returns null as default when no defaultValue provided", () => {
      const result = getItem("nonexistent");

      expect(result).toBeNull();
    });

    it("parses JSON correctly", () => {
      const data = { foo: "bar", count: 42 };
      localStorage.setItem("coolest-todo-test", JSON.stringify(data));

      const result = getItem("test");

      expect(result).toEqual(data);
    });

    it("handles arrays", () => {
      const data = [1, 2, 3, 4, 5];
      localStorage.setItem("coolest-todo-test", JSON.stringify(data));

      const result = getItem("test");

      expect(result).toEqual(data);
    });

    it("returns default value on parse error", () => {
      localStorage.setItem("coolest-todo-test", "invalid json{");

      const result = getItem("test", "fallback");

      expect(result).toBe("fallback");
    });
  });

  describe("setItem", () => {
    it("stores value successfully", () => {
      const success = setItem("test", "value");

      expect(success).toBe(true);
      expect(localStorage.getItem("coolest-todo-test")).toBe(
        JSON.stringify("value")
      );
    });

    it("stringifies objects", () => {
      const data = { name: "John", age: 30 };
      const success = setItem("test", data);

      expect(success).toBe(true);
      expect(JSON.parse(localStorage.getItem("coolest-todo-test"))).toEqual(
        data
      );
    });

    it("stringifies arrays", () => {
      const data = ["a", "b", "c"];
      const success = setItem("test", data);

      expect(success).toBe(true);
      expect(JSON.parse(localStorage.getItem("coolest-todo-test"))).toEqual(
        data
      );
    });

    it("handles null values", () => {
      const success = setItem("test", null);

      expect(success).toBe(true);
      expect(localStorage.getItem("coolest-todo-test")).toBe("null");
    });

    it("handles boolean values", () => {
      setItem("test1", true);
      setItem("test2", false);

      expect(getItem("test1")).toBe(true);
      expect(getItem("test2")).toBe(false);
    });

    it("handles number values", () => {
      setItem("test", 42);

      expect(getItem("test")).toBe(42);
    });
  });

  describe("removeItem", () => {
    it("removes item successfully", () => {
      localStorage.setItem("coolest-todo-test", "value");

      const success = removeItem("test");

      expect(success).toBe(true);
      expect(localStorage.getItem("coolest-todo-test")).toBeNull();
    });

    it("returns true even if key does not exist", () => {
      const success = removeItem("nonexistent");

      expect(success).toBe(true);
    });
  });

  describe("clearAll", () => {
    it("clears all app data", () => {
      localStorage.setItem("coolest-todo-test1", "value1");
      localStorage.setItem("coolest-todo-test2", "value2");
      localStorage.setItem("other-app-data", "keep");

      const success = clearAll();

      expect(success).toBe(true);
      expect(localStorage.getItem("coolest-todo-test1")).toBeNull();
      expect(localStorage.getItem("coolest-todo-test2")).toBeNull();
      expect(localStorage.getItem("other-app-data")).toBe("keep");
    });

    it("returns true when storage is empty", () => {
      const success = clearAll();

      expect(success).toBe(true);
    });
  });

  describe("isAvailable", () => {
    it("returns true when localStorage is available", () => {
      const result = isAvailable();

      expect(result).toBe(true);
    });
  });

  describe("getStorageSize", () => {
    it("returns 0 for empty storage", () => {
      const size = getStorageSize();

      expect(size).toBe(0);
    });

    it("returns positive number when data exists", () => {
      localStorage.setItem("coolest-todo-test", JSON.stringify("value"));

      const size = getStorageSize();

      expect(size).toBeGreaterThan(0);
    });

    it("increases with more data", () => {
      localStorage.setItem("coolest-todo-test1", JSON.stringify("small"));
      const size1 = getStorageSize();

      localStorage.setItem(
        "coolest-todo-test2",
        JSON.stringify("a much longer string with more data")
      );
      const size2 = getStorageSize();

      expect(size2).toBeGreaterThan(size1);
    });
  });

  describe("storage prefix", () => {
    it("adds prefix to all keys", () => {
      setItem("mykey", "value");

      expect(localStorage.getItem("coolest-todo-mykey")).toBeDefined();
      expect(localStorage.getItem("mykey")).toBeNull();
    });

    it("only clears prefixed keys", () => {
      localStorage.setItem("coolest-todo-app", "app-data");
      localStorage.setItem("other-prefix-data", "other-data");

      clearAll();

      expect(localStorage.getItem("coolest-todo-app")).toBeNull();
      expect(localStorage.getItem("other-prefix-data")).toBe("other-data");
    });
  });
});
