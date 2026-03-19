import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RiHospitalLine, RiMailLine, RiLockLine, RiShieldKeyholeLine } from 'react-icons/ri'
import api from '../../api/axios'
import { AUTH_FORGOT_PASSWORD, AUTH_RESET_PASSWORD } from '../../api/endpoints'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1=email, 2=otp+new pw
  const [email, setEmail] = useState('')
  const [form, setForm] = useState({ otp: '', newPassword: '', confirmNewPassword: '' })
  const [loading, setLoading] = useState(false)

  const sendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(AUTH_FORGOT_PASSWORD, { email })
      toast.success('OTP sent to your email!')
      setStep(2)
    } catch {}
    finally { setLoading(false) }
  }

  const resetPw = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(AUTH_RESET_PASSWORD, { email, ...form })
      toast.success('Password reset successfully!')
      window.location.href = '/login'
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <img src="/logo.png" alt="QueueLess" className="w-16 h-16 object-contain drop-shadow-lg" />
            <span className="font-display text-white text-2xl">QueueLess</span>
          </Link>
          <p className="text-teal-200/60 text-sm mt-2">
            {step === 1 ? 'Reset your password' : 'Enter OTP & new password'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-teal-900/30 p-8">
          {step === 1 ? (
            <form onSubmit={sendOTP} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" placeholder="your@email.com" value={email}
                    onChange={e => setEmail(e.target.value)} className="input-field pl-10" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPw} className="space-y-4">
              <div>
                <label className="label">OTP Code</label>
                <div className="relative">
                  <RiShieldKeyholeLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="6-digit OTP" value={form.otp}
                    onChange={e => setForm({ ...form, otp: e.target.value })} className="input-field pl-10" required maxLength={6} />
                </div>
              </div>
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" placeholder="Min 6 characters" value={form.newPassword}
                    onChange={e => setForm({ ...form, newPassword: e.target.value })} className="input-field pl-10" required />
                </div>
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" placeholder="Re-enter password" value={form.confirmNewPassword}
                    onChange={e => setForm({ ...form, confirmNewPassword: e.target.value })} className="input-field pl-10" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-400 hover:text-gray-600 text-center mt-1">
                ← Back
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Remember it?{' '}
            <Link to="/login" className="text-teal-700 font-medium hover:text-teal-800">Sign in</Link>
          </p>
        </div>

        {/* ✅ Back to home */}
        <div className="text-center mt-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-teal-300/60 hover:text-teal-300 text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
