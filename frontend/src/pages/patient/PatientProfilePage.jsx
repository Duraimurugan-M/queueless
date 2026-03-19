import { useEffect, useState } from 'react'
import {
  RiUserLine, RiPhoneLine, RiMailLine, RiCalendarLine,
  RiEditLine, RiSaveLine, RiCloseLine, RiShieldCheckLine,
  RiIdCardLine, RiTimeLine
} from 'react-icons/ri'
import api from '../../api/axios'
import { PATIENT_PROFILE, PATIENT_PROFILE_UPDATE } from '../../api/endpoints'
import toast from 'react-hot-toast'

function InfoRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="text-teal-700 text-base" />
      </div>
      <div>
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`text-slate-800 font-medium text-sm ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
      </div>
    </div>
  )
}

export default function PatientProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', age: '' })

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(PATIENT_PROFILE)
      setProfile(data)
      setForm({ name: data.name || '', email: data.email || '', age: data.age || '' })
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProfile() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(PATIENT_PROFILE_UPDATE, {
        name: form.name,
        email: form.email,
        age: parseInt(form.age),
      })
      toast.success('Profile updated successfully!')
      setEditing(false)
      fetchProfile()
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PT'

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-slate-900">My Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">View and update your personal details</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Profile Header Card */}
          <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-display text-2xl font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-display text-2xl leading-tight truncate">{profile?.name}</h2>
              <p className="text-teal-200 text-sm mt-0.5">{profile?.email || 'No email set'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 text-xs bg-white/15 text-teal-100 px-2.5 py-1 rounded-full font-medium">
                  <RiShieldCheckLine className="text-sm" />
                  Verified Patient
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-white/15 text-teal-100 px-2.5 py-1 rounded-full font-mono font-medium">
                  {profile?.displayId}
                </span>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 flex-shrink-0
                ${editing ? 'bg-white/20 text-white' : 'bg-white text-teal-700 hover:bg-teal-50'}`}
            >
              {editing ? <><RiCloseLine /> Cancel</> : <><RiEditLine /> Edit</>}
            </button>
          </div>

          {/* Edit Form */}
          {editing && (
            <div className="bg-white rounded-2xl border-2 border-teal-200 p-6 shadow-sm animate-slide-up">
              <h3 className="font-display text-lg text-slate-900 mb-5 flex items-center gap-2">
                <RiEditLine className="text-teal-600" /> Edit Profile
              </h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input type="text" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="input-field" placeholder="Your full name" required />
                  </div>
                  <div>
                    <label className="label">Age</label>
                    <input type="number" value={form.age} min={1} max={150}
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                      className="input-field" placeholder="Your age" />
                  </div>
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field" placeholder="your@email.com" />
                  <p className="text-xs text-gray-400 mt-1">Used for booking confirmations and prescriptions</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="btn-primary flex items-center gap-2 py-2.5 px-6">
                    {saving
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><RiSaveLine /> Save Changes</>}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Profile Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-display text-lg text-slate-900">Personal Information</h3>
              <span className="text-xs text-gray-400">Member since {joinedDate}</span>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-3">
              <InfoRow icon={RiUserLine}      label="Full Name"    value={profile?.name} />
              <InfoRow icon={RiIdCardLine}    label="Patient ID"   value={profile?.displayId} mono />
              <InfoRow icon={RiPhoneLine}     label="Mobile"       value={profile?.mobile} mono />
              <InfoRow icon={RiMailLine}      label="Email"        value={profile?.email} />
              <InfoRow icon={RiCalendarLine}  label="Age"          value={profile?.age ? `${profile.age} years` : null} />
              <InfoRow icon={RiTimeLine}      label="Registered On" value={joinedDate} />
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-display text-lg text-slate-900">Account</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                    <RiShieldCheckLine className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Account Status</p>
                    <p className="text-xs text-gray-400">Your account is active and verified</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">Active</span>
              </div>
              <p className="text-xs text-gray-400 px-1">
                To change your password, use "Forgot Password" on the login page.
                Mobile number cannot be changed — contact hospital reception.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
