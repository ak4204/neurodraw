import { useState } from 'react'
import { Info, RotateCcw, CheckCircle, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const MODEL_INTERNALS = [
  {
    name: 'Spiral VGG16',
    backbone: 'VGG16 (ImageNet pretrained)',
    head: 'GAP → Dense(256) → Dropout(0.5) → Dense(128) → Dropout(0.4) → Dense(1, sigmoid)',
    total_params: '~138.4M',
    trainable_params: '~16.8M (unfrozen head + block5)',
    input: '224 × 224 × 3 RGB, normalized to [0, 1]',
    threshold: '0.50',
    dataset: 'Spiral drawings from PD/healthy subjects',
  },
  {
    name: 'Wave VGG16',
    backbone: 'VGG16 (ImageNet pretrained)',
    head: 'GAP → Dense(256) → Dropout(0.5) → Dense(128) → Dropout(0.4) → Dense(1, sigmoid)',
    total_params: '~138.4M',
    trainable_params: '~16.8M',
    input: '224 × 224 × 3 RGB, normalized to [0, 1]',
    threshold: '0.50',
    dataset: 'Wave drawings from PD/healthy subjects',
  },
  {
    name: 'Unified VGG16',
    backbone: 'VGG16 (ImageNet pretrained)',
    head: 'GAP → Dense(256) → Dropout(0.5) → Dense(128) → Dropout(0.4) → Dense(1, sigmoid)',
    total_params: '~138.4M',
    trainable_params: '~16.8M',
    input: '224 × 224 × 3 RGB, normalized to [0, 1]',
    threshold: '0.50',
    dataset: 'Combined spiral + wave dataset (1.3× wave weight)',
  },
]

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-ink)', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #edf2f7' }}>{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid #f7fafc' }}>
      <div style={{ width: 180, flexShrink: 0, fontSize: '0.82rem', color: 'var(--c-ink-muted)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--c-ink)', lineHeight: 1.6 }}>{value}</div>
    </div>
  )
}

export default function Settings() {
  const [qualityMode, setQualityMode] = useState(() => localStorage.getItem('qualityMode') || 'standard')
  const [resetDone, setResetDone] = useState(false)
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleQualityMode = (mode) => {
    setQualityMode(mode)
    localStorage.setItem('qualityMode', mode)
  }

  const handleReset = () => {
    setQualityMode('standard')
    localStorage.removeItem('qualityMode')
    setResetDone(true)
    setTimeout(() => setResetDone(false), 2000)
  }

  return (
    <div style={{ padding: '40px', maxWidth: 800, width: '100%' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>Settings</h1>
        <p className="page-greeting" style={{ fontSize: '1.05rem' }}>Inference parameters, model internals, and application info.</p>
      </div>

      {/* Confidence Threshold */}
      <Section title="Confidence Threshold">
        <div className="card" style={{ background: 'var(--c-purple-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, color: 'var(--c-ink)' }}>Decision threshold (t)</span>
            <span style={{ fontFamily: 'monospace', fontSize: '1.5rem', color: 'var(--c-purple)', fontWeight: 800 }}>0.50</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--c-ink-muted)' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--c-purple)' }} />
            <span>
              When the VGG16 model outputs a probability ≥ 0.50, the result is "Parkinson-consistent."
              Below 0.50, it is "Healthy-consistent." This threshold is fixed and matches the original model training setup.
            </span>
          </div>
        </div>
      </Section>

      {/* Quality Check */}
      <Section title="Quality Check Strictness">
        <p style={{ fontSize: '0.875rem', color: 'var(--c-ink-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Controls how strict the pre-inference image quality assessment is. Stored in your browser.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'relaxed', label: 'Relaxed', description: 'Only hard failures block analysis. Warnings shown but do not require override.' },
            { id: 'standard', label: 'Standard (Recommended)', description: 'Warns on potential issues, blocks hard failures. Default setting.' },
            { id: 'strict', label: 'Strict', description: 'Treats warnings as failures, requiring explicit override before proceeding.' },
          ].map(({ id, label, description }) => (
            <div
              key={id}
              onClick={() => handleQualityMode(id)}
              style={{
                padding: '14px 18px',
                borderRadius: 12,
                border: `2px solid ${qualityMode === id ? 'var(--c-purple)' : '#e2e8f0'}`,
                background: qualityMode === id ? 'var(--c-purple-light)' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2, color: qualityMode === id ? 'var(--c-purple)' : 'var(--c-ink)' }}>{label}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--c-ink-muted)' }}>{description}</div>
              </div>
              {qualityMode === id && <CheckCircle size={20} color="var(--c-purple)" />}
            </div>
          ))}
        </div>
      </Section>

      {/* Model Internals */}
      <Section title="Model Internals">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {MODEL_INTERNALS.map((model) => (
            <div key={model.name} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #edf2f7', fontWeight: 700, fontSize: '1rem', color: 'var(--c-ink)' }}>
                {model.name}
              </div>
              <div style={{ padding: '8px 24px 16px' }}>
                <Row label="Backbone" value={model.backbone} />
                <Row label="Head Architecture" value={model.head} />
                <Row label="Total Parameters" value={model.total_params} />
                <Row label="Trainable Parameters" value={model.trainable_params} />
                <Row label="Input Format" value={model.input} />
                <Row label="Decision Threshold" value={model.threshold} />
                <Row label="Training Dataset" value={model.dataset} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Force Override */}
      <Section title="Force Override">
        <div className="card" style={{ borderLeft: '4px solid var(--c-warning)', background: '#fffbea' }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--c-ink)' }}>What "Force analyze anyway" does</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--c-ink-muted)', lineHeight: 1.65, marginBottom: 10 }}>
            When the routing classifier identifies an image as "Garbage" (not a recognizable spiral or wave drawing),
            the AUTO mode pipeline stops before running any diagnostic VGG16 model.
            "Force analyze anyway" bypasses this safety gate — equivalent to using "Run All Three" mode.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#b45309', fontWeight: 600 }}>
            ⚠ For demo purposes only. Outputs on invalid inputs should not be interpreted as clinical results.
          </p>
        </div>
      </Section>

      {/* Application Info */}
      <Section title="Application Info">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '8px 24px 16px' }}>
            <Row label="Version" value="v1.0.0 — Research Preview" />
            <Row label="Platform" value="NeuroDraw · Parkinson's Handwriting Analysis" />
            <Row label="Backend" value="FastAPI + Uvicorn" />
            <Row label="ML Framework" value="TensorFlow / Keras (VGG16)" />
            <Row label="Deployment" value="Hugging Face Spaces (Docker SDK)" />
            <Row label="License" value="Research & Educational Use Only — Not for Clinical Deployment" />
          </div>
        </div>
      </Section>

      {/* Actions */}
      <Section title="Account & Actions">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <button
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 99, background: '#fef2f2', color: '#dc2626', fontWeight: 600, border: '1px solid #fecaca', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
          >
            <LogOut size={16} />
            Sign Out {user?.email && `(${user.email})`}
          </button>
          
          <button
            onClick={handleReset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 99, background: '#f1f5f9', color: 'var(--c-ink)', fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            <RotateCcw size={16} />
            {resetDone ? '✓ Reset complete' : 'Reset to defaults'}
          </button>
        </div>
      </Section>
    </div>
  )
}
