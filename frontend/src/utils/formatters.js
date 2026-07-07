/* Formatting utilities for NeuroDraw */

export function formatConfidence(prob) {
  if (prob == null) return '—'
  return `${Math.round(prob * 100)}%`
}

export function formatProbability(prob) {
  if (prob == null) return '—'
  return prob.toFixed(3)
}

export function getConfidenceBand(prob) {
  if (prob == null) return 'Unknown'
  const pct = prob * 100
  if (pct >= 80) return 'High'
  if (pct >= 60) return 'Moderate'
  return 'Low'
}

export function getConfidenceBandColor(band) {
  switch (band) {
    case 'High': return 'var(--color-accent)'
    case 'Moderate': return 'var(--color-warning-text)'
    default: return 'var(--color-ink-muted)'
  }
}

export function getResultLabel(label) {
  if (!label) return '—'
  if (label === 'Parkinson') return 'Parkinson-consistent'
  if (label === 'Healthy') return 'Healthy-consistent'
  return label
}

export function formatTimestamp(iso) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function formatInferenceTime(ms) {
  if (ms == null) return '—'
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms)}ms`
}

export function getDrawingTypeLabel(type) {
  if (!type) return 'Unknown'
  const map = { spiral: 'Spiral', wave: 'Wave', garbage: 'Invalid' }
  return map[type?.toLowerCase()] ?? type
}

export function formatCaseId(caseId) {
  if (!caseId) return '—'
  return caseId.slice(0, 8).toUpperCase()
}

export function getModeLabel(mode) {
  const map = {
    auto: 'Auto-route',
    manual: 'Manual Select',
    all_three: 'Run All Three',
  }
  return map[mode] ?? mode
}
