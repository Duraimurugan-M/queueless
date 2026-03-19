import { useEffect, useState } from 'react'
import {
  RiHistoryLine, RiDownload2Line, RiTimeLine, RiCloseCircleLine,
  RiCalendarLine, RiHospitalLine, RiSearchLine, RiFileTextLine,
  RiRefreshLine
} from 'react-icons/ri'
import api from '../../api/axios'
import { PATIENT_VISIT_HISTORY, PATIENT_CANCEL_TOKEN } from '../../api/endpoints'
import { downloadTokenPDF, downloadPrescriptionPDF } from '../../utils/pdfDownload'
import toast from 'react-hot-toast'

// Convert "14:30" or "14:30 - 14:45" to 12hr
const fmt = (t) => {
  if (!t) return ''
  const [h, m] = t.trim().split(':').map(Number)
  const p = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${p}`
}
const to12hr = (t) => {
  if (!t) return ''
  if (t.includes(' - ')) {
    const [s, e] = t.split(' - ')
    return `${fmt(s)} – ${fmt(e)}`
  }
  return fmt(t)
}

const STATUS_CONFIG = {
  BOOKED:    { cls: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500',  label: 'Upcoming' },
  COMPLETED: { cls: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', label: 'Completed' },
  CANCELLED: { cls: 'bg-red-50 text-red-600 border-red-200',       dot: 'bg-red-400',   label: 'Cancelled' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.BOOKED
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export default function VisitHistoryPage() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  const fetchHistory = () => {
    setLoading(true)
    api.get(PATIENT_VISIT_HISTORY)
      .then(r => setVisits(r.data.visits || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchHistory() }, [])

  const cancelToken = async (visitId) => {
    if (!confirm('Cancel this appointment?')) return
    setCancelling(visitId)
    try {
      await api.patch(PATIENT_CANCEL_TOKEN(visitId))
      toast.success('Appointment cancelled')
      fetchHistory()
    } catch {}
    finally { setCancelling(null) }
  }

  const filtered = visits.filter(v => {
    const matchFilter = filter === 'ALL' || v.status === filter
    const matchSearch = !search ||
      v.doctor?.toLowerCase().includes(search.toLowerCase()) ||
      v.department?.toLowerCase().includes(search.toLowerCase()) ||
      String(v.tokenNumber).includes(search)
    return matchFilter && matchSearch
  })

  const counts = {
    ALL:       visits.length,
    BOOKED:    visits.filter(v => v.status === 'BOOKED').length,
    COMPLETED: visits.filter(v => v.status === 'COMPLETED').length,
    CANCELLED: visits.filter(v => v.status === 'CANCELLED').length,
  }

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Visit History</h1>
          <p className="text-gray-500 mt-1 text-sm">All your hospital appointments and records</p>
        </div>
        <button onClick={fetchHistory} className="btn-secondary text-sm py-2 flex items-center gap-2">
          <RiRefreshLine /> Refresh
        </button>
      </div>

      {/* Stat tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'ALL',       label: 'All Visits',  color: 'border-slate-300 text-slate-700 bg-white' },
          { key: 'BOOKED',    label: 'Upcoming',    color: 'border-blue-300 text-blue-700 bg-blue-50' },
          { key: 'COMPLETED', label: 'Completed',   color: 'border-green-300 text-green-700 bg-green-50' },
          { key: 'CANCELLED', label: 'Cancelled',   color: 'border-red-300 text-red-600 bg-red-50' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`p-3 rounded-xl border-2 text-left transition-all duration-150
              ${filter === tab.key
                ? tab.color + ' shadow-sm'
                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}>
            <p className="text-2xl font-display font-bold">{counts[tab.key]}</p>
            <p className="text-xs font-medium mt-0.5">{tab.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by doctor, department or token number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-11 py-3"
        />
      </div>

      {/* Visit cards */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
          <RiHistoryLine className="text-5xl mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg text-gray-500">No visits found</p>
          <p className="text-sm mt-1">
            {search || filter !== 'ALL' ? 'Try clearing your filters' : 'Your appointment history will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(visit => (
            <div key={visit.visitId}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all duration-200
                ${visit.status === 'CANCELLED' ? 'opacity-70 border-gray-100' : 'border-gray-100'}`}>

              {/* Status stripe */}
              <div className={`h-1 ${
                visit.status === 'BOOKED'    ? 'bg-blue-500' :
                visit.status === 'COMPLETED' ? 'bg-green-500' :
                                               'bg-red-400'}`} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">

                  {/* Left — info */}
                  <div className="flex items-start gap-4">
                    {/* Token badge */}
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-display font-bold
                      ${visit.status === 'BOOKED'    ? 'bg-blue-100 text-blue-700' :
                        visit.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                       'bg-gray-100 text-gray-500'}`}>
                      <span className="text-[10px] font-sans font-medium opacity-70 leading-none">TOKEN</span>
                      <span className="text-xl leading-tight">#{visit.tokenNumber}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800 text-base">{visit.doctor}</h3>
                        <StatusBadge status={visit.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <RiHospitalLine className="text-gray-400 text-base" />
                          {visit.department}
                        </span>
                        <span className="text-gray-300">•</span>
                        {/* ✅ 12hr format */}
                        <span className="flex items-center gap-1.5">
                          <RiTimeLine className="text-gray-400 text-base" />
                          {to12hr(visit.slotTime)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1.5">
                          <RiCalendarLine className="text-gray-400 text-base" />
                          {new Date(visit.date).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right — actions */}
                  <div className="flex items-center gap-2 flex-wrap">

                    {/* Token PDF — always */}
                    <button
                      onClick={() => downloadTokenPDF(visit.visitId)}
                      className="inline-flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 px-3 py-2 rounded-lg transition-colors font-medium">
                      <RiDownload2Line className="text-sm" />
                      Token PDF
                    </button>

                    {/* Prescription PDF — only if exists */}
                    {visit.prescriptionId && (
                      <button
                        onClick={() => downloadPrescriptionPDF(visit.prescriptionId)}
                        className="inline-flex items-center gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors font-medium">
                        <RiDownload2Line className="text-sm" />
                        Prescription PDF
                      </button>
                    )}

                    {/* No prescription yet */}
                    {visit.status === 'COMPLETED' && !visit.prescriptionId && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">
                        <RiFileTextLine />
                        No prescription yet
                      </span>
                    )}

                    {/* Cancel — upcoming only */}
                    {visit.status === 'BOOKED' && (
                      <button
                        onClick={() => cancelToken(visit.visitId)}
                        disabled={cancelling === visit.visitId}
                        className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-lg transition-colors font-medium">
                        <RiCloseCircleLine className="text-sm" />
                        {cancelling === visit.visitId ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
