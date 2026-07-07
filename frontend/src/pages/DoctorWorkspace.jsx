import { useState } from 'react'
import { FileText, Download, UserPlus, FileSearch } from 'lucide-react'

export default function DoctorWorkspace() {
  const [patient, setPatient] = useState({ name: '', id: '', age: '', gender: 'Male', doctor: '', history: '', notes: '' })
  
  return (
    <div className="main-content" style={{ padding: '40px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>Doctor Workspace</h1>
        <p className="page-greeting" style={{ fontSize: '1.05rem' }}>Create patient reports using completed kinematic and visual analyses.</p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: 32 }}>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid #edf2f7', paddingBottom: 16 }}>Patient Details</h3>
          
          <div className="grid-3" style={{ gap: 20 }}>
            <label className="label">Patient Name <input className="input mt-2" placeholder="e.g. John Doe" value={patient.name} onChange={e => setPatient({...patient, name: e.target.value})} /></label>
            <label className="label">Patient ID <input className="input mt-2" placeholder="PT-1002" value={patient.id} onChange={e => setPatient({...patient, id: e.target.value})} /></label>
            <label className="label">Age <input className="input mt-2" type="number" value={patient.age} onChange={e => setPatient({...patient, age: e.target.value})} /></label>
          </div>

          <div className="grid-3" style={{ gap: 20 }}>
            <label className="label">Gender 
              <select className="input select mt-2" value={patient.gender} onChange={e => setPatient({...patient, gender: e.target.value})}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </label>
            <label className="label">Neurologist / Clinician <input className="input mt-2" placeholder="Dr. Smith" value={patient.doctor} onChange={e => setPatient({...patient, doctor: e.target.value})} /></label>
            <label className="label">Hospital / Clinic <input className="input mt-2" placeholder="General Hospital" /></label>
          </div>

          <label className="label mt-4">Clinical History & Current Symptoms
            <textarea className="input mt-2" rows="3" placeholder="Tremor in right hand, mild bradykinesia..."></textarea>
          </label>
          <label className="label mt-2">Clinical Notes & Impression
            <textarea className="input mt-2" rows="3" placeholder="Enter findings..."></textarea>
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileSearch size={20} color="var(--c-purple)" /> Attach Analysis
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--c-ink-muted)', marginBottom: 20 }}>
              Link a completed Image or .svc Analysis ID to this report.
            </p>
            <input className="input" placeholder="Analysis Case ID (e.g. 8f2a...)" />
            <button className="btn mt-4" style={{ background: '#f1f5f9', color: 'var(--c-ink)', width: '100%' }}>Verify Analysis</button>
          </div>

          <div className="card" style={{ background: 'var(--c-purple-light)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 16, color: 'var(--c-purple)' }}>Report Generation</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--c-ink-muted)', marginBottom: 24 }}>
              Compile the Patient Details, Clinical Notes, and Attached Analysis into a formal PDF report.
            </p>
            <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }} onClick={() => window.print()}>
              <Download size={18} /> Export PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
