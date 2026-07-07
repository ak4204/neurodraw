import { Check, X } from 'lucide-react'
import { formatInferenceTime } from '../../utils/formatters'

function ModelCard({ result, title, isPrimary }) {
  if (!result) return null
  const prob = result.prob ?? 0.5
  const isParkinson = result.label === 'Parkinson'

  return (
    <div
      className="card"
      style={{
        borderLeft: isPrimary ? '3px solid var(--color-accent)' : undefined,
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h5 style={{ marginBottom: 0, fontSize: '0.6875rem' }}>{title}</h5>
          {result.is_mock && (
            <span className="badge badge-warn" style={{ fontSize: '0.6rem' }}>mock</span>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-ink)' }}>
          {isParkinson ? 'Parkinson-consistent' : 'Healthy-consistent'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: 2 }}>
          {result.model_name}
        </div>
      </div>

      {/* Prob bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginBottom: 3 }}>
          <span>Healthy</span>
          <span>Parkinson</span>
        </div>
        <div className="prob-bar-track">
          <div
            className="prob-bar-fill"
            style={{ width: `${prob * 100}%` }}
          />
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: 2 }}>
          {(prob * 100).toFixed(1)}%
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Inference</span>
        <span style={{ color: 'var(--color-ink)' }}>{formatInferenceTime(result.inference_time_ms)}</span>
      </div>
    </div>
  )
}

export default function ModelCards({ specialist, unified, mode }) {
  if (!specialist && !unified) return null

  const modelsAgree = specialist && unified && specialist.label === unified.label
  const bothPresent = specialist && unified && specialist !== unified

  return (
    <div>
      <h5 className="mb-3">Model Results</h5>
      <div className="grid-2" style={{ marginBottom: 10 }}>
        <ModelCard result={specialist} title="Primary Model" isPrimary />
        {unified && unified !== specialist && (
          <ModelCard result={unified} title="Unified Cross-check" isPrimary={false} />
        )}
      </div>

      {bothPresent && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          fontSize: '0.8125rem',
          padding: '6px 10px',
          borderRadius: 'var(--radius)',
          background: modelsAgree ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
          border: `1px solid ${modelsAgree ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`,
          color: modelsAgree ? 'var(--color-success-text)' : 'var(--color-warning-text)',
        }}>
          {modelsAgree
            ? <Check size={13} strokeWidth={2} />
            : <X size={13} strokeWidth={2} />
          }
          {modelsAgree
            ? 'Both models agree on the assessment'
            : 'Models disagree — manual review recommended'
          }
        </div>
      )}
    </div>
  )
}
