import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStats } from '../services/api';
import type { StatsResponse } from '../types/api';
import dayjs from 'dayjs';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function StatsPage() {
  const { code } = useParams();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await getStats(code);
        setData(s);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  const series = useMemo(() => {
    if (!data) return [];
    // Agrupar por día
    const map = new Map<string, number>();
    for (const c of data.lastClicks) {
      const d = dayjs(c.clickedAt).format('YYYY-MM-DD');
      map.set(d, (map.get(d) ?? 0) + 1);
    }
    const arr = Array.from(map.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day));
    return arr;
  }, [data]);

  if (loading) return <div>Cargando…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stats de <span className="font-mono">{data.code}</span></h1>
        <Link to="/dashboard" className="text-blue-600 underline">Volver al Dashboard</Link>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <div className="text-sm">
          <div><strong>Original:</strong> <a className="text-blue-600 underline break-all" href={data.originalUrl} target="_blank" rel="noreferrer">{data.originalUrl}</a></div>
          <div><strong>Creado:</strong> {dayjs(data.createdAt).format('YYYY-MM-DD HH:mm')}</div>
          <div><strong>Expira:</strong> {data.expiresAt ? dayjs(data.expiresAt).format('YYYY-MM-DD HH:mm') : '-'}</div>
          <div><strong>Total clicks:</strong> {data.totalClicks}</div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <details className="mt-2">
          <summary className="cursor-pointer">Ver últimos {data.lastClicks.length} clicks</summary>
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Fecha</th>
                  <th className="text-left p-2">IP</th>
                  <th className="text-left p-2">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {data.lastClicks.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{dayjs(c.clickedAt).format('YYYY-MM-DD HH:mm:ss')}</td>
                    <td className="p-2">{c.ipAddress ?? '-'}</td>
                    <td className="p-2 break-all">{c.userAgent?.slice(0, 180) ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}
