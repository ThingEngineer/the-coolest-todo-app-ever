/**
 * AuthModal Component
 *
 * Modal dialog for user authentication (login/signup).
 * Provides email/password forms with validation and error handling.
 */

import { useState } from "preact/hooks";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";
import { getUserFriendlyError, SuccessMessages } from "../utils/errorMessages";

export function AuthModal({ onClose, onSuccess }) {
  const { signIn, signUp, loading } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      if (mode === "signup") {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) {
          const friendlyError = getUserFriendlyError(signUpError);
          setError(friendlyError);
          toast.error(friendlyError);
        } else {
          toast.success(SuccessMessages.authSignUp);
          onSuccess?.();
          onClose?.();
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          const friendlyError = getUserFriendlyError(signInError);
          setError(friendlyError);
          toast.error(friendlyError);
        } else {
          toast.success(SuccessMessages.authSignIn);
          onSuccess?.();
          onClose?.();
        }
      }
    } catch (err) {
      const friendlyError = getUserFriendlyError(err);
      setError(friendlyError);
      toast.error(friendlyError);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
    setConfirmPassword("");
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h2>
          <button
            onClick={onClose}
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Info Message */}
        <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p class="text-sm text-blue-800 dark:text-blue-200">
            {mode === "login"
              ? "Sign in to sync your tasks across devices"
              : "Create an account to backup and sync your tasks"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} class="space-y-4">
          {/* Email */}
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onInput={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500"
              disabled={loading}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onInput={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-400 dark:placeholder-gray-500"
              disabled={loading}
              required
              minlength="6"
            />
          </div>

          {/* Confirm Password (signup only) */}
          {mode === "signup" && (
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onInput={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-400 dark:placeholder-gray-500"
                disabled={loading}
                required
                minlength="6"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p class="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                   text-white font-medium rounded-lg transition-colors
                   focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:cursor-not-allowed"
          >
            {loading
              ? "Processing..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div class="mt-4 text-center">
          <button
            onClick={toggleMode}
            class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            disabled={loading}
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Offline Notice */}
        <div class="mt-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-center">
          <p class="text-xs text-gray-600 dark:text-gray-400">
            You can continue using the app offline without an account. Your data
            will be saved locally on this device.
          </p>
        </div>
      </div>
    </div>
  );
}
