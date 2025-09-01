import React, { useState } from 'react';
import { shorten } from '../../services/api';

export default function ShortenForm() {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [result, setResult] = useState<{ shortUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await shorten({ originalUrl: url, customAlias: alias || undefined });
      setResult(r);
      navigator.clipboard?.writeText(r.shortUrl).catch(() => {});
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white p-4 rounded shadow space-y-3">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="w-full p-2 border rounded"
        required
      />
      <input
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        placeholder="Alias (opcional)"
        className="w-full p-2 border rounded"
      />
      <button className="px-4 py-2 bg-black text-white rounded" disabled={loading}>
        {loading ? 'Creando...' : 'Acortar'}
      </button>

      {result && (
        <div className="mt-2">
          <a
            href={result.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            {result.shortUrl}
          </a>
          <div className="text-sm text-gray-500">Copiado al portapapeles</div>
        </div>
      )}
    </form>
  );
}
