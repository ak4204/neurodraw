import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'
import { BarChart, Activity, AlertCircle } from 'lucide-react'

export default function ResearchDashboard() {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    apiFetch('/models/metrics').then(setMetrics).catch(() => {})
  }, [])

  return (
    <div className="main-content flex-col" style={{ padding: '40px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>Research Dashboard</h1>
        <p className="page-greeting" style={{ fontSize: '1.05rem' }}>Evaluation metrics, ROC curves, and Confusion Matrices for trained models.</p>
      </div>

      {/* Model Selection Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <button className="btn btn-primary">Spiral Model</button>
        <button className="btn" style={{ background: 'white' }}>Wave Model</button>
        <button className="btn" style={{ background: 'white' }}>Unified Model</button>
        <button className="btn" style={{ background: 'white' }}>Classical ML (PaHaW)</button>
      </div>

      <div className="grid-3" style={{ gap: 24, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-title">Accuracy</div>
          <div className="stat-value">{metrics?.spiral_vgg16?.accuracy ? (metrics.spiral_vgg16.accuracy * 100).toFixed(1) + '%' : 'N/A'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Precision</div>
          <div className="stat-value">Not Available</div>
          <div className="stat-sub mt-2">Awaiting Evaluation Data</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Recall (Sensitivity)</div>
          <div className="stat-value">Not Available</div>
          <div className="stat-sub mt-2">Awaiting Evaluation Data</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Specificity</div>
          <div className="stat-value">Not Available</div>
          <div className="stat-sub mt-2">Awaiting Evaluation Data</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">F1 Score</div>
          <div className="stat-value">Not Available</div>
          <div className="stat-sub mt-2">Awaiting Evaluation Data</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Inference Time</div>
          <div className="stat-value">~140ms</div>
          <div className="stat-sub mt-2">CPU Average</div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid-3" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ height: 400, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 24 }}>ROC Curve (Receiver Operating Characteristic)</h3>
          <div style={{ flex: 1, border: '2px dashed #e2e8f0', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--c-ink-muted)', background: '#f8fafc' }}>
            <Activity size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <div style={{ fontWeight: 600 }}>Awaiting Evaluation Data</div>
            <div style={{ fontSize: '0.85rem', marginTop: 8 }}>ROC curve arrays not provided in API</div>
          </div>
        </div>

        <div className="card" style={{ height: 400, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 24 }}>Confusion Matrix</h3>
          <div style={{ flex: 1, border: '2px dashed #e2e8f0', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--c-ink-muted)', background: '#f8fafc' }}>
            <BarChart size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <div style={{ fontWeight: 600 }}>Awaiting Evaluation Data</div>
            <div style={{ fontSize: '0.85rem', marginTop: 8 }}>Matrix arrays not provided in API</div>
          </div>
        </div>
      </div>

    </div>
  )
}
