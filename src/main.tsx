import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeDatabase } from './initDatabase'

// Initialize database schema before rendering app
initializeDatabase().then(() => {
  createRoot(document.getElementById('root')!).render(
    <App />
  )
}).catch((error) => {
  console.error('Failed to initialize app:', error)
  // Still render the app even if init fails
  createRoot(document.getElementById('root')!).render(
    <App />
  )
})
