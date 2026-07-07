export default function ConfusionMatrix({ matrix }) {
  if (!matrix) return null
  const { labels, matrix: cells } = matrix
  if (!labels || !cells) return null

  const maxVal = Math.max(...cells.flat())

  const getIntensity = (val) => {
    const ratio = maxVal > 0 ? val / maxVal : 0
    return Math.round(ratio * 100)
  }

  return (
    <div>
      <h5 style={{ marginBottom: 12 }}>Routing Classifier Confusion Matrix</h5>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ fontSize: '0.875rem', minWidth: 300 }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', background: 'transparent', color: 'var(--color-ink-muted)' }}>
                Actual ↓ / Predicted →
              </th>
              {labels.map(l => (
                <th key={l} style={{ textAlign: 'center', padding: '6px 10px' }}>{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.map((row, i) => (
              <tr key={labels[i]}>
                <td style={{
                  fontWeight: 600,
                  padding: '6px 10px',
                  background: 'var(--color-neutral-bg)',
                  borderRight: '1px solid var(--color-border)',
                  color: 'var(--color-ink-muted)',
                  fontSize: '0.8125rem',
                }}>
                  {labels[i]}
                </td>
                {row.map((val, j) => {
                  const isDiag = i === j
                  const intensity = getIntensity(val)
                  return (
                    <td
                      key={j}
                      style={{
                        textAlign: 'center',
                        padding: '8px 12px',
                        fontWeight: isDiag ? 700 : 400,
                        background: isDiag
                          ? `rgba(13, 115, 119, ${intensity / 100 * 0.4 + 0.05})`
                          : val > 0
                          ? `rgba(248, 113, 113, ${Math.min(intensity / 100 * 0.4, 0.3)})`
                          : 'transparent',
                        color: isDiag ? 'var(--color-accent)' : val > 0 ? 'var(--color-error-text)' : 'var(--color-ink-muted)',
                        fontSize: '0.9375rem',
                        border: '1px solid var(--color-border-light)',
                      }}
                    >
                      {val}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: 8 }}>
        Diagonal = correct classifications · Off-diagonal = misclassifications
      </p>
    </div>
  )
}
