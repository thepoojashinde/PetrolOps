import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth.jsx'
import { useTheme } from '../context/theme.jsx'
import bgImage from '../assets/bg.jpg'
import bgLight from '../assets/bglight.jpg'

export function SignUpPage() {
  const { register } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await register({ email, password })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        backgroundImage: `url(${theme === 'dark' ? bgImage : bgLight})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay: lighter in light mode, darker in dark mode */}
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 via-transparent to-slate-900/20 dark:from-indigo-900/20 dark:to-slate-900/30" aria-hidden />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                PetrolOps
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Create an admin account
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="signup-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Email
              </label>
              <input
                id="signup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Password
              </label>
              <input
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="signup-confirm" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Confirm password
              </label>
              <input
                id="signup-confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="Repeat password"
                required
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 disabled:opacity-60 dark:shadow-indigo-900/30"
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
