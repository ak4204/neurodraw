import { useRef, useState, useCallback } from 'react'
import { Upload, Image as ImageIcon, X, CheckCircle } from 'lucide-react'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/bmp']

const GUIDELINES = [
  'Plain white paper — no lines or grid',
  'Camera directly overhead, no tilt',
  'Full drawing visible in frame',
  'Sharp focus, even lighting',
  'No shadows across the drawing',
]

export default function DropZone({ onFile }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  const handleFile = useCallback((f) => {
    if (!f) return
    if (!ACCEPTED.includes(f.type)) {
      setError('Please upload a JPG, PNG, or BMP image.')
      return
    }
    setError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    onFile(f)
  }, [onFile])

  const clear = useCallback(() => {
    setFile(null); setPreview(null); setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onFile(null)
  }, [onFile])

  if (file && preview) {
    return (
      <div>
        <div style={{ border: '1.5px solid var(--c-border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card-sm)' }}>
          <img src={preview} alt="Drawing preview" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', background: '#fff', display: 'block', padding: 8 }} />
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--c-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
              <ImageIcon size={14} strokeWidth={1.5} style={{ color: 'var(--c-teal)' }} />
              <span style={{ fontWeight: 500 }}>{file.name}</span>
              <span style={{ color: 'var(--c-ink-muted)' }}>· {(file.size / 1024).toFixed(0)} KB</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={clear} style={{ color: 'var(--c-ink-muted)', padding: '4px 8px' }}>
              <X size={13} strokeWidth={2} /> Remove
            </button>
          </div>
        </div>
        <div className="mt-3" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--c-teal)', fontWeight: 500 }}>
          <CheckCircle size={14} strokeWidth={2} /> Image ready for analysis
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        className={`dropzone${dragOver ? ' drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => inputRef.current?.click()}
        role="button" tabIndex={0}
        aria-label="Upload drawing"
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} id="drawing-file-input" />

        <div className="dropzone-icon">
          <Upload size={26} strokeWidth={1.75} style={{ color: dragOver ? 'var(--c-teal)' : 'var(--c-indigo)' }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>
          {dragOver ? 'Drop your drawing here' : 'Upload a Drawing'}
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--c-ink-muted)', marginBottom: 12 }}>
          Drag & drop or click to browse — JPG, PNG, BMP
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-pill)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--c-ink-muted)' }}>
          Choose file
        </div>
      </div>

      {error && <div className="badge badge-error mt-2">{error}</div>}

      {/* Drawing reference icons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        {[
          { label: 'Spiral', path: 'M18 18 Q22 14 22 18 Q22 24 16 24 Q10 24 10 18 Q10 12 18 12 Q26 12 26 18 Q26 26 18 26' },
          { label: 'Wave', path: 'M6 18 Q9 12 12 18 Q15 24 18 18 Q21 12 24 18 Q27 24 30 18' },
        ].map(({ label, path }) => (
          <div key={label} style={{ flex: 1, background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', padding: '10px 8px', textAlign: 'center' }}>
            <svg width="48" height="36" viewBox="0 0 36 36" fill="none" stroke="var(--c-teal)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 6px', display: 'block' }}>
              <path d={path} />
            </svg>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--c-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Guidelines */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--c-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Image Guidelines</div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {GUIDELINES.map((g, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--c-ink-muted)' }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--c-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={10} strokeWidth={2.5} style={{ color: 'var(--c-teal)' }} />
              </div>
              {g}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
