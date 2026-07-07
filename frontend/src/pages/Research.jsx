import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Upload } from 'lucide-react'
import { getMetrics } from '../utils/api'
import ResearchModelCard from '../components/Research/ModelCard'
import MetricsChart from '../components/Research/MetricsChart'
import ConfusionMatrix from '../components/Research/ConfusionMatrix'
import ThresholdSlider from '../components/Research/ThresholdSlider'

const WHY_MULTIPLE = [
  {
    q: 'Why specialist + unified models?',
    a: 'Different drawing types elicit different motor patterns. Spiral drawings test sustained motor planning, while wave drawings test rhythmic motor control. Training a specialist for each task preserves these distinctions. The unified model, trained on both, acts as a cross-validator and handles cases where drawing type is uncertain.',
  },
  {
    q: 'Why a routing classifier?',
    a: 'The diagnostic models were trained on labeled spiral/wave data. Feeding the wrong drawing type to a specialist degrades accuracy. The routing classifier prevents this by automatically detecting the drawing type — and blocking garbage inputs before any diagnostic model runs.',
  },
  {
    q: 'Why include the PaHaW classical pipeline?',
    a: 'Static image models capture appearance but miss temporal dynamics — how a drawing was made, not just the end result. PaHaW kinematic features (velocity, jerk, pressure, entropy) complement the image-based VGG16 models and demonstrate that different modalities can capture complementary aspects of motor impairment.',
  },
]

export default function Research() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pahawFile, setPahawFile] = useState(null)
  const [openAccordions, setOpenAccordions] = useState({})
  const [pahawOpen, setPahawOpen] = useState(false)

  useEffect(() => {
    getMetrics()
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleAccordion = (i) => setOpenAccordions(prev => ({ ...prev, [i]: !prev[i] }))

  if (loading) return <div className="page-content"><p>Loading metrics…</p></div>

  const MODEL_ORDER = ['routing_classifier', 'spiral_vgg16', 'wave_vgg16', 'unified_vgg16', 'pahaw_pipeline']

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Research & Model Zoo</h1>
        <p>Architecture, training details, and performance metrics for each model in the pipeline.</p>
      </div>

      {/* Performance comparison charts */}
      <div className="section">
        <MetricsChart metrics={metrics} />
      </div>

      {/* Why multiple models accordion */}
      <div className="section">
        <div className="section-header">
          <h3>Why multiple models?</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-muted)', marginTop: 4 }}>
            The rationale behind the multi-model pipeline architecture.
          </p>
        </div>
        <div>
          {WHY_MULTIPLE.map((item, i) => (
            <div key={i} className="accordion-item">
              <button
                className="accordion-header"
                onClick={() => toggleAccordion(i)}
                aria-expanded={!!openAccordions[i]}
              >
                {item.q}
                {openAccordions[i]
                  ? <ChevronDown size={15} strokeWidth={1.5} />
                  : <ChevronRight size={15} strokeWidth={1.5} />
                }
              </button>
              {openAccordions[i] && (
                <div className="accordion-body">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confusion matrix */}
      {metrics?.routing_classifier?.confusion_matrix && (
        <div className="section">
          <div className="card">
            <ConfusionMatrix matrix={metrics.routing_classifier.confusion_matrix} />
          </div>
        </div>
      )}

      {/* Threshold slider */}
      <div className="section">
        <ThresholdSlider />
      </div>

      {/* Model cards */}
      <div className="section">
        <div className="section-header">
          <h3>Model Details</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {MODEL_ORDER.map(key => metrics?.[key] && (
            <ResearchModelCard key={key} model={metrics[key]} modelKey={key} />
          ))}
        </div>
      </div>

      {/* PaHaW advanced section */}
      <div className="section">
        <div className="accordion-item">
          <button
            className="accordion-header"
            onClick={() => setPahawOpen(o => !o)}
            aria-expanded={pahawOpen}
            style={{ fontSize: '0.9375rem', fontWeight: 600 }}
          >
            Advanced: PaHaW Stroke Data Upload
            {pahawOpen
              ? <ChevronDown size={15} strokeWidth={1.5} />
              : <ChevronRight size={15} strokeWidth={1.5} />
            }
          </button>
          {pahawOpen && (
            <div className="accordion-body">
              <div style={{
                padding: '12px 14px',
                background: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning-border)',
                borderRadius: 'var(--radius)',
                fontSize: '0.8125rem',
                color: 'var(--color-warning-text)',
                marginBottom: 16,
              }}>
                The PaHaW pipeline processes <strong>.svc digitizer files</strong>, not photographs.
                It is completely isolated from the photo-upload flow and belongs only here on the Research page.
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)', marginBottom: 12 }}>
                Upload a <code style={{ background: 'var(--color-neutral-bg)', padding: '1px 5px', borderRadius: 3, fontSize: '0.8rem' }}>.svc</code> file
                (tab-separated: X, Y, timestamp, pressure, azimuth, altitude) to run the classical ML pipeline.
              </p>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} strokeWidth={1.5} />
                  Choose .svc file
                  <input
                    type="file"
                    accept=".svc"
                    style={{ display: 'none' }}
                    onChange={e => setPahawFile(e.target.files[0])}
                  />
                </label>
                {pahawFile && <span style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)' }}>{pahawFile.name}</span>}
              </div>
              {pahawFile && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--color-accent-soft)', borderRadius: 'var(--radius)', fontSize: '0.8rem', color: 'var(--color-accent)' }}>
                  PaHaW analysis endpoint: POST /api/pahaw/analyze (backend must be running with pahaw_pipeline_v3.joblib)
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
