/**
 * Thin wrapper around fetch pointing at the FastAPI backend.
 *
 * Set VITE_API_BASE_URL in the root .env to override the default:
 *   VITE_API_BASE_URL=http://192.168.1.100:8000   ← your machine's LAN IP for real devices
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000';

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend error ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend error ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}
