import { useState } from 'react'
import { Info } from 'lucide-react'

export default function ThresholdSlider({ baseMetrics }) {
  const [threshold, setThreshold] = useState(0.50)

  // Approximate sensitivity/specificity tradeoff at different thresholds
  // These are illustrative curves, not actual model outputs
  const approxSensitivity = Math.round(Math.min(0.99, 0.94 + (0.50 - threshold) * 0.8) * 100)
  const approxSpecificity = Math.round(Math.min(0.99, 0.93 + (threshold - 0.50) * 0.8) * 100)

  return (
    <div className="card" style={{ borderLeft: '3px solid var(--color-warning-border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h5 style={{ marginBottom: 4 }}>Decision Threshold</h5>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
            Educational control — does not affect actual inference
          </p>
        </div>
        <span className="badge badge-warn">Demo only</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 8 }}>
          <span style={{ color: 'var(--color-ink-muted)' }}>Threshold</span>
          <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-accent)' }}>
            t = {threshold.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={0.3}
          max={0.9}
          step={0.05}
          value={threshold}
          onChange={e => setThreshold(parseFloat(e.target.value))}
          aria-label="Decision threshold"
          id="threshold-slider"
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-ink-muted)', marginTop: 2 }}>
          <span>0.30 — More sensitive</span>
          <span>0.90 — More specific</span>
        </div>
      </div>

      {/* Tradeoff display */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{
          padding: '10px 12px',
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-success-border)',
          borderRadius: 'var(--radius)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-success-text)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
            Sensitivity (TPR)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-success-text)' }}>
            ~{approxSensitivity}%
          </div>
        </div>
        <div style={{
          padding: '10px 12px',
          background: 'var(--color-accent-soft)',
          border: '1px solid rgba(13,115,119,0.2)',
          borderRadius: 'var(--radius)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-accent)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
            Specificity (TNR)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}>
            ~{approxSpecificity}%
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
        <Info size={12} strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
        Sensitivity/specificity values are illustrative approximations for educational purposes.
        Actual model inference always uses t = 0.50.
      </div>
    </div>
  )
}
