import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { RiTeamLine, RiCheckboxCircleLine, RiFileTextLine, RiRefreshLine, RiAddLine, RiCloseLine } from 'react-icons/ri'
import api from '../../api/axios'
import { DOCTOR_QUEUE, DOCTOR_COMPLETE_TOKEN, PRESCRIPTION_CREATE } from '../../api/endpoints'
import toast from 'react-hot-toast'

const fmt = (t) => {
  if (!t) return ''
  const [h, m] = t.trim().split(':').map(Number)
  const p = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${p}`
}
const to12hr = (t) => {
  if (!t) return ''
  if (t.includes(' - ')) { const [s, e] = t.split(' - '); return `${fmt(s)} – ${fmt(e)}` }
  return fmt(t)
}

function PrescriptionModal({ token, onClose, onSuccess }) {
  const [form, setForm] = useState({
    diagnosisNotes: '',
    medicines: [{ name: '', timing: [], foodInstruction: 'BEFORE_FOOD', sideEffects: '' }]
  })
  const [loading, setLoading] = useState(false)
  const timingOptions = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']

  const toggleTiming = (medIdx, val) => {
    const meds = [...form.medicines]
    meds[medIdx].timing = meds[medIdx].timing.includes(val)
      ? meds[medIdx].timing.filter(x => x !== val)
      : [...meds[medIdx].timing, val]
    setForm({ ...form, medicines: meds })
  }

  const updateMed = (idx, field, val) => {
    const meds = [...form.medicines]
    meds[idx] = { ...meds[idx], [field]: val }
    setForm({ ...form, medicines: meds })
  }

  const addMed = () => setForm({
    ...form,
    medicines: [...form.medicines, { name: '', timing: [], foodInstruction: 'BEFORE_FOOD', sideEffects: '' }]
  })

  const removeMed = (idx) => setForm({
    ...form,
    medicines: form.medicines.filter((_, i) => i !== idx)
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(PRESCRIPTION_CREATE, { tokenId: token._id, ...form })
      toast.success('Prescription created & emailed to patient!')
      onSuccess()
    } catch {}
    finally { setLoading(false) }
  }

  // ✅ Portal renders modal directly into document.body
  // This escapes ALL parent overflow/transform/z-index constraints
  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div style={{ minHeight: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div
          className="bg-white rounded-3xl w-full shadow-2xl"
          style={{ maxWidth: '672px' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <h3 className="font-display text-xl text-slate-900">
              Create Prescription — Token #{token.tokenNumber}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <RiCloseLine className="text-xl text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {/* Patient info */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-5 text-sm">
              <span className="text-teal-800 font-medium">Patient: </span>
              <span className="text-teal-700">{token.patientDetails?.name}</span>
              <span className="text-teal-400 mx-2">·</span>
              <span className="text-teal-700">Age {token.patientDetails?.age}</span>
              {token.patientDetails?.reason && (
                <>
                  <span className="text-teal-400 mx-2">·</span>
                  <span className="text-teal-600 italic">"{token.patientDetails.reason}"</span>
                </>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Diagnosis */}
              <div>
                <label className="label">Diagnosis Notes</label>
                <textarea
                  value={form.diagnosisNotes}
                  onChange={e => setForm({ ...form, diagnosisNotes: e.target.value })}
                  className="input-field resize-none h-28"
                  placeholder="Enter diagnosis and clinical notes..."
                  required />
              </div>

              {/* Medicines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Medicines</label>
                  <button type="button" onClick={addMed}
                    className="text-sm text-teal-700 flex items-center gap-1 hover:text-teal-800 font-medium">
                    <RiAddLine /> Add Medicine
                  </button>
                </div>
                <div className="space-y-4">
                  {form.medicines.map((med, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Medicine {idx + 1}</span>
                        {form.medicines.length > 1 && (
                          <button type="button" onClick={() => removeMed(idx)}
                            className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50">
                            <RiCloseLine />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Medicine name (e.g. Paracetamol 500mg)"
                        value={med.name}
                        onChange={e => updateMed(idx, 'name', e.target.value)}
                        className="input-field"
                        required />
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-medium">Timing — select all that apply</p>
                        <div className="flex gap-2 flex-wrap">
                          {timingOptions.map(t => (
                            <button key={t} type="button"
                              onClick={() => toggleTiming(idx, t)}
                              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all
                                ${med.timing.includes(t)
                                  ? 'bg-teal-600 text-white border-teal-600'
                                  : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400'}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <select
                        value={med.foodInstruction}
                        onChange={e => updateMed(idx, 'foodInstruction', e.target.value)}
                        className="input-field">
                        <option value="BEFORE_FOOD">Before Food</option>
                        <option value="AFTER_FOOD">After Food</option>
                        <option value="WITH_FOOD">With Food</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Side effects (e.g. Drowsiness, Nausea)"
                        value={med.sideEffects}
                        onChange={e => updateMed(idx, 'sideEffects', e.target.value)}
                        className="input-field"
                        required />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2 pb-2">
                <button type="submit" disabled={loading}
                  className="btn-primary flex items-center gap-2 flex-1 justify-center py-3">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><RiFileTextLine /> Create Prescription</>}
                </button>
                <button type="button" onClick={onClose} className="btn-secondary px-6">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body  // ✅ Renders outside all parent containers
  )
}

export default function DoctorQueuePage() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(null)
  const [prescriptionToken, setPrescriptionToken] = useState(null)

  const fetchQueue = () => {
    setLoading(true)
    api.get(DOCTOR_QUEUE).then(r => setQueue(r.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchQueue() }, [])

  const completeToken = async (tokenId) => {
    setCompleting(tokenId)
    try {
      await api.patch(DOCTOR_COMPLETE_TOKEN(tokenId))
      toast.success('Token marked as completed')
      fetchQueue()
    } catch {}
    finally { setCompleting(null) }
  }

  const pending = queue.filter(t => t.status === 'BOOKED')
  const done    = queue.filter(t => t.status === 'COMPLETED')

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Today's Queue</h1>
          <p className="text-gray-500 mt-1 text-sm">{pending.length} waiting · {done.length} completed</p>
        </div>
        <button onClick={fetchQueue} className="btn-secondary flex items-center gap-2">
          <RiRefreshLine /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-20" />)}</div>
      ) : queue.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <RiTeamLine className="text-5xl mx-auto mb-3 opacity-40" />
          <p className="font-medium text-lg">No patients today</p>
          <p className="text-sm mt-1">Queue is empty for the last 24 hours</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((token) => (
            <div key={token._id}
              className={`card flex flex-wrap items-center gap-4 transition-all
                ${token.status === 'COMPLETED' ? 'opacity-60' : ''}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display text-xl font-bold flex-shrink-0
                ${token.status === 'BOOKED'    ? 'bg-teal-100 text-teal-700' :
                  token.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                 'bg-gray-100 text-gray-500'}`}>
                #{token.tokenNumber}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{token.patientDetails?.name || 'Patient'}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                  <span>Age {token.patientDetails?.age || '—'}</span>
                  <span>·</span>
                  <span>{to12hr(token.slotTime)}</span>
                  {token.patientDetails?.reason && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-[200px] italic">{token.patientDetails.reason}</span>
                    </>
                  )}
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0
                ${token.status === 'BOOKED'    ? 'bg-blue-100 text-blue-700' :
                  token.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                 'bg-red-100 text-red-600'}`}>
                {token.status === 'BOOKED' ? 'Waiting' : token.status === 'COMPLETED' ? 'Done' : 'Cancelled'}
              </span>
              <div className="flex gap-2 flex-shrink-0">
                {token.status === 'BOOKED' && (
                  <button
                    onClick={() => completeToken(token._id)}
                    disabled={completing === token._id}
                    className="inline-flex items-center gap-1.5 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors font-medium">
                    {completing === token._id
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><RiCheckboxCircleLine /> Complete</>}
                  </button>
                )}
                {token.status === 'COMPLETED' && (
                  <button
                    onClick={() => setPrescriptionToken(token)}
                    className="inline-flex items-center gap-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-colors font-medium">
                    <RiFileTextLine /> Prescribe
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {prescriptionToken && (
        <PrescriptionModal
          token={prescriptionToken}
          onClose={() => setPrescriptionToken(null)}
          onSuccess={() => { setPrescriptionToken(null); fetchQueue() }}
        />
      )}
    </div>
  )
}