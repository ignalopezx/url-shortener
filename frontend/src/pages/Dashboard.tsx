import UrlList from "../components/UrlList/UrlList"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Gestiona y monitorea todos tus enlaces acortados</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          En tiempo real
        </div>
      </div>
      <UrlList />
    </div>
  )
}
