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

function isHomeScreenApp() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    ('standalone' in navigator && navigator.standalone === true)
  )
}

function syncViewport() {
  const root = document.documentElement
  if (isHomeScreenApp()) {
    root.classList.add('is-standalone')
    root.style.setProperty('--vv-top', '0px')
    root.style.removeProperty('--vv-height')
    return
  }
  const viewport = window.visualViewport
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
