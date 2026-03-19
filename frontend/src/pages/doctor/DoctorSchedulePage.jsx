import { useState, useEffect } from 'react'
import { RiCalendarLine, RiTimeLine, RiAddLine } from 'react-icons/ri'
import api from '../../api/axios'
import { DOCTOR_CREATE_SCHEDULE, DOCTOR_GET_SCHEDULE } from '../../api/endpoints'
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

export default function DoctorSchedulePage() {
const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]

  // viewDate auto-starts as today and auto-fetches today's schedule on mount
  const [viewDate, setViewDate] = useState(today)
  const [schedule, setSchedule] = useState(null)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: today, startTime: '09:00', endTime: '17:00',
    breakStart: '13:00', breakEnd: '14:00', slotDuration: 15,
  })

  // Auto-fetch today's schedule on mount
  useEffect(() => { fetchSchedule(today) }, [])

  const fetchSchedule = async (date) => {
    setScheduleLoading(true)
    try {
      const r = await api.get(DOCTOR_GET_SCHEDULE, { params: { date } })
      setSchedule(r.data?.slots ? r.data : null)
    } catch { setSchedule(null) }
    finally { setScheduleLoading(false) }
  }

  const handleDateChange = (date) => {
    setViewDate(date)
    fetchSchedule(date)
  }

  const createSchedule = async (e) => {
    e.preventDefault()
    // Extra guard: block past dates
    if (form.date < today) {
      toast.error('Cannot create schedule for a past date')
      return
    }
    setCreating(true)
    try {
      await api.post(DOCTOR_CREATE_SCHEDULE, { ...form, slotDuration: parseInt(form.slotDuration) })
      toast.success('Schedule created!')
      setShowForm(false)
      setViewDate(form.date)
      fetchSchedule(form.date)
    } catch (err) {
      if (err.response?.status === 409) toast.error('Schedule already exists for this date')
    } finally { setCreating(false) }
  }

  const set = f => e => setForm({ ...form, [f]: e.target.value })

  const slotStatusColor = {
    AVAILABLE: 'bg-teal-50 border-teal-400 text-teal-700',
    BOOKED:    'bg-blue-100 border-blue-400 text-blue-700',
    COMPLETED: 'bg-green-100 border-green-400 text-green-700',
    CANCELLED: 'bg-red-100 border-red-400 text-red-600',
  }

  const legendConfig = [
    { label: 'Available',  cls: 'border-teal-400 bg-teal-50' },
    { label: 'Booked',     cls: 'border-blue-400 bg-blue-100' },
    { label: 'Completed',  cls: 'border-green-400 bg-green-100' },
    { label: 'Cancelled',  cls: 'border-red-400 bg-red-100' },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-slate-900">My Schedule</h1>
          <p className="text-gray-500 mt-1 text-sm">Create and manage your daily appointment slots</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <RiAddLine /> New Schedule
        </button>
      </div>

      {showForm && (
        <div className="card border-2 border-teal-200 animate-slide-up">
          <h2 className="font-display text-lg text-slate-900 mb-5 flex items-center gap-2">
            <RiCalendarLine className="text-teal-600" /> Create Schedule
          </h2>
          <form onSubmit={createSchedule} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              {/* min=today prevents selecting past dates */}
              <input type="date" min={today} value={form.date} onChange={set('date')} className="input-field" required />
              <p className="text-xs text-gray-400 mt-1">Only today or future dates allowed</p>
            </div>
            <div>
              <label className="label">Slot Duration (minutes)</label>
              <select value={form.slotDuration} onChange={set('slotDuration')} className="input-field">
                {[10, 15, 20, 30].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div>
              <label className="label">Start Time</label>
              <input type="time" value={form.startTime} onChange={set('startTime')} className="input-field" required />
            </div>
            <div>
              <label className="label">End Time</label>
              <input type="time" value={form.endTime} onChange={set('endTime')} className="input-field" required />
            </div>
            <div>
              <label className="label">Break Start</label>
              <input type="time" value={form.breakStart} onChange={set('breakStart')} className="input-field" required />
            </div>
            <div>
              <label className="label">Break End</label>
              <input type="time" value={form.breakEnd} onChange={set('breakEnd')} className="input-field" required />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                {creating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Schedule'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <label className="label">View Schedule for Date</label>
            {/* No min restriction here — doctor can VIEW past schedules */}
            <input
              type="date"
              value={viewDate}
              onChange={e => handleDateChange(e.target.value)}
              className="input-field w-auto"
            />
          </div>
          {viewDate === today && (
            <span className="text-xs bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full font-medium mt-5">
              Today
            </span>
          )}
        </div>

        {scheduleLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Array(12).fill(0).map((_, i) => <div key={i} className="skeleton h-16" />)}
          </div>
        ) : !schedule ? (
          <div className="text-center py-12 text-gray-400">
            <RiCalendarLine className="text-5xl mx-auto mb-3 opacity-40" />
            <p className="font-medium">No schedule for {viewDate}</p>
            <p className="text-sm mt-1">
              {viewDate >= today ? 'Create a schedule using the button above' : 'No schedule was created for this date'}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-6 mb-4 text-sm text-gray-500 flex-wrap">
              <span>⏰ {to12hr(schedule.startTime)} – {to12hr(schedule.endTime)}</span>
              <span>☕ Break: {to12hr(schedule.breakStart)} – {to12hr(schedule.breakEnd)}</span>
              <span>📋 {schedule.slots?.length} slots</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {schedule.slots?.map(slot => (
                <div key={slot._id}
                  className={`border-2 rounded-xl p-3 text-center text-xs font-medium ${slotStatusColor[slot.status] || 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                  <RiTimeLine className="mx-auto mb-1 text-base" />
                  <p>{to12hr(slot.start)}</p>
                  <p className="opacity-70">#{slot.tokenNumber}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-5 mt-5 flex-wrap">
              {legendConfig.map(({ label, cls }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                  <span className={`w-3.5 h-3.5 rounded border-2 inline-block ${cls}`} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}