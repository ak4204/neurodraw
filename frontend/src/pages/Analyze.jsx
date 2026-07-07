import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import DropZone from '../components/Upload/DropZone'
import ModelSelector from '../components/Upload/ModelSelector'
import PipelineStepper from '../components/Upload/PipelineStepper'
import { useAnalysis } from '../hooks/useAnalysis'

export default function Analyze() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('auto')
  const [manualModel, setManualModel] = useState(null)
  const [forceAnalyze, setForceAnalyze] = useState(false)

  const { status, stepStatus, steps, caseData, error, isMock, runAnalysis, reset } = useAnalysis()

  const handleFile = useCallback((f) => {
    setFile(f)
    setForceAnalyze(false)
    reset()
  }, [reset])

  const handleSubmit = useCallback(async () => {
    if (!file) return
    try {
      const result = await runAnalysis(file, mode, manualModel)
      if (result?.case_id) {
        navigate(`/analyze/${result.case_id}`)
      }
    } catch (err) {
      // Error shown in UI
    }
  }, [file, mode, manualModel, runAnalysis, navigate])

  const isGarbage = caseData?.routing_result?.is_garbage && caseData?.routing_result?.confidence >= 0.6
  const isBlocked = caseData?.blocked
  const canSubmit = file && status !== 'running' && (!isBlocked || forceAnalyze || mode === 'all_three')

  return (
    <div className="page-content-wide">
      {isMock && (
        <div className="mock-banner">
          <AlertTriangle size={14} strokeWidth={1.5} />
          Model files not detected — showing simulated results for layout preview.
          Real inference requires model files in backend/models/
        </div>
      )}

      <div className="page-header" style={{ marginTop: isMock ? 16 : 0 }}>
        <h1>Analysis Workspace</h1>
        <p>Upload a spiral or wave drawing to run the Parkinson's handwriting analysis pipeline.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 280px',
        gap: 24,
        alignItems: 'flex-start',
      }}>
        {/* Left: Upload + model selector */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h5 className="mb-3">Upload Drawing</h5>
            <DropZone onFile={handleFile} />
          </div>
          <div className="card">
            <ModelSelector
              mode={mode}
              onMode={(m) => { setMode(m); setForceAnalyze(false) }}
              manualModel={manualModel}
              onManualModel={setManualModel}
            />
          </div>
        </div>

        {/* Middle: Guidelines */}
        <div className="card">
          <h5 className="mb-3">Drawing Guidelines</h5>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)', marginBottom: 16, lineHeight: 1.6 }}>
            For best results, follow these guidelines when capturing your drawing.
            Consistent, high-quality images improve routing and diagnostic accuracy.
          </p>

          <div style={{ marginBottom: 20 }}>
            <h5 style={{ marginBottom: 10 }}>Spiral Drawing</h5>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
              Draw a continuous spiral starting from the center, moving outward. Keep it
              smooth and consistent. Try to maintain even spacing between loops.
              The spiral should fill most of the page without touching the edges.
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h5 style={{ marginBottom: 10 }}>Wave Drawing</h5>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
              Draw a continuous sinusoidal wave from left to right across the page.
              Maintain consistent amplitude and frequency. Multiple rows are acceptable
              but not required.
            </p>
          </div>

          <div style={{
            padding: '12px 14px',
            background: 'var(--color-accent-soft)',
            border: '1px solid rgba(13,115,119,0.15)',
            borderRadius: 'var(--radius)',
            fontSize: '0.8125rem',
            color: 'var(--color-accent)',
          }}>
            <strong>Tip:</strong> Use a thick-tipped pen on plain white A4 paper.
            Photograph in natural light with the camera positioned directly overhead
            to minimize distortion.
          </div>

          {/* Error display */}
          {error && (
            <div style={{
              marginTop: 16,
              padding: '10px 14px',
              background: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              color: 'var(--color-error-text)',
            }}>
              <strong>Analysis error:</strong> {error}
            </div>
          )}

          {/* Analyze button */}
          <div style={{ marginTop: 20 }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 0', fontSize: '0.9375rem' }}
              onClick={handleSubmit}
              disabled={!canSubmit}
              id="analyze-btn"
            >
              {status === 'running' ? 'Analyzing…' : 'Run Analysis'}
            </button>
            {!file && (
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-ink-muted)', marginTop: 6 }}>
                Upload a drawing to begin
              </p>
            )}
            {mode === 'manual' && !manualModel && (
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-warning-text)', marginTop: 6 }}>
                Select a model to continue
              </p>
            )}
          </div>
        </div>

        {/* Right: Pipeline stepper */}
        <div className="card">
          <PipelineStepper
            steps={steps}
            stepStatus={stepStatus}
            routingResult={caseData?.routing_result || null}
            onForceAnalyze={() => {
              setForceAnalyze(true)
              handleSubmit()
            }}
          />
        </div>
      </div>
    </div>
  )
}
