import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Upload, FileText, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, PenTool, Brain, Loader2, ArrowLeft } from 'lucide-react'
import { apiFetch } from '../utils/api'

export default function AnalyzeSignal() {
  const [file, setFile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [isManualExpanded, setIsManualExpanded] = useState(false)
  const [manualForm, setManualForm] = useState({
    patient_id: '',
    diagnosis_date: '',
    doctor_name: '',
    clinical_notes: ''
  })
  
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

  const handleFormChange = (e) => {
    setManualForm({ ...manualForm, [e.target.name]: e.target.value })
  }

  return (
    <div className="main-content" style={{ flexDirection: 'column', gap: 32, maxWidth: 1000, margin: '0 auto', paddingTop: 20 }}>
      
      <div>
        <Link to="/analyze" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--c-ink-muted)', textDecoration: 'none', marginBottom: 16, fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Hub
        </Link>
        <h1 className="page-title" style={{ marginBottom: 8 }}>Handwriting Signal Analysis (.svc)</h1>
        <p className="page-greeting" style={{ fontSize: '1rem' }}>Upload digital pen recordings to extract kinematics, pressure, and tremor features.</p>
      </div>

      {!result && !isProcessing && (
        <>
          <div 
            className="card" 
            style={{ padding: 40, border: '2px dashed #E2E8F0', textAlign: 'center', cursor: 'pointer', background: 'var(--c-surface)', transition: 'all 0.2s' }} 
            onClick={() => fileInput.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) parseSVC(e.dataTransfer.files[0]) }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-cyan)'; e.currentTarget.style.background = 'var(--c-cyan-light)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'var(--c-surface)' }}
          >
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

          {/* Clinical Record Accordion */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isManualExpanded ? '#f8fafc' : 'white' }} onClick={() => setIsManualExpanded(!isManualExpanded)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={20} color="var(--c-ink-muted)" />
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Doctor Clinical Record</h3>
              </div>
              {isManualExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {isManualExpanded && (
              <div style={{ padding: 24, borderTop: '1px solid #edf2f7' }}>
                <div style={{ padding: 12, background: 'var(--c-purple)', color: 'white', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, marginBottom: 24, display: 'inline-block' }}>
                  Store Patient Information & Notes
                </div>
                
                <h4 style={{ marginBottom: 12, fontSize: '0.95rem' }}>Patient Details</h4>
                <div className="grid-3" style={{ gap: 20, marginBottom: 24 }}>
                  <label className="label">Patient ID <input name="patient_id" value={manualForm.patient_id} onChange={handleFormChange} className="input mt-2" placeholder="PT-1049" /></label>
                  <label className="label">Diagnosis Date <input name="diagnosis_date" type="date" value={manualForm.diagnosis_date} onChange={handleFormChange} className="input mt-2" /></label>
                  <label className="label">Attending Doctor <input name="doctor_name" value={manualForm.doctor_name} onChange={handleFormChange} className="input mt-2" placeholder="Dr. Smith" /></label>
                </div>

                <label className="label mt-4">Clinical Notes 
                  <textarea name="clinical_notes" value={manualForm.clinical_notes} onChange={handleFormChange} className="input mt-2" rows="4" placeholder="Enter clinical observations, symptoms, or medication history here..."></textarea>
                </label>
                
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" style={{ background: 'var(--c-purple)', opacity: 0.8 }}>
                    Save Record (UI Demo)
                  </button>
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
                Confidence: <strong style={{ color: 'var(--c-ink)' }}>{result.confidence.toFixed(1)}%</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)' }}>Model Used</div>
              <div style={{ fontWeight: 600 }}>PaHaW Classical Pipeline</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)', marginTop: 12 }}>Features Extracted</div>
              <div style={{ fontWeight: 600 }}>{result.features_extracted} Kinematic Features</div>
            </div>
          </div>


          <h4 style={{ marginBottom: 12, fontSize: '0.95rem' }}>Extracted Kinematics</h4>
          <div className="grid-4" style={{ gap: 16 }}>
            {result.basic_stats && Object.entries(result.basic_stats).map(([key, val]) => (
              <div key={key} style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
                  {key}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <button className="btn btn-primary" onClick={() => { setResult(null); setFile(null); setSummary(null) }}>Run Another File</button>
          </div>
        </div>
      )}

    </div>
  )
}
