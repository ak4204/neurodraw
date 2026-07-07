import { Zap, Target, GitCompare, Info, ChevronDown } from 'lucide-react'

const MODES = [
  {
    id: 'auto',
    icon: Zap,
    title: 'Auto-route',
    description: "Router classifies the drawing and selects the specialist model automatically",
    chip: "Router's pick",
  },
  {
    id: 'manual',
    icon: Target,
    title: 'Manual select',
    description: 'You choose which diagnostic model to apply',
    chip: null,
  },
  {
    id: 'all_three',
    icon: GitCompare,
    title: 'Run All Three',
    description: 'Run all three diagnostic models in parallel for comparison',
    chip: 'Type-agnostic demo',
  },
]

const MANUAL_OPTIONS = [
  { value: 'spiral', label: 'Spiral VGG16 — trained on spiral drawings' },
  { value: 'wave', label: 'Wave VGG16 — trained on wave drawings' },
  { value: 'unified', label: 'Unified VGG16 — trained on combined dataset' },
]

export default function ModelSelector({ mode, onMode, manualModel, onManualModel }) {
  return (
    <div>
      <h5 className="mb-3">Analysis Mode</h5>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {MODES.map(({ id, icon: Icon, title, description, chip }) => (
          <div
            key={id}
            className={`model-radio-card ${mode === id ? 'selected' : ''}`}
            onClick={() => onMode(id)}
            role="radio"
            aria-checked={mode === id}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onMode(id)}
            id={`mode-${id}`}
          >
            <div className={`radio-dot ${mode === id ? 'checked' : ''}`} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                <Icon size={14} strokeWidth={1.5} style={{ color: mode === id ? 'var(--color-accent)' : 'var(--color-ink-muted)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-ink)' }}>{title}</span>
                {chip && (
                  <span className={`badge ${id === 'all_three' ? 'badge-warn' : 'badge-teal'}`} style={{ fontSize: '0.65rem' }}>
                    {chip}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', lineHeight: 1.4 }}>
                {description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual model selector */}
      {mode === 'manual' && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--color-accent-soft)', borderRadius: 'var(--radius)', border: '1px solid rgba(13,115,119,0.2)' }}>
          <label className="label" htmlFor="manual-model-select" style={{ color: 'var(--color-accent)', fontSize: '0.8rem' }}>
            Select model
          </label>
          <div style={{ position: 'relative' }}>
            <select
              id="manual-model-select"
              className="input select"
              value={manualModel || ''}
              onChange={e => onManualModel(e.target.value)}
              style={{ fontSize: '0.875rem' }}
            >
              <option value="" disabled>Choose a model…</option>
              {MANUAL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* All-three info note */}
      {mode === 'all_three' && (
        <div style={{
          marginTop: 10,
          padding: '8px 10px',
          background: 'var(--color-warning-bg)',
          border: '1px solid var(--color-warning-border)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          gap: 7,
          alignItems: 'flex-start',
          fontSize: '0.8rem',
          color: 'var(--color-warning-text)',
        }}>
          <Info size={13} strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            The "invalid drawing" gate is bypassed in this mode — all three models
            run regardless of drawing type. Router verdict is still shown for reference.
          </span>
        </div>
      )}
    </div>
  )
}
