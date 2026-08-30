import { useLocation } from 'react-router-dom'
import { getRegisteredClinic } from '../../services/clinicService'
import ClinicActionBanner from '../../components/clinic/ClinicActionBanner'
import { IconHospital } from '../../components/common/Icons'

function ClinicDashboardPage() {
  const location = useLocation()
  const registeredClinic = getRegisteredClinic()

  const showBanner = Boolean(
    location.state?.showCompleteProfileBanner ?? registeredClinic?.profileComplete === false,
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {showBanner ? (
        <ClinicActionBanner
          type="warning"
          badge="Ação recomendada"
          badgeDetail="Perfil incompleto"
          title="Complete o cadastro da sua clínica"
          description="Preencha endereço completo, horários de atendimento e fotos para aumentar a atratividade do seu perfil e receber agendamentos."
          actionLabel="Completar perfil"
          actionTo="/dashboard/perfil"
          icon={IconHospital}
        />
      ) : null}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Visão geral da clínica. Métricas, agendamentos recentes e receita estimada serão exibidos
          aqui com dados mock (checklist §4.1).
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Conteúdo do dashboard em construção
      </div>
    </div>
  )
}

export default ClinicDashboardPage
