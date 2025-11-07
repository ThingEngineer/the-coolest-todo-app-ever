/**
 * Authentication Service
 *
 * Handles user authentication using Supabase Auth:
 * - Email/password signup and login
 * - Session management
 * - User profile access
 * - Logout functionality
 */

import supabase, { isSupabaseAvailable } from "../config/supabase.js";

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password (min 6 characters)
 * @returns {Promise<{user: object, session: object, error: object|null}>}
 */
export async function signUp(email, password) {
  if (!isSupabaseAvailable()) {
    return {
      user: null,
      session: null,
      error: {
        message:
          "Supabase not configured. Authentication requires Supabase setup.",
      },
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    return {
      user: null,
      session: null,
      error: { message: err.message || "Sign up failed" },
    };
  }
}

/**
 * Sign in an existing user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: object, session: object, error: object|null}>}
 */
export async function signIn(email, password) {
  if (!isSupabaseAvailable()) {
    return {
      user: null,
      session: null,
      error: {
        message:
          "Supabase not configured. Authentication requires Supabase setup.",
      },
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    return {
      user: null,
      session: null,
      error: { message: err.message || "Sign in failed" },
    };
  }
}

/**
 * Sign out the current user
 * @returns {Promise<{error: object|null}>}
 */
export async function signOut() {
  if (!isSupabaseAvailable()) {
    return { error: { message: "Supabase not configured" } };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    return { error: { message: err.message || "Sign out failed" } };
  }
}

/**
 * Get the current user session
 * @returns {Promise<{session: object|null, error: object|null}>}
 */
export async function getSession() {
  if (!isSupabaseAvailable()) {
    return { session: null, error: null };
  }

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { session: null, error };
    }

    return { session: data.session, error: null };
  } catch (err) {
    return {
      session: null,
      error: { message: err.message || "Failed to get session" },
    };
  }
}

/**
 * Get the current user
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export async function getUser() {
  if (!isSupabaseAvailable()) {
    return { user: null, error: null };
  }

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (err) {
    return {
      user: null,
      error: { message: err.message || "Failed to get user" },
    };
  }
}

/**
 * Subscribe to authentication state changes
 * @param {function} callback - Called with (event, session) on auth state change
 * @returns {object} Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
  if (!isSupabaseAvailable()) {
    console.warn(
      "Supabase not configured. Auth state changes will not be tracked."
    );
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  const { data } = supabase.auth.onAuthStateChange(callback);
  return data;
}

/**
 * Reset password for a user (send reset email)
 * @param {string} email - User email
 * @returns {Promise<{error: object|null}>}
 */
export async function resetPassword(email) {
  if (!isSupabaseAvailable()) {
    return { error: { message: "Supabase not configured" } };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    return { error: { message: err.message || "Password reset failed" } };
  }
}

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export async function updatePassword(newPassword) {
  if (!isSupabaseAvailable()) {
    return { user: null, error: { message: "Supabase not configured" } };
  }

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (err) {
    return {
      user: null,
      error: { message: err.message || "Password update failed" },
    };
  }
}
