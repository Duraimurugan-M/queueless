import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
  RiBookmarkLine, RiHistoryLine, RiTimeLine, RiArrowRightLine,
  RiTicketLine, RiCheckboxCircleLine, RiCloseCircleLine,
  RiCalendarCheckLine, RiUserLine, RiHospitalLine, RiQrCodeLine,
  RiDownload2Line, RiAlertLine
} from 'react-icons/ri'
import api from '../../api/axios'
import { TOKEN_MY_ALL, PATIENT_PROFILE } from '../../api/endpoints'
import { downloadTokenPDF } from '../../utils/pdfDownload'

const fmt = (t) => { if (!t) return ''; const [h, m] = t.trim().split(':').map(Number); const p = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${p}` }
const to12hr = (t) => { if (!t) return ''; if (t.includes(' - ')) { const [s,e] = t.split(' - '); return `${fmt(s)} – ${fmt(e)}` }; return fmt(t) }

const STATUS_CONFIG = {
  BOOKED:    { cls: 'bg-blue-50 text-blue-700 border border-blue-200',   dot: 'bg-blue-500',  label: 'Upcoming' },
  COMPLETED: { cls: 'bg-green-50 text-green-700 border border-green-200', dot: 'bg-green-500', label: 'Completed' },
  CANCELLED: { cls: 'bg-red-50 text-red-500 border border-red-200',       dot: 'bg-red-400',   label: 'Cancelled' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.BOOKED
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

export default function PatientDashboard() {
  const [tokens, setTokens] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qrToken, setQrToken] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(TOKEN_MY_ALL).then(r => setTokens(r.data || [])).catch(() => {}),
      api.get(PATIENT_PROFILE).then(r => setProfile(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const booked    = tokens.filter(t => t.status === 'BOOKED').length
  const completed = tokens.filter(t => t.status === 'COMPLETED').length
  const cancelled = tokens.filter(t => t.status === 'CANCELLED').length
  const activeTokens = tokens.filter(t => t.status === 'BOOKED')
  const recentTokens = tokens.slice(0, 6)

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Welcome header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-teal-300 text-sm font-medium mb-1">{today}</p>
            <h1 className="font-display text-3xl font-bold leading-tight">
              Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-teal-200/80 text-sm mt-1.5">
              {booked > 0
                ? `You have ${booked} upcoming appointment${booked > 1 ? 's' : ''}.`
                : 'No upcoming appointments. Book one below.'}
            </p>
            {profile?.displayId && (
              <p className="text-teal-300/70 text-xs mt-2 font-mono">Patient ID: {profile.displayId}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/patient/book"
              className="inline-flex items-center gap-2 bg-white text-teal-700 hover:bg-teal-50 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm">
              <RiBookmarkLine />
              Book Token
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: RiTicketLine,         label: 'Active',    value: booked,    bg: 'bg-blue-50',  icon_bg: 'bg-blue-100',  icon_color: 'text-blue-600',  val_color: 'text-blue-700' },
          { icon: RiCheckboxCircleLine, label: 'Completed', value: completed, bg: 'bg-green-50', icon_bg: 'bg-green-100', icon_color: 'text-green-600', val_color: 'text-green-700' },
          { icon: RiCloseCircleLine,    label: 'Cancelled', value: cancelled, bg: 'bg-red-50',   icon_bg: 'bg-red-100',   icon_color: 'text-red-500',   val_color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white`}>
            <div className={`w-10 h-10 ${s.icon_bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`${s.icon_color} text-lg`} />
            </div>
            <p className={`text-2xl font-display font-bold ${s.val_color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active token alert */}
      {activeTokens.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <RiAlertLine className="text-amber-600 text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-800 text-sm">Upcoming Appointment</p>
            {activeTokens.slice(0, 1).map(t => (
              <p key={t._id} className="text-amber-700 text-xs mt-0.5">
                Token <strong>#{t.tokenNumber}</strong> · {to12hr(t.slotTime)}
              </p>
            ))}
          </div>
          <button
            onClick={() => setQrToken(activeTokens[0])}
            className="flex items-center gap-1.5 text-xs bg-amber-600 text-white hover:bg-amber-700 px-3 py-2 rounded-lg font-medium flex-shrink-0 transition-colors">
            <RiQrCodeLine />
            Show QR
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/patient/book',    icon: RiCalendarCheckLine, label: 'Book Appointment', desc: 'Find doctor & slot',    bg: 'bg-teal-50',   icon_bg: 'bg-teal-100',   icon_c: 'text-teal-700',   hover: 'hover:bg-teal-100/50' },
          { to: '/patient/history', icon: RiHistoryLine,       label: 'Visit History',    desc: 'Past visits & records', bg: 'bg-blue-50',   icon_bg: 'bg-blue-100',   icon_c: 'text-blue-700',   hover: 'hover:bg-blue-100/50' },
          { to: '/patient/profile', icon: RiUserLine,          label: 'My Profile',       desc: 'View & edit details',   bg: 'bg-purple-50', icon_bg: 'bg-purple-100', icon_c: 'text-purple-700', hover: 'hover:bg-purple-100/50' },
        ].map(a => (
          <Link key={a.to} to={a.to}
            className={`${a.bg} ${a.hover} rounded-2xl p-5 border border-white transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 group`}>
            <div className={`w-11 h-11 ${a.icon_bg} rounded-xl flex items-center justify-center mb-3`}>
              <a.icon className={`${a.icon_c} text-xl`} />
            </div>
            <p className="font-semibold text-slate-800 text-sm">{a.label}</p>
            <p className="text-gray-500 text-xs mt-0.5">{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent tokens list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-display text-lg text-slate-900">Recent Tokens</h2>
          <Link to="/patient/history"
            className="text-sm text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1 transition-colors">
            View all <RiArrowRightLine />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : recentTokens.length === 0 ? (
          <div className="py-14 text-center text-gray-400">
            <RiTicketLine className="text-5xl mx-auto mb-3 opacity-30" />
            <p className="font-display text-base text-gray-500">No tokens yet</p>
            <p className="text-sm mt-1 mb-4">Book your first appointment to get started</p>
            <Link to="/patient/book" className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2">
              <RiBookmarkLine /> Book Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentTokens.map(token => (
              <div key={token._id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">

                {/* Token number badge */}
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-display
                  ${token.status === 'BOOKED' ? 'bg-blue-100 text-blue-700' :
                    token.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <span className="text-[9px] font-sans font-medium leading-none opacity-60">NO.</span>
                  <span className="text-lg font-bold leading-tight">{token.tokenNumber}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{to12hr(token.slotTime) || 'Slot time unavailable'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(token.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Status + action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={token.status} />

                  {/* QR button — booked only */}
                  {token.status === 'BOOKED' && (
                    <button
                      onClick={() => setQrToken(token)}
                      title="Show QR Code"
                      className="w-8 h-8 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center justify-center transition-colors">
                      <RiQrCodeLine className="text-teal-700 text-base" />
                    </button>
                  )}

                  {/* PDF download — all tokens */}
                  <button
                    onClick={() => downloadTokenPDF(token._id)}
                    title="Download Token PDF"
                    className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                    <RiDownload2Line className="text-blue-700 text-base" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrToken && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setQrToken(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-xs w-full overflow-hidden"
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-800 px-6 py-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <RiHospitalLine className="text-teal-300 text-lg" />
                <span className="text-teal-200 text-xs font-medium uppercase tracking-widest">QueueLess Hospital</span>
              </div>
              <h3 className="font-display text-3xl text-white font-bold">Token #{qrToken.tokenNumber}</h3>
              <p className="text-teal-200/80 text-sm mt-1">{to12hr(qrToken.slotTime)}</p>
            </div>

            {/* QR code */}
            <div className="p-6 flex flex-col items-center">
              <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-inner">
                <QRCodeSVG value={qrToken._id} size={160} level="H" includeMargin={false} />
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Show this QR code at the hospital reception for check-in
              </p>
              <div className="mt-3">
                <StatusBadge status={qrToken.status} />
              </div>
            </div>

            {/* Modal footer — Download + Close */}
            <div className="px-6 pb-6 space-y-2">
              <button
                onClick={() => downloadTokenPDF(qrToken._id)}
                className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
                <RiDownload2Line /> Download Token PDF
              </button>
              <button
                onClick={() => setQrToken(null)}
                className="btn-secondary w-full py-2.5 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
