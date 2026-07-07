import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { getConfidenceBand, getConfidenceBandColor, formatConfidence } from '../../utils/formatters'

function CountUp({ target, duration = 1000 }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return <span>{value}</span>
}

export default function HeadlineResult({ caseData }) {
  if (!caseData) return null

  const {
    specialist_result,
    unified_result,
    all_results,
    routing_result,
    type_agnostic_mode,
  } = caseData

  // Primary result: for all_three use unified, otherwise specialist
  const primary = all_results?.unified || specialist_result || {}
  const label = primary.label || 'Healthy'
  const prob = primary.prob ?? 0.5

  // Confidence: distance from decision boundary
  const rawConf = Math.abs(prob - 0.5) * 2
  const confidencePct = Math.round(rawConf * 100)
  const band = getConfidenceBand(rawConf)
  const bandColor = getConfidenceBandColor(band)

  const isParkinson = label === 'Parkinson'
  const displayLabel = isParkinson ? 'Parkinson-consistent' : 'Healthy-consistent'

  const routerLabel = routing_result?.label ?? '—'
  const routerConf = Math.round((routing_result?.confidence || 0) * 100)

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Main verdict */}
      <div style={{ marginBottom: 8 }}>
        {type_agnostic_mode && (
          <span className="badge badge-warn" style={{ marginBottom: 10, display: 'inline-flex' }}>
            Type-agnostic demo mode
          </span>
        )}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.25rem',
            fontWeight: 700,
            color: 'var(--color-ink)',
            lineHeight: 1.2,
            marginBottom: 8,
          }}
          className="count-up"
        >
          {displayLabel}
        </h2>
      </div>

      {/* Confidence display */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span
            style={{
              fontSize: '3rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: 'var(--color-accent)',
              lineHeight: 1,
            }}
          >
            <CountUp target={confidencePct} />%
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)' }}>
            confidence
          </span>
        </div>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: bandColor,
            padding: '2px 8px',
            borderRadius: 99,
            background: band === 'High' ? 'var(--color-accent-soft)' : band === 'Moderate' ? 'var(--color-warning-bg)' : 'var(--color-neutral-bg)',
            border: `1px solid ${bandColor}30`,
          }}
        >
          {band} confidence
        </span>
      </div>

      {/* Probability bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginBottom: 4 }}>
          <span>Healthy</span>
          <span>Raw probability: {(prob * 100).toFixed(1)}%</span>
          <span>Parkinson</span>
        </div>
        <div className="prob-bar-track" style={{ height: 8 }}>
          <div
            className="prob-bar-fill"
            style={{ width: `${prob * 100}%` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <div style={{ width: 2, height: 6, background: 'var(--color-border)', borderRadius: 1 }} />
        </div>
      </div>

      {/* Router verdict summary */}
      <div style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)' }}>
        <span>
          Detected: <strong style={{ color: 'var(--color-ink)' }}>{routerLabel}</strong> drawing
        </span>
        {' · '}
        <span>Router confidence: <strong style={{ color: 'var(--color-ink)' }}>{routerConf}%</strong></span>
        {routing_result?.is_mock && (
          <span className="badge badge-warn" style={{ marginLeft: 6, fontSize: '0.65rem' }}>mock</span>
        )}
      </div>
    </div>
  )
}
