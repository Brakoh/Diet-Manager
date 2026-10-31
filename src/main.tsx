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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
