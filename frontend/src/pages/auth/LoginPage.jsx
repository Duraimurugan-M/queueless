import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiEyeLine, RiEyeOffLine, RiSmartphoneLine, RiLockLine } from 'react-icons/ri'
import api from '../../api/axios'
import { AUTH_LOGIN } from '../../api/endpoints'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Detect mobile (all digits) vs email
      const isMobile = /^\d+$/.test(identifier.trim())
      const payload = isMobile
        ? { mobile: identifier.trim(), password }
        : { email: identifier.trim(), password }

      const { data } = await api.post(AUTH_LOGIN, payload)
      login(data.token, data.role)
      toast.success('Welcome back!')
      if (data.role === 'PATIENT') navigate('/patient')
      else if (data.role === 'DOCTOR') navigate('/doctor')
      else if (data.role === 'MD') navigate('/md')
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <img src="/logo.png" alt="QueueLess" className="w-16 h-16 object-contain drop-shadow-lg" />
            <span className="font-display text-white text-2xl">QueueLess</span>
          </Link>
          <p className="text-teal-200/60 text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-teal-900/30 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email or Mobile Number</label>
              <div className="relative">
                <RiSmartphoneLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="you@email.com or 9876543210"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="input-field pl-10"
                  required
                  autoComplete="username"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Enter your email address or mobile number</p>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm text-teal-700 hover:text-teal-800 font-medium">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account?{' '}
            <Link to="/register" className="text-teal-700 font-medium hover:text-teal-800">Register as patient</Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-teal-300/60 hover:text-teal-300 text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

