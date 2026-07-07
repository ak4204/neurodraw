import {
  Upload, Cpu, Scan, Eye, Brain, GitMerge, FileText,
  Check, AlertTriangle, Loader, SkipForward,
} from 'lucide-react'

const STEP_ICONS = {
  uploading: Upload,
  preprocessing: Cpu,
  routing: Scan,
  quality: Eye,
  specialist: Brain,
  unified: GitMerge,
  report: FileText,
}

function StepIcon({ stepId, status }) {
  const Icon = STEP_ICONS[stepId] || FileText
  const isDone = status === 'done'
  const isActive = status === 'active'
  const isError = status === 'error'
  const isSkipped = status === 'skipped'

  let bg = 'var(--color-surface)'
  let border = 'var(--color-border)'
  let color = 'var(--color-ink-muted)'

  if (isDone) { bg = 'var(--color-accent)'; border = 'var(--color-accent)'; color = '#fff' }
  if (isActive) { bg = 'var(--color-accent-soft)'; border = 'var(--color-accent)'; color = 'var(--color-accent)' }
  if (isError) { bg = 'var(--color-error-bg)'; border = 'var(--color-error-border)'; color = 'var(--color-error-text)' }
  if (isSkipped) { bg = 'var(--color-neutral-bg)'; border = 'var(--color-border)'; color = 'var(--color-border)' }

  return (
    <div
      style={{
        width: 28, height: 28, borderRadius: '50%',
        border: `1px solid ${border}`,
        background: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.3s ease',
        animation: isActive ? 'pulse-step 1.5s ease-in-out infinite' : 'none',
      }}
    >
      {isDone
        ? <Check size={13} strokeWidth={2.5} />
        : isError
        ? <AlertTriangle size={12} strokeWidth={2} />
        : isSkipped
        ? <SkipForward size={12} strokeWidth={1.5} />
        : isActive
        ? <Loader size={12} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
        : <Icon size={12} strokeWidth={1.5} />
      }
    </div>
  )
}

export default function PipelineStepper({ steps, stepStatus, routingResult, onForceAnalyze }) {
  const isGarbage = routingResult?.is_garbage && !routingResult?.is_borderline
  const isBorderline = routingResult?.is_borderline

  return (
    <div>
      <h5 className="mb-3">Pipeline</h5>
      <div className="stepper">
        {steps.map(({ id, label }) => {
          const status = stepStatus[id] || 'pending'
          return (
            <div key={id} className="step-item">
              <StepIcon stepId={id} status={status} />
              <span
                className={`step-label ${status}`}
                style={{
                  fontSize: '0.875rem',
                  textDecoration: status === 'skipped' ? 'line-through' : 'none',
                }}
              >
                {label}
              </span>
              {status === 'active' && (
                <span style={{
                  fontSize: '0.7rem',
                  color: 'var(--color-accent)',
                  fontWeight: 500,
                }}>
                  …
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Routing verdict chip */}
      {routingResult && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-ink-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
            Router verdict
          </div>

          {isGarbage ? (
            <div style={{
              border: '1px solid var(--color-error-border)',
              background: 'var(--color-error-bg)',
              borderRadius: 'var(--radius)',
              padding: '10px 12px',
              fontSize: '0.8125rem',
              color: 'var(--color-error-text)',
            }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                ⚠ Not recognized as a valid drawing
              </div>
              <div style={{ color: 'var(--color-ink-muted)', marginBottom: 8, fontSize: '0.8rem' }}>
                The routing classifier could not identify this as a spiral or wave drawing.
                Please upload a clearer image on plain white paper.
              </div>
              {onForceAnalyze && (
                <button
                  className="btn-accent-ghost"
                  style={{ fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-muted)', textDecoration: 'underline', padding: 0 }}
                  onClick={onForceAnalyze}
                >
                  Force analyze anyway (demo override)
                </button>
              )}
            </div>
          ) : isBorderline ? (
            <div style={{ border: '1px solid var(--color-warning-border)', background: 'var(--color-warning-bg)', borderRadius: 'var(--radius)', padding: '10px 12px', fontSize: '0.8125rem' }}>
              <div style={{ fontWeight: 500, color: 'var(--color-warning-text)', marginBottom: 8 }}>
                Borderline confidence — confirm drawing type:
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="badge badge-teal" style={{ padding: '3px 10px', cursor: 'default' }}>
                  Spiral ({Math.round((routingResult.all_probs?.Spiral || 0) * 100)}%)
                </span>
                <span className="badge badge-neutral" style={{ padding: '3px 10px', cursor: 'default' }}>
                  Wave ({Math.round((routingResult.all_probs?.Wave || 0) * 100)}%)
                </span>
              </div>
            </div>
          ) : routingResult.label ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-teal">
                Detected: {routingResult.label}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
                {Math.round((routingResult.confidence || 0) * 100)}% confidence
              </span>
              {routingResult.is_mock && (
                <span className="badge badge-warn" style={{ fontSize: '0.65rem' }}>mock</span>
              )}
            </div>
          ) : null}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
