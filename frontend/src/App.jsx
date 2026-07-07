import { Routes, Route } from 'react-router-dom'
import TopNav from './components/Layout/TopNav'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import AnalyzeHub from './pages/AnalyzeHub'
import AnalyzeImage from './pages/AnalyzeImage'
import AnalyzeSignal from './pages/AnalyzeSignal'
import PipelineArchitecture from './pages/PipelineArchitecture'
import DoctorWorkspace from './pages/DoctorWorkspace'
import Disease from './pages/Disease'
import History from './pages/History'
import Reports from './pages/Reports'
import ResearchDashboard from './pages/ResearchDashboard'
import ModelComparison from './pages/ModelComparison'
import About from './pages/About'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="app-container">
      <TopNav />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/analyze" element={<AnalyzeHub />} />
          <Route path="/analyze/image" element={<AnalyzeImage />} />
          <Route path="/analyze/image/:caseId" element={<AnalyzeImage />} />
          <Route path="/analyze/signal" element={<AnalyzeSignal />} />
          
          <Route path="/pipeline" element={<PipelineArchitecture />} />
          <Route path="/workspace" element={<DoctorWorkspace />} />
          <Route path="/research" element={<ResearchDashboard />} />
          <Route path="/models" element={<ModelComparison />} />
          
          {/* Legacy/Other pages */}
          <Route path="/disease" element={<Disease />} />
          <Route path="/history" element={<History />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  )
}
