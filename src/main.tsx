import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import RotatingCubePage from './components/RotatingCubePage.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/react-three" element={<RotatingCubePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
