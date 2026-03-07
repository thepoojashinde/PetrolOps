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

  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [confirmPassword,setConfirmPassword] = useState('')
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)

  const onSubmit = async (e) => {

    e.preventDefault()
    setError("")

    if(password !== confirmPassword){
      setError("Passwords do not match")
      return
    }

    if(password.length < 8){
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try{

      await register({ email,password })

      navigate('/app',{ replace:true })

    }catch(err){

      setError(err?.response?.data?.message || err?.message || "Sign up failed")

    }finally{

      setLoading(false)

    }

  }

  return(

    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        backgroundImage:`url(${theme === 'dark' ? bgImage : bgLight})`,
        backgroundSize:'cover',
        backgroundPosition:'center',
        backgroundAttachment:'fixed'
      }}
    >

      {/* overlay */}

      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70" />

      <div className="relative z-10 w-full max-w-sm">

        <div className="rounded-xl border border-white/20 bg-white/95 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90">

          {/* header */}

          <div className="flex items-start justify-between gap-3">

            <div>

              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                PetrolOps
              </h1>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Create admin account
              </p>

            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg border border-slate-300 bg-white/80 px-2 py-1 text-xs hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

          </div>


          {/* form */}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">

            <div>

              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Email
              </label>

              <input
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                type="email"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="you@example.com"
                required
              />

            </div>


            <div>

              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Password
              </label>

              <input
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />

            </div>


            <div>

              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Confirm password
              </label>

              <input
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Repeat password"
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
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Sign up"}
            </button>


            <p className="text-center text-xs text-slate-600 dark:text-slate-400">

              Already have an account?{" "}

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