import type { ShortenRequest, ShortenResponse, UrlItemDto, StatsResponse } from '../types/api';

const BASE = import.meta.env.VITE_API_BASE ?? '/api';

async function handle(res: Response) {
  if (!res.ok) {
    // Intentamos leer error del backend
    let msg = res.statusText;
    try {
      const t = await res.text();
      if (t) msg = t;
    } catch { /* empty */ }
    throw new Error(msg);
  }
  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

export async function shorten(body: ShortenRequest): Promise<ShortenResponse> {
  const res = await fetch(`${BASE}/urls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function listAll(): Promise<UrlItemDto[]> {
  const res = await fetch(`${BASE}/urls`);
  return handle(res);
}

export async function deleteUrl(code: string): Promise<void> {
  const res = await fetch(`${BASE}/urls/${code}`, { method: 'DELETE' });
  await handle(res);
}

export async function getStats(code: string): Promise<StatsResponse> {
  const res = await fetch(`${BASE}/urls/${code}/stats`);
  return handle(res);
}
