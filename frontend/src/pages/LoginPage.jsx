import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth.jsx'
import { useTheme } from '../context/theme.jsx'
import bgImage from '../assets/bg.jpg'
import bgLight from '../assets/bglight.jpg'

export function LoginPage() {

  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [email, setEmail] = useState(() =>
    import.meta.env.DEV && import.meta.env.VITE_DEMO_EMAIL ? import.meta.env.VITE_DEMO_EMAIL : ''
  )

  const [password, setPassword] = useState(() =>
    import.meta.env.DEV && import.meta.env.VITE_DEMO_PASSWORD ? import.meta.env.VITE_DEMO_PASSWORD : ''
  )

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ email, password })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (

    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        backgroundImage: `url(${theme === 'dark' ? bgImage : bgLight})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >

      {/* overlay */}

      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70" aria-hidden />

      <div className="relative z-10 w-full max-w-sm">

        <div className="rounded-xl border border-white/20 bg-white/95 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90">

          <div className="flex items-start justify-between gap-3">

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                PetrolOps
              </h1>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Admin login
              </p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg border border-slate-300 bg-white/80 px-2 py-1 text-xs text-slate-700 hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Email
              </label>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Password
              </label>

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="text-center text-xs text-slate-600 dark:text-slate-400">

              <p>
                No account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Sign up
                </Link>
              </p>

            </div>

          </form>

        </div>

      </div>

    </div>
  )
}