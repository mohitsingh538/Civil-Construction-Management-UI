const API_BASE = '/api';

/**
 * Centralized HTTP client for all backend calls.
 *
 * All API functions must go through this — never call `fetch` directly
 * in any api/*.ts file or component.
 *
 * To switch from mock → real backend: update the api/*.ts files only.
 * This client, all hooks, and all components stay completely unchanged.
 */
export async function apiClient<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add Authorization header → `Bearer ${getAuthToken()}`
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
