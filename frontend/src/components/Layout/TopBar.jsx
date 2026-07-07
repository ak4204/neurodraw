import { useEffect, useState } from 'react'
import { Bell, Search, AlertTriangle, Cpu } from 'lucide-react'
import { checkHealth } from '../../utils/api'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/analyze': 'Analyze Drawing',
  '/disease': "About Parkinson's Disease",
  '/history': 'Analysis History',
  '/research': 'Research & Model Zoo',
  '/about': 'About the Project',
  '/settings': 'Settings',
}

export default function TopBar() {
  const [online, setOnline] = useState(null)
  const [mockMode, setMockMode] = useState(false)
  const location = useLocation()

  const pageTitle = Object.entries(PAGE_TITLES).reduce((acc, [path, title]) => {
    if (location.pathname === path) return title
    if (location.pathname.startsWith(path) && path !== '/') return title
    return acc
  }, 'NeuroDraw')

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      try {
        const h = await checkHealth()
        if (!cancelled) { setOnline(h.status === 'ok'); setMockMode(h.any_mock ?? false) }
      } catch { if (!cancelled) setOnline(false) }
    }
    poll()
    const id = setInterval(poll, 30000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Mock banner */}
      {mockMode && (
        <div className="mock-banner">
          <AlertTriangle size={15} strokeWidth={2} />
          Model files not detected — showing simulated results for layout preview.
          Drop your .keras files into <code style={{ background: 'rgba(0,0,0,0.08)', padding: '1px 5px', borderRadius: 3 }}>backend/models/</code> to enable real inference.
        </div>
      )}

      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--c-ink)', lineHeight: 1.2 }}>
              {pageTitle}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--c-ink-muted)', lineHeight: 1 }}>
              NeuroDraw Research Platform
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="topbar-search">
          <Search size={14} className="topbar-search-icon" strokeWidth={2} />
          <input placeholder="Search analyses, models…" id="topbar-search" aria-label="Search" />
        </div>

        {/* Actions */}
        <div className="topbar-actions">
          {online !== null && (
            <div className={online ? 'topbar-model-chip' : 'topbar-mock-chip'}>
              <Cpu size={12} strokeWidth={2} />
              {online ? 'Models Ready' : 'API Offline'}
            </div>
          )}
          <button className="topbar-icon-btn" aria-label="Notifications">
            <Bell size={16} strokeWidth={1.75} />
          </button>
        </div>
      </header>
    </div>
  )
}
