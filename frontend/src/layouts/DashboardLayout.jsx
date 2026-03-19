import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  RiDashboardLine, RiCalendarLine, RiTeamLine, RiHistoryLine,
  RiUserLine, RiLogoutBoxLine, RiMenuLine, RiCloseLine,
  RiStethoscopeLine, RiBookmarkLine, RiBarChartLine, RiBuildingLine
} from 'react-icons/ri'

const navConfig = {
  PATIENT: [
    { to: '/patient',         label: 'Dashboard',     icon: RiDashboardLine, end: true },
    { to: '/patient/book',    label: 'Book Token',     icon: RiBookmarkLine },
    { to: '/patient/history', label: 'Visit History',  icon: RiHistoryLine },
    { to: '/patient/profile', label: 'My Profile',     icon: RiUserLine },
  ],
  DOCTOR: [
    { to: '/doctor',          label: 'Dashboard',      icon: RiDashboardLine, end: true },
    { to: '/doctor/schedule', label: 'My Schedule',    icon: RiCalendarLine },
    { to: '/doctor/queue',    label: "Today's Queue",  icon: RiTeamLine },
  ],
  MD: [
    { to: '/md',              label: 'Dashboard',      icon: RiBarChartLine,  end: true },
    { to: '/md/departments',  label: 'Departments',    icon: RiBuildingLine },
    { to: '/md/doctors',      label: 'Doctors',        icon: RiStethoscopeLine },
  ],
}

const roleLabel = { PATIENT: 'Patient Portal', DOCTOR: 'Doctor Portal', MD: 'Admin Portal' }
const rolePill   = { PATIENT: 'bg-teal-500/20 text-teal-300', DOCTOR: 'bg-blue-500/20 text-blue-300', MD: 'bg-purple-500/20 text-purple-300' }

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const links = navConfig[role] || []

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Mobile overlay ─────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#0f172a] flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex-shrink-0
      `}>

        {/* Logo block — click navigates to dashboard */}
        <Link
          to={role === 'PATIENT' ? '/patient' : role === 'DOCTOR' ? '/doctor' : '/md'}
          className="flex items-center gap-3 px-5 py-5 border-b border-white/5 hover:bg-white/5 transition-colors"
        >
          <img src="/logo.png" alt="QueueLess" className="w-9 h-9 rounded-xl object-contain bg-white/10 p-1" />
          <div>
            <p className="text-white font-display font-bold text-[17px] leading-tight">QueueLess</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 inline-block ${rolePill[role]}`}>
              {roleLabel[role]}
            </span>
          </div>
          <button className="ml-auto lg:hidden p-1 text-slate-400 hover:text-white" onClick={(e) => { e.preventDefault(); setSidebarOpen(false) }}>
            <RiCloseLine className="text-xl" />
          </button>
        </Link>

        {/* Nav links — flex-1 so they push logout down */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">Menu</p>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                    ${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                    <Icon className="text-base" />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + Logout — pinned to bottom */}
        <div className="border-t border-white/5 p-3">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user?.role?.[0]}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{roleLabel[role]}</p>
              <p className="text-slate-500 text-[10px] truncate">Logged in</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
          >
            <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <RiLogoutBoxLine className="text-base" />
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      {/* <div className="flex-1 flex flex-col min-w-0 overflow-hidden"> */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar — mobile only */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <RiMenuLine className="text-xl text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="QueueLess" className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-display font-bold text-slate-800 text-lg">QueueLess</span>
          </div>
          <div className="w-9" />
        </header>

        {/* Scrollable page area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
