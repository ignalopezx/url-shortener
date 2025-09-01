export type ShortenRequest = {
  originalUrl: string;
  customAlias?: string;
  expiresAt?: string | null;
};
export type ShortenResponse = { code: string; shortUrl: string; expiresAt?: string | null };
export type UrlItemDto = {
  code: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string | null;
  totalClicks: number;
};

const BASE = import.meta.env.VITE_API_BASE ?? '/api';

async function handleRes(res: Response) {
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  return res.json();
}

export async function shorten(body: ShortenRequest): Promise<ShortenResponse> {
  const res = await fetch(`${BASE}/urls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleRes(res);
}

export async function listAll(): Promise<UrlItemDto[]> {
  const res = await fetch(`${BASE}/urls`);
  return handleRes(res);
}

export async function deleteUrl(code: string): Promise<void> {
  const res = await fetch(`${BASE}/urls/${code}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('No se pudo eliminar');
}

export async function stats(code: string) {
  const res = await fetch(`${BASE}/urls/${code}/stats`);
  return handleRes(res);
}
