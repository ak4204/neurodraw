import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Upload, Brain, Clock, FlaskConical,
  BookOpen, Settings, Activity, Waves,
} from 'lucide-react'
import { checkHealth } from '../../utils/api'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/analyze', icon: Upload, label: 'Analyze Drawing' },
  { to: '/disease', icon: Brain, label: "About Parkinson's", badge: 'Info' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/research', icon: FlaskConical, label: 'Research' },
  { to: '/about', icon: BookOpen, label: 'About Project' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const [online, setOnline] = useState(null)
  const [mockMode, setMockMode] = useState(false)

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      try {
        const h = await checkHealth()
        if (!cancelled) {
          setOnline(h.status === 'ok')
          setMockMode(h.any_mock ?? false)
        }
      } catch {
        if (!cancelled) setOnline(false)
      }
    }
    poll()
    const id = setInterval(poll, 30000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="sidebar-logo-icon">
            <Waves size={18} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div className="sidebar-logo-name">NeuroDraw</div>
            <div className="sidebar-logo-sub">Research Platform · v1.0</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV.map(({ to, icon: Icon, label, badge, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to) && to !== '/'

          return (
            <NavLink
              key={to}
              to={to}
              className={`nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{label}</span>
              {badge && (
                <span className="nav-item-badge">{badge}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className={`status-dot ${online ? 'online pulse' : ''}`} />
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>
              {online === null ? 'Connecting…' : online ? 'Inference Engine' : 'API Offline'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>
              {mockMode ? 'Mock mode active' : online ? 'All models loaded' : 'Start backend server'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
