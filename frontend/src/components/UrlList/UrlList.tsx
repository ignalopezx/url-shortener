import { useEffect, useMemo, useState } from 'react';
import { listAll, deleteUrl } from '../../services/api';
import type { UrlItemDto } from '../../types/api';
import dayjs from 'dayjs';
import { copy } from '../../utils/copy';
import { Link } from 'react-router-dom';

const SHORT_BASE = import.meta.env.VITE_SHORT_BASE ?? 'http://localhost:8080';

export default function UrlList() {
  const [items, setItems] = useState<UrlItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await listAll();
      setItems(data);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(it =>
      it.code.toLowerCase().includes(q) ||
      it.originalUrl.toLowerCase().includes(q)
    );
  }, [items, filter]);

  async function onDelete(code: string) {
    if (!confirm(`¿Eliminar el código ${code}?`)) return;
    try {
      await deleteUrl(code);
      await load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  if (loading) return <div className="text-gray-500">Cargando…</div>;
  if (!items.length) return <div className="text-gray-500">No hay URLs aún.</div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <input
          className="p-2 border rounded-md w-full max-w-md"
          placeholder="Filtrar por código o URL…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          onClick={load}
          className="ml-3 px-3 py-2 border rounded-md"
          title="Recargar"
        >
          Recargar
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">URL original</th>
              <th className="text-left p-3">Creado</th>
              <th className="text-left p-3">Expira</th>
              <th className="text-right p-3">Clicks</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => {
              const shortUrl = `${SHORT_BASE}/${it.code}`;
              return (
                <tr key={it.code} className="border-t">
                  <td className="p-3 font-mono">{it.code}</td>
                  <td className="p-3 max-w-[420px]">
                    <a className="text-blue-600 underline break-all" href={shortUrl} target="_blank" rel="noreferrer">
                      {it.originalUrl}
                    </a>
                  </td>
                  <td className="p-3">{dayjs(it.createdAt).format('YYYY-MM-DD HH:mm')}</td>
                  <td className="p-3">{it.expiresAt ? dayjs(it.expiresAt).format('YYYY-MM-DD') : '-'}</td>
                  <td className="p-3 text-right">{it.totalClicks}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-2 py-1 border rounded"
                        onClick={() => window.open(shortUrl, '_blank')}
                      >
                        Abrir
                      </button>
                      <button
                        className="px-2 py-1 border rounded"
                        onClick={() => copy(shortUrl)}
                      >
                        Copiar
                      </button>
                      <Link to={`/stats/${it.code}`} className="px-2 py-1 border rounded">
                        Stats
                      </Link>
                      <button
                        className="px-2 py-1 border rounded text-red-600 border-red-300"
                        onClick={() => onDelete(it.code)}
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
