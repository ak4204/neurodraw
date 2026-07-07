import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { getCase, generateReport } from '../utils/api'
import { formatTimestamp, formatInferenceTime, formatCaseId, getModeLabel } from '../utils/formatters'
import Disclaimer from '../components/Results/Disclaimer'

export default function Report() {
  const { caseId } = useParams()
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    getCase(caseId)
      .then(setCaseData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [caseId])

  const handleDownload = async () => {
    setDownloading(true)
    try { await generateReport(caseId) }
    catch (err) { alert(`PDF error: ${err.message}`) }
    finally { setDownloading(false) }
  }

  if (loading) return <div className="page-content"><p>Loading report…</p></div>
  if (error) return <div className="page-content"><p style={{ color: 'var(--color-error-text)' }}>{error}</p></div>
  if (!caseData) return null

  const primary = caseData.specialist_result || caseData.all_results?.unified
  const routing = caseData.routing_result

  return (
    <div className="page-content">
      {/* Print-hidden actions */}
      <div className="no-print" style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <Link to={`/analyze/${caseId}`} className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to Results
        </Link>
        <button className="btn btn-primary btn-sm" onClick={handleDownload} disabled={downloading} id="download-pdf-btn">
          <Download size={14} strokeWidth={1.5} />
          {downloading ? 'Generating…' : 'Download PDF'}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => window.print()} id="print-btn">
          <Printer size={14} strokeWidth={1.5} /> Print
        </button>
      </div>

      {/* Report body */}
      <div style={{ maxWidth: 720, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '40px 48px' }}>
        {/* Header */}
        <div style={{ borderBottom: '2px solid var(--color-accent)', paddingBottom: 20, marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: 4 }}>
            NeuroDraw
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)' }}>
            Parkinson's Handwriting Analysis — Research Report
          </div>
        </div>

        {/* Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Case ID</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>#{formatCaseId(caseData.case_id)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Generated</div>
            <div style={{ fontSize: '0.875rem' }}>{formatTimestamp(caseData.timestamp)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Mode</div>
            <div style={{ fontSize: '0.875rem' }}>{getModeLabel(caseData.mode)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Mock Results</div>
            <div style={{ fontSize: '0.875rem' }}>{caseData.is_mock ? 'Yes — simulated inference' : 'No — real inference'}</div>
          </div>
        </div>

        <div className="divider" />

        {/* Drawing classification */}
        <h4 style={{ fontFamily: 'var(--font-body)', marginBottom: 10 }}>Drawing Classification</h4>
        <table style={{ marginBottom: 24 }}>
          <tbody>
            <tr><td style={{ color: 'var(--color-ink-muted)', width: 160 }}>Detected type</td><td><strong>{routing?.label ?? '—'}</strong></td></tr>
            <tr><td style={{ color: 'var(--color-ink-muted)' }}>Router confidence</td><td>{Math.round((routing?.confidence ?? 0) * 100)}%</td></tr>
            <tr><td style={{ color: 'var(--color-ink-muted)' }}>Borderline</td><td>{routing?.is_borderline ? 'Yes' : 'No'}</td></tr>
          </tbody>
        </table>

        {/* Model results */}
        <h4 style={{ fontFamily: 'var(--font-body)', marginBottom: 10 }}>Model Results</h4>
        <table style={{ marginBottom: 24 }}>
          <thead>
            <tr>
              <th>Model</th>
              <th>Assessment</th>
              <th>Probability</th>
              <th>Inference</th>
            </tr>
          </thead>
          <tbody>
            {caseData.all_results
              ? Object.entries(caseData.all_results).map(([key, r]) => r && (
                  <tr key={key}>
                    <td>{r.model_name}</td>
                    <td>{r.label}-consistent</td>
                    <td>{(r.prob * 100).toFixed(1)}%</td>
                    <td>{formatInferenceTime(r.inference_time_ms)}</td>
                  </tr>
                ))
              : [caseData.specialist_result, caseData.unified_result].filter(Boolean).map((r, i) => (
                  <tr key={i}>
                    <td>{r.model_name}</td>
                    <td>{r.label}-consistent</td>
                    <td>{(r.prob * 100).toFixed(1)}%</td>
                    <td>{formatInferenceTime(r.inference_time_ms)}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>

        {/* Explanation */}
        {caseData.explanation && (
          <>
            <h4 style={{ fontFamily: 'var(--font-body)', marginBottom: 10 }}>Interpretation</h4>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-ink)', marginBottom: 24 }}>
              {caseData.explanation}
            </p>
          </>
        )}

        <div className="divider" />
        <Disclaimer prominent />
      </div>
    </div>
  )
}
