import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js'
import {
  RiBuildingLine, RiStethoscopeLine, RiTeamLine, RiCheckboxCircleLine,
  RiArrowRightLine, RiBarChartLine, RiCloseCircleLine, RiPulseLine
} from 'react-icons/ri'
import api from '../../api/axios'
import { ANALYTICS_MD_TODAY, MD_DOCTORS, MD_DEPARTMENTS } from '../../api/endpoints'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const now = () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export default function MdDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [doctorCount, setDoctorCount] = useState(null)
  const [deptCount, setDeptCount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(ANALYTICS_MD_TODAY).then(r => setAnalytics(r.data.data)).catch(() => {}),
      api.get(MD_DOCTORS).then(r => setDoctorCount(r.data?.length ?? 0)).catch(() => {}),
      api.get(MD_DEPARTMENTS).then(r => setDeptCount(r.data?.length ?? 0)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const deptData   = analytics?.byDepartment || []
  const doctorData = analytics?.byDoctor     || []

  const doughnutData = {
    labels: deptData.map(d => d.department),
    datasets: [{
      data: deptData.map(d => d.total),
      backgroundColor: ['#0f766e','#0d9488','#14b8a6','#2dd4bf','#5eead4','#99f6e4','#134e4a'],
      borderWidth: 0,
      hoverOffset: 6,
    }]
  }

  const barData = {
    labels: doctorData.map(d => d.doctor),
    datasets: [
      {
        label: 'Completed',
        data: doctorData.map(d => d.completed),
        backgroundColor: '#10b981',
        borderRadius: 6,
        barThickness: 20,
      },
      {
        label: 'Pending',
        data: doctorData.map(d => d.pending || (d.total - d.completed - (d.cancelled || 0))),
        backgroundColor: '#f59e0b',
        borderRadius: 6,
        barThickness: 20,
      },
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { font: { family: 'DM Sans', size: 12 }, boxWidth: 12, padding: 16 } }
    },
  }

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")"}} />
        <div className="relative">
          <p className="text-slate-400 text-sm">{now()}</p>
          <h1 className="font-display text-3xl font-bold mt-1">Admin Dashboard</h1>
          <p className="text-slate-300 text-sm mt-1.5">Hospital-wide operations overview</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: RiTeamLine,           label: 'Patients Today', value: analytics?.total     ?? '—', bg: 'bg-teal-50',   ib: 'bg-teal-100',   ic: 'text-teal-700',  vc: 'text-teal-800' },
          { icon: RiCheckboxCircleLine, label: 'Completed',      value: analytics?.completed ?? '—', bg: 'bg-green-50',  ib: 'bg-green-100',  ic: 'text-green-600', vc: 'text-green-800' },
          { icon: RiCloseCircleLine,    label: 'Cancelled',      value: analytics?.cancelled ?? '—', bg: 'bg-red-50',    ib: 'bg-red-100',    ic: 'text-red-500',   vc: 'text-red-700' },
          { icon: RiStethoscopeLine,    label: 'Doctors',        value: doctorCount          ?? '—', bg: 'bg-blue-50',   ib: 'bg-blue-100',   ic: 'text-blue-600',  vc: 'text-blue-800' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white`}>
            <div className={`w-10 h-10 ${s.ib} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`${s.ic} text-lg`} />
            </div>
            <p className={`text-2xl font-display font-bold ${s.vc}`}>
              {loading ? <span className="skeleton inline-block w-8 h-6 rounded" /> : s.value}
            </p>
            <p className="text-gray-500 text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/md/departments"
          className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <RiBuildingLine className="text-purple-700 text-xl" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">Departments</p>
            <p className="text-sm text-gray-500">{deptCount ?? '—'} departments registered</p>
          </div>
          <RiArrowRightLine className="text-gray-300 group-hover:text-purple-500 transition-colors" />
        </Link>

        <Link to="/md/doctors"
          className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <RiStethoscopeLine className="text-blue-700 text-xl" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">Doctors</p>
            <p className="text-sm text-gray-500">{doctorCount ?? '—'} doctors on staff</p>
          </div>
          <RiArrowRightLine className="text-gray-300 group-hover:text-blue-500 transition-colors" />
        </Link>
      </div>

      {/* Charts */}
      {!loading && (deptData.length > 0 || doctorData.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {deptData.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-display text-lg text-slate-900 mb-1">Patients by Department</h3>
              <p className="text-xs text-gray-400 mb-5">Today's distribution across departments</p>
              <div className="h-60">
                <Doughnut data={doughnutData} options={{
                  ...chartOptions,
                  cutout: '65%',
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 11 }, boxWidth: 10, padding: 12 } }
                  }
                }} />
              </div>
            </div>
          )}

          {doctorData.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-display text-lg text-slate-900 mb-1">Doctor Performance</h3>
              <p className="text-xs text-gray-400 mb-5">Completed vs pending tokens per doctor</p>
              <div className="h-60">
                <Bar data={barData} options={{
                  ...chartOptions,
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11 } } },
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { family: 'DM Sans', size: 11 }, stepSize: 1 } }
                  }
                }} />
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && deptData.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-12 text-center text-gray-400">
          <RiBarChartLine className="text-5xl mx-auto mb-3 opacity-30" />
          <p className="font-display text-base text-gray-500">No analytics yet</p>
          <p className="text-sm mt-1">Data will appear once patients start booking tokens</p>
        </div>
      )}
    </div>
  )
}
