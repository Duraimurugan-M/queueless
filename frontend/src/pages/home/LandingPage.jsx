import { Link } from 'react-router-dom'
import {
  RiTimeLine, RiSmartphoneLine, RiShieldCheckLine,
  RiFileTextLine, RiArrowRightLine,
  RiMenuLine, RiCloseLine, RiQrCodeLine, RiMailSendLine
} from 'react-icons/ri'
import { useState } from 'react'

// ✅ Patient-focused features only — no admin/doctor stuff
const features = [
  {
    icon: RiSmartphoneLine,
    title: 'Book in Seconds',
    desc: 'Choose your department, pick a doctor and select a slot — all from your phone. No calls, no paperwork.',
  },
  {
    icon: RiTimeLine,
    title: 'Track Your Queue Live',
    desc: 'See exactly how many patients are ahead of you and get a real-time estimate of your waiting time.',
  },
  {
    icon: RiQrCodeLine,
    title: 'Instant QR Token',
    desc: 'Get a QR-coded token the moment you book. Show it at the reception — fast, paperless check-in.',
  },
  {
    icon: RiFileTextLine,
    title: 'Digital Prescriptions',
    desc: 'After your visit, download your prescription as a PDF or receive it directly in your email inbox.',
  },
  {
    icon: RiMailSendLine,
    title: 'Email Confirmations',
    desc: 'Automatic email when you book, cancel, or when your prescription is ready — stay informed always.',
  },
  {
    icon: RiShieldCheckLine,
    title: 'Safe & Private',
    desc: 'Your health data is protected with secure login and encrypted access — only you can see your records.',
  },
]

const steps = [
  { num: '01', title: 'Create Your Account', desc: 'Register with your name, mobile and email in under a minute.' },
  { num: '02', title: 'Book a Token', desc: 'Select a department, doctor, date and your preferred time slot.' },
  { num: '03', title: 'Track Your Turn', desc: 'Watch the live queue and arrive right on time — no waiting room stress.' },
  { num: '04', title: 'Get Your Prescription', desc: 'Download your prescription PDF or find it in your visit history.' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-body">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="QueueLess" className="w-9 h-9 object-contain" />
            <span className="font-display text-xl font-bold text-slate-900">QueueLess</span>
          </div>

          {/* ✅ Clean nav — just patient-relevant anchors */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-teal-700 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-teal-700 transition-colors">How It Works</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors">Login</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Register Free</Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <RiCloseLine className="text-xl" /> : <RiMenuLine className="text-xl" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4">
            <a href="#features" className="block text-sm text-gray-600" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm text-gray-600" onClick={() => setMenuOpen(false)}>How It Works</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="btn-secondary text-sm py-2 px-4 flex-1 text-center">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4 flex-1 text-center">Register</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-pattern opacity-30" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-teal-300/10 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-700/50 border border-teal-500/30 text-teal-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full live-dot" />
              QueueLess Hospital — Digital Patient Portal
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
              Skip the Queue.<br />
              <span className="text-teal-400 italic">Not the Care.</span>
            </h1>

            {/* ✅ Patient-first copy — no mention of roles */}
            <p className="text-teal-100/80 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              Book your hospital appointment online, track your queue from home, and get your prescription delivered to your inbox — all without standing in line.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register"
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-teal-500/30">
                Register as Patient
                <RiArrowRightLine />
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 border border-teal-500/40 text-teal-200 hover:bg-teal-800/50 font-medium py-3 px-6 rounded-xl transition-all duration-200">
                Already have an account? Login
              </Link>
            </div>

            {/* ✅ Patient-relevant stats only */}
            <div className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-teal-700/50">
              {[
                { val: 'Live Queue', label: 'Real-time token tracking' },
                { val: 'QR Token', label: 'Instant digital token' },
                { val: 'PDF + Email', label: 'Prescription delivery' },
              ].map(s => (
                <div key={s.val}>
                  <p className="text-white font-display text-2xl font-bold">{s.val}</p>
                  <p className="text-teal-300/70 text-sm mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES — all patient-facing */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-teal-700 text-sm font-semibold tracking-widest uppercase mb-3">For Patients</p>
            <h2 className="font-display text-4xl text-slate-900">Everything You Need, Nothing You Don't</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              QueueLess is designed around your experience as a patient — fast, simple and stress-free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                  <f.icon className="text-teal-700 text-xl" />
                </div>
                <h3 className="font-display text-lg text-slate-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-teal-700 text-sm font-semibold tracking-widest uppercase mb-3">Simple Steps</p>
            <h2 className="font-display text-4xl text-slate-900">How QueueLess Works</h2>
            <p className="text-gray-500 mt-3">From registration to prescription in four easy steps.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full h-px bg-teal-100 z-0" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white font-display text-2xl font-bold flex items-center justify-center mb-5 shadow-md shadow-teal-200">
                    {s.num}
                  </div>
                  <h3 className="font-display text-xl text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-teal-700">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl text-white mb-4">Your Next Appointment, Made Easy.</h2>
          <p className="text-teal-100/80 mb-8 text-lg">
            Join QueueLess today — register free and book your first token in minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-white text-teal-700 hover:bg-teal-50 font-semibold py-3 px-7 rounded-xl transition-all duration-200">
              Register Free
              <RiArrowRightLine />
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-teal-600 font-medium py-3 px-7 rounded-xl transition-all duration-200">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="QueueLess" className="w-8 h-8 object-contain" />
            <span className="font-display text-white text-lg">QueueLess</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} QueueLess Hospital. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Login</Link>
            <Link to="/register" className="text-slate-400 hover:text-white text-sm transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
