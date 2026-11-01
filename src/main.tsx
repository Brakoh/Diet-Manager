import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/500.css'
import '@fontsource/outfit/600.css'
import '@fontsource/outfit/700.css'
import App from './App'
import './styles.css'

document.addEventListener(
  'touchmove',
  (event) => {
    if (event.touches.length > 1) event.preventDefault()
  },
  { passive: false },
)

document.addEventListener(
  'gesturestart',
  ((event: Event) => {
    event.preventDefault()
  }) as EventListener,
)

function syncViewport() {
  const viewport = window.visualViewport
  const root = document.documentElement
  root.style.setProperty('--vv-height', `${viewport?.height ?? window.innerHeight}px`)
  root.style.setProperty('--vv-top', `${viewport?.offsetTop ?? 0}px`)
}

syncViewport()
window.visualViewport?.addEventListener('resize', syncViewport)
window.visualViewport?.addEventListener('scroll', syncViewport)
window.addEventListener('orientationchange', syncViewport)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
