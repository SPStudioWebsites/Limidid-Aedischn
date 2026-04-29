import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Impressum from './Impressum.jsx'
import Datenschutz from './Datenschutz.jsx'

function Router() {
  const getPage = () => window.location.hash.replace('#', '').toLowerCase()
  const [page, setPage] = useState(getPage)

  useEffect(() => {
    const onHash = () => setPage(getPage())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (page === 'impressum')  return <Impressum />
  if (page === 'datenschutz') return <Datenschutz />
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
