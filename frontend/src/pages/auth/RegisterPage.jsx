import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiHospitalLine, RiEyeLine, RiEyeOffLine, RiUserLine, RiMailLine, RiSmartphoneLine, RiLockLine } from 'react-icons/ri'
import api from '../../api/axios'
import { AUTH_REGISTER } from '../../api/endpoints'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '', age: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(AUTH_REGISTER, { ...form, age: parseInt(form.age) })
      toast.success('Registered successfully! Please login.')
      navigate('/login')
    } catch (err) {
      // handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <img src="/logo.png" alt="QueueLess" className="w-16 h-16 object-contain drop-shadow-lg" />
            <span className="font-display text-white text-2xl">QueueLess</span>
          </Link>
          <p className="text-teal-200/60 text-sm mt-2">Create your patient account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-teal-900/30 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="John Doe" value={form.name} onChange={set('name')} className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label className="label">Mobile Number</label>
              <div className="relative">
                <RiSmartphoneLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" placeholder="9876543210" value={form.mobile} onChange={set('mobile')} className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} className="input-field pl-10" required />
              </div>
            </div>

            <div>
              <label className="label">Age</label>
              <input type="number" placeholder="25" min={1} max={150} value={form.age} onChange={set('age')} className="input-field" required />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={set('password')} className="input-field pl-10 pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base mt-2">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
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
