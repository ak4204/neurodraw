/* Utility API client for NeuroDraw frontend */

const BASE_URL = '/api'

async function handleResponse(res) {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const body = await res.json()
      msg = body.detail || body.message || msg
    } catch (_) {}
    throw new Error(msg)
  }
  return res.json()
}

export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, options)
  return handleResponse(res)
}

export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/`)
    .catch(() => ({ ok: false, json: async () => ({}) }))
  if (!res.ok) return { status: 'offline', models_loaded: {} }
  return res.json()
}

export async function analyzeImage(file, mode = 'auto', manualModel = null) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('mode', mode)
  if (manualModel) formData.append('manual_model', manualModel)

  const res = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  })
  return handleResponse(res)
}

export async function getCases() {
  const res = await fetch(`${BASE_URL}/cases`)
  return handleResponse(res)
}

export async function getCase(caseId) {
  const res = await fetch(`${BASE_URL}/cases/${caseId}`)
  return handleResponse(res)
}

export async function deleteCase(caseId) {
  const res = await fetch(`${BASE_URL}/cases/${caseId}`, { method: 'DELETE' })
  return handleResponse(res)
}

export async function generateReport(caseId) {
  const res = await fetch(`${BASE_URL}/reports/${caseId}`, { method: 'POST' })
  if (!res.ok) throw new Error(`Report generation failed: HTTP ${res.status}`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `neurodraw_report_${caseId.slice(0, 8)}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function getMetrics() {
  const res = await fetch(`${BASE_URL}/models/metrics`)
  return handleResponse(res)
}

export async function analyzePahaw(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE_URL}/pahaw/analyze`, {
    method: 'POST',
    body: formData,
  })
  return handleResponse(res)
}
