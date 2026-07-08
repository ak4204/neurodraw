import { Link } from 'react-router-dom'
import { Waves } from 'lucide-react'

export default function Landing() {
  return (
    <div className="hero-container">
      <div className="hero-bg"></div>
      
      {/* Top Left Logo (overlay on hero) */}
      <div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 800, fontSize: '1.25rem', color: 'var(--c-ink)', zIndex: 2 }}>
        <div className="logo-icon">
          <Waves size={20} strokeWidth={2.5} />
        </div>
        NeuroDraw
      </div>

      <div className="hero-content">
        <h1 className="hero-title">
          Advancing Parkinson's<br />
          Research with AI
        </h1>
        <p className="hero-subtitle">
          A multi-model deep learning platform analyzing kinematic and visual biomarkers in spiral and wave drawings.
        </p>
        <Link to="/login" className="hero-btn">
          Enter Platform
        </Link>
      </div>
    </div>
  )
}
