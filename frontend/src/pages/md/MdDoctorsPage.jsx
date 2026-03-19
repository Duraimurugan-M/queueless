import { useEffect, useState } from 'react'
import {
  RiStethoscopeLine, RiAddLine, RiCloseLine, RiEditLine,
  RiSaveLine, RiToggleLine, RiMailLine, RiPhoneLine
} from 'react-icons/ri'
import api from '../../api/axios'
import { MD_DOCTORS, MD_CREATE_DOCTOR, MD_DEPARTMENTS, MD_UPDATE_DOCTOR, MD_TOGGLE_DOCTOR_STATUS } from '../../api/endpoints'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', email: '', mobile: '', password: '', departmentId: '', specialization: '' }

export default function MdDoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingDoc, setEditingDoc] = useState(null)
  const [editForm, setEditForm] = useState({ specialization: '', departmentId: '' })
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')

  const fetchDoctors = () => {
    api.get(MD_DOCTORS).then(r => setDoctors(r.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDoctors()
    api.get(MD_DEPARTMENTS).then(r => setDepartments(r.data || []))
  }, [])

  const set = f => e => setForm({ ...form, [f]: e.target.value })

  const createDoctor = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post(MD_CREATE_DOCTOR, form)
      toast.success('Doctor account created!')
      setForm(EMPTY_FORM)
      setShowForm(false)
      fetchDoctors()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create doctor'
      toast.error(msg)
    } finally { setCreating(false) }
  }

  const startEdit = (doc) => {
    setEditingDoc(doc._id)
    setEditForm({ specialization: doc.specialization, departmentId: doc.department?._id || '' })
  }

  const saveEdit = async (id) => {
    setSaving(true)
    try {
      await api.patch(MD_UPDATE_DOCTOR(id), editForm)
      toast.success('Doctor updated!')
      setEditingDoc(null)
      fetchDoctors()
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const toggleStatus = async (id) => {
    setToggling(id)
    try {
      const { data } = await api.patch(MD_TOGGLE_DOCTOR_STATUS(id))
      toast.success(data.message)
      fetchDoctors()
    } catch { toast.error('Failed to update status') }
    finally { setToggling(null) }
  }

  const filtered = doctors.filter(d =>
    filterStatus === 'ALL' ? true : filterStatus === 'ACTIVE' ? d.isAvailable : !d.isAvailable
  )
  const activeCount   = doctors.filter(d => d.isAvailable).length
  const inactiveCount = doctors.filter(d => !d.isAvailable).length

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Doctors</h1>
          <p className="text-gray-500 mt-1 text-sm">{activeCount} active · {inactiveCount} inactive</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          {showForm ? <RiCloseLine /> : <RiAddLine />}
          {showForm ? 'Cancel' : 'Add Doctor'}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'ALL',      label: `All (${doctors.length})` },
          { key: 'ACTIVE',   label: `Active (${activeCount})` },
          { key: 'INACTIVE', label: `Inactive (${inactiveCount})` },
        ].map(t => (
          <button key={t.key} onClick={() => setFilterStatus(t.key)}
            className={`text-sm px-4 py-2 rounded-xl font-medium transition-all
              ${filterStatus === t.key ? 'bg-teal-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card border-2 border-teal-200 animate-slide-up">
          <h2 className="font-display text-lg text-slate-900 mb-5">New Doctor Account</h2>
          <form onSubmit={createDoctor} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" placeholder="Dr. Jane Smith" value={form.name} onChange={set('name')} className="input-field" required />
            </div>
            <div>
              <label className="label">Mobile Number</label>
              <input type="tel" placeholder="9876543210" value={form.mobile} onChange={set('mobile')} className="input-field" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Email Address <span className="text-gray-400 font-normal">(optional — for email login)</span></label>
              <input type="email" placeholder="doctor@hospital.com" value={form.email} onChange={set('email')} className="input-field" />
            </div>
            <div>
              <label className="label">Department</label>
              <select value={form.departmentId} onChange={set('departmentId')} className="input-field" required>
                <option value="">— Select department —</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Specialization</label>
              <input type="text" placeholder="e.g. Cardiologist" value={form.specialization} onChange={set('specialization')} className="input-field" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Initial Password</label>
              <input type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} className="input-field" required minLength={6} />
              <p className="text-xs text-gray-400 mt-1">Doctor logs in using mobile or email + this password.</p>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                {creating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><RiStethoscopeLine /> Create Doctor</>}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Doctors list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <RiStethoscopeLine className="text-5xl mx-auto mb-3 opacity-40" />
            <p className="font-medium">No doctors found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(doc => (
              <div key={doc._id} className={`p-5 transition-colors ${!doc.isAvailable ? 'bg-gray-50/70 opacity-75' : 'hover:bg-gray-50'}`}>
                <div className="flex items-start gap-4 flex-wrap">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${doc.isAvailable ? 'bg-teal-100' : 'bg-gray-200'}`}>
                    <RiStethoscopeLine className={`text-xl ${doc.isAvailable ? 'text-teal-700' : 'text-gray-400'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800">{doc.user?.name}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${doc.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {doc.isAvailable ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {editingDoc === doc._id ? (
                      <div className="grid sm:grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="label text-xs">Specialization</label>
                          <input type="text" value={editForm.specialization}
                            onChange={e => setEditForm(f => ({ ...f, specialization: e.target.value }))}
                            className="input-field py-1.5 text-sm" />
                        </div>
                        <div>
                          <label className="label text-xs">Department</label>
                          <select value={editForm.departmentId}
                            onChange={e => setEditForm(f => ({ ...f, departmentId: e.target.value }))}
                            className="input-field py-1.5 text-sm">
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                          </select>
                        </div>
                        <div className="sm:col-span-2 flex gap-2">
                          <button onClick={() => saveEdit(doc._id)} disabled={saving}
                            className="inline-flex items-center gap-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
                            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><RiSaveLine /> Save</>}
                          </button>
                          <button onClick={() => setEditingDoc(null)} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                        <span>{doc.specialization}</span>
                        <span className="text-gray-300">•</span>
                        <span>{doc.department?.name}</span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1"><RiPhoneLine className="text-xs" />{doc.user?.mobile}</span>
                        {doc.user?.email && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1"><RiMailLine className="text-xs" />{doc.user?.email}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {editingDoc !== doc._id && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => startEdit(doc)}
                        className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-teal-700 bg-white hover:bg-teal-50 border border-gray-200 px-3 py-2 rounded-lg font-medium transition-colors">
                        <RiEditLine /> Edit
                      </button>
                      <button onClick={() => toggleStatus(doc._id)} disabled={toggling === doc._id}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors
                          ${doc.isAvailable
                            ? 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200'
                            : 'text-green-700 bg-green-50 hover:bg-green-100 border-green-200'}`}>
                        {toggling === doc._id
                          ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          : <><RiToggleLine />{doc.isAvailable ? 'Deactivate' : 'Activate'}</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
