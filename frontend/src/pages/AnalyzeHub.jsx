import { Link } from 'react-router-dom'
import { Image as ImageIcon, PenTool, UserRound, ArrowRight } from 'lucide-react'

export default function AnalyzeHub() {
  return (
    <div className="main-content flex-col" style={{ alignItems: 'center', paddingTop: 60 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 className="page-title" style={{ marginBottom: 16 }}>Choose Analysis Method</h1>
        <p className="page-greeting" style={{ fontSize: '1.1rem' }}>
          Select the appropriate clinical workflow for your patient data.
        </p>
      </div>

      <div className="grid-3" style={{ width: '100%', maxWidth: 1100 }}>
        
        {/* Image Analysis */}
        <Link to="/analyze/image" className="card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', transition: 'all var(--t)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--c-purple-light)', color: 'var(--c-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <ImageIcon size={32} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--c-ink)', marginBottom: 12 }}>Image-Based Analysis</h3>
          <p style={{ color: 'var(--c-ink-muted)', fontSize: '0.95rem', flex: 1, marginBottom: 24 }}>
            Analyze scanned spiral or wave drawings using deep learning Vision Transformers and CNN models.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--c-purple)', fontWeight: 600, fontSize: '0.9rem', gap: 6 }}>
            Start Workflow <ArrowRight size={16} />
          </div>
        </Link>

        {/* Signal Analysis */}
        <Link to="/analyze/signal" className="card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', transition: 'all var(--t)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--c-cyan-light)', color: 'var(--c-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <PenTool size={32} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--c-ink)', marginBottom: 12 }}>Handwriting Signal Analysis (.svc)</h3>
          <p style={{ color: 'var(--c-ink-muted)', fontSize: '0.95rem', flex: 1, marginBottom: 24 }}>
            Analyze digital pen recordings tracking kinematics, pressure, and tremor using sequential and classical ML.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--c-cyan)', fontWeight: 600, fontSize: '0.9rem', gap: 6 }}>
            Start Workflow <ArrowRight size={16} />
          </div>
        </Link>

        {/* Doctor Workspace */}
        <Link to="/workspace" className="card" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', transition: 'all var(--t)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--c-success-bg)', color: 'var(--c-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <UserRound size={32} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--c-ink)', marginBottom: 12 }}>Doctor Workspace</h3>
          <p style={{ color: 'var(--c-ink-muted)', fontSize: '0.95rem', flex: 1, marginBottom: 24 }}>
            Create comprehensive clinical reports, attach existing analyses, and manage patient records securely.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--c-success)', fontWeight: 600, fontSize: '0.9rem', gap: 6 }}>
            Open Workspace <ArrowRight size={16} />
          </div>
        </Link>

      </div>
    </div>
  )
}
