import { Outlet } from 'react-router-dom'
import { Sidebar } from '../ui/Sidebar.jsx'
import { Topbar } from '../ui/Topbar.jsx'
import { useTheme } from '../context/theme.jsx'
import bgImage from '../assets/bg.jpg'
import bgLight from '../assets/bglight.jpg'

export function AdminLayout() {
  const { theme } = useTheme()
  const bg = theme === 'dark' ? bgImage : bgLight

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="flex min-h-screen">

        <Sidebar />

        <div className="relative flex min-w-0 flex-1 flex-col">

          {/* Background Image */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Overlay */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-white/70 dark:bg-black/70"></div>

          <div className="relative z-20 flex flex-col flex-1">
            <Topbar />

            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </main>
          </div>

        </div>
      </div>
    </div>
  )
}