import { useEffect, useState } from 'react'
import { RiBuildingLine, RiAddLine, RiEditLine, RiSaveLine, RiCloseLine } from 'react-icons/ri'
import api from '../../api/axios'
import { MD_DEPARTMENTS, MD_CREATE_DEPARTMENT, MD_UPDATE_DEPARTMENT } from '../../api/endpoints'
import toast from 'react-hot-toast'

export default function MdDepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchDepts = () => {
    api.get(MD_DEPARTMENTS).then(r => setDepartments(r.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchDepts() }, [])

  const create = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post(MD_CREATE_DEPARTMENT, { name: newName })
      toast.success('Department created!')
      setNewName('')
      setShowForm(false)
      fetchDepts()
    } catch (err) {
      if (err.response?.status === 409) toast.error('Department already exists')
    } finally { setCreating(false) }
  }

  const startEdit = (dept) => {
    setEditingId(dept._id)
    setEditName(dept.name)
  }

  const saveEdit = async (id) => {
    setSaving(true)
    try {
      await api.patch(MD_UPDATE_DEPARTMENT(id), { name: editName })
      toast.success('Department updated!')
      setEditingId(null)
      fetchDepts()
    } catch (err) {
      if (err.response?.status === 409) toast.error('Name already exists')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Departments</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage hospital departments</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          {showForm ? <RiCloseLine /> : <RiAddLine />}
          {showForm ? 'Cancel' : 'Add Department'}
        </button>
      </div>

      {showForm && (
        <div className="card border-2 border-teal-200 animate-slide-up">
          <h2 className="font-display text-lg text-slate-900 mb-4">New Department</h2>
          <form onSubmit={create} className="flex gap-3">
            <input type="text" placeholder="e.g. Cardiology" value={newName}
              onChange={e => setNewName(e.target.value)} className="input-field flex-1" required />
            <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
              {creating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16" />)}</div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <RiBuildingLine className="text-5xl mx-auto mb-3 opacity-40" />
            <p className="font-medium">No departments yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {departments.map((dept, idx) => (
              <div key={dept._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <RiBuildingLine className="text-purple-700" />
                </div>

                <div className="flex-1 min-w-0">
                  {editingId === dept._id ? (
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                      className="input-field py-1.5 text-sm" autoFocus />
                  ) : (
                    <>
                      <p className="font-semibold text-slate-800">{dept.name}</p>
                      <p className="text-xs text-teal-600 font-mono font-medium mt-0.5">
                        {dept.deptId || `DEPT-${String(idx + 1).padStart(3, '0')}`}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {editingId === dept._id ? (
                    <>
                      <button onClick={() => saveEdit(dept._id)} disabled={saving}
                        className="inline-flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                        {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><RiSaveLine /> Save</>}
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg border border-gray-200 bg-white">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(dept)}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-teal-600 bg-white hover:bg-teal-50 border border-gray-200 px-3 py-1.5 rounded-lg font-medium transition-colors">
                      <RiEditLine /> Edit
                    </button>
                  )}
                  <span className="text-xs text-gray-400 w-6 text-right">#{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
