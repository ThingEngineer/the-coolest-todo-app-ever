/**
 * App Component
 * Root component for the Coolest Todo Application
 */

import { useEffect, useState } from "preact/hooks";
import { useTasks } from "./hooks/useTasks";
import { useCategories } from "./hooks/useCategories";
import { useTheme } from "./hooks/useTheme";
import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";
import CategoryFilter from "./components/CategoryFilter";
import ThemeSelector from "./components/ThemeSelector";
import ConfirmModal from "./components/ConfirmModal";
import { getDateRanges, isOverdue } from "./services/dateParser";

export default function App() {
  const {
    tasks,
    loading,
    error,
    stats,
    addTask,
    toggleTask,
    removeTask,
    clearCompleted,
    initDemo,
    updateFilter,
  } = useTasks();

  const {
    categories,
    loading: categoriesLoading,
    initDemo: initCategoriesDemo,
  } = useCategories();

  const {
    currentTheme,
    themePreference,
    availableThemes,
    changeTheme,
    isSystemTheme,
  } = useTheme();

  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState(undefined);
  const [sortBy, setSortBy] = useState("order");
  const [quickFilter, setQuickFilter] = useState(null); // 'today', 'thisWeek', 'overdue'
  const [showClearModal, setShowClearModal] = useState(false);

  // Initialize demo data on first load
  useEffect(() => {
    initDemo();
    initCategoriesDemo();
  }, []);

  // Update task filter when category or sort changes
  useEffect(() => {
    updateFilter({ categoryId: selectedCategoryId, sortBy });
  }, [selectedCategoryId, sortBy]);

  // Apply quick date filters
  const applyQuickFilter = (tasks) => {
    if (!quickFilter) return tasks;

    const ranges = getDateRanges();

    if (quickFilter === "today") {
      return tasks.filter((task) => {
        if (!task.dueDate) return false;
        const due = new Date(task.dueDate);
        return due >= ranges.today.start && due <= ranges.today.end;
      });
    }

    if (quickFilter === "thisWeek") {
      return tasks.filter((task) => {
        if (!task.dueDate) return false;
        const due = new Date(task.dueDate);
        return due >= ranges.thisWeek.start && due <= ranges.thisWeek.end;
      });
    }

    if (quickFilter === "overdue") {
      return tasks.filter(
        (task) => !task.completed && task.dueDate && isOverdue(task.dueDate)
      );
    }

    return tasks;
  };

  // Separate active and completed for better visual distinction
  const filteredActiveTasks = applyQuickFilter(
    tasks.filter((task) => !task.completed)
  );
  const filteredCompletedTasks = applyQuickFilter(
    tasks.filter((task) => task.completed)
  );
  const activeTasks = filteredActiveTasks;
  const completedTasks = filteredCompletedTasks;

  // Count overdue tasks
  const overdueTasks = tasks.filter(
    (task) => !task.completed && task.dueDate && isOverdue(task.dueDate)
  );

  // Calculate task counts per category for filter badges
  const getTaskCounts = () => {
    const allTasks = [...activeTasks, ...completedTasks];
    const counts = {
      all: allTasks.length,
      null: allTasks.filter((t) => !t.categoryId).length,
    };

    categories.forEach((cat) => {
      counts[cat.id] = allTasks.filter((t) => t.categoryId === cat.id).length;
    });

    return counts;
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-theme duration-300">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-2">
                ✨ The Coolest Todo App{" "}
                <span className="text-lg sm:text-xl md:text-2xl font-light text-gray-400 dark:text-gray-500 italic">
                  (ever)
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Get things done with style
              </p>
            </div>

            {/* Theme Selector */}
            <ThemeSelector
              currentTheme={currentTheme}
              themePreference={themePreference}
              availableThemes={availableThemes}
              onChangeTheme={changeTheme}
              isSystemTheme={isSystemTheme}
            />
          </div>

          {/* Stats */}
          {stats.total > 0 && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Total:{" "}
                <strong className="text-light-text dark:text-dark-text">
                  {stats.total}
                </strong>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Active: <strong className="text-primary">{stats.active}</strong>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Completed:{" "}
                <strong className="text-success">{stats.completed}</strong>
              </span>

              {/* Overdue count */}
              {overdueTasks.length > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  Overdue: <strong>⚠️ {overdueTasks.length}</strong>
                </span>
              )}

              {/* Toggle completed visibility */}
              {stats.completed > 0 && (
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="ml-auto text-xs px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {showCompleted ? "Hide" : "Show"} completed
                </button>
              )}
            </div>
          )}
        </header>

        <main>
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6">
            <TaskInput
              onAddTask={addTask}
              error={error}
              categories={categories}
            />

            {/* Category Filter */}
            {!categoriesLoading && categories.length > 0 && (
              <CategoryFilter
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                taskCounts={getTaskCounts()}
              />
            )}

            {/* Sort and Quick Date Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="order">Creation Order</option>
                  <option value="dueDate">Due Date</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>

              {/* Quick Date Filters */}
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Quick:
                </span>
                <button
                  onClick={() =>
                    setQuickFilter(quickFilter === "today" ? null : "today")
                  }
                  className={`px-2.5 py-1 text-xs rounded transition ${
                    quickFilter === "today"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  📅 Today
                </button>
                <button
                  onClick={() =>
                    setQuickFilter(
                      quickFilter === "thisWeek" ? null : "thisWeek"
                    )
                  }
                  className={`px-2.5 py-1 text-xs rounded transition ${
                    quickFilter === "thisWeek"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  📆 This Week
                </button>
                <button
                  onClick={() =>
                    setQuickFilter(quickFilter === "overdue" ? null : "overdue")
                  }
                  className={`px-2.5 py-1 text-xs rounded transition ${
                    quickFilter === "overdue"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  ⚠️ Overdue
                </button>
              </div>
            </div>

            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                  Active Tasks
                </h2>
                <TaskList
                  tasks={activeTasks}
                  loading={loading}
                  onToggleTask={toggleTask}
                  onDeleteTask={removeTask}
                  categories={categories}
                />
              </div>
            )}

            {/* Completed Tasks */}
            {showCompleted && completedTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Completed Tasks
                  </h2>
                  <button
                    onClick={() => setShowClearModal(true)}
                    className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-danger hover:bg-danger/10 rounded transition"
                  >
                    🗑️ Clear Completed
                  </button>
                </div>
                <TaskList
                  tasks={completedTasks}
                  loading={false}
                  onToggleTask={toggleTask}
                  onDeleteTask={removeTask}
                  categories={categories}
                />
              </div>
            )}

            {/* Empty state when all sections are empty */}
            {activeTasks.length === 0 &&
              completedTasks.length === 0 &&
              !loading && (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No tasks yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Get started by creating your first task above!
                  </p>
                </div>
              )}
          </div>
        </main>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-500">
          <p>Made with ❤️ using Vite, Preact, and Tailwind CSS</p>
        </footer>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={clearCompleted}
        title="Clear Completed Tasks?"
        message={`Are you sure you want to permanently delete ${
          completedTasks.length
        } completed task${
          completedTasks.length === 1 ? "" : "s"
        }? This action cannot be undone.`}
        confirmText="Yes, Clear Them"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
