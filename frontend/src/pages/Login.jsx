import { useState, useEffect } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { ALLOWED_EMAILS } from '../config/allowedEmails'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { BrainCircuit } from 'lucide-react'

export default function Login() {
  const [error, setError] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard')
    }
  }, [user, loading])

  async function handleGoogleSignIn() {
    setSigningIn(true)
    setError('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const email = result.user.email
      if (!ALLOWED_EMAILS.includes(email)) {
        await signOut(auth)
        setError(`Access denied. ${email} is not authorized.`)
        setSigningIn(false)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Firebase auth error:', err.code, err.message)
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(`Error: ${err.code} — ${err.message}`)
      }
      setSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f7ff, #ede9fe)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '4px solid #e2e8f0',
            borderTopColor: '#8766F8', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Verifying access...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f7ff 0%, #ede9fe 50%, #ddd6fe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', padding: 20,
    }}>
      <div style={{
        background: 'white', borderRadius: 24, padding: '48px 40px',
        maxWidth: 420, width: '100%',
        boxShadow: '0 20px 60px rgba(135, 102, 248, 0.15)', textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'linear-gradient(135deg, #8766F8, #6d28d9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(135, 102, 248, 0.3)',
        }}>
          <BrainCircuit size={32} color="white" strokeWidth={2} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>
          NeuroDraw
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: 36, lineHeight: 1.6 }}>
          Parkinson's Research Platform<br />
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Authorized access only</span>
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          style={{
            width: '100%', padding: '14px 24px', borderRadius: 12,
            border: '2px solid #e2e8f0',
            background: signingIn ? '#f8fafc' : 'white',
            cursor: signingIn ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            fontSize: '1rem', fontWeight: 600, color: '#1a1a2e',
            transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
          onMouseEnter={e => { if (!signingIn) e.currentTarget.style.borderColor = '#8766F8' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {signingIn ? 'Opening Google...' : 'Continue with Google'}
        </button>

        {error && (
          <div style={{
            marginTop: 20, padding: '12px 16px',
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 10, color: '#dc2626', fontSize: '0.85rem', lineHeight: 1.5,
          }}>
            🚫 {error}
          </div>
        )}

        <p style={{ marginTop: 28, fontSize: '0.78rem', color: '#94a3b8' }}>
          Only authorized researchers can access this platform.
        </p>
      </div>
    </div>
  )
}
