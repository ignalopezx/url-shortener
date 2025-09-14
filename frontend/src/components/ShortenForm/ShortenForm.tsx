"use client"

import type React from "react"
import { useState } from "react"
import { shorten } from "../../services/api"
import type { ShortenResponse } from "../../types/types"
import { copy } from "../../utils/copy"
import dayjs from "dayjs"
import { QRCodeCanvas } from "qrcode.react"

const SHORT_BASE = import.meta.env.VITE_SHORT_BASE ?? "https://url-shortener-1-9ih9.onrender.com"

export default function ShortenForm() {
  const [originalUrl, setOriginalUrl] = useState("")
  const [customAlias, setCustomAlias] = useState("")
  const [expiresAt, setExpiresAt] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ShortenResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const minDate = dayjs().add(1, "day").format("YYYY-MM-DD")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const u = new URL(originalUrl)
      if (!u.protocol.startsWith("http")) throw new Error("URL debe iniciar con http(s)://")
    } catch {
      setLoading(false)
      setError("URL inválida (debe incluir http(s)://)")
      return
    }

    try {
      const payload = {
        originalUrl,
        customAlias: customAlias.trim() || undefined,
        expiresAt: expiresAt ? dayjs(expiresAt).endOf("day").toISOString() : undefined,
      }
      const r = await shorten(payload)
      setResult(r)
      await copy(r.shortUrl)
    } catch (err: unknown) {
      let msg = "Ocurrió un error inesperado, revisá los datos."

      if (err instanceof Error) {
        if (err.message.includes("409")) {
          msg = "Ese alias ya está en uso, probá con otro 😉"
        } else if (err.message.includes("500")) {
          msg = "Máximo de caracteres alcanzado o error en el servidor."
        }
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const shortPreview = customAlias ? `${SHORT_BASE}/${customAlias}` : undefined

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/60 dark:border-slate-700 overflow-hidden transition-colors">
      <div className="p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">URL original</label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-600 transition-all placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white"
                placeholder="https://ejemplo.com/mi-articulo-muy-largo"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="w-5 h-5 text-slate-400 dark:text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Custom Alias */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Alias personalizado
              </label>
              <div className="space-y-2">
                <input
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:border-transparent focus:bg-white dark:focus:bg-slate-600 transition-all placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white font-mono text-sm ${
                    customAlias.length >= 16
                      ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                      : "border-slate-200 dark:border-slate-600 focus:ring-blue-500"
                  }`}
                  placeholder="mi-enlace"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  maxLength={16}
                />
                <div className="flex justify-between items-center text-xs">
                  {shortPreview && (
                    <p className="text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                      {shortPreview}
                    </p>
                  )}
                  <span
                    className={`ml-auto ${customAlias.length >= 16 ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}
                  >
                    {customAlias.length}/16
                  </span>
                </div>
              </div>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Fecha de expiración
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-slate-600 transition-all text-slate-900 dark:text-white"
                min={minDate}
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">Por defecto: 7 días</p>
            </div>

            {/* Submit Button */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 opacity-0">Acción</label>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creando…
                  </div>
                ) : (
                  "Acortar URL"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <div className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">Error</p>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-1 text-center lg:text-left space-y-3">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-green-800 dark:text-green-200 font-semibold">¡Enlace creado exitosamente!</span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-green-700 dark:text-green-300">Tu enlace corto:</p>
                  <a
                    className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors break-all block"
                    href={result.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {result.shortUrl}
                  </a>
                </div>

                <div className="flex items-center gap-2 justify-center lg:justify-start text-sm text-green-600 dark:text-green-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Copiado al portapapeles automáticamente
                </div>

                {result.expiresAt && (
                  <p className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full inline-block">
                    Expira: {dayjs(result.expiresAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                <div className="p-4 bg-white dark:bg-slate-700 rounded-2xl shadow-lg">
                  <QRCodeCanvas
                    value={result.shortUrl}
                    size={120}
                    className="hover:scale-105 transition-transform"
                    level="M"
                    includeMargin={true}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">Código QR</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
