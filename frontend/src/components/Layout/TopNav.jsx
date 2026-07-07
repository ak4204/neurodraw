import { NavLink, useLocation } from 'react-router-dom'
import { Waves, Bell, Settings as SettingsIcon, CheckCircle, AlertCircle, Info, X, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useNotif } from '../../context/NotifContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/analyze', label: 'Analyze' },
  { to: '/pipeline', label: 'Architecture' },
  { to: '/workspace', label: 'Doctor Workspace' },
  { to: '/reports', label: 'Reports' },
  { to: '/models', label: 'Models' },
  { to: '/history', label: 'History' },
  { to: '/disease', label: "Parkinson's Info" },
]

const ICONS = {
  success: <CheckCircle size={16} color="var(--c-success)" />,
  error:   <AlertCircle size={16} color="var(--c-error)" />,
  info:    <Info size={16} color="var(--c-purple)" />,
  warning: <AlertCircle size={16} color="var(--c-warning)" />,
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export default function TopNav() {
  const location = useLocation()
  const { notifs, dismiss, clearAll } = useNotif()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (location.pathname === '/') return null

  const unread = notifs.length

  return (
    <div className="top-nav">
      <div className="logo-container">
        <div className="logo-icon">
          <Waves size={20} strokeWidth={2.5} />
        </div>
        NeuroDraw
      </div>

      <div className="nav-pills">
        {NAV.map(({ to, label }) => {
          const isActive = to === '/analyze'
            ? location.pathname === '/analyze' || location.pathname.startsWith('/analyze/')
            : location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to} className={`nav-pill ${isActive ? 'active' : ''}`}>
              {label}
            </NavLink>
          )
        })}
      </div>

      <div className="top-right">

        {/* Notification Bell */}
        <div ref={ref} style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            aria-label="Notifications"
            onClick={() => setOpen(o => !o)}
            style={{ position: 'relative' }}
          >
            <Bell size={18} strokeWidth={2} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 8, height: 8,
                background: 'var(--c-error)',
                borderRadius: '50%',
                border: '2px solid white',
              }} />
            )}
          </button>

          {open && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 10px)',
              width: 340,
              background: 'white',
              borderRadius: 16,
              boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
              border: '1px solid #edf2f7',
              zIndex: 1000,
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
                {notifs.length > 0 && (
                  <button
                    onClick={clearAll}
                    style={{ fontSize: '0.78rem', color: 'var(--c-ink-muted)', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: '#f1f5f9' }}
                  >
                    <Trash2 size={12} /> Clear all
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifs.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--c-ink-muted)', fontSize: '0.9rem' }}>
                    <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                    No notifications yet
                  </div>
                ) : (
                  notifs.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f7fafc', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ marginTop: 2, flexShrink: 0 }}>{ICONS[n.type] || ICONS.info}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--c-ink)', lineHeight: 1.5 }}>{n.message}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--c-ink-muted)', marginTop: 4 }}>{timeAgo(n.time)}</div>
                      </div>
                      <button onClick={() => dismiss(n.id)} style={{ color: 'var(--c-ink-light)', flexShrink: 0, marginTop: 2 }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <NavLink to="/settings" className="icon-btn" aria-label="Settings">
          <SettingsIcon size={18} strokeWidth={2} />
        </NavLink>
      </div>
    </div>
  )
}
