import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { prefetchAevumConfig } from './hooks/use-config'

// Wave I7 — Prefetch /api/config so first-paint Buy-Buttons already know
// whether to disable themselves. Non-blocking, fail-open.
prefetchAevumConfig().catch(() => undefined);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
