import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function ResearchModelCard({ model, modelKey }) {
  const [expanded, setExpanded] = useState(false)

  const metrics = [
    { label: 'Accuracy', value: model.accuracy },
    { label: 'ROC-AUC', value: model.roc_auc },
    { label: 'Sensitivity', value: model.sensitivity },
    { label: 'Specificity', value: model.specificity },
    { label: 'Precision', value: model.precision },
    { label: 'Recall', value: model.recall },
    { label: 'F1 Score', value: model.f1 },
  ].filter(m => m.value != null)

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h4 style={{ marginBottom: 0 }}>{model.name}</h4>
            <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>{model.type?.split(' ')[0]}</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
            {model.dataset}
          </p>
        </div>
      </div>

      {/* Metrics table */}
      {metrics.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <table>
            <thead>
              <tr>
                {metrics.map(m => (
                  <th key={m.label} style={{ textAlign: 'center', fontSize: '0.65rem', padding: '6px 8px' }}>{m.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {metrics.map(m => (
                  <td key={m.label} style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-accent)', padding: '6px 8px' }}>
                    {(m.value * 100).toFixed(1)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Architecture collapsible */}
      <div className="accordion-item">
        <button
          className="accordion-header"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          style={{ fontSize: '0.8125rem' }}
        >
          Architecture & Details
          {expanded
            ? <ChevronDown size={14} strokeWidth={1.5} />
            : <ChevronRight size={14} strokeWidth={1.5} />
          }
        </button>
        {expanded && (
          <div className="accordion-body" style={{ fontSize: '0.8125rem' }}>
            {model.architecture && (
              <div style={{ marginBottom: 8 }}>
                <strong>Architecture:</strong>
                <div style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-neutral-bg)', padding: '6px 8px', borderRadius: 'var(--radius)', marginTop: 4, fontSize: '0.8rem', lineHeight: 1.5 }}>
                  {model.architecture}
                </div>
              </div>
            )}
            {model.training && <p style={{ marginBottom: 6 }}><strong>Training:</strong> {model.training}</p>}
            {model.input && <p style={{ marginBottom: 6 }}><strong>Input:</strong> {model.input}</p>}
            {model.threshold != null && <p style={{ marginBottom: 6 }}><strong>Decision threshold:</strong> {model.threshold}</p>}
            {model.features && <p><strong>Features:</strong> {model.features}</p>}
            {model.notes && <p style={{ marginTop: 6, padding: '6px 8px', background: 'var(--color-accent-soft)', borderRadius: 'var(--radius)' }}>{model.notes}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
