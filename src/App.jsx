import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import PatientWelcomePage from './pages/PatientWelcomePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/paciente/inicio" element={<PatientWelcomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
