import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import FirAnalysis from './pages/FirAnalysis.jsx'
import SectionFinder from './pages/SectionFinder.jsx'
import TimelineGenerator from './pages/TimelineGenerator.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/fir-analysis" element={<FirAnalysis />} />
          <Route path="/section-finder" element={<SectionFinder />} />
          <Route path="/timeline-generator" element={<TimelineGenerator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
