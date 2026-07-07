import { BookOpen, Activity, Microscope, FlaskConical, Cpu, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const PIPELINE_STEPS = [
  {
    icon: Activity,
    title: 'Upload & Route',
    description: 'A routing classifier determines whether the uploaded drawing is a spiral, wave, or invalid image — preventing garbage from reaching diagnostic models.',
  },
  {
    icon: Microscope,
    title: 'Quality Assessment',
    description: 'Blur estimation, brightness/exposure analysis, resolution check, and background cleanliness heuristics surface potential image quality issues before inference.',
  },
  {
    icon: FlaskConical,
    title: 'Multi-Model Inference',
    description: 'A specialist VGG16 (selected by the router) and the Unified VGG16 run in parallel. Results are cross-checked for agreement. The PaHaW classical pipeline operates separately on digitizer stroke data.',
  },
  {
    icon: BookOpen,
    title: 'Report Generation',
    description: 'Results are compiled into a structured report with case ID, model outputs, quality check summary, and a templated plain-language explanation — exportable as PDF.',
  },
]

const TECH_STACK = [
  { layer: 'Frontend', tech: 'React 18 + Vite + React Router v6' },
  { layer: 'Styling', tech: 'Vanilla CSS with design tokens (no framework)' },
  { layer: 'Charts', tech: 'Recharts (bar charts, ROC curves)' },
  { layer: 'Icons', tech: 'Lucide React (consistent 1.5px stroke)' },
  { layer: 'Backend', tech: 'FastAPI + Uvicorn (Python)' },
  { layer: 'Image Models', tech: 'TensorFlow / Keras (VGG16 + custom head)' },
  { layer: 'Classical ML', tech: 'scikit-learn + joblib (PaHaW pipeline)' },
  { layer: 'Quality Check', tech: 'OpenCV-Python + Pillow' },
  { layer: 'PDF Export', tech: 'ReportLab' },
  { layer: 'Deployment', tech: 'Hugging Face Spaces (Docker SDK)' },
]

const LIMITATIONS = [
  'Training datasets (PD Spiral/Wave) are small by deep learning standards (~400 subjects). Models may not generalize to all population groups, ethnicities, or paper/pen varieties.',
  'Static image analysis misses temporal dynamics of drawing — velocity, pressure, and jerk. The PaHaW classical pipeline addresses this, but requires specialized digitizer hardware, not a phone camera.',
  'Image quality is highly variable. Blur, poor lighting, or cluttered backgrounds significantly affect model confidence. The quality check system catches common issues but cannot correct them.',
  'The routing classifier has ~6% misclassification rate. A spiral misrouted to the wave specialist (or vice versa) will see degraded performance.',
  'No independent external validation dataset — all reported metrics come from held-out splits of the same training distribution.',
  'This is a research and screening tool, not a clinical diagnostic system. It has no regulatory approval (FDA, CE, CDSCO etc.) for medical use.',
]

const FUTURE_WORK = [
  'Grad-CAM and saliency map overlays — visualize which regions of the drawing most influenced the model\'s decision, directly on the uploaded image.',
  'Live stylus capture in-browser — use the Pointer Events API to capture drawing dynamics (pressure, velocity, tilt) from a tablet without specialized hardware.',
  'Expanded routing classifier — add additional drawing types (Luria alternating sequences, pentagons) and handle multi-drawing sheet uploads.',
  'Longitudinal tracking — allow users to upload serial drawings over time and visualize motor trajectory trends.',
  'Ensemble calibration — Platt scaling or isotonic regression to produce better-calibrated probability estimates.',
  'Federated learning module — distributed model improvement without centralizing sensitive drawing data.',
]

export default function About() {
  return (
    <div className="page-content" style={{ maxWidth: 820 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="badge badge-neutral">Project Documentation</span>
          <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.875rem' }}>·</span>
          <span style={{ color: 'var(--color-ink-muted)', fontSize: '0.875rem' }}>About the app, not the disease</span>
        </div>
        <h1>About NeuroDraw</h1>
        <p>
          The motivation, methodology, and honest limitations of this research platform.
          For information about Parkinson's disease itself, see{' '}
          <Link to="/disease">About Parkinson's</Link>.
        </p>
      </div>

      {/* Motivation */}
      <div className="section">
        <h2 style={{ fontSize: '1.375rem', marginBottom: 12 }}>Motivation</h2>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, marginBottom: 14, color: 'var(--color-ink)' }}>
          Parkinson's disease affects an estimated 10 million people worldwide, but diagnosis
          typically occurs years after pathological changes begin — when 60–80% of dopaminergic
          neurons have already been lost. Early detection tools that are low-cost, accessible,
          and non-invasive could meaningfully change outcomes.
        </p>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, marginBottom: 14 }}>
          Handwriting analysis is a well-established clinical observation: micrographia, tremor
          signatures, and reduced pen velocity are consistent markers of Parkinson's motor impairment.
          NeuroDraw demonstrates that these signals can be captured from a photograph of a spiral or
          wave drawing — without specialized hardware — using computer vision and deep learning.
        </p>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.75 }}>
          This platform is a research demonstration — not a clinical product. Its goal is to show
          what's technically possible, expose the models' actual capabilities and limitations
          transparently, and serve as a reference architecture for future work.
        </p>
      </div>

      {/* Methodology */}
      <div className="section">
        <h2 style={{ fontSize: '1.375rem', marginBottom: 16 }}>Methodology</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PIPELINE_STEPS.map(({ icon: Icon, title, description }, i) => (
            <div key={title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius)',
                background: 'var(--color-accent-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-accent)',
                flexShrink: 0,
              }}>
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <div style={{ paddingTop: 6 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{i + 1}. {title}</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technologies */}
      <div className="section">
        <h2 style={{ fontSize: '1.375rem', marginBottom: 14 }}>Technologies</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr><th>Layer</th><th>Technology</th></tr>
            </thead>
            <tbody>
              {TECH_STACK.map(({ layer, tech }) => (
                <tr key={layer}>
                  <td style={{ fontWeight: 500, width: 160 }}>{layer}</td>
                  <td style={{ color: 'var(--color-ink-muted)' }}>{tech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Limitations */}
      <div className="section">
        <h2 style={{ fontSize: '1.375rem', marginBottom: 14 }}>Limitations</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Transparency about limitations is a core commitment of this research platform.
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LIMITATIONS.map((lim, i) => (
            <li key={i} style={{
              display: 'flex',
              gap: 12,
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'var(--color-ink)',
              padding: '10px 0',
              borderBottom: '1px solid var(--color-border-light)',
            }}>
              <span style={{ color: 'var(--color-ink-muted)', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', paddingTop: 2 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {lim}
            </li>
          ))}
        </ul>
      </div>

      {/* Future work */}
      <div className="section">
        <h2 style={{ fontSize: '1.375rem', marginBottom: 14 }}>Future Work</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {FUTURE_WORK.map((item, i) => {
            const dash = item.indexOf(' — ')
            const title = dash > -1 ? item.slice(0, dash) : item.slice(0, 40)
            const body = dash > -1 ? item.slice(dash + 3) : item.slice(40)
            return (
              <div key={i} className="card card-sm">
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>{body}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Credits */}
      <div className="section">
        <div className="card" style={{ background: 'var(--color-accent-soft)', border: '1px solid rgba(13,115,119,0.2)' }}>
          <h5 style={{ marginBottom: 8 }}>Research Credits</h5>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
            Models trained on the PaHaW dataset (Brno University of Technology, Czech Republic).
            Spiral/Wave drawing datasets from the UC Irvine Machine Learning Repository.
            VGG16 architecture: Simonyan & Zisserman, 2014.
            Deployment pattern inspired by NeuroSSL (Hugging Face Spaces + Cloudflare Workers).
          </p>
        </div>
      </div>
    </div>
  )
}
