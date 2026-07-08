import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { NotifProvider } from './context/NotifContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <NotifProvider>
        <App />
      </NotifProvider>
    </HashRouter>
  </StrictMode>,
)
