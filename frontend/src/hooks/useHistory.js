import { useState, useCallback } from 'react'
import { getCases, deleteCase as apiDeleteCase } from '../utils/api'

export function useHistory() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refreshCases = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCases()
      setCases(data.cases || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const removeCase = useCallback(async (caseId) => {
    try {
      await apiDeleteCase(caseId)
      setCases(prev => prev.filter(c => c.case_id !== caseId))
    } catch (err) {
      setError(err.message)
    }
  }, [])

  return { cases, loading, error, refreshCases, removeCase }
}
