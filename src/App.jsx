/**
 * App Component
 * Root component for the Coolest Todo Application
 * Now with Supabase authentication and cloud sync support
 */

import { useEffect, useState } from "preact/hooks";
import { useTasks } from "./hooks/useTasks";
import { useCategories } from "./hooks/useCategories";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./contexts/ToastContext";
import TaskInput from "./components/TaskInput";
import TaskList from "./components/TaskList";
import CategoryFilter from "./components/CategoryFilter";
import ThemeSelector from "./components/ThemeSelector";
import ConfirmModal from "./components/ConfirmModal";
import { UserProfile } from "./components/UserProfile";
import AnimatedBackground from "./components/AnimatedBackground";
import { getDateRanges, isOverdue } from "./services/dateParser";
import {
  getUserFriendlyError,
  SuccessMessages,
  InfoMessages,
} from "./utils/errorMessages";

export default function App() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const toast = useToast();

  const {
    tasks,
    loading,
    error,
    stats,
    syncing,
    isOnline,
    addTask,
    toggleTask,
    removeTask,
    clearCompleted,
    initDemo,
    updateFilter,
    syncToSupabase,
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

  // Show offline indicator
  useEffect(() => {
    if (!isOnline) {
      toast.info(InfoMessages.offline, { duration: 3000 });
    }
  }, [isOnline]);

  // Show sync status
  useEffect(() => {
    if (syncing) {
      toast.info(InfoMessages.syncing, { duration: 2000 });
    }
  }, [syncing]);

  // Wrapped handlers with toast notifications
  const handleAddTask = async (taskData) => {
    const result = await addTask(taskData);
    if (result.success) {
      toast.success(SuccessMessages.taskCreated);
    } else if (result.error) {
      toast.error(getUserFriendlyError(result.error));
    }
    return result;
  };

  const handleToggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    const result = await toggleTask(id);
    if (result.success) {
      // Only show success toast when completing (not uncompleting)
      if (task && !task.completed) {
        toast.success(SuccessMessages.taskCompleted, { duration: 2000 });
      }
    } else if (result.error) {
      toast.error(getUserFriendlyError(result.error));
    }
    return result;
  };

  const handleRemoveTask = async (id) => {
    const result = await removeTask(id);
    if (result.success) {
      toast.success(SuccessMessages.taskDeleted, { duration: 2000 });
    } else if (result.error) {
      toast.error(getUserFriendlyError(result.error));
    }
    return result;
  };

  const handleClearCompleted = async () => {
    const result = await clearCompleted();
    setShowClearModal(false);
    if (result.success) {
      toast.success(SuccessMessages.tasksCleared);
    } else if (result.error) {
      toast.error(getUserFriendlyError(result.error));
    }
    return result;
  };

  const handleSyncToSupabase = async () => {
    const result = await syncToSupabase();
    if (result.success) {
      toast.success(SuccessMessages.syncSuccess);
    } else if (result.error) {
      toast.error(getUserFriendlyError(result.error), {
        action: {
          label: "Retry",
          onClick: handleSyncToSupabase,
        },
      });
    }
    return result;
  };

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
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-theme duration-300 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-2xl lg:max-w-4xl relative z-10">
        <header className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-light-text dark:text-dark-text mb-1 sm:mb-2 leading-tight">
                ✨ The Coolest Todo App{" "}
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-gray-400 dark:text-gray-500 italic whitespace-nowrap">
                  (ever)
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Get things done with style
                {isAuthenticated && isOnline && (
                  <span className="ml-2 text-green-600 dark:text-green-400 text-xs sm:text-sm">
                    ☁️ Syncing
                  </span>
                )}
                {isAuthenticated && !isOnline && (
                  <span className="ml-2 text-orange-600 dark:text-orange-400 text-xs sm:text-sm">
                    📱 Offline
                  </span>
                )}
              </p>
            </div>

            {/* User Profile & Theme Selector */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <UserProfile />
              <ThemeSelector
                currentTheme={currentTheme}
                themePreference={themePreference}
                availableThemes={availableThemes}
                onChangeTheme={changeTheme}
                isSystemTheme={isSystemTheme}
              />
            </div>
          </div>

          {/* Stats */}
          {stats.total > 0 && (
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
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
                  className="ml-auto text-xs px-2 sm:px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {showCompleted ? "Hide" : "Show"} completed
                </button>
              )}
            </div>
          )}
        </header>

        <main>
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-4 sm:p-5 md:p-6">
            <TaskInput
              onAddTask={handleAddTask}
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort"
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0"
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-initial px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="order">Creation Order</option>
                  <option value="dueDate">Due Date</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>

              {/* Quick Date Filters */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                  Quick:
                </span>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() =>
                      setQuickFilter(quickFilter === "today" ? null : "today")
                    }
                    className={`px-2 sm:px-2.5 py-1 text-xs rounded whitespace-nowrap transition ${
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
                    className={`px-2 sm:px-2.5 py-1 text-xs rounded whitespace-nowrap transition ${
                      quickFilter === "thisWeek"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    📆 This Week
                  </button>
                  <button
                    onClick={() =>
                      setQuickFilter(
                        quickFilter === "overdue" ? null : "overdue"
                      )
                    }
                    className={`px-2 sm:px-2.5 py-1 text-xs rounded whitespace-nowrap transition ${
                      quickFilter === "overdue"
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    ⚠️ Overdue
                  </button>
                </div>
              </div>
            </div>

            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 uppercase tracking-wide">
                  Active Tasks
                </h2>
                <TaskList
                  tasks={activeTasks}
                  loading={loading}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleRemoveTask}
                  categories={categories}
                  isCompletedSection={false}
                />
              </div>
            )}

            {/* Completed Tasks */}
            {showCompleted && completedTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h2 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Completed Tasks
                  </h2>
                  <button
                    onClick={() => setShowClearModal(true)}
                    className="px-2 sm:px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-danger hover:bg-danger/10 rounded transition"
                  >
                    🗑️ Clear Completed
                  </button>
                </div>
                <TaskList
                  tasks={completedTasks}
                  loading={loading}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleRemoveTask}
                  categories={categories}
                  isCompletedSection={true}
                />
              </div>
            )}

            {/* Empty state when all sections are empty */}
            {activeTasks.length === 0 &&
              completedTasks.length === 0 &&
              !loading && (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 mb-4">
                    <svg
                      className="h-8 w-8 sm:h-10 sm:w-10 text-primary"
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
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {quickFilter === "today"
                      ? "No tasks due today! 🎉"
                      : quickFilter === "thisWeek"
                      ? "No tasks this week! 🌟"
                      : quickFilter === "overdue"
                      ? "No overdue tasks! 👍"
                      : selectedCategoryId !== undefined
                      ? "No tasks in this category"
                      : "No tasks yet"}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    {quickFilter || selectedCategoryId !== undefined
                      ? "Try a different filter or create a new task"
                      : "Get started by creating your first task above!"}
                  </p>
                </div>
              )}
          </div>
        </main>

        <footer className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-500">
          <p>Made with ❤️ using Vite, Preact, and Tailwind CSS</p>
        </footer>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearCompleted}
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
