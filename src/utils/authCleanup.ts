
/**
 * Removes all Supabase auth tokens and keys from localStorage and sessionStorage to avoid limbo states.
 */
export function cleanupAuthState() {
  // Remove all supabase.auth.* and sb-* keys
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
}
