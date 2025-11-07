/**
 * ThemeSelector Component
 * Allows users to select and preview different themes
 */

import { useState } from "preact/hooks";

export default function ThemeSelector({
  currentTheme,
  themePreference,
  availableThemes,
  onChangeTheme,
  isSystemTheme,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (themeId) => {
    onChangeTheme(themeId);
    setIsOpen(false);
  };

  const activeTheme =
    availableThemes.find((t) => t.id === currentTheme) || availableThemes[0];

  return (
    <div className="relative">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        aria-label="Select theme"
        aria-expanded={isOpen}
      >
        <span className="text-xl">{activeTheme.icon}</span>
        <span className="hidden sm:inline text-gray-700 dark:text-gray-300">
          {isSystemTheme ? "System" : activeTheme.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Theme Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Theme
              </div>

              {/* System Theme Option */}
              <button
                onClick={() => handleThemeSelect("system")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition ${
                  themePreference === "system"
                    ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="text-xl">💻</span>
                <div className="flex-1">
                  <div className="font-medium">System</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Follow system preference
                  </div>
                </div>
                {themePreference === "system" && (
                  <svg
                    className="w-5 h-5 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>

              <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

              {/* Theme Options */}
              {availableThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition ${
                    themePreference === theme.id
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-xl">{theme.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{theme.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {theme.description}
                    </div>
                  </div>
                  {themePreference === theme.id && (
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
