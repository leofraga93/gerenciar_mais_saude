import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getRegisteredClinic } from '../../services/clinicService'

function ClinicDashboardPage() {
  const location = useLocation()
  const registeredClinic = getRegisteredClinic()

  const [showBanner, setShowBanner] = useState(
    Boolean(
      location.state?.showCompleteProfileBanner ?? registeredClinic?.profileComplete === false,
    ),
  )

  return (
    <div className="mx-auto max-w-6xl">
      {showBanner ? (
        <div
          className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div>
            <p className="font-semibold text-amber-900">Complete seu perfil</p>
            <p className="mt-1 text-sm text-amber-800">
              Credenciamento concluído. Preencha endereço, horários e dados financeiros em{' '}
              <Link to="/dashboard/perfil" className="font-medium underline hover:text-amber-900">
                Perfil
              </Link>{' '}
              e publique exames em{' '}
              <Link to="/dashboard/servicos" className="font-medium underline hover:text-amber-900">
                Meus Serviços
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
          >
            Entendi
          </button>
        </div>
      ) : null}

      <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Visão geral da clínica. Métricas, agendamentos recentes e receita estimada serão exibidos
        aqui com dados mock (checklist §4.1).
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Conteúdo do dashboard em construção
      </div>
    </div>
  )
}

export default ClinicDashboardPage
