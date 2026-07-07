import { createContext, useContext, useState, useCallback } from 'react'

const NotifContext = createContext(null)

export function NotifProvider({ children }) {
  const [notifs, setNotifs] = useState([])

  const push = useCallback((message, type = 'info') => {
    const id = Date.now()
    setNotifs(prev => [{ id, message, type, time: new Date() }, ...prev].slice(0, 20))
  }, [])

  const dismiss = useCallback((id) => {
    setNotifs(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => setNotifs([]), [])

  return (
    <NotifContext.Provider value={{ notifs, push, dismiss, clearAll }}>
      {children}
    </NotifContext.Provider>
  )
}

export function useNotif() {
  return useContext(NotifContext)
}
