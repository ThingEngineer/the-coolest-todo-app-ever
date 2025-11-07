/**
 * CategoryFilter Component
 * Filter tasks by category with color-coded chips
 */

import { getCategoryColorClasses } from "../utils/helpers";

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
  taskCounts,
}) {
  /**
   * Handle category selection
   * @param {string|null} categoryId - Category ID or null for "All"
   */
  const handleSelect = (categoryId) => {
    onSelectCategory(categoryId);
  };

  /**
   * Get task count for a category
   * @param {string|null} categoryId - Category ID
   * @returns {number} Count
   */
  const getCount = (categoryId) => {
    return taskCounts?.[categoryId || "all"] || 0;
  };

  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 uppercase tracking-wide">
        Filter by Category
      </h2>

      {/* Desktop: Wrapping layout, Mobile: Horizontal scroll */}
      <div className="relative">
        {/* Gradient fade indicators for mobile scroll */}
        <div className="md:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-dark-surface to-transparent pointer-events-none z-10"></div>
        <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-dark-surface to-transparent pointer-events-none z-10"></div>

        <div className="overflow-x-auto md:overflow-visible scrollbar-hide -mx-1 px-1">
          <div className="flex md:flex-wrap gap-2 pb-2 md:pb-0 min-w-min">
            {/* All Tasks */}
            <button
              onClick={() => handleSelect(undefined)}
              className={`
                inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0
                transition-all duration-200
                ${
                  selectedCategoryId === undefined
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }
              `}
              aria-pressed={selectedCategoryId === undefined}
            >
              <span>All Tasks</span>
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs rounded-full bg-white/20">
                {getCount("all")}
              </span>
            </button>

            {/* Uncategorized */}
            <button
              onClick={() => handleSelect(null)}
              className={`
                inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0
                transition-all duration-200
                ${
                  selectedCategoryId === null
                    ? "bg-gray-600 text-white shadow-md scale-105"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }
              `}
              aria-pressed={selectedCategoryId === null}
            >
              <span>Uncategorized</span>
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs rounded-full bg-white/20">
                {getCount(null)}
              </span>
            </button>

            {/* Category Chips */}
            {categories.map((category) => {
              const colorClasses = getCategoryColorClasses(category.color);
              const isSelected = selectedCategoryId === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => handleSelect(category.id)}
                  className={`
                    inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                    text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0
                    transition-all duration-200
                    ${
                      isSelected
                        ? `${colorClasses.bg} text-white shadow-md scale-105`
                        : `bg-white dark:bg-dark-surface border-2 ${colorClasses.border} ${colorClasses.text} hover:${colorClasses.bg} hover:text-white`
                    }
                  `}
                  aria-pressed={isSelected}
                  title={category.name}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <span
                    className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs rounded-full ${
                      isSelected
                        ? "bg-white/20"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    {getCount(category.id)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {categories.length === 0 && (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
          No categories yet. Create one to organize your tasks!
        </p>
      )}
    </div>
  );
}
