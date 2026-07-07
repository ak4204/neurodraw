import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  pass: { icon: CheckCircle, color: 'var(--color-success-text)', bg: 'var(--color-success-bg)' },
  warn: { icon: AlertTriangle, color: 'var(--color-warning-text)', bg: 'var(--color-warning-bg)' },
  fail: { icon: XCircle, color: 'var(--color-error-text)', bg: 'var(--color-error-bg)' },
}

export default function QualityCheck({ quality }) {
  if (!quality) return null
  const { passed, has_warnings, checks } = quality

  const overallStatus = !passed ? 'fail' : has_warnings ? 'warn' : 'pass'
  const { color: overallColor, bg: overallBg } = STATUS_CONFIG[overallStatus]

  return (
    <div style={{ marginTop: 12 }}>
      <div className="flex items-center gap-2 mb-2">
        <h5 style={{ marginBottom: 0 }}>Quality Assessment</h5>
        <span
          className="badge"
          style={{
            background: overallBg,
            color: overallColor,
            fontSize: '0.7rem',
          }}
        >
          {!passed ? 'Issues detected' : has_warnings ? 'Warnings' : 'Passed'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {(checks || []).map((check, i) => {
          const { icon: Icon, color, bg } = STATUS_CONFIG[check.status] || STATUS_CONFIG.pass
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 'var(--radius)',
                background: check.status !== 'pass' ? bg : 'transparent',
                fontSize: '0.8125rem',
              }}
            >
              <Icon size={14} strokeWidth={1.5} style={{ color, flexShrink: 0, marginTop: 1 }} />
              <div>
                <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{check.name}</span>
                {' — '}
                <span style={{ color: 'var(--color-ink-muted)' }}>{check.message}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
