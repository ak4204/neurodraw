import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, FileText, Clock, Download } from 'lucide-react'
import { getCase, generateReport } from '../utils/api'
import { formatTimestamp, formatInferenceTime, formatCaseId, getModeLabel } from '../utils/formatters'
import HeadlineResult from '../components/Results/HeadlineResult'
import ModelCards from '../components/Results/ModelCards'
import CompareView from '../components/Results/CompareView'
import Disclaimer from '../components/Results/Disclaimer'

export default function Results() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getCase(caseId)
      .then(data => { if (!cancelled) setCaseData(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [caseId])

  const handleReport = async () => {
    setReportLoading(true)
    try {
      await generateReport(caseId)
    } catch (err) {
      alert(`Report error: ${err.message}`)
    } finally {
      setReportLoading(false)
    }
  }

  if (loading) return (
    <div className="page-content">
      <div className="empty-state">
        <p>Loading case…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="page-content">
      <div style={{ padding: '20px', border: '1px solid var(--color-error-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-error-bg)', color: 'var(--color-error-text)' }}>
        <strong>Error loading case:</strong> {error}
      </div>
      <Link to="/analyze" className="btn btn-secondary mt-4">
        <ArrowLeft size={14} strokeWidth={1.5} /> New Analysis
      </Link>
    </div>
  )

  if (!caseData) return null

  const isMock = caseData.is_mock
  const isAllThree = caseData.mode === 'all_three'

  return (
    <div className="page-content">
      {/* Mock banner */}
      {isMock && (
        <div className="mock-banner" style={{ marginBottom: 20, borderRadius: 'var(--radius)', border: '1px solid var(--color-warning-border)' }}>
          <AlertTriangle size={14} strokeWidth={1.5} />
          Model files not detected — showing simulated results for layout preview. Real inference requires model files in backend/models/
        </div>
      )}

      {/* Back nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <Link to="/analyze" className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} strokeWidth={1.5} /> New Analysis
        </Link>
        <div style={{ display: 'flex', gap: 6, fontSize: '0.75rem', color: 'var(--color-ink-muted)', alignItems: 'center' }}>
          <Clock size={12} strokeWidth={1.5} />
          {formatTimestamp(caseData.timestamp)}
          <span style={{ marginLeft: 4, padding: '1px 6px', background: 'var(--color-neutral-bg)', borderRadius: 99, fontFamily: 'var(--font-mono)', border: '1px solid var(--color-border)' }}>
            #{formatCaseId(caseData.case_id)}
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
            {getModeLabel(caseData.mode)}
          </span>
        </div>
      </div>

      {/* Headline */}
      <HeadlineResult caseData={caseData} />

      <div className="divider" />

      {/* Router verdict (always shown, including all_three mode) */}
      <div className="card mb-4">
        <h5 className="mb-3">Drawing Classification (Router)</h5>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span className="badge badge-teal" style={{ fontSize: '0.8125rem', padding: '3px 10px' }}>
            Detected: {caseData.routing_result?.label ?? '—'}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)' }}>
            Router confidence: <strong style={{ color: 'var(--color-ink)' }}>
              {Math.round((caseData.routing_result?.confidence ?? 0) * 100)}%
            </strong>
          </span>
          {isAllThree && (
            <span className="badge badge-warn" style={{ fontSize: '0.7rem' }}>
              Bypassed for model selection — type-agnostic mode
            </span>
          )}
          {caseData.routing_result?.is_borderline && (
            <span className="badge badge-warn">Borderline confidence</span>
          )}
        </div>
      </div>

      {/* Model results */}
      <div className="mb-4">
        {isAllThree ? (
          <CompareView allResults={caseData.all_results} routingResult={caseData.routing_result} />
        ) : (
          <ModelCards
            specialist={caseData.specialist_result}
            unified={caseData.unified_result}
            mode={caseData.mode}
          />
        )}
      </div>

      {/* Explanation */}
      {caseData.explanation && (
        <div className="card card-accent mb-4">
          <h5 className="mb-2">Interpretation</h5>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-ink)' }}>
            {caseData.explanation}
          </p>
          <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
            <span>Inference: {formatInferenceTime(caseData.inference_time_ms)}</span>
            {isMock && <span>⚠ Mock inference</span>}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mb-4">
        <Disclaimer prominent />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          onClick={handleReport}
          disabled={reportLoading}
          id="generate-report-btn"
        >
          <Download size={14} strokeWidth={1.5} />
          {reportLoading ? 'Generating…' : 'Generate Report'}
        </button>
        <Link to={`/reports/${caseId}`} className="btn btn-secondary">
          <FileText size={14} strokeWidth={1.5} />
          View Report
        </Link>
        <Link to="/history" className="btn btn-secondary">
          Save to History
        </Link>
        <Link to="/analyze" className="btn btn-ghost">
          Analyze another image
        </Link>
      </div>
    </div>
  )
}
