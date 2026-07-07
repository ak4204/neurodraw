import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, FileText, Search, Clock, Upload, RefreshCw, Activity } from 'lucide-react'
import { useHistory } from '../hooks/useHistory'
import { formatTimestamp, formatCaseId } from '../utils/formatters'

function toConfidence(prob) {
  const p = Math.min(1, Math.max(0, prob ?? 0.5))
  return Math.min(Math.max(p, 1 - p), 0.96)
}

function HistoryCard({ caseItem, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const result = caseItem.specialist_result || caseItem.all_results?.unified
  const label = result?.label
  const prob = result?.prob ?? 0.5
  const confidence = toConfidence(prob)
  const isPD = label === 'Parkinson'
  const routerLabel = caseItem.routing_result?.label ?? '—'
  const color = isPD ? 'var(--c-error)' : 'var(--c-success)'
  const bgColor = isPD ? 'var(--c-error-bg)' : 'var(--c-success-bg)'

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{
            padding: '4px 10px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700,
            background: bgColor, color, marginBottom: 6, display: 'inline-block'
          }}>
            {isPD ? 'Parkinson Positive' : 'Healthy Negative'}
          </span>
          {caseItem.is_mock && (
            <span style={{ marginLeft: 6, padding: '3px 8px', borderRadius: 99, fontSize: '0.7rem', background: '#fffbea', color: 'var(--c-warning)', fontWeight: 600 }}>mock</span>
          )}
          <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--c-ink-muted)', marginTop: 4 }}>
            #{formatCaseId(caseItem.case_id)}
          </div>
        </div>
        <button
          style={{ padding: '6px', color: 'var(--c-ink-muted)', borderRadius: 8, border: '1px solid #edf2f7', background: 'white' }}
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Confidence Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--c-ink-muted)' }}>Confidence</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{Math.round(confidence * 100)}%</span>
        </div>
        <div style={{ height: 8, background: '#edf2f7', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.round(confidence * 100)}%`, background: color, borderRadius: 99 }} />
        </div>
      </div>

      {/* Metadata */}
      <div style={{ fontSize: '0.8rem', color: 'var(--c-ink-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={13} /> {formatTimestamp(caseItem.timestamp)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={13} /> Drawing: <strong style={{ color: 'var(--c-ink)' }}>{routerLabel}</strong>
        </div>
      </div>

      {/* Actions */}
      {confirmDelete ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--c-error-bg)', color: 'var(--c-error)', fontWeight: 600, fontSize: '0.85rem', border: '1px solid var(--c-error)' }}
            onClick={() => onDelete(caseItem.case_id)}
          >Delete</button>
          <button
            style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#f1f5f9', color: 'var(--c-ink)', fontWeight: 600, fontSize: '0.85rem', border: '1px solid #e2e8f0' }}
            onClick={() => setConfirmDelete(false)}
          >Cancel</button>
        </div>
      ) : (
        <Link
          to={`/analyze/${caseItem.case_id}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, background: 'var(--c-purple-light)', color: 'var(--c-purple)', fontWeight: 600, fontSize: '0.85rem' }}
        >
          <FileText size={14} /> View Full Results
        </Link>
      )}
    </div>
  )
}

export default function History() {
  const { cases, loading, error, refreshCases, removeCase } = useHistory()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => { refreshCases() }, [refreshCases])

  const filtered = cases
    .filter(c => {
      if (!query) return true
      const q = query.toLowerCase()
      return (
        (c.routing_result?.label ?? '').toLowerCase().includes(q) ||
        (c.specialist_result?.label ?? '').toLowerCase().includes(q) ||
        c.case_id.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.timestamp) - new Date(a.timestamp)
      if (sort === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp)
      if (sort === 'confidence') {
        const probA = (a.specialist_result || a.all_results?.unified)?.prob ?? 0
        const probB = (b.specialist_result || b.all_results?.unified)?.prob ?? 0
        return Math.abs(probB - 0.5) - Math.abs(probA - 0.5)
      }
      return 0
    })

  return (
    <div style={{ padding: '40px', width: '100%' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>Analysis History</h1>
        <p className="page-greeting" style={{ fontSize: '1.05rem' }}>Session-based history — resets when the server restarts.</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-ink-light)', pointerEvents: 'none' }} />
          <input
            className="input"
            style={{ paddingLeft: 40, margin: 0 }}
            placeholder="Search by type or Case ID…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <select
          className="input select"
          style={{ width: 200, margin: 0 }}
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="confidence">Highest confidence</option>
        </select>
        <button
          className="btn"
          style={{ background: '#f1f5f9', color: 'var(--c-ink)', border: '1px solid #e2e8f0', gap: 8, flexShrink: 0 }}
          onClick={refreshCases}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 24, padding: '14px 18px', background: 'var(--c-error-bg)', color: 'var(--c-error)', borderRadius: 12, fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--c-ink-muted)' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Clock size={36} color="var(--c-ink-light)" />
          </div>
          <h3 style={{ color: 'var(--c-ink)', marginBottom: 8 }}>{query ? 'No results match' : 'No analyses yet'}</h3>
          <p style={{ marginBottom: 24, fontSize: '0.95rem' }}>{query ? 'Try a different search.' : 'Run your first image analysis to see results here.'}</p>
          {!query && (
            <Link to="/analyze" className="btn btn-primary">
              <Upload size={16} /> Start Analysis
            </Link>
          )}
        </div>
      )}

      {/* Count */}
      {filtered.length > 0 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)', marginBottom: 20 }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Cards Grid */}
      {filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map(c => (
            <HistoryCard key={c.case_id} caseItem={c} onDelete={removeCase} />
          ))}
        </div>
      )}
    </div>
  )
}
