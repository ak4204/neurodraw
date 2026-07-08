import { useAuth } from '../../hooks/useAuth'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f7ff, #ede9fe)',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '4px solid #e2e8f0',
            borderTopColor: '#8766F8', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Verifying access...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}
