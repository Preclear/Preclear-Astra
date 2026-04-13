import type {
  PermitAdviceRequest,
  PermitAdviceResponse,
  FreeTextResponse,
} from '../types/permit';

// ---------------------------------------------------------------------------
// Base URL — throws at module load time if .env is missing, so you notice
// immediately during `npm run dev`.
// ---------------------------------------------------------------------------
const API_BASE = import.meta.env.VITE_API_URL;
if (!API_BASE) {
  throw new Error('VITE_API_URL is not set in .env — add it and restart the dev server.');
}

const JURISDICTION_SLUG = 'md-baltimore-county';

// ---------------------------------------------------------------------------
// Shared fetch helper
// ---------------------------------------------------------------------------
async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    clearTimeout(timerId);

    if (!response.ok) {
      let detail = `Request failed (${response.status})`;
      try {
        const err = (await response.json()) as { detail?: string };
        if (err.detail) detail = err.detail;
      } catch {
        /* ignore JSON parse errors */
      }
      throw new Error(detail);
    }

    return (await response.json()) as T;
  } catch (err) {
    clearTimeout(timerId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('The search is taking longer than expected. Please try again.');
      }
      // Re-throw parsed API errors (already strings)
      if (err.message) throw err;
    }
    throw new Error('Unable to reach the permit database.');
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Structured permit advice for a known project type.
 * POST /api/permit-advice
 */
export async function fetchPermitAdvice(
  payload: PermitAdviceRequest,
): Promise<PermitAdviceResponse> {
  return apiFetch<PermitAdviceResponse>('/api/permit-advice', {
    ...payload,
    jurisdiction_slug: JURISDICTION_SLUG,
  });
}

/**
 * Free-text RAG query for the "Other / Custom" project type.
 * POST /api/query
 */
export async function fetchFreeTextAnswer(question: string): Promise<FreeTextResponse> {
  return apiFetch<FreeTextResponse>('/api/query', {
    question,
    jurisdiction_slug: JURISDICTION_SLUG,
  });
}

/**
 * Fire-and-forget feedback signal. Errors are silently swallowed.
 * POST /api/feedback
 */
export function sendFeedback(signal: 'thumbs_up' | 'thumbs_down'): void {
  fetch(`${API_BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ signal }),
  }).catch(() => { /* intentionally ignored */ });
}
