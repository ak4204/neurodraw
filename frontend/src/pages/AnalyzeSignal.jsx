import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, PenTool, Brain, Loader2 } from 'lucide-react'
import { apiFetch } from '../utils/api'

export default function AnalyzeSignal() {
  const [file, setFile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [isManualExpanded, setIsManualExpanded] = useState(false)
  
  // Pipeline animation state
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState(null)

  const fileInput = useRef(null)

  const PIPELINE_STEPS = [
    'Reading .svc file',
    'Parsing coordinate data',
    'Extracting kinematic features',
    'Normalizing feature vectors',
    'Running sequential PaHaW pipeline',
    'Generating clinical report'
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
    
    // Simulate pipeline steps animation
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setCurrentStep(i)
      await new Promise(r => setTimeout(r, 600)) // Artificial delay for UX
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiFetch('/analyze-svc', { method: 'POST', body: formData })
      
      if (res.error) throw new Error(res.error)
      setResult(res.pahaw_result)
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
        <h1 className="page-title" style={{ marginBottom: 8 }}>Handwriting Signal Analysis (.svc)</h1>
        <p className="page-greeting" style={{ fontSize: '1rem' }}>Upload digital pen recordings to extract kinematics, pressure, and tremor features.</p>
      </div>

      {!result && !isProcessing && (
        <>
          <div className="card" style={{ padding: 40, border: '2px dashed #E2E8F0', textAlign: 'center', cursor: 'pointer', background: 'var(--c-surface)' }} onClick={() => fileInput.current?.click()}>
            <input type="file" ref={fileInput} accept=".svc" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) parseSVC(e.target.files[0]) }} />
            <div style={{ width: 64, height: 64, background: 'var(--c-cyan-light)', borderRadius: 20, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-cyan)' }}>
              <Upload size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Upload .svc File</h3>
            <p style={{ color: 'var(--c-ink-muted)', marginBottom: 24 }}>Expected format: X, Y, Timestamp, Pressure, Azimuth, Altitude</p>
            <div className="btn btn-primary" style={{ background: 'var(--c-cyan)' }}>Select File</div>
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
                <button className="btn btn-primary" style={{ background: 'var(--c-cyan)' }} onClick={runAnalysis}>
                  Run PaHaW Pipeline
                </button>
              </div>
            </div>
          )}

          {/* Manual Entry Accordion */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isManualExpanded ? '#f8fafc' : 'white' }} onClick={() => setIsManualExpanded(!isManualExpanded)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={20} color="var(--c-ink-muted)" />
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Manual Clinical Data Entry</h3>
              </div>
              {isManualExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {isManualExpanded && (
              <div style={{ padding: 24, borderTop: '1px solid #edf2f7' }}>
                <div style={{ padding: 12, background: 'var(--c-warning)', color: 'white', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, marginBottom: 24, display: 'inline-block' }}>
                  For Demonstration / Clinical Record Entry Only
                </div>
                <div className="grid-3" style={{ gap: 20 }}>
                  <label className="label">Patient ID <input className="input mt-2" placeholder="e.g. PT-1049" /></label>
                  <label className="label">Drawing Type 
                    <select className="input select mt-2"><option>Spiral</option><option>Wave</option></select>
                  </label>
                  <label className="label">Recording Duration (s) <input className="input mt-2" type="number" /></label>
                  <label className="label">Avg Pressure <input className="input mt-2" type="number" /></label>
                  <label className="label">Max Pressure <input className="input mt-2" type="number" /></label>
                  <label className="label">Avg Velocity (cm/s) <input className="input mt-2" type="number" /></label>
                </div>
                <label className="label mt-4">Clinical Notes <textarea className="input mt-2" rows="3"></textarea></label>
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Save to Records</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {isProcessing && !result && (
        <div className="card" style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={48} className="spin" color="var(--c-cyan)" style={{ marginBottom: 32, animation: 'spin 1s linear infinite' }} />
          <h2 style={{ marginBottom: 24 }}>Analyzing Sequence</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 400 }}>
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, borderRadius: 8, background: idx === currentStep ? 'var(--c-cyan-light)' : 'transparent', color: idx < currentStep ? 'var(--c-success)' : idx === currentStep ? 'var(--c-cyan)' : 'var(--c-ink-light)', transition: 'all 0.3s ease' }}>
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
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: result.prediction === 'Parkinson' ? '#FFF5F5' : '#F0FFF4', border: `2px solid ${result.prediction === 'Parkinson' ? 'var(--c-error)' : 'var(--c-success)'}` }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-ink-muted)', marginBottom: 4 }}>Clinical Recommendation</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.prediction === 'Parkinson' ? 'var(--c-error)' : 'var(--c-success)' }}>
                {result.prediction === 'Parkinson' ? 'Parkinson-Consistent' : 'Healthy-Consistent'}
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--c-ink-muted)', marginTop: 8 }}>
                Confidence: <strong style={{ color: 'var(--c-ink)' }}>{(Math.abs(result.probability - 0.5) * 200 + 50).toFixed(1)}%</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)' }}>Model Used</div>
              <div style={{ fontWeight: 600 }}>PaHaW Classical Pipeline</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)', marginTop: 12 }}>Features Extracted</div>
              <div style={{ fontWeight: 600 }}>{result.features_extracted} Kinematic Features</div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', marginTop: 16 }}>Kinematic Feature Summary</h3>
          <div className="grid-4">
            <div className="stat-card">
              <div className="stat-sub" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Total Samples</div>
              <div className="stat-value" style={{ fontSize: '1.8rem', marginTop: 8 }}>{result.features.num_points}</div>
            </div>
            <div className="stat-card">
              <div className="stat-sub" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Recording Duration</div>
              <div className="stat-value" style={{ fontSize: '1.8rem', marginTop: 8 }}>{result.features.stroke_duration.toFixed(2)}s</div>
            </div>
            <div className="stat-card">
              <div className="stat-sub" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Avg Velocity</div>
              <div className="stat-value" style={{ fontSize: '1.8rem', marginTop: 8 }}>{result.features.velocity_mean.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-sub" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Max Velocity</div>
              <div className="stat-value" style={{ fontSize: '1.8rem', marginTop: 8 }}>{result.features.velocity_max.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-sub" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Avg Pressure</div>
              <div className="stat-value" style={{ fontSize: '1.8rem', marginTop: 8 }}>{result.features.pressure_mean.toFixed(0)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-sub" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Max Pressure</div>
              <div className="stat-value" style={{ fontSize: '1.8rem', marginTop: 8 }}>{result.features.pressure_max.toFixed(0)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-sub" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Avg Acceleration</div>
              <div className="stat-value" style={{ fontSize: '1.8rem', marginTop: 8 }}>{result.features.acceleration_mean.toFixed(2)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-sub" style={{ textTransform: 'uppercase', fontWeight: 700 }}>Avg Jerk</div>
              <div className="stat-value" style={{ fontSize: '1.8rem', marginTop: 8 }}>{result.features.jerk_mean.toFixed(2)}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <button className="btn btn-primary" onClick={() => { setResult(null); setFile(null); setSummary(null) }}>Run Another File</button>
          </div>
        </div>
      )}

    </div>
  )
}
