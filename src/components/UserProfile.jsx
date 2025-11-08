/**
 * UserProfile Component
 *
 * Displays user info and provides sign out functionality.
 * Shows online/offline status and sync indicators.
 */

import { useState } from "preact/hooks";
import { lazy, Suspense } from "preact/compat";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";
import { SuccessMessages } from "../utils/errorMessages";

// Lazy load AuthModal for better initial performance
const AuthModal = lazy(() =>
  import("./AuthModal").then((module) => ({ default: module.AuthModal }))
);

export function UserProfile() {
  const { user, isAuthenticated, isOnline, signOut, loading } = useAuth();
  const toast = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    setShowDropdown(false);
    await signOut();
    toast.success(SuccessMessages.authSignOut);
  };

  // Not authenticated - show sign in button
  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 
                 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          <svg
            class="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          <span class="hidden sm:inline">Sign In</span>
        </button>

        {showAuthModal && (
          <Suspense fallback={null}>
            <AuthModal
              onClose={() => setShowAuthModal(false)}
              onSuccess={() => {
                setShowAuthModal(false);
                toast.success(SuccessMessages.authSignIn);
              }}
            />
          </Suspense>
        )}
      </>
    );
  }

  // Authenticated - show user menu
  return (
    <div class="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300
               hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        {/* User Avatar */}
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs sm:text-sm">
          {user?.email?.[0]?.toUpperCase() || "U"}
        </div>

        {/* User Email (truncated) - hidden on mobile */}
        <span class="hidden sm:inline max-w-[150px] truncate text-xs sm:text-sm">
          {user?.email}
        </span>

        {/* Online/Offline Indicator */}
        <span
          class={`w-2 h-2 rounded-full ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />

        {/* Dropdown Arrow */}
        <svg
          class={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
            showDropdown ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            class="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Content - Mobile: Bottom sheet, Desktop: Dropdown */}
          <div
            class="fixed sm:absolute left-0 right-0 bottom-0 sm:left-auto sm:right-0 sm:bottom-auto sm:mt-2 
                   w-full sm:w-64 bg-white dark:bg-gray-800 sm:rounded-lg rounded-t-lg shadow-lg 
                   border-t sm:border border-gray-200 dark:border-gray-700 z-20 max-h-[70vh] sm:max-h-96 overflow-y-auto"
          >
            {/* User Info */}
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between mb-2 sm:mb-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
                  {user?.email}
                </p>
                {/* Close button for mobile */}
                <button
                  onClick={() => setShowDropdown(false)}
                  class="sm:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
                  aria-label="Close user menu"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isOnline
                  ? "🟢 Online - Syncing with cloud"
                  : "🔴 Offline - Using local storage"}
              </p>
            </div>

            {/* Menu Items */}
            <div class="py-2">
              {/* Account Info */}
              <div class="px-4 py-2">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  User ID: {user?.id?.slice(0, 8)}...
                </p>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={loading}
                class="w-full px-4 py-2.5 sm:py-2 text-left text-sm text-red-600 dark:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {loading ? "Signing out..." : "Sign Out"}
              </button>
            </div>

            {/* Footer Info */}
            <div class="px-4 py-2 sm:py-2 border-t border-gray-200 dark:border-gray-700">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                💡 Your tasks are automatically synced when online
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
