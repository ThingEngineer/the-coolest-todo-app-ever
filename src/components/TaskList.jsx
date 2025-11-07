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
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          Loading tasks...
        </p>
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
    <div className="space-y-2" role="list" aria-label="Tasks">
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
