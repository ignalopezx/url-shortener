import React, { useState } from 'react';
import { shorten } from '../../services/api';
import type { ShortenResponse } from '../../types/api';
import { copy } from '../../utils/copy';
import dayjs from 'dayjs';
import { QRCodeCanvas } from 'qrcode.react';

const SHORT_BASE = import.meta.env.VITE_SHORT_BASE ?? 'http://localhost:8080';

export default function ShortenForm() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState<string>(''); // ISO yyyy-mm-dd
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const minDate = dayjs().add(1, 'day').format('YYYY-MM-DD');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);

    // Validación sencilla
    try {
      const u = new URL(originalUrl);
      if (!u.protocol.startsWith('http')) throw new Error('URL debe iniciar con http(s)://');
    } catch {
      setLoading(false);
      setError('URL inválida (debe incluir http(s)://)');
      return;
    }

    try {
      const payload = {
        originalUrl,
        customAlias: customAlias.trim() || undefined,
        expiresAt: expiresAt ? dayjs(expiresAt).endOf('day').toISOString() : undefined,
      };
      const r = await shorten(payload);
      setResult(r);
      await copy(r.shortUrl);
    } catch (err: unknown) {
      let msg = 'Ocurrió un error inesperado, revisá los datos.';

      if (err instanceof Error) {
        if (err.message.includes('409')) {
          msg = 'Ese alias ya está en uso, probá con otro 😉';
        } else if (err.message.includes('500')) {
          msg = 'Máximo de caracteres alcanzado o error en el servidor.';
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const shortPreview = customAlias ? `${SHORT_BASE}/${customAlias}` : undefined;

  return (
    <div className="bg-white p-4 rounded-2xl shadow space-y-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">URL original</label>
          <input
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            placeholder="https://ejemplo.com/articulo"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Alias */}
          <div>
            <label className="block text-sm font-medium mb-1">Alias (opcional)</label>
            <input
              className={`w-full p-2 border rounded-md focus:outline-none transition ${
                customAlias.length >= 16
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="mi-alias"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              maxLength={16}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              {shortPreview && <p>Vista previa: {shortPreview}</p>}
              <p>{customAlias.length}/16</p>
            </div>
          </div>

          {/* Fecha de expiración */}
          <div>
            <label className="block text-sm font-medium mb-1">Expira el (opcional)</label>
            <input
              type="date"
              className="w-full p-2 border rounded-md"
              min={minDate}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">Si no elegís fecha, la URL dura 7 días.</p>
          </div>

          {/* Botón */}
          <div className="flex items-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60 shadow"
              disabled={loading}
            >
              {loading ? 'Creando…' : 'Acortar'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="border rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 bg-white shadow-lg">
          <div className="flex-1 text-center md:text-left">
            <div className="text-sm text-gray-600 mb-1">Tu enlace corto</div>
            <a
              className="text-lg font-semibold text-blue-600 hover:underline break-all"
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
            >
              {result.shortUrl}
            </a>
            <div className="text-xs text-gray-500 mt-1">
              (Lo copiamos al portapapeles automáticamente)
            </div>
            {result.expiresAt && (
              <div className="text-xs text-gray-600 mt-2">
                Expira: {dayjs(result.expiresAt).format('YYYY-MM-DD HH:mm')}
              </div>
            )}
          </div>
          <div className="shrink-0">
            <QRCodeCanvas
              value={result.shortUrl}
              size={128}
              className="hover:scale-105 transition-transform"
            />
          </div>
        </div>
      )}
    </div>
  );
}
