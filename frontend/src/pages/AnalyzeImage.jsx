import { useState, useRef } from 'react'
import {
  Upload, CheckCircle, AlertCircle, Loader2, ArrowLeft,
  BrainCircuit, Activity, Cpu, RefreshCw, ShieldCheck, ShieldAlert, Info
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotif } from '../context/NotifContext'

const API_BASE = import.meta.env.PROD ? 'https://ak332-neurodraw-backend.hf.space/api' : '/api'

const MODELS = [
  { key: 'auto', label: 'Auto (Recommended)', desc: 'Router picks the best specialist model automatically.' },
  { key: 'all_three', label: 'Run All Three Models', desc: 'Spiral + Wave + Unified run simultaneously for cross-validation.' },
  { key: 'manual_spiral', label: 'Spiral Specialist', desc: 'Force the Spiral VGG16 model regardless of drawing type.' },
  { key: 'manual_wave', label: 'Wave Specialist', desc: 'Force the Wave VGG16 model regardless of drawing type.' },
  { key: 'manual_unified', label: 'Unified Cross-Checker', desc: 'Run only the combined Spiral+Wave VGG16 model.' },
]

// Converts raw model probability to a medically-believable confidence.
// Clamps input to [0,1], then maps distance from 0.5 to a [50%-96%] display range.
// A real clinical AI never claims 100% certainty.
function toConfidence(prob) {
  const p = Math.min(1, Math.max(0, prob ?? 0.5)) // clamp raw prob to [0, 1]
  const raw = Math.max(p, 1 - p)                  // distance from 0.5 → always >= 0.5
  const capped = Math.min(raw, 0.96)               // medical cap: never show 100%
  return capped
}

function ConfidenceBar({ prob, color }) {
  const confidence = toConfidence(prob)
  const pct = Math.round(confidence * 100)
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--c-ink-muted)' }}>Confidence</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 8, background: '#edf2f7', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

function ModelCard({ title, result, icon: Icon }) {
  if (!result) return null
  const isPD = result.label === 'Parkinson'
  const color = isPD ? 'var(--c-error)' : 'var(--c-success)'
  const bgColor = isPD ? 'var(--c-error-bg)' : 'var(--c-success-bg)'
  const prob = result.prob ?? 0.5

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--c-purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-purple)' }}>
              <Icon size={16} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{result.label}</div>
        </div>
        <span style={{ padding: '6px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700, background: bgColor, color }}>
          {isPD ? 'Positive' : 'Negative'}
        </span>
      </div>
      <ConfidenceBar prob={prob} color={color} />
      {result.is_mock && (
        <div style={{ fontSize: '0.78rem', color: 'var(--c-warning)', background: '#fffbea', borderRadius: 8, padding: '6px 10px' }}>
          ⚠ Mock result — model file not loaded
        </div>
      )}
    </div>
  )
}

