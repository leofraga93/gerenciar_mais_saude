import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import brandLogo from '../../assets/logo-500-sem-fundo.png'
import { clearRegisteredClinic, getRegisteredClinic } from '../../services/clinicService'
import ClinicTopBar from './ClinicTopBar'
import Sidebar from './Sidebar'

/**
 * Layout pai de /dashboard/* — sidebar + top bar + rotas filhas (checklist §3.1).
 */
function ClinicShell() {
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const clinic = getRegisteredClinic()
  const clinicName = clinic?.tradeName ?? 'Sua clínica'

  const handleLogout = () => {
    clearRegisteredClinic()
    navigate('/')
  }

  const closeMobileNav = () => setMobileNavOpen(false)

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">
          <img src={brandLogo} alt="" className="h-10 w-10 object-contain" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-slate-900">Gerenciar Mais Saúde</p>
            <p className="text-xs text-slate-500">Área da clínica</p>
          </div>
        </div>
        <Sidebar />
      </aside>

      {/* Drawer mobile / tablet */}
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label="Fechar menu"
          onClick={closeMobileNav}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:hidden ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!mobileNavOpen}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          <div className="flex items-center gap-2">
            <img src={brandLogo} alt="" className="h-9 w-9 object-contain" aria-hidden />
            <p className="text-sm font-semibold">Menu</p>
          </div>
          <button
            type="button"
            onClick={closeMobileNav}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Fechar menu de navegação"
          >
            ✕
          </button>
        </div>
        <Sidebar onNavigate={closeMobileNav} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <ClinicTopBar
          clinicName={clinicName}
          onMenuOpen={() => setMobileNavOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ClinicShell
