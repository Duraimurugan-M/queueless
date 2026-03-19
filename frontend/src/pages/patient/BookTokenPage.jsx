import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiHospitalLine, RiStethoscopeLine, RiCalendarLine, RiTimeLine, RiUser3Line, RiCheckLine } from 'react-icons/ri'
import api from '../../api/axios'
import { PATIENT_PUBLIC_DEPARTMENTS, PATIENT_PUBLIC_DOCTORS, PATIENT_SLOTS, PATIENT_BOOK_TOKEN } from '../../api/endpoints'
import toast from 'react-hot-toast'

const fmt = (t) => {
  if (!t) return ''
  const [h, m] = t.trim().split(':').map(Number)
  const p = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${p}`
}

// Get today's date in local timezone (IST-safe)
const getToday = () =>
  new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
    .toISOString().split('T')[0]

// Check if a slot time has already passed for today
// slot.start is "HH:MM" in 24hr format
const isSlotPast = (slotStart, selectedDate) => {
  const today = getToday()
  if (selectedDate !== today) return false // future date — never past

  const now = new Date()
  const [slotH, slotM] = slotStart.split(':').map(Number)
  const slotMinutes = slotH * 60 + slotM
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return slotMinutes <= nowMinutes // slot start time has passed
}

export default function BookTokenPage() {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [slots, setSlots] = useState([])
  const [selected, setSelected] = useState({ departmentId: '', doctorId: '', date: '', slot: null })
  const [patientForm, setPatientForm] = useState({ name: '', age: '', dob: '', reason: '' })
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const today = getToday()

  useEffect(() => {
    api.get(PATIENT_PUBLIC_DEPARTMENTS).then(r => setDepartments(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selected.departmentId) { setDoctors([]); return }
    api.get(PATIENT_PUBLIC_DOCTORS)
      .then(r => setDoctors(r.data.filter(d => d.department?._id === selected.departmentId)))
      .catch(() => {})
    setSelected(s => ({ ...s, doctorId: '', slot: null }))
    setSlots([])
  }, [selected.departmentId])

  useEffect(() => {
    if (!selected.doctorId || !selected.date) { setSlots([]); return }
    setLoadingSlots(true)
    api.get(PATIENT_SLOTS, { params: { doctorId: selected.doctorId, date: selected.date } })
      .then(r => setSlots(r.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
    setSelected(s => ({ ...s, slot: null }))
  }, [selected.doctorId, selected.date])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selected.slot) { toast.error('Please select a time slot'); return }
    setLoading(true)
    try {
      await api.post(PATIENT_BOOK_TOKEN, {
        scheduleId: selected.slot.scheduleId,
        slotId: selected.slot._id,
        name: patientForm.name,
        age: parseInt(patientForm.age),
        dob: patientForm.dob || undefined,
        reason: patientForm.reason || undefined,
      })
      toast.success('Token booked! Check your email.')
      navigate('/patient')
    } catch {}
    finally { setLoading(false) }
  }

  const step = !selected.departmentId ? 1 : !selected.doctorId ? 2 : !selected.slot ? 3 : 4

  // Determine slot appearance and clickability
  const getSlotState = (slot) => {
    const past = isSlotPast(slot.start, selected.date)
    if (past && slot.status === 'AVAILABLE') return 'past'
    if (slot.status === 'BOOKED') return 'booked'
    if (slot.status === 'COMPLETED') return 'completed'
    if (slot.status === 'AVAILABLE') return 'available'
    return 'disabled'
  }

  const slotStyle = (slot) => {
    const state = getSlotState(slot)
    if (selected.slot?._id === slot._id)
      return { cls: 'border-teal-600 bg-teal-50 text-teal-700 font-semibold cursor-pointer', disabled: false }

    switch (state) {
      case 'available':
        return { cls: 'border-gray-200 hover:border-teal-400 text-gray-700 cursor-pointer bg-white', disabled: false }
      case 'past':
        // Time passed — show with strikethrough-like style, darker gray, not clickable
        return { cls: 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through opacity-60', disabled: true }
      case 'booked':
        return { cls: 'border-blue-300 bg-blue-50 text-blue-400 cursor-not-allowed opacity-70', disabled: true }
      case 'completed':
        return { cls: 'border-green-300 bg-green-50 text-green-400 cursor-not-allowed opacity-60', disabled: true }
      default:
        return { cls: 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed', disabled: true }
    }
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <div>
        <h1 className="font-display text-3xl text-slate-900">Book Token</h1>
        <p className="text-gray-500 mt-1">Follow the steps to book your appointment</p>
      </div>

      {/* Step bar */}
      <div className="flex items-center gap-1">
        {['Department', 'Doctor', 'Slot', 'Details'].map((label, i) => {
          const s = i + 1
          const done = step > s
          const active = step === s
          return (
            <div key={label} className="flex items-center gap-1 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                ${done ? 'bg-teal-600 text-white' : active ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-400' : 'bg-gray-100 text-gray-400'}`}>
                {done ? <RiCheckLine /> : s}
              </div>
              <span className={`text-xs font-medium hidden sm:block mr-1 ${active ? 'text-teal-700' : done ? 'text-teal-500' : 'text-gray-400'}`}>{label}</span>
              {i < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-teal-400' : 'bg-gray-200'}`} />}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Department */}
        <div className="card">
          <h2 className="font-display text-lg text-slate-900 flex items-center gap-2 mb-4">
            <RiHospitalLine className="text-teal-600" /> Department
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {departments.length === 0 && <p className="text-sm text-gray-400 col-span-3">No departments available</p>}
            {departments.map(dept => (
              <button key={dept._id} type="button"
                onClick={() => setSelected(s => ({ ...s, departmentId: dept._id, doctorId: '', slot: null }))}
                className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all
                  ${selected.departmentId === dept._id ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-teal-300 text-gray-700'}`}>
                {dept.name}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor */}
        {selected.departmentId && (
          <div className="card animate-slide-up">
            <h2 className="font-display text-lg text-slate-900 flex items-center gap-2 mb-4">
              <RiStethoscopeLine className="text-teal-600" /> Doctor
            </h2>
            {doctors.length === 0
              ? <p className="text-sm text-gray-400">No doctors in this department yet</p>
              : <div className="space-y-2">
                  {doctors.map(doc => (
                    <button key={doc._id} type="button"
                      onClick={() => setSelected(s => ({ ...s, doctorId: doc._id, slot: null }))}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left w-full transition-all
                        ${selected.doctorId === doc._id ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}>
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <RiStethoscopeLine className="text-teal-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{doc.user?.name}</p>
                        <p className="text-xs text-gray-500">{doc.specialization}</p>
                      </div>
                    </button>
                  ))}
                </div>
            }
          </div>
        )}

        {/* Date & Slot */}
        {selected.doctorId && (
          <div className="card animate-slide-up">
            <h2 className="font-display text-lg text-slate-900 flex items-center gap-2 mb-4">
              <RiCalendarLine className="text-teal-600" /> Date & Time Slot
            </h2>
            <div className="mb-4">
              <label className="label">Appointment Date</label>
              <input type="date" min={today} value={selected.date}
                onChange={e => setSelected(s => ({ ...s, date: e.target.value, slot: null }))}
                className="input-field w-auto" />
            </div>

            {selected.date && (
              loadingSlots
                ? <div className="grid grid-cols-3 gap-2">{Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-14" />)}</div>
                : slots.length === 0
                  ? <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">No slots for this date.</p>
                  : <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slots.map(slot => {
                          const { cls, disabled } = slotStyle(slot)
                          const isClickable = !disabled && slot.status === 'AVAILABLE'
                          return (
                            <button
                              key={slot._id}
                              type="button"
                              disabled={disabled}
                              onClick={() => isClickable && setSelected(s => ({ ...s, slot }))}
                              className={`p-3 rounded-xl border-2 text-center text-sm transition-all ${cls}`}>
                              <RiTimeLine className="mx-auto mb-1" />
                              <p>{fmt(slot.start)}</p>
                              <p className="text-xs opacity-60">#{slot.tokenNumber}</p>
                            </button>
                          )
                        })}
                      </div>

                      {/* Legend — Available + Booked only */}
                      <div className="flex gap-5 mt-4 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <span className="w-3.5 h-3.5 rounded border-2 border-gray-300 bg-white inline-block" />
                          Available
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <span className="w-3.5 h-3.5 rounded border-2 border-blue-300 bg-blue-50 inline-block" />
                          Booked
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <span className="w-3.5 h-3.5 rounded border-2 border-gray-200 bg-gray-100 inline-block" />
                          Passed
                        </span>
                      </div>
                    </>
            )}
          </div>
        )}

        {/* Patient Details */}
        {selected.slot && (
          <div className="card animate-slide-up">
            <h2 className="font-display text-lg text-slate-900 flex items-center gap-2 mb-4">
              <RiUser3Line className="text-teal-600" /> Patient Details
            </h2>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-5 text-sm">
              <p className="font-semibold text-teal-800 mb-1">Booking Summary</p>
              <p className="text-teal-700">
                Slot: <strong>{fmt(selected.slot.start)} – {fmt(selected.slot.end)}</strong> · Token #{selected.slot.tokenNumber} · Date: <strong>{selected.date}</strong>
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Patient Name</label>
                <input type="text" placeholder="Full name" value={patientForm.name}
                  onChange={e => setPatientForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="label">Age</label>
                <input type="number" placeholder="Age" min={1} max={150} value={patientForm.age}
                  onChange={e => setPatientForm(f => ({ ...f, age: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="label">Date of Birth <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="date" value={patientForm.dob}
                  onChange={e => setPatientForm(f => ({ ...f, dob: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Reason for Visit <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" placeholder="e.g. Fever, Checkup" value={patientForm.reason}
                  onChange={e => setPatientForm(f => ({ ...f, reason: e.target.value }))} className="input-field" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base mt-6">
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Confirm Booking'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}