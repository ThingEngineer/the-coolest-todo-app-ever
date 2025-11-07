/**
 * TaskInput Component
 * Input field for creating new tasks with Enter key handler, category selection, and due date
 */

import { useState } from "preact/hooks";
import { getCategoryColorClasses } from "../utils/helpers";
import DatePicker from "./DatePicker";

export default function TaskInput({ onAddTask, error, categories }) {
  const [title, setTitle] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [inputError, setInputError] = useState("");

  /**
   * Handle form submission
   * @param {Event} e - Form event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setInputError("Please enter a task title");
      return;
    }

    const result = await onAddTask({
      title,
      categoryId: selectedCategoryId,
      dueDate,
    });

    if (result && result.success) {
      setTitle("");
      setDueDate(null);
      setInputError("");
      // Keep category selected for next task
    } else {
      setInputError(result?.error || "Failed to add task");
    }
  };

  /**
   * Handle Enter key press
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  /**
   * Handle input change
   * @param {Event} e - Input event
   */
  const handleChange = (e) => {
    const newValue = e.target.value;
    setTitle(newValue);
    if (inputError) setInputError("");
  };

  /**
   * Get category badge for selected category
   */
  const getSelectedCategory = () => {
    if (!selectedCategoryId) return null;
    return categories.find((cat) => cat.id === selectedCategoryId);
  };

  const selectedCategory = getSelectedCategory();

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={title}
            onInput={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="What needs to be done?"
            className={`
              w-full px-4 py-3 text-lg
              bg-white dark:bg-dark-surface
              text-light-text dark:text-dark-text
              border-2 rounded-lg
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary
              ${
                inputError || error
                  ? "border-danger"
                  : "border-light-border dark:border-dark-border"
              }
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              ${selectedCategory ? "pr-32" : "pr-20"}
            `}
            maxLength={500}
            aria-label="Task title"
            aria-invalid={!!(inputError || error)}
            aria-describedby={inputError || error ? "input-error" : undefined}
          />

          {/* Category Badge (when selected) */}
          {selectedCategory && (
            <div className="absolute right-20 top-1/2 -translate-y-1/2">
              {(() => {
                const colorClasses = getCategoryColorClasses(
                  selectedCategory.color
                );
                return (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses.bg} text-white`}
                  >
                    {selectedCategory.name}
                  </span>
                );
              })()}
            </div>
          )}

          {title.length > 0 && (
            <button
              type="submit"
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                px-4 py-2 rounded-md
                bg-primary text-white
                hover:bg-blue-600 active:bg-blue-700
                transition-colors duration-200
                font-medium text-sm
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              "
              aria-label="Add task"
            >
              Add
            </button>
          )}
        </div>

        {/* Category Selector */}
        {categories && categories.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Category:
            </label>
            <select
              value={selectedCategoryId || ""}
              onChange={(e) => setSelectedCategoryId(e.target.value || null)}
              className="
                px-3 py-1 text-sm rounded-md
                bg-white dark:bg-dark-surface
                border border-light-border dark:border-dark-border
                text-light-text dark:text-dark-text
                focus:outline-none focus:ring-2 focus:ring-primary
                cursor-pointer
              "
              aria-label="Select category"
            >
              <option value="">None</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Due Date Picker */}
        <div className="mt-3">
          <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
            Due Date (optional):
          </label>
          <DatePicker value={dueDate} onChange={setDueDate} />
        </div>

        {(inputError || error) && (
          <p
            id="input-error"
            className="mt-2 text-sm text-danger animate-slide-in-down"
            role="alert"
          >
            {inputError || error}
          </p>
        )}

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Press Enter or click Add to create a task
        </p>
      </form>
    </div>
  );
}
