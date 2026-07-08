import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { ALLOWED_EMAILS } from '../config/allowedEmails'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (ALLOWED_EMAILS.includes(firebaseUser.email)) {
          setUser(firebaseUser)
        } else {
          await signOut(auth)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const logout = () => signOut(auth)
  return { user, loading, logout }
}
