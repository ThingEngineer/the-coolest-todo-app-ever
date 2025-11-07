/**
 * Task Service Tests
 * Test CRUD operations and validation for tasks
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  initializeDemoData,
} from "../../src/services/taskService";
import * as storageService from "../../src/services/storageService";

// Mock storage service
vi.mock("../../src/services/storageService", () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}));

describe("taskService", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Default mock implementation returns empty array
    storageService.getItem.mockReturnValue([]);
    storageService.setItem.mockReturnValue(true);
  });

  describe("createTask", () => {
    it("creates task with valid title", () => {
      const result = createTask({ title: "Buy milk" });

      expect(result.success).toBe(true);
      expect(result.task).toBeDefined();
      expect(result.task.title).toBe("Buy milk");
      expect(result.task.completed).toBe(false);
      expect(result.task.id).toBeDefined();
      expect(result.task.order).toBe(0);
    });

    it("rejects empty title", () => {
      const result = createTask({ title: "" });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.task).toBeNull();
    });

    it("rejects whitespace-only title", () => {
      const result = createTask({ title: "   " });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("rejects title longer than 500 characters", () => {
      const longTitle = "a".repeat(501);
      const result = createTask({ title: longTitle });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("sanitizes HTML in title", () => {
      const result = createTask({
        title: '<script>alert("xss")</script>Buy milk',
      });

      expect(result.success).toBe(true);
      expect(result.task.title).toBe("Buy milk");
      expect(result.task.title).not.toContain("<script>");
    });

    it("creates task with category", () => {
      const result = createTask({
        title: "Buy groceries",
        categoryId: "cat-123",
      });

      expect(result.success).toBe(true);
      expect(result.task.categoryId).toBe("cat-123");
    });

    it("creates task with due date", () => {
      const dueDate = new Date("2025-12-31").toISOString();
      const result = createTask({
        title: "Year-end task",
        dueDate,
      });

      expect(result.success).toBe(true);
      expect(result.task.dueDate).toBe(dueDate);
    });

    it("increments order for new tasks", () => {
      // Mock existing tasks
      storageService.getItem.mockReturnValue([
        { id: "1", title: "Task 1", order: 0, completed: false },
        { id: "2", title: "Task 2", order: 1, completed: false },
      ]);

      const result = createTask({ title: "Task 3" });

      expect(result.success).toBe(true);
      expect(result.task.order).toBe(2);
    });

    it("saves task to storage", () => {
      createTask({ title: "Buy milk" });

      expect(storageService.setItem).toHaveBeenCalled();
      const savedTasks = storageService.setItem.mock.calls[0][1];
      expect(savedTasks).toHaveLength(1);
      expect(savedTasks[0].title).toBe("Buy milk");
    });
  });

  describe("getAllTasks", () => {
    it("returns empty array when no tasks exist", () => {
      const tasks = getAllTasks();

      expect(tasks).toEqual([]);
    });

    it("returns all tasks", () => {
      const mockTasks = [
        { id: "1", title: "Task 1", order: 0, completed: false },
        { id: "2", title: "Task 2", order: 1, completed: false },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const tasks = getAllTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe("Task 1");
    });

    it("filters tasks by category", () => {
      const mockTasks = [
        { id: "1", title: "Work task", categoryId: "work", order: 0 },
        { id: "2", title: "Personal task", categoryId: "personal", order: 1 },
        { id: "3", title: "Another work task", categoryId: "work", order: 2 },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const tasks = getAllTasks({ categoryId: "work" });

      expect(tasks).toHaveLength(2);
      expect(tasks.every((t) => t.categoryId === "work")).toBe(true);
    });

    it("sorts tasks by title", () => {
      const mockTasks = [
        { id: "1", title: "Zebra", order: 0 },
        { id: "2", title: "Apple", order: 1 },
        { id: "3", title: "Mango", order: 2 },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const tasks = getAllTasks({ sortBy: "title" });

      expect(tasks[0].title).toBe("Apple");
      expect(tasks[1].title).toBe("Mango");
      expect(tasks[2].title).toBe("Zebra");
    });

    it("sorts tasks by due date", () => {
      const mockTasks = [
        { id: "1", title: "Task 1", dueDate: "2025-12-31", order: 0 },
        { id: "2", title: "Task 2", dueDate: "2025-01-15", order: 1 },
        { id: "3", title: "Task 3", dueDate: null, order: 2 },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const tasks = getAllTasks({ sortBy: "dueDate" });

      expect(tasks[0].dueDate).toBe("2025-01-15");
      expect(tasks[1].dueDate).toBe("2025-12-31");
      expect(tasks[2].dueDate).toBeNull(); // Null dates go to end
    });

    it("sorts tasks in descending order", () => {
      const mockTasks = [
        { id: "1", title: "A", order: 0 },
        { id: "2", title: "B", order: 1 },
        { id: "3", title: "C", order: 2 },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const tasks = getAllTasks({ sortBy: "title", sortDirection: "desc" });

      expect(tasks[0].title).toBe("C");
      expect(tasks[2].title).toBe("A");
    });
  });

  describe("getTaskById", () => {
    it("returns task when found", () => {
      const mockTasks = [{ id: "task-123", title: "Test task", order: 0 }];
      storageService.getItem.mockReturnValue(mockTasks);

      const task = getTaskById("task-123");

      expect(task).toBeDefined();
      expect(task.title).toBe("Test task");
    });

    it("returns null when task not found", () => {
      storageService.getItem.mockReturnValue([]);

      const task = getTaskById("non-existent");

      expect(task).toBeNull();
    });
  });

  describe("updateTask", () => {
    it("updates task title", () => {
      const mockTasks = [
        { id: "task-1", title: "Old title", order: 0, completed: false },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const result = updateTask("task-1", { title: "New title" });

      expect(result.success).toBe(true);
      expect(result.task.title).toBe("New title");
    });

    it("sanitizes updated title", () => {
      const mockTasks = [
        { id: "task-1", title: "Old title", order: 0, completed: false },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const result = updateTask("task-1", {
        title: '<script>alert("xss")</script>New title',
      });

      expect(result.success).toBe(true);
      expect(result.task.title).toBe("New title");
      expect(result.task.title).not.toContain("<script>");
    });

    it("rejects invalid title update", () => {
      const mockTasks = [
        { id: "task-1", title: "Old title", order: 0, completed: false },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const result = updateTask("task-1", { title: "" });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("updates category", () => {
      const mockTasks = [
        { id: "task-1", title: "Task", categoryId: null, order: 0 },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const result = updateTask("task-1", { categoryId: "cat-123" });

      expect(result.success).toBe(true);
      expect(result.task.categoryId).toBe("cat-123");
    });

    it("updates due date", () => {
      const mockTasks = [
        { id: "task-1", title: "Task", dueDate: null, order: 0 },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const newDueDate = "2025-12-31T00:00:00.000Z";
      const result = updateTask("task-1", { dueDate: newDueDate });

      expect(result.success).toBe(true);
      expect(result.task.dueDate).toBe(newDueDate);
    });

    it("returns error when task not found", () => {
      storageService.getItem.mockReturnValue([]);

      const result = updateTask("non-existent", { title: "New title" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });
  });

  describe("deleteTask", () => {
    it("deletes task successfully", () => {
      const mockTasks = [
        { id: "task-1", title: "Task 1", order: 0 },
        { id: "task-2", title: "Task 2", order: 1 },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const result = deleteTask("task-1");

      expect(result.success).toBe(true);
      expect(storageService.setItem).toHaveBeenCalled();

      const savedTasks = storageService.setItem.mock.calls[0][1];
      expect(savedTasks).toHaveLength(1);
      expect(savedTasks[0].id).toBe("task-2");
    });

    it("returns error when task not found", () => {
      storageService.getItem.mockReturnValue([]);

      const result = deleteTask("non-existent");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });
  });

  describe("toggleTaskCompletion", () => {
    it("marks incomplete task as complete", () => {
      const mockTasks = [
        { id: "task-1", title: "Task 1", completed: false, completedAt: null },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const result = toggleTaskCompletion("task-1");

      expect(result.success).toBe(true);
      expect(result.task.completed).toBe(true);
      expect(result.task.completedAt).toBeDefined();
    });

    it("marks complete task as incomplete", () => {
      const mockTasks = [
        {
          id: "task-1",
          title: "Task 1",
          completed: true,
          completedAt: new Date().toISOString(),
        },
      ];
      storageService.getItem.mockReturnValue(mockTasks);

      const result = toggleTaskCompletion("task-1");

      expect(result.success).toBe(true);
      expect(result.task.completed).toBe(false);
      expect(result.task.completedAt).toBeNull();
    });

    it("returns error when task not found", () => {
      storageService.getItem.mockReturnValue([]);

      const result = toggleTaskCompletion("non-existent");

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });
  });

  describe("initializeDemoData", () => {
    it("initializes demo data on first launch", () => {
      storageService.getItem.mockImplementation((key) => {
        if (key === "initialized") return false;
        return [];
      });

      const tasks = initializeDemoData();

      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
      expect(storageService.setItem).toHaveBeenCalled();
    });

    it("returns existing tasks when already initialized", () => {
      const mockTasks = [{ id: "1", title: "Existing task", order: 0 }];
      storageService.getItem.mockImplementation((key) => {
        if (key === "initialized") return true;
        if (key === "tasks") return mockTasks;
        return null;
      });

      const tasks = initializeDemoData();

      expect(tasks).toEqual(mockTasks);
    });
  });
});
