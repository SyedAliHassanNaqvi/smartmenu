/**
 * Wraps `fetch` against the app's JSON API routes, injecting the optional
 * bearer token and normalizing responses so callers (and TanStack Query) get a
 * consistent error type regardless of HTTP status.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: {
    method?: string;
    token?: string | null;
    body?: unknown;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const { method = "GET", token, body, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data as { error?: string } | null)?.error ??
      `Request failed with status ${response.status}`;
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return data as T;
}
