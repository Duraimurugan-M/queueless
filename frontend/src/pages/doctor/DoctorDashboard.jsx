import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RiTeamLine, RiCheckboxCircleLine, RiCalendarLine, RiArrowRightLine,
  RiTimeLine, RiUserHeartLine, RiStethoscopeLine, RiPulseLine,
  RiFileTextLine, RiAlertLine
} from 'react-icons/ri'
import api from '../../api/axios'
import { DOCTOR_QUEUE } from '../../api/endpoints'

const now = () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

export default function DoctorDashboard() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(DOCTOR_QUEUE).then(r => setQueue(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const pending   = queue.filter(t => t.status === 'BOOKED')
  const completed = queue.filter(t => t.status === 'COMPLETED')
  const nextPatient = pending[0]

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-teal-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10"
          style={{background: 'radial-gradient(circle at center, #14b8a6, transparent)'}} />
        <div className="relative">
          <p className="text-slate-400 text-sm">{now()}</p>
          <h1 className="font-display text-3xl font-bold mt-1">Doctor Dashboard</h1>
          <p className="text-slate-300 text-sm mt-1.5">
            {pending.length > 0
              ? `${pending.length} patient${pending.length > 1 ? 's' : ''} waiting for consultation`
              : 'No patients in queue right now'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: RiTeamLine,           label: 'Total Today', value: queue.length,      bg: 'bg-slate-50',  ib: 'bg-slate-100',  ic: 'text-slate-600',  vc: 'text-slate-800' },
          { icon: RiTimeLine,           label: 'Waiting',     value: pending.length,    bg: 'bg-amber-50',  ib: 'bg-amber-100',  ic: 'text-amber-600',  vc: 'text-amber-700' },
          { icon: RiCheckboxCircleLine, label: 'Done',        value: completed.length,  bg: 'bg-green-50',  ib: 'bg-green-100',  ic: 'text-green-600',  vc: 'text-green-700' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white`}>
            <div className={`w-10 h-10 ${s.ib} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`${s.ic} text-lg`} />
            </div>
            <p className={`text-2xl font-display font-bold ${s.vc}`}>{s.value}</p>
            <p className="text-gray-500 text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Next patient alert */}
      {nextPatient && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <RiUserHeartLine className="text-teal-700 text-xl" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-teal-600 font-semibold uppercase tracking-wide">Next Patient</p>
            <p className="font-display text-lg text-teal-900 font-bold">{nextPatient.patientDetails?.name || 'Patient'}</p>
            <p className="text-teal-700 text-xs">Token #{nextPatient.tokenNumber} · {nextPatient.slotTime} · Age {nextPatient.patientDetails?.age}</p>
            {nextPatient.patientDetails?.reason && (
              <p className="text-teal-600 text-xs mt-0.5 italic">"{nextPatient.patientDetails.reason}"</p>
            )}
          </div>
          <Link to="/doctor/queue"
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors flex-shrink-0">
            <RiStethoscopeLine /> Open Queue
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/doctor/schedule"
          className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <RiCalendarLine className="text-blue-700 text-xl" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">Manage Schedule</p>
            <p className="text-sm text-gray-500">Create today's appointment slots</p>
          </div>
          <RiArrowRightLine className="text-gray-300 group-hover:text-blue-500 transition-colors" />
        </Link>

        <Link to="/doctor/queue"
          className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
            <RiTeamLine className="text-teal-700 text-xl" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">Patient Queue</p>
            <p className="text-sm text-gray-500">{pending.length} waiting · {completed.length} done</p>
          </div>
          <RiArrowRightLine className="text-gray-300 group-hover:text-teal-500 transition-colors" />
        </Link>
      </div>

      {/* Queue preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-display text-lg text-slate-900">Today's Queue</h2>
          <Link to="/doctor/queue" className="text-sm text-teal-700 font-medium flex items-center gap-1 hover:text-teal-800">
            Manage <RiArrowRightLine />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : queue.length === 0 ? (
          <div className="py-14 text-center text-gray-400">
            <RiTeamLine className="text-5xl mx-auto mb-3 opacity-30" />
            <p className="font-display text-base text-gray-500">Queue is empty</p>
            <p className="text-sm mt-1">Patients who book tokens will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {queue.slice(0, 6).map((token, idx) => (
              <div key={token._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-display font-bold flex-shrink-0
                  ${token.status === 'BOOKED' ? 'bg-amber-100 text-amber-700' :
                    token.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                  {token.tokenNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{token.patientDetails?.name || 'Patient'}</p>
                  <p className="text-xs text-gray-400">{token.slotTime} · Age {token.patientDetails?.age || '—'}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0
                  ${token.status === 'BOOKED' ? 'bg-amber-100 text-amber-700' :
                    token.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                  {token.status === 'BOOKED' ? 'Waiting' : token.status === 'COMPLETED' ? 'Done' : 'Cancelled'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
