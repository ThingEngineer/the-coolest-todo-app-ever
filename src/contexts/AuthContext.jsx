/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the app.
 * Manages user session, handles auth state changes, and provides
 * sign in, sign up, and sign out functionality.
 */

import { createContext } from "preact";
import { useState, useEffect } from "preact/hooks";
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getSession,
  getUser,
  onAuthStateChange,
} from "../services/authService.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize auth state
  useEffect(() => {
    // Check for existing session
    initializeAuth();

    // Listen for auth state changes
    const { subscription } = onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN") {
        console.log("User signed in:", session?.user?.email);
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
      }
    });

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function initializeAuth() {
    try {
      const { session, error } = await getSession();

      if (error) {
        console.error("Failed to get session:", error);
      }

      if (session) {
        setSession(session);
        setUser(session.user);
      } else {
        // Try to get user directly (in case session check failed)
        const { user: currentUser } = await getUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
    } catch (err) {
      console.error("Auth initialization error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    setLoading(true);
    try {
      const { user, session, error } = await authSignIn(email, password);

      if (error) {
        return { error };
      }

      setUser(user);
      setSession(session);
      return { user, session, error: null };
    } catch (err) {
      return { error: { message: err.message || "Sign in failed" } };
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email, password) {
    setLoading(true);
    try {
      const { user, session, error } = await authSignUp(email, password);

      if (error) {
        return { error };
      }

      setUser(user);
      setSession(session);
      return { user, session, error: null };
    } catch (err) {
      return { error: { message: err.message || "Sign up failed" } };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      const { error } = await authSignOut();

      if (error) {
        return { error };
      }

      setUser(null);
      setSession(null);

      // Clear localStorage on sign out
      localStorage.removeItem("todos_tasks");
      localStorage.removeItem("todos_categories");

      return { error: null };
    } catch (err) {
      return { error: { message: err.message || "Sign out failed" } };
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    session,
    loading,
    isOnline,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
