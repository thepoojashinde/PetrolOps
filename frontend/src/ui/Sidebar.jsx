import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/auth.jsx'

const links = [
  { to: '/app', label: 'Dashboard', end: true },
  { to: '/app/fuel-types', label: 'Fuel Types' },
  { to: '/app/machines', label: 'Machines' },
  { to: '/app/workers', label: 'Workers' },
  { to: '/app/live-tracking', label: 'Live Tracking' },
  { to: '/app/sales', label: 'Sales' },
  { to: '/app/tankers', label: 'Tankers' },
  { to: '/app/reports', label: 'Reports' },
]

export function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60 lg:block">
      <div className="px-5 py-6">
        <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          PetrolOps
        </div>
        <div className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          Petrol Pump Management
        </div>
      </div>

      <nav className="px-3 pb-6">
        <div className="space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                [
                  'block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                ].join(' ')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="mt-[330px] border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Logout
          </button>
        </div>
      </nav>
    </aside>
  )
}

