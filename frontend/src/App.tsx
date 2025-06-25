import React, { useState, Suspense, useEffect } from 'react'
import MainPage from './MainPage'
import { dynamicLoader } from './utils/dynamicLoader'
import { useAssistantStore } from './store/assistant'
import AIAssistant from './components/AIAssistant'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { DownloadSection } from './components/DownloadSection'
import { WritingHelperApp } from './writing-helper/WritingHelperApp'
import { AnimeCharaHelperApp } from './anime-chara-helper/AnimeCharaHelperApp'
import ChargePage from './components/ChargePage'
import './App.css'
import { LanguageProvider } from './contexts/LanguageContext'
import { CircularProgress } from '@mui/material'

// Loading component for suspense
const LoadingComponent = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <span>Loading...</span>
  </div>
);

const App: React.FC = () => {
  const [isAssistantOpen, setAssistantOpen] = useState(false);

  // Preload installed components on app start
  useEffect(() => {
    dynamicLoader.preloadInstalledComponents();
  }, []);

  const handleModeSelect = (mode: string) => {
    // Handle mode selection
  };

  const handleBack = () => {
    // Handle back navigation
  };

  return (
    <Suspense fallback={<CircularProgress />}>
      <LanguageProvider>
        <Router>
          <div className="app-container">
            <Suspense fallback={<LoadingComponent />}>
              <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/writing" element={<WritingHelperApp />} />
                <Route path="/writing-helper" element={<WritingHelperApp />} />
                <Route path="/anime-chara" element={<AnimeCharaHelperApp onBack={handleBack} />} />
                <Route path="/charge" element={<ChargePage onClose={() => {}} />} />
              </Routes>
            </Suspense>

            {isAssistantOpen && (
              <div className="ai-assistant-container">
                <AIAssistant onClose={() => setAssistantOpen(false)} />
              </div>
            )}
          </div>
        </Router>
      </LanguageProvider>
    </Suspense>
  )
}

export default App 