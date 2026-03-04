import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css'

// StrictMode removed — it double-invokes effects in dev which causes
// two simultaneous getUserMedia() calls → OS locks camera → NotReadableError
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)