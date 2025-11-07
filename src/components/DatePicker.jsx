/**
 * DatePicker Component
 * Natural language date input with fallback to date picker
 */

import { useState } from "preact/hooks";
import { parseNaturalLanguageDate, formatDate } from "../services/dateParser";

export default function DatePicker({
  value,
  onChange,
  placeholder = "e.g., tomorrow, next week, in 3 days",
}) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  /**
   * Common date suggestions
   */
  const suggestions = [
    { label: "Today", value: "today" },
    { label: "Tomorrow", value: "tomorrow" },
    { label: "This Week", value: "this week" },
    { label: "Next Week", value: "next week" },
    { label: "In 3 Days", value: "in 3 days" },
    { label: "In 1 Week", value: "in 1 week" },
  ];

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setShowSuggestions(val.length > 0);
  };

  /**
   * Handle input blur
   */
  const handleBlur = () => {
    if (inputValue) {
      const parsed = parseNaturalLanguageDate(inputValue);
      if (parsed) {
        onChange(parsed.toISOString());
        setInputValue("");
      }
    }
    setTimeout(() => setShowSuggestions(false), 200);
  };

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = (suggestionValue) => {
    const parsed = parseNaturalLanguageDate(suggestionValue);
    if (parsed) {
      onChange(parsed.toISOString());
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  /**
   * Handle Enter key
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const parsed = parseNaturalLanguageDate(inputValue);
      if (parsed) {
        onChange(parsed.toISOString());
        setInputValue("");
        setShowSuggestions(false);
      }
    }
  };

  /**
   * Clear date
   */
  const handleClear = () => {
    onChange(null);
    setInputValue("");
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="
            flex-1 px-3 py-1 text-sm rounded-md
            bg-white dark:bg-dark-surface
            border border-light-border dark:border-dark-border
            text-light-text dark:text-dark-text
            focus:outline-none focus:ring-2 focus:ring-primary
            placeholder:text-gray-400 dark:placeholder:text-gray-500
          "
          aria-label="Due date"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="
              text-xs text-gray-500 hover:text-danger
              transition-colors
            "
            aria-label="Clear due date"
          >
            Clear
          </button>
        )}
      </div>

      {/* Current value display */}
      {value && !inputValue && (
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          Due: {formatDate(value, { relative: true })}
        </p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          className="
          absolute z-10 mt-1 w-full
          bg-white dark:bg-dark-surface
          border border-light-border dark:border-dark-border
          rounded-md shadow-lg
          max-h-48 overflow-auto
        "
        >
          {suggestions
            .filter(
              (s) =>
                !inputValue ||
                s.label.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map((suggestion) => (
              <button
                key={suggestion.value}
                type="button"
                onClick={() => handleSuggestionClick(suggestion.value)}
                className="
                  w-full text-left px-3 py-2 text-sm
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors
                  text-light-text dark:text-dark-text
                "
              >
                {suggestion.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
