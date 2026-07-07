import { useState } from 'react'
import { FileText, Download, Filter, Search, MoreHorizontal } from 'lucide-react'

export default function Reports() {
  const [reports] = useState([
    { id: 'REP-2026-004', patient: 'John Doe', date: 'Oct 14, 2026', type: 'Clinical Summary', status: 'Finalized' },
    { id: 'REP-2026-003', patient: 'Sarah Connor', date: 'Oct 12, 2026', type: 'Kinematic Analysis', status: 'Draft' },
    { id: 'REP-2026-002', patient: 'Miles Dyson', date: 'Oct 10, 2026', type: 'Clinical Summary', status: 'Finalized' },
    { id: 'REP-2026-001', patient: 'Ellen Ripley', date: 'Oct 05, 2026', type: 'Visual Assessment', status: 'Finalized' },
  ])

  return (
    <div className="main-content flex-col" style={{ padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 8 }}>Clinical Reports</h1>
          <p className="page-greeting" style={{ fontSize: '1.05rem' }}>View, manage, and export patient reports generated in the Doctor Workspace.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--c-ink)' }}><Filter size={16} /> Filter</button>
          <button className="btn btn-primary"><FileText size={16} /> New Report</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #edf2f7', display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} color="var(--c-ink-light)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input className="input" placeholder="Search reports by patient or ID..." style={{ margin: 0, paddingLeft: 44, width: '100%', maxWidth: 400 }} />
          </div>
        </div>
        <table>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '16px 24px' }}>Report ID</th>
              <th>Patient Name</th>
              <th>Date Generated</th>
              <th>Report Type</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', paddingRight: 24 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--c-purple)' }}>{r.id}</td>
                <td style={{ fontWeight: 500 }}>{r.patient}</td>
                <td style={{ color: 'var(--c-ink-muted)' }}>{r.date}</td>
                <td style={{ color: 'var(--c-ink-muted)' }}>{r.type}</td>
                <td>
                  <span className={`trend-badge ${r.status === 'Finalized' ? 'trend-pos' : ''}`} style={{ background: r.status === 'Draft' ? '#f1f5f9' : undefined, color: r.status === 'Draft' ? 'var(--c-ink-muted)' : undefined }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right', paddingRight: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button style={{ color: 'var(--c-ink-muted)', padding: 4 }}><Download size={18} /></button>
                    <button style={{ color: 'var(--c-ink-muted)', padding: 4 }}><MoreHorizontal size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
