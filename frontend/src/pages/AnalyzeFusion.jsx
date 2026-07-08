import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Upload, CheckCircle2, AlertCircle, PenTool, Brain, Loader2, ArrowLeft, Image as ImageIcon, Activity } from 'lucide-react'
import { apiFetch } from '../utils/api'

export default function AnalyzeFusion() {
  const [file, setFile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  
  // Pipeline animation state
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState(null)

  const fileInput = useRef(null)

  const PIPELINE_STEPS = [
    'Parsing .svc coordinate data',
    'Extracting kinematic & NLD features',
    'Rendering trajectory to image format',
    'Running cross-modal classification',
    'Computing AUC-weighted fusion math'
  ]

  const parseSVC = async (f) => {
    const text = await f.text()
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
    
    if (lines.length < 10) {
      setError("File does not contain enough valid stroke data.")
      return
    }

    try {
      const first = lines[0].split(/\s+/)
      const last = lines[lines.length-1].split(/\s+/)
      
      const duration = (parseFloat(last[2]) - parseFloat(first[2])) / 1000 // approx ms to s depending on format
      let penDownCount = 0
      let hasPressure = false

      for (let l of lines) {
        const parts = l.split(/\s+/)
        if (parseFloat(parts[3]) > 0) penDownCount++
        if (parseFloat(parts[3]) > 0) hasPressure = true
      }

      setSummary({
        name: f.name,
        samples: lines.length,
        duration: duration > 0 ? duration.toFixed(2) + 's' : 'Unknown',
        penDown: ((penDownCount / lines.length) * 100).toFixed(1) + '%',
        pressure: hasPressure ? 'Yes' : 'No',
        status: 'Valid format'
      })
      setFile(f)
      setError(null)
    } catch (e) {
      setError("Invalid .svc column structure. Expected: X Y Timestamp Pressure Azimuth Altitude")
    }
  }

  const runAnalysis = async () => {
    if (!file) return
    setIsProcessing(true)
    setResult(null)
    
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setCurrentStep(i)
      await new Promise(r => setTimeout(r, 600))
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiFetch('/analyze-fusion', { method: 'POST', body: formData })
      
      if (res.error) throw new Error(res.error)
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsProcessing(false)
      setCurrentStep(PIPELINE_STEPS.length)
    }
  }

  return (
    <div className="main-content" style={{ flexDirection: 'column', gap: 32, maxWidth: 1000, margin: '0 auto', paddingTop: 20 }}>
      
      <div>
        <Link to="/analyze" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--c-ink-muted)', textDecoration: 'none', marginBottom: 16, fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <h1 className="page-title" style={{ marginBottom: 8 }}>Cross-Modal Fusion Analysis</h1>
        <p className="page-greeting" style={{ fontSize: '1rem' }}>Combine kinematic pen-signal analysis and image-based deep learning on the same sample.</p>
      </div>

      {!result && !isProcessing && (
        <>
          <div 
            className="card" 
            style={{ padding: 40, border: '2px dashed #E2E8F0', textAlign: 'center', cursor: 'pointer', background: 'var(--c-surface)', transition: 'all 0.2s' }} 
            onClick={() => fileInput.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) parseSVC(e.dataTransfer.files[0]) }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-success)'; e.currentTarget.style.background = 'var(--c-success-light)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'var(--c-surface)' }}
          >
            <input type="file" ref={fileInput} accept=".svc" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) parseSVC(e.target.files[0]) }} />
            <div style={{ width: 64, height: 64, background: 'var(--c-success-light)', borderRadius: 20, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-success)' }}>
              <Upload size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Upload .svc File</h3>
            <p style={{ color: 'var(--c-ink-muted)', marginBottom: 24 }}>Expected format: X, Y, Timestamp, Pressure, Azimuth, Altitude</p>
            <div className="btn btn-primary" style={{ background: 'var(--c-success)' }}>Select File</div>
          </div>

          {error && (
            <div style={{ padding: 16, background: 'var(--c-error-bg)', color: 'var(--c-error)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {summary && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid #edf2f7', paddingBottom: 12 }}>Recording Summary</h3>
              <div className="grid-3" style={{ fontSize: '0.9rem' }}>
                <div><strong style={{ color: 'var(--c-ink-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>File Name</strong>{summary.name}</div>
                <div><strong style={{ color: 'var(--c-ink-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Samples</strong>{summary.samples}</div>
                <div><strong style={{ color: 'var(--c-ink-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Recording Duration</strong>{summary.duration}</div>
                <div><strong style={{ color: 'var(--c-ink-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Pen Down Time</strong>{summary.penDown}</div>
                <div><strong style={{ color: 'var(--c-ink-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Pressure Data</strong>{summary.pressure}</div>
                <div><strong style={{ color: 'var(--c-ink-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</strong><span style={{ color: 'var(--c-success)', fontWeight: 600 }}>{summary.status}</span></div>
              </div>
              <div style={{ borderTop: '1px solid #edf2f7', paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" style={{ background: 'var(--c-success)' }} onClick={runAnalysis}>
                  Run Fusion Pipeline
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {isProcessing && !result && (
        <div className="card" style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={48} className="spin" color="var(--c-success)" style={{ marginBottom: 32, animation: 'spin 1s linear infinite' }} />
          <h2 style={{ marginBottom: 24 }}>Cross-Modal Analysis</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 400 }}>
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, borderRadius: 8, background: idx === currentStep ? 'var(--c-success-light)' : 'transparent', color: idx < currentStep ? 'var(--c-success)' : idx === currentStep ? 'var(--c-success)' : 'var(--c-ink-light)', transition: 'all 0.3s ease' }}>
                {idx < currentStep ? <CheckCircle2 size={20} /> : idx === currentStep ? <Loader2 size={20} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--c-ink-light)' }} />}
                <span style={{ fontWeight: idx === currentStep ? 600 : 400 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Verdict */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: result.fusion_result.prediction === 'Parkinson' ? '#FFF5F5' : '#F0FFF4', border: `2px solid ${result.fusion_result.prediction === 'Parkinson' ? 'var(--c-error)' : 'var(--c-success)'}` }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-ink-muted)', marginBottom: 4 }}>Fused Clinical Recommendation</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.fusion_result.prediction === 'Parkinson' ? 'var(--c-error)' : 'var(--c-success)' }}>
                {result.fusion_result.prediction === 'Parkinson' ? 'Parkinson-Consistent' : 'Healthy-Consistent'}
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--c-ink-muted)', marginTop: 8 }}>
                AUC-Weighted Confidence: <strong style={{ color: 'var(--c-ink)' }}>{result.fusion_result.confidence}%</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', gap: 16 }}>
              {result.rendered_image_b64 && (
                <div style={{ width: 120, height: 120, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white' }}>
                  <img src={`data:image/png;base64,${result.rendered_image_b64}`} alt="Rendered SVC" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', marginTop: 16 }}>Modality Breakdown</h3>
          <div className="grid-3" style={{ gap: 16 }}>
            {/* Classical Pipeline */}
            <div className="card" style={{ borderLeft: '4px solid var(--c-cyan)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--c-cyan)' }}>
                <Activity size={20} /> <span style={{ fontWeight: 600 }}>Kinematic Pipeline (SVM)</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: result.pahaw_result.prediction === 'Parkinson' ? 'var(--c-error)' : 'var(--c-success)' }}>
                {result.pahaw_result.prediction}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)', marginTop: 4 }}>
                Prob: {(result.pahaw_result.probability * 100).toFixed(1)}% | Weight: {result.fusion_result.weights.pahaw.toFixed(2)}
              </div>
            </div>

            {/* Specialist CNN */}
            <div className="card" style={{ borderLeft: '4px solid var(--c-purple)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--c-purple)' }}>
                <ImageIcon size={20} /> <span style={{ fontWeight: 600 }}>Specialist CNN</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: result.specialist_result.label === 'Parkinson' ? 'var(--c-error)' : 'var(--c-success)' }}>
                {result.specialist_result.label}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)', marginTop: 4 }}>
                Prob: {(result.specialist_result.prob * 100).toFixed(1)}% | Weight: {result.fusion_result.weights.specialist.toFixed(2)}
              </div>
            </div>

            {/* Unified CNN */}
            <div className="card" style={{ borderLeft: '4px solid var(--c-purple)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--c-purple)' }}>
                <Brain size={20} /> <span style={{ fontWeight: 600 }}>Unified CNN</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: result.unified_result.label === 'Parkinson' ? 'var(--c-error)' : 'var(--c-success)' }}>
                {result.unified_result.label}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)', marginTop: 4 }}>
                Prob: {(result.unified_result.prob * 100).toFixed(1)}% | Weight: {result.fusion_result.weights.unified.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="card" style={{ background: '#f8fafc', fontSize: '0.95rem', color: 'var(--c-ink-muted)' }}>
            <strong>Fusion Math:</strong> The final probability is calculated as a weighted average of each model's independent prediction, where the weight is defined as that model's gold-standard held-out AUC metric. 
            This prevents models with lower generalizability from overturning highly-specialized components.
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <button className="btn btn-primary" onClick={() => { setResult(null); setFile(null); setSummary(null) }}>Run Another Fusion</button>
          </div>
        </div>
      )}

    </div>
  )
}
