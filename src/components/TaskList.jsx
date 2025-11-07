/**
 * TaskList Component
 * Container that displays a list of tasks with category information
 */

import TaskItem from "./TaskItem";

export default function TaskList({
  tasks,
  loading,
  onToggleTask,
  onDeleteTask,
  categories,
}) {
  if (loading) {
    return (
      <div
        className="space-y-2 sm:space-y-3"
        aria-live="polite"
        aria-busy="true"
      >
        {/* Skeleton loaders */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 sm:p-4 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg animate-pulse"
          >
            <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return null; // Let parent handle empty state
  }

  /**
   * Get category for a task
   * @param {string|null} categoryId - Category ID
   * @returns {Object|null} Category object
   */
  const getCategoryForTask = (categoryId) => {
    if (!categoryId || !categories) return null;
    return categories.find((cat) => cat.id === categoryId) || null;
  };

  return (
    <div className="space-y-2 sm:space-y-3" role="list" aria-label="Tasks">
      {tasks.map((task) => (
        <div key={task.id} role="listitem" className="animate-slide-in-down">
          <TaskItem
            task={task}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            category={getCategoryForTask(task.categoryId)}
          />
        </div>
      ))}
    </div>
  );
}
