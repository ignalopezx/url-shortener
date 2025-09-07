import ShortenForm from "../components/ShortenForm/ShortenForm"

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
          Acortador de URLs
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Transforma tus enlaces largos en URLs cortas y elegantes. Incluye estadísticas detalladas y códigos QR
          automáticos.
        </p>
      </div>

      <ShortenForm />

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-blue-100 dark:border-slate-600">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-700 dark:text-slate-200 font-medium">💡 Consejo profesional</p>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
              Usá el <strong className="text-slate-800 dark:text-white">Dashboard</strong> para gestionar tus URLs, ver
              estadísticas detalladas y administrar tus enlaces.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
