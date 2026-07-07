import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'

export default function ModelComparison() {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    apiFetch('/models/metrics').then(setMetrics).catch(() => {})
  }, [])

  return (
    <div className="main-content flex-col" style={{ padding: '40px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>Model Comparison</h1>
        <p className="page-greeting" style={{ fontSize: '1.05rem' }}>Detailed architecture and evaluation metrics for all active models.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #edf2f7' }}>
            <tr>
              <th style={{ padding: '20px 24px' }}>Model Name</th>
              <th>Architecture</th>
              <th>Input Modality</th>
              <th>Size</th>
              <th>Accuracy</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1 Score</th>
              <th>AUC</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '20px 24px', fontWeight: 600 }}>Spiral Specialist</td>
              <td>VGG16 (CNN)</td>
              <td>Image (224x224)</td>
              <td>112 MB</td>
              <td style={{ fontWeight: 600 }}>{metrics?.spiral_vgg16?.accuracy ? (metrics.spiral_vgg16.accuracy * 100).toFixed(1) + '%' : 'N/A'}</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
            </tr>
            <tr>
              <td style={{ padding: '20px 24px', fontWeight: 600 }}>Wave Specialist</td>
              <td>VGG16 (CNN)</td>
              <td>Image (224x224)</td>
              <td>112 MB</td>
              <td style={{ fontWeight: 600 }}>{metrics?.wave_vgg16?.accuracy ? (metrics.wave_vgg16.accuracy * 100).toFixed(1) + '%' : 'N/A'}</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
            </tr>
            <tr>
              <td style={{ padding: '20px 24px', fontWeight: 600 }}>Unified Cross-Checker</td>
              <td>VGG16 (CNN)</td>
              <td>Image (224x224)</td>
              <td>112 MB</td>
              <td style={{ fontWeight: 600 }}>{metrics?.unified_vgg16?.accuracy ? (metrics.unified_vgg16.accuracy * 100).toFixed(1) + '%' : 'N/A'}</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
            </tr>
            <tr>
              <td style={{ padding: '20px 24px', fontWeight: 600 }}>Routing Classifier</td>
              <td>MobileNetV2</td>
              <td>Image (224x224)</td>
              <td>13 MB</td>
              <td style={{ fontWeight: 600 }}>{metrics?.drawing_type_3class?.accuracy ? (metrics.drawing_type_3class.accuracy * 100).toFixed(1) + '%' : 'N/A'}</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
            </tr>
            <tr>
              <td style={{ padding: '20px 24px', fontWeight: 600 }}>PaHaW Classical</td>
              <td>RandomForest / SVM</td>
              <td>Signal (.svc)</td>
              <td>&lt;1 MB</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
              <td style={{ color: 'var(--c-ink-muted)' }}>Not Available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
