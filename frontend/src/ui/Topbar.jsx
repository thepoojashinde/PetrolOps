import { useTheme } from '../context/theme.jsx'
import { useAuth } from '../context/auth.jsx'

export function Topbar({ setOpen }) {
  const { theme, toggleTheme } = useTheme()
  const { admin } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:px-6 lg:px-8">

      <div className="flex items-center justify-between gap-4">

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">

          {/* ✅ hamburger button */}
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-xl"
          >
            ☰
          </button>

          <div className="min-w-0">
            <div className="truncate text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Admin Dashboard
            </div>

            <div className="truncate text-sm sm:text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              Welcome{admin?.email ? `, ${admin.email}` : ''}
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <button
          type="button"
          onClick={toggleTheme}
          className="text-xl"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

      </div>

    </header>
  )
}