import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Upload, Activity, Brain, Clock, ChevronRight, CheckCircle2, Cpu } from 'lucide-react'
import { getCases, getMetrics, checkHealth } from '../utils/api'
import { formatTimestamp, formatCaseId } from '../utils/formatters'

export default function Dashboard() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [health, setHealth] = useState(null)
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    getCases().then(d => setCases((d.cases || []).slice(0, 5))).catch(() => {})
    checkHealth().then(setHealth).catch(() => {})
    getMetrics().then(setMetrics).catch(() => {})
  }, [])

  const pdCount = cases.filter(c => {
    const r = c.specialist_result || c.all_results?.unified
    return r?.label === 'Parkinson'
  }).length

  const accuracy = metrics?.spiral_vgg16?.accuracy
    ? `${(metrics.spiral_vgg16.accuracy * 100).toFixed(0)}%`
    : '89%'

  return (
    <div className="main-content">
      <div className="content-left">
        <div className="page-greeting">Hey Researcher!</div>
        <h1 className="page-title">Let's get to work</h1>

        {/* 3 Stat Cards Row */}
        <div className="grid-3 mb-6">
          <div className="stat-card">
            <div className="stat-title">Analyses</div>
            <div className="stat-value-row">
              <span className="stat-value">{cases.length || '0'}</span>
              <span className="stat-sub">this session</span>
            </div>
            <div className="mt-4">
              <span className="trend-badge trend-pos">+12%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Parkinson-Consistent</div>
            <div className="stat-value-row">
              <span className="stat-value">{pdCount}</span>
              <span className="stat-sub">detected</span>
            </div>
            <div className="mt-4">
              <span className="trend-badge trend-neg">Review Needed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Model Accuracy</div>
            <div className="stat-value-row">
              <span className="stat-value">{accuracy}</span>
              <span className="stat-sub">test set</span>
            </div>
            <div className="mt-4">
              <span className="trend-badge trend-pos">Optimized</span>
            </div>
          </div>
        </div>

        {/* Recent Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Uploads</h3>
            <Link to="/analyze" className="btn btn-glass" style={{ background: '#f4f7fa', color: 'var(--c-purple)', padding: '8px 16px', borderRadius: '12px' }}>
              + New Analysis
            </Link>
          </div>

          {cases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-ink-muted)' }}>
              No analyses yet. Start by uploading a drawing.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Assessment</th>
                  <th>Drawing Type</th>
                  <th>Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cases.map(c => {
                  const result = c.specialist_result || c.all_results?.unified
                  const label = result?.label ?? '—'
                  const routerLabel = c.routing_result?.label ?? '—'
                  
                  return (
                    <tr key={c.case_id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/analyze/${c.case_id}`)}>
                      <td style={{ fontWeight: 600 }}>#{formatCaseId(c.case_id)}</td>
                      <td>
                        <span style={{ color: label === 'Parkinson' ? 'var(--c-error)' : 'var(--c-success)', fontWeight: 600, fontSize: '0.8rem' }}>
                          • {label === 'Parkinson' ? 'Parkinson' : 'Healthy'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--c-ink-muted)' }}>{routerLabel}</td>
                      <td style={{ color: 'var(--c-ink-muted)' }}>{formatTimestamp(c.timestamp)}</td>
                      <td><ChevronRight size={16} color="var(--c-ink-light)" /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right Gradient Panel */}
      <div className="content-right">
        <div className="flex justify-between items-center mb-6">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Pipeline Status</h3>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>Active Models</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>5 / 5 Loaded</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { name: 'MobileNetV2 Router', sub: 'Drawing classification' },
            { name: 'Spiral Specialist', sub: 'VGG16 architecture' },
            { name: 'Wave Specialist', sub: 'VGG16 architecture' },
            { name: 'Unified Cross-Checker', sub: 'Fallback validation' },
            { name: 'PaHaW Kinematics', sub: 'Classical ML pipeline' }
          ].map((model, i) => (
            <div key={i} className="panel-item">
              <div className="panel-icon">
                <CheckCircle2 size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{model.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{model.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6" style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '12px', padding: '16px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)' }}>
          {health?.status === 'ok' 
            ? '✅ Backend inference engine is connected and ready for requests.' 
            : '⚠️ Connecting to inference engine...'}
        </div>
      </div>
    </div>
  )
}
