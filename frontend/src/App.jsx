import { Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/theme.jsx'
import { AuthProvider } from './context/auth.jsx'
import { ToastProvider } from './context/toast.jsx'
import { ProtectedRoute } from './routes/ProtectedRoute.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { SignUpPage } from './pages/SignUpPage.jsx'
import { AdminLayout } from './layout/AdminLayout.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { FuelTypesPage } from './pages/FuelTypesPage.jsx'
import { MachinesPage } from './pages/MachinesPage.jsx'
import { WorkersPage } from './pages/WorkersPage.jsx'
import { LiveTrackingPage } from './pages/LiveTrackingPage.jsx'
import { SalesPage } from './pages/SalesPage.jsx'
import { TankersPage } from './pages/TankersPage.jsx'
import { ReportsPage } from './pages/ReportsPage.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="fuel-types" element={<FuelTypesPage />} />
            <Route path="machines" element={<MachinesPage />} />
            <Route path="workers" element={<WorkersPage />} />
            <Route path="live-tracking" element={<LiveTrackingPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="tankers" element={<TankersPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
