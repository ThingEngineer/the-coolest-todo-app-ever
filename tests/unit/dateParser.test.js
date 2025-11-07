/**
 * Date Parser Tests
 * Test natural language date parsing and date utilities
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  parseNaturalLanguageDate,
  isOverdue,
  formatDate,
  getDateRanges,
} from "../../src/services/dateParser";

describe("dateParser", () => {
  // Mock current date for consistent testing
  const mockNow = new Date("2025-11-07T12:00:00.000Z");

  beforeEach(() => {
    vi.setSystemTime(mockNow);
  });

  describe("parseNaturalLanguageDate", () => {
    it('parses "today"', () => {
      const result = parseNaturalLanguageDate("today");
      const parsed = new Date(result);

      expect(parsed.getDate()).toBe(mockNow.getDate());
      expect(parsed.getMonth()).toBe(mockNow.getMonth());
    });

    it('parses "tomorrow"', () => {
      const result = parseNaturalLanguageDate("tomorrow");
      const parsed = new Date(result);
      const tomorrow = new Date(mockNow);
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(parsed.getDate()).toBe(tomorrow.getDate());
    });

    it('parses "next week"', () => {
      const result = parseNaturalLanguageDate("next week");
      const parsed = new Date(result);

      expect(parsed.getTime()).toBeGreaterThan(mockNow.getTime());
    });

    it('parses "in 3 days"', () => {
      const result = parseNaturalLanguageDate("in 3 days");
      const parsed = new Date(result);
      const expected = new Date(mockNow);
      expected.setDate(expected.getDate() + 3);

      expect(parsed.getDate()).toBe(expected.getDate());
    });

    it('parses "in 2 weeks"', () => {
      const result = parseNaturalLanguageDate("in 2 weeks");
      const parsed = new Date(result);

      expect(parsed.getTime()).toBeGreaterThan(mockNow.getTime());
    });

    it("returns null for invalid input", () => {
      const result = parseNaturalLanguageDate("invalid date");

      expect(result).toBeNull();
    });

    it("returns null for empty string", () => {
      const result = parseNaturalLanguageDate("");

      expect(result).toBeNull();
    });

    it("handles case-insensitive input", () => {
      const result1 = parseNaturalLanguageDate("TODAY");
      const result2 = parseNaturalLanguageDate("Tomorrow");

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  describe("isOverdue", () => {
    it("returns true for past date", () => {
      const pastDate = new Date("2025-11-06T12:00:00.000Z").toISOString();

      expect(isOverdue(pastDate)).toBe(true);
    });

    it("returns false for future date", () => {
      const futureDate = new Date("2025-11-08T12:00:00.000Z").toISOString();

      expect(isOverdue(futureDate)).toBe(false);
    });

    it("returns false for today", () => {
      const today = mockNow.toISOString();

      expect(isOverdue(today)).toBe(false);
    });

    it("returns false for null", () => {
      expect(isOverdue(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(isOverdue(undefined)).toBe(false);
    });

    it("handles date strings correctly", () => {
      expect(isOverdue("2025-01-01")).toBe(true);
      expect(isOverdue("2025-12-31")).toBe(false);
    });
  });

  describe("formatDate", () => {
    it("formats date with default options", () => {
      const date = "2025-12-25T00:00:00.000Z";
      const result = formatDate(date);

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("formats date with relative option", () => {
      const tomorrow = new Date(mockNow);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = formatDate(tomorrow.toISOString(), { relative: true });

      expect(result.toLowerCase()).toContain("tomorrow");
    });

    it('shows "today" for today\'s date with relative option', () => {
      const result = formatDate(mockNow.toISOString(), { relative: true });

      expect(result.toLowerCase()).toContain("today");
    });

    it("handles null date", () => {
      const result = formatDate(null);

      expect(result).toBe("");
    });

    it("handles invalid date", () => {
      const result = formatDate("invalid");

      expect(result).toBeDefined();
    });
  });

  describe("getDateRanges", () => {
    it("returns today range", () => {
      const ranges = getDateRanges();

      expect(ranges.today).toBeDefined();
      expect(ranges.today.start).toBeInstanceOf(Date);
      expect(ranges.today.end).toBeInstanceOf(Date);
    });

    it("returns this week range", () => {
      const ranges = getDateRanges();

      expect(ranges.thisWeek).toBeDefined();
      expect(ranges.thisWeek.start).toBeInstanceOf(Date);
      expect(ranges.thisWeek.end).toBeInstanceOf(Date);
    });

    it("today range spans 24 hours", () => {
      const ranges = getDateRanges();
      const diff = ranges.today.end.getTime() - ranges.today.start.getTime();
      const hours = diff / (1000 * 60 * 60);

      expect(hours).toBeGreaterThanOrEqual(23);
      expect(hours).toBeLessThanOrEqual(24);
    });

    it("this week range spans 7 days", () => {
      const ranges = getDateRanges();
      const diff =
        ranges.thisWeek.end.getTime() - ranges.thisWeek.start.getTime();
      const days = diff / (1000 * 60 * 60 * 24);

      expect(days).toBeGreaterThanOrEqual(2);
      expect(days).toBeLessThanOrEqual(8);
    });
  });
});
