import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/auth.jsx'

export function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()
  if (loading) return <div className="p-6 text-sm text-slate-500">Loading…</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

