import { NavLink } from "react-router-dom"
import { useAuth } from "../context/auth.jsx"

const links = [
  { to: "/app", label: "Dashboard", end: true },
  { to: "/app/fuel-types", label: "Fuel Types" },
  { to: "/app/machines", label: "Machines" },
  { to: "/app/workers", label: "Workers" },
  { to: "/app/live-tracking", label: "Live Tracking" },
  { to: "/app/sales", label: "Sales" },
  { to: "/app/tankers", label: "Tankers" },
  { to: "/app/reports", label: "Reports" },
]

export function Sidebar({ open, setOpen }) {
  const { logout } = useAuth()

  return (
    <>
      {/* Overlay (mobile only) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72
        transform transition-transform duration-300 ease-in-out
        bg-white/90 backdrop-blur-xl
        border-r border-slate-200
        shadow-xl
        dark:bg-slate-900/95 dark:border-slate-800
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800">
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            PetrolOps
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Petrol Pump Management
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 space-y-1">

          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 w-full border-t border-slate-200 dark:border-slate-800 p-4">

          <button
            onClick={logout}
            className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium
            text-slate-700 hover:bg-slate-100
            dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Logout
          </button>

        </div>
      </aside>
    </>
  )
}