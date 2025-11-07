/**
 * useAuth Hook
 *
 * Provides easy access to authentication state and methods.
 * Must be used within an AuthProvider.
 */

import { useContext } from "preact/hooks";
import { AuthContext } from "../contexts/AuthContext.jsx";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
