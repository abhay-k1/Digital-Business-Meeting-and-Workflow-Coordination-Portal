"use client";

export interface UserSession {
  id: string;
  email: string;
  name: string;
}

/**
 * Saves user details in localStorage.
 */
export function saveSession(user: UserSession) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_session", JSON.stringify(user));
  }
}

/**
 * Retrieves the current logged-in user session.
 */
export function getSession(): UserSession | null {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("user_session");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Removes the session to log out.
 */
export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user_session");
  }
}

/**
 * Simple client-side route guard: redirects to login if not logged in.
 */
export function checkAuthOrRedirect() {
  if (typeof window !== "undefined") {
    const session = getSession();
    if (!session) {
      window.location.href = "/login";
      return false;
    }
    return true;
  }
  return false;
}
