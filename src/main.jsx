import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import OracleApp from './OracleApp.jsx'
import './styles.css'
import './oracle.css'

const isOracleExperience = window.location.pathname.startsWith(`${import.meta.env.BASE_URL}oracle`)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isOracleExperience ? <OracleApp /> : <App />}
  </StrictMode>,
)
