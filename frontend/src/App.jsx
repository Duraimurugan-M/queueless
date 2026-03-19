import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Public / Landing
import LandingPage from './pages/home/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard'
import BookTokenPage from './pages/patient/BookTokenPage'
import VisitHistoryPage from './pages/patient/VisitHistoryPage'
import PatientProfilePage from './pages/patient/PatientProfilePage'

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorSchedulePage from './pages/doctor/DoctorSchedulePage'
import DoctorQueuePage from './pages/doctor/DoctorQueuePage'

// MD pages
import MdDashboard from './pages/md/MdDashboard'
import MdDepartmentsPage from './pages/md/MdDepartmentsPage'
import MdDoctorsPage from './pages/md/MdDoctorsPage'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) {
    if (user.role === 'PATIENT') return <Navigate to="/patient" replace />
    if (user.role === 'DOCTOR') return <Navigate to="/doctor" replace />
    if (user.role === 'MD') return <Navigate to="/md" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

      {/* Patient */}
      <Route path="/patient" element={<ProtectedRoute allowedRoles={['PATIENT']}><DashboardLayout role="PATIENT" /></ProtectedRoute>}>
        <Route index element={<PatientDashboard />} />
        <Route path="book" element={<BookTokenPage />} />
        <Route path="history" element={<VisitHistoryPage />} />
        <Route path="profile" element={<PatientProfilePage />} />
      </Route>

      {/* Doctor */}
      <Route path="/doctor" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DashboardLayout role="DOCTOR" /></ProtectedRoute>}>
        <Route index element={<DoctorDashboard />} />
        <Route path="schedule" element={<DoctorSchedulePage />} />
        <Route path="queue" element={<DoctorQueuePage />} />
      </Route>

      {/* MD */}
      <Route path="/md" element={<ProtectedRoute allowedRoles={['MD']}><DashboardLayout role="MD" /></ProtectedRoute>}>
        <Route index element={<MdDashboard />} />
        <Route path="departments" element={<MdDepartmentsPage />} />
        <Route path="doctors" element={<MdDoctorsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
