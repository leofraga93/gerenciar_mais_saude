import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  CLINIC_APPROVAL_STATUS,
  getClinicTrialRemainingDays,
  getRegisteredClinic,
} from '../../services/clinicService'
import { CLINIC_MONTHLY_PLAN_BRL, CLINIC_SUBSCRIPTION_STATUS } from '../../constants/billingConstants'
import ClinicActionBanner from '../../components/clinic/ClinicActionBanner'
import { StatCard } from '../../components/clinic/StatCard'
import { StatusBadge } from '../../components/clinic/StatusBadge'
import { useAppointments } from '../../hooks/useAppointments'
import { APPOINTMENT_STATUS } from '../../data/appointments'
import { formatCurrencyBRL } from '../../utils/serviceValidation'
import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconCreditCard,
  IconHospital,
} from '../../components/common/Icons'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function ClinicDashboardPage() {
  const location = useLocation()
  const registeredClinic = getRegisteredClinic()
  const trialDaysLeft = getClinicTrialRemainingDays(registeredClinic)

  const showBanner = Boolean(
    location.state?.showCompleteProfileBanner ?? registeredClinic?.profileComplete === false,
  )

  const moderationNotice = (() => {
    if (!registeredClinic) return null
    if (registeredClinic.statusAprovacao === CLINIC_APPROVAL_STATUS.PENDING) {
      return {
        type: 'warning',
        badge: 'Credenciamento em análise',
        title: 'Cadastro em análise',
        description:
          'Sua clínica e seu catálogo de exames estão sob verificação da administração da plataforma. Após a aprovação, você terá 3 meses (90 dias) de uso gratuito ilimitado.',
      }
    }
    if (registeredClinic.statusAprovacao === CLINIC_APPROVAL_STATUS.SUSPENDED) {
      const isTrialExpired =
        registeredClinic.subscriptionStatus === CLINIC_SUBSCRIPTION_STATUS.TRIAL_EXPIRED ||
        registeredClinic.suspensionReason === 'TRIAL_EXPIRED'
      return {
        type: 'warning',
        badge: isTrialExpired ? 'Período de teste encerrado' : 'Clínica suspensa',
        title: isTrialExpired
          ? 'Seu período gratuito de 90 dias terminou'
          : 'A publicação da clínica está suspensa',
        description: isTrialExpired
          ? `Para reativar sua clínica no catálogo de pacientes, confirme a adesão ao plano mensal de ${formatCurrencyBRL(CLINIC_MONTHLY_PLAN_BRL)}/mês junto à administração.`
          : 'Sua clínica continua com acesso ao portal, mas os serviços não estão disponíveis para agendamento. Entre em contato com a administração da plataforma para regularizar a situação.',
      }
    }
    if (registeredClinic.statusAprovacao === CLINIC_APPROVAL_STATUS.REJECTED) {
      return {
        type: 'warning',
        badge: 'Credenciamento não aprovado',
        title: 'O credenciamento não foi aprovado',
        description:
          'Sua clínica continua com acesso ao portal para consultar os dados cadastrados. Entre em contato com o suporte para regularizar as pendências cadastrais.',
      }
    }
    if (
      registeredClinic.statusAprovacao === CLINIC_APPROVAL_STATUS.APPROVED &&
      registeredClinic.subscriptionStatus === CLINIC_SUBSCRIPTION_STATUS.TRIAL &&
      trialDaysLeft !== null
    ) {
      return {
        type: 'info',
        badge: 'Período de teste ativo',
        title: `${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'} de uso gratuito ilimitado`,
        description: `Após o término dos 90 dias gratuitos, o plano mensal é de ${formatCurrencyBRL(CLINIC_MONTHLY_PLAN_BRL)}/mês. Caso não haja adesão ao fim do prazo, a exibição no catálogo é suspensa automaticamente.`,
      }
    }
    return null
  })()

  const { data: appointments = [], isLoading } = useAppointments()
  const today = new Date().toISOString().split('T')[0]

  const metrics = useMemo(() => {
    const todayList = appointments.filter((a) => a.date === today)
    const pending = appointments.filter((a) => a.status === APPOINTMENT_STATUS.SOLICITADO)
    const confirmed = appointments.filter(
      (a) => a.status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA,
    )
    const realized = appointments.filter((a) => a.status === APPOINTMENT_STATUS.REALIZADO)
    const revenue = realized
      .filter((a) => a.paymentType !== 'CONVENIO')
      .reduce((acc, a) => acc + (a.price || 0), 0)
    return { todayList, pending, confirmed, realized, revenue }
  }, [appointments, today])

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))
      .slice(0, 5)
  }, [appointments])

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {moderationNotice ? (
        <ClinicActionBanner
          type={moderationNotice.type}
          badge="Status da clínica"
          badgeDetail={moderationNotice.badge}
          title={moderationNotice.title}
          description={moderationNotice.description}
          icon={IconHospital}
        />
      ) : null}
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
        <p className="mt-1 text-sm text-slate-500">
          Visão geral da clínica com indicadores da agenda e atendimentos realizados.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Agendamentos Hoje"
            value={metrics.todayList.length}
            sub={metrics.todayList.length === 0 ? 'Nenhum para hoje' : 'no dia atual'}
            icon={IconCalendar}
            color="blue"
          />
          <StatCard
            label="Solicitações Pendentes"
            value={metrics.pending.length}
            sub="aguardando confirmação"
            icon={IconClock}
            color="amber"
          />
          <StatCard
            label="Exames Realizados"
            value={metrics.realized.length}
            sub={`${metrics.confirmed.length} vaga(s) confirmada(s)`}
            icon={IconCheckCircle}
            color="emerald"
          />
          <StatCard
            label="Receita Confirmada"
            value={formatCurrencyBRL(metrics.revenue)}
            sub="particular realizado"
            icon={IconCreditCard}
            color="violet"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800">Agendamentos Recentes</h2>
          <Link
            to="/dashboard/agenda"
            className="text-xs font-semibold text-emerald-600 transition hover:text-emerald-700"
          >
            Ver todos
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : recentAppointments.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">
            Nenhum agendamento registrado ainda.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  {apt.patientName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{apt.patientName}</p>
                  <p className="truncate text-xs text-slate-500">{apt.serviceName}</p>
                </div>

                <div className="hidden shrink-0 text-right sm:block tabular-nums">
                  <p className="text-xs font-medium text-slate-700">{formatDate(apt.date)}</p>
                  <p className="text-xs text-slate-400">{apt.time}</p>
                </div>

                <div className="shrink-0">
                  <StatusBadge status={apt.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Meus Serviços', desc: 'Gerencie o catálogo de exames e consultas', to: '/dashboard/servicos' },
          { label: 'Agenda', desc: 'Confirme vagas, valide tokens e conclua exames', to: '/dashboard/agenda' },
          { label: 'Financeiro', desc: 'Receita confirmada, pendente e progressão mensal', to: '/dashboard/financeiro' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-800 transition group-hover:text-emerald-700">
              {item.label}
            </p>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ClinicDashboardPage
