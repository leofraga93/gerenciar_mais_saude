import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ClinicShell from './components/clinic/ClinicShell'
import LandingPage from './pages/LandingPage'
import ClinicSignupPage from './pages/ClinicSignupPage'
import PatientWelcomePage from './pages/PatientWelcomePage'
import ClinicDashboardPage from './pages/clinic/ClinicDashboardPage'
import ClinicAgendaPage from './pages/clinic/ClinicAgendaPage'
import ClinicServicesPage from './pages/clinic/ClinicServicesPage'
import ClinicFinancePage from './pages/clinic/ClinicFinancePage'
import ClinicProfilePage from './pages/clinic/ClinicProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cadastro-clinica" element={<ClinicSignupPage />} />
        <Route path="/paciente/inicio" element={<PatientWelcomePage />} />

        <Route path="/dashboard" element={<ClinicShell />}>
          <Route index element={<ClinicDashboardPage />} />
          <Route path="agenda" element={<ClinicAgendaPage />} />
          <Route path="servicos" element={<ClinicServicesPage />} />
          <Route path="financeiro" element={<ClinicFinancePage />} />
          <Route path="perfil" element={<ClinicProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
