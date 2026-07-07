import { formatInferenceTime } from '../../utils/formatters'

const MODEL_LABELS = {
  spiral: 'Spiral VGG16',
  wave: 'Wave VGG16',
  unified: 'Unified VGG16',
}

function CompareCard({ modelKey, result }) {
  if (!result) return (
    <div className="card" style={{ opacity: 0.4 }}>
      <h5>{MODEL_LABELS[modelKey] || modelKey}</h5>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)' }}>No result</p>
    </div>
  )

  const prob = result.prob ?? 0.5
  const isParkinson = result.label === 'Parkinson'

  return (
    <div className="card" style={{ borderTop: `3px solid var(--color-accent)` }}>
      <h5 style={{ marginBottom: 8 }}>{MODEL_LABELS[modelKey] || result.model_name}</h5>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.125rem',
        fontWeight: 600,
        color: 'var(--color-ink)',
        marginBottom: 12,
      }}>
        {isParkinson ? 'Parkinson-consistent' : 'Healthy-consistent'}
      </div>

      <div className="prob-bar-track" style={{ marginBottom: 4 }}>
        <div className="prob-bar-fill" style={{ width: `${prob * 100}%` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginBottom: 12 }}>
        <span>0%</span>
        <span style={{ fontWeight: 500, color: 'var(--color-accent)' }}>{(prob * 100).toFixed(1)}%</span>
        <span>100%</span>
      </div>

      <table style={{ fontSize: '0.8rem' }}>
        <tbody>
          <tr>
            <td style={{ color: 'var(--color-ink-muted)', paddingLeft: 0, paddingRight: 12 }}>Inference</td>
            <td style={{ paddingLeft: 0 }}>{formatInferenceTime(result.inference_time_ms)}</td>
          </tr>
          <tr>
            <td style={{ color: 'var(--color-ink-muted)', paddingLeft: 0, paddingRight: 12 }}>Mock</td>
            <td style={{ paddingLeft: 0 }}>{result.is_mock ? 'Yes' : 'No'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function CompareView({ allResults, routingResult }) {
  if (!allResults) return null

  const allLabels = Object.values(allResults).filter(Boolean).map(r => r.label)
  const hasDisagreement = new Set(allLabels).size > 1

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h5 style={{ marginBottom: 0 }}>All Three Models</h5>
        <span className="badge badge-warn">Type-agnostic demo mode</span>
      </div>

      <div style={{
        padding: '8px 12px',
        background: 'var(--color-warning-bg)',
        border: '1px solid var(--color-warning-border)',
        borderRadius: 'var(--radius)',
        fontSize: '0.8rem',
        color: 'var(--color-warning-text)',
        marginBottom: 16,
      }}>
        All three diagnostic models ran in parallel regardless of drawing type.
        The routing classifier verdict is still shown below for reference.
        {hasDisagreement && ' Models show disagreement — interpret results carefully.'}
      </div>

      <div className="grid-3">
        {['spiral', 'wave', 'unified'].map(key => (
          <CompareCard key={key} modelKey={key} result={allResults[key]} />
        ))}
      </div>
    </div>
  )
}