export default function AnalyzeImage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [selectedMode, setSelectedMode] = useState('auto')
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const fileInput = useRef(null)
  const { push } = useNotif()

  const handleFile = (f) => {
    if (!f) return
    if (!['image/jpeg', 'image/png', 'image/bmp'].includes(f.type)) {
      setError('Please upload a JPG, PNG, or BMP image.')
      return
    }
    setError(null)
    setResult(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const runAnalysis = async () => {
    if (!file) return
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Resolve mode and optional manual_model
      if (selectedMode.startsWith('manual_')) {
        formData.append('mode', 'manual')
        formData.append('manual_model', selectedMode.replace('manual_', ''))
      } else {
        formData.append('mode', selectedMode)
      }

      const res = await fetch(`${API_BASE}/analyze`, { method: 'POST', body: formData })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `Server error ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
      // Push notification
      const label = data.specialist_result?.label || data.all_results?.unified?.label || 'Unknown'
      const drawing = data.routing_result?.label || 'Drawing'
      if (data.blocked) {
        push(`Image rejected: not a valid spiral or wave drawing.`, 'warning')
      } else {
        push(`${drawing} analysis complete — Result: ${label}`, label === 'Parkinson' ? 'error' : 'success')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(null) }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      <Link to="/analyze" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--c-ink-muted)', marginBottom: 24, fontSize: '0.9rem', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Hub
      </Link>
      <h1 className="page-title" style={{ marginBottom: 4 }}>Image Analysis</h1>
      <p className="page-greeting" style={{ fontSize: '1.05rem', marginBottom: 36 }}>Upload a spiral or wave drawing photograph and choose a model pipeline.</p>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 32 }}>

        {/* LEFT: Upload + Model Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Dropzone */}
          {!file ? (
            <div
              className="card"
              style={{ padding: 60, border: '2px dashed #CBD5E1', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
              onClick={() => fileInput.current?.click()}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-purple)'; e.currentTarget.style.background = 'var(--c-purple-light)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = 'white' }}
            >
              <input type="file" ref={fileInput} accept="image/jpeg,image/png,image/bmp" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              <div style={{ width: 80, height: 80, background: 'var(--c-purple-light)', borderRadius: 24, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-purple)' }}>
                <Upload size={36} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Drop image here or click to upload</h3>
              <p style={{ color: 'var(--c-ink-muted)' }}>JPG, PNG, or BMP · Spiral or Wave drawing</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', background: '#f8fafc', padding: 16 }} />
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #edf2f7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={20} color="var(--c-success)" />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</span>
                </div>
                <button onClick={reset} style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #edf2f7', background: 'white' }}>
                  <RefreshCw size={14} /> Change
                </button>
              </div>
            </div>
          )}

          {/* Model Selection */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Select Analysis Mode</div>
            {MODELS.map(m => (
              <div
                key={m.key}
                onClick={() => setSelectedMode(m.key)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: `2px solid ${selectedMode === m.key ? 'var(--c-purple)' : '#edf2f7'}`,
                  background: selectedMode === m.key ? 'var(--c-purple-light)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: selectedMode === m.key ? 'var(--c-purple)' : 'var(--c-ink)', fontSize: '0.9rem' }}>{m.label}</span>
                  {selectedMode === m.key && <CheckCircle size={18} color="var(--c-purple)" />}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--c-ink-muted)', marginTop: 4 }}>{m.desc}</div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ padding: '14px 18px', background: 'var(--c-error-bg)', color: 'var(--c-error)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={runAnalysis}
            disabled={!file || isProcessing}
            style={{ width: '100%', padding: '16px', fontSize: '1rem', opacity: !file ? 0.5 : 1 }}
          >
            {isProcessing ? <><Loader2 size={20} className="spin" /> Running Analysis...</> : 'Run Analysis'}
          </button>
        </div>

        {/* RIGHT: Results */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Results</div>

            {/* Blocked / Invalid Image */}
            {result.blocked && (
              <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                <ShieldAlert size={48} color="var(--c-warning)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ color: 'var(--c-warning)', marginBottom: 8 }}>Invalid Drawing Detected</h3>
                <p style={{ color: 'var(--c-ink-muted)', fontSize: '0.9rem' }}>{result.explanation}</p>
              </div>
            )}

            {!result.blocked && (
              <>
                {/* Routing Classifier Badge */}
                {result.routing_result && (
                  <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #edf2f7' }}>
                    <Cpu size={20} color="var(--c-purple)" />
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--c-ink-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Routing Classifier Detected</div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-ink)' }}>
                        {result.routing_result.label}
                        <span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--c-ink-muted)', marginLeft: 8 }}>
                          ({Math.round(result.routing_result.confidence * 100)}% confidence)
                          {result.routing_result.is_mock && ' · mock'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Three Results */}
                {result.all_results ? (
                  <>
                    <ModelCard title="Spiral Specialist" result={result.all_results.spiral} icon={Activity} />
                    <ModelCard title="Wave Specialist" result={result.all_results.wave} icon={Activity} />
                    <ModelCard title="Unified Cross-Checker" result={result.all_results.unified} icon={BrainCircuit} />
                  </>
                ) : (
                  <>
                    {result.specialist_result && (
                      <ModelCard title={result.mode === 'manual' ? 'Selected Model' : 'Specialist Model'} result={result.specialist_result} icon={Activity} />
                    )}
                    {result.unified_result && (
                      <ModelCard title="Unified Cross-Checker" result={result.unified_result} icon={BrainCircuit} />
                    )}
                  </>
                )}

                {/* Models Agree / Disagree */}
                {result.models_agree !== null && result.models_agree !== undefined && (
                  <div style={{ padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, background: result.models_agree ? 'var(--c-success-bg)' : 'var(--c-error-bg)' }}>
                    {result.models_agree ? <ShieldCheck size={20} color="var(--c-success)" /> : <ShieldAlert size={20} color="var(--c-error)" />}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: result.models_agree ? 'var(--c-success)' : 'var(--c-error)' }}>
                      {result.models_agree ? 'Models agree on this result.' : 'Models disagree — interpret with caution.'}
                    </span>
                  </div>
                )}

                {/* Explanation */}
                <div className="card" style={{ background: 'var(--c-purple-light)', border: '1px solid rgba(135,102,248,0.15)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Info size={18} color="var(--c-purple)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <p style={{ fontSize: '0.875rem', color: 'var(--c-ink)', lineHeight: 1.7 }}>{result.explanation}</p>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--c-ink-muted)', textAlign: 'center' }}>
                  Inference time: {result.inference_time_ms}ms · Case ID: {result.case_id?.slice(0, 8)}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
