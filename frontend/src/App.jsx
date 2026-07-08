import { Routes, Route } from 'react-router-dom'
import TopNav from './components/Layout/TopNav'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AnalyzeHub from './pages/AnalyzeHub'
import AnalyzeImage from './pages/AnalyzeImage'
import AnalyzeSignal from './pages/AnalyzeSignal'
import PipelineArchitecture from './pages/PipelineArchitecture'
import AnalyzeFusion from './pages/AnalyzeFusion'
import Disease from './pages/Disease'
import History from './pages/History'
import Reports from './pages/Reports'
import ResearchDashboard from './pages/ResearchDashboard'
import ModelComparison from './pages/ModelComparison'
import About from './pages/About'
import Settings from './pages/Settings'

function ProtectedLayout({ children }) {
  return (
    <div className="app-container">
      <TopNav />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Protected routes — require Google sign-in */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <ProtectedLayout><Dashboard /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/analyze" element={
        <ProtectedRoute>
          <ProtectedLayout><AnalyzeHub /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/analyze/image" element={
        <ProtectedRoute>
          <ProtectedLayout><AnalyzeImage /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/analyze/image/:caseId" element={
        <ProtectedRoute>
          <ProtectedLayout><AnalyzeImage /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/analyze/signal" element={
        <ProtectedRoute>
          <ProtectedLayout><AnalyzeSignal /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/analyze/fusion" element={
        <ProtectedRoute>
          <ProtectedLayout><AnalyzeFusion /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/pipeline" element={
        <ProtectedRoute>
          <ProtectedLayout><PipelineArchitecture /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/research" element={
        <ProtectedRoute>
          <ProtectedLayout><ResearchDashboard /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/models" element={
        <ProtectedRoute>
          <ProtectedLayout><ModelComparison /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/disease" element={
        <ProtectedRoute>
          <ProtectedLayout><Disease /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute>
          <ProtectedLayout><History /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <ProtectedLayout><Reports /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/about" element={
        <ProtectedRoute>
          <ProtectedLayout><About /></ProtectedLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <ProtectedLayout><Settings /></ProtectedLayout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}
