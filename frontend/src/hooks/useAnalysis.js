import { useState, useCallback } from 'react'
import { analyzeImage } from '../utils/api'

const STEPS = [
  { id: 'uploading', label: 'Uploading image' },
  { id: 'preprocessing', label: 'Preprocessing' },
  { id: 'routing', label: 'Detecting drawing type' },
  { id: 'quality', label: 'Quality assessment' },
  { id: 'specialist', label: 'Running specialist model' },
  { id: 'unified', label: 'Running unified cross-check' },
  { id: 'report', label: 'Building report' },
]

const IDLE_STATUS = Object.fromEntries(STEPS.map(s => [s.id, 'pending']))

export function useAnalysis() {
  const [status, setStatus] = useState('idle') // 'idle'|'running'|'done'|'error'
  const [stepStatus, setStepStatus] = useState(IDLE_STATUS)
  const [caseData, setCaseData] = useState(null)
  const [error, setError] = useState(null)
  const [isMock, setIsMock] = useState(false)

  const setStep = useCallback((stepId, s) => {
    setStepStatus(prev => ({ ...prev, [stepId]: s }))
  }, [])

  const runAnalysis = useCallback(async (file, mode, manualModel) => {
    setStatus('running')
    setCaseData(null)
    setError(null)
    setIsMock(false)
    setStepStatus(IDLE_STATUS)

    try {
      // Simulate staged progression for UX
      setStep('uploading', 'active')
      await new Promise(r => setTimeout(r, 300))
      setStep('uploading', 'done')

      setStep('preprocessing', 'active')
      await new Promise(r => setTimeout(r, 200))
      setStep('preprocessing', 'done')

      setStep('routing', 'active')

      // Start actual API call alongside staged animation
      const analysisPromise = analyzeImage(file, mode, manualModel)

      // Show routing + quality steps while waiting for response
      await new Promise(r => setTimeout(r, 600))
      setStep('routing', 'done')
      setStep('quality', 'active')
      await new Promise(r => setTimeout(r, 400))
      setStep('quality', 'done')

      setStep('specialist', 'active')
      if (mode !== 'manual') {
        await new Promise(r => setTimeout(r, 400))
        setStep('unified', 'active')
      }

      // Await actual result
      const result = await analysisPromise

      setStep('specialist', 'done')
      setStep('unified', mode === 'manual' ? 'skipped' : 'done')
      setStep('report', 'active')
      await new Promise(r => setTimeout(r, 200))
      setStep('report', 'done')

      setCaseData(result)
      setIsMock(result.is_mock || false)
      setStatus('done')
      return result

    } catch (err) {
      setError(err.message || 'Analysis failed')
      setStatus('error')
      // Mark active steps as error
      setStepStatus(prev => {
        const next = { ...prev }
        Object.keys(next).forEach(k => {
          if (next[k] === 'active') next[k] = 'error'
        })
        return next
      })
      throw err
    }
  }, [setStep])

  const reset = useCallback(() => {
    setStatus('idle')
    setStepStatus(IDLE_STATUS)
    setCaseData(null)
    setError(null)
    setIsMock(false)
  }, [])

  return {
    status,
    stepStatus,
    steps: STEPS,
    caseData,
    error,
    isMock,
    runAnalysis,
    reset,
    isRunning: status === 'running',
    isDone: status === 'done',
  }
}
