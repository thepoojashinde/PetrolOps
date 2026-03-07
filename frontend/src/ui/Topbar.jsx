import { useTheme } from '../context/theme.jsx'
import { useAuth } from '../context/auth.jsx'

export function Topbar() {
  const { theme, toggleTheme } = useTheme()
  const { admin } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Admin Dashboard
          </div>
          <div className="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            Welcome{admin?.email ? `, ${admin.email}` : ''}
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
        </button>
      </div>
    </header>
  )
}

