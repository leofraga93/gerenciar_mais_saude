import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getRegisteredClinic } from '../../services/clinicService'
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

  const showBanner = Boolean(
    location.state?.showCompleteProfileBanner ?? registeredClinic?.profileComplete === false,
  )

  const { data: appointments = [], isLoading } = useAppointments()

  const today = new Date().toISOString().split('T')[0]

  const metrics = useMemo(() => {
    const todayList = appointments.filter((a) => a.date === today)
    const pending = appointments.filter((a) => a.status === APPOINTMENT_STATUS.SOLICITADO)
    const paid = appointments.filter((a) => a.status === APPOINTMENT_STATUS.PAGO)
    const revenue = paid.reduce((acc, a) => acc + (a.price || 0), 0)
    return { todayList, pending, paid, revenue }
  }, [appointments, today])

  // Últimos 5 agendamentos ordenados por data/hora decrescente
  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => {
        const da = new Date(`${a.date}T${a.time}`)
        const db = new Date(`${b.date}T${b.time}`)
        return db - da
      })
      .slice(0, 5)
  }, [appointments])

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
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

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visão geral da clínica com dados em tempo real do mock de agendamentos.
        </p>
      </div>

      {/* Cards de métricas */}
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
            label="Atendimentos Confirmados"
            value={metrics.paid.length + appointments.filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA).length}
            sub="pagos + confirmados"
            icon={IconCheckCircle}
            color="emerald"
          />
          <StatCard
            label="Receita Estimada"
            value={formatCurrencyBRL(metrics.revenue)}
            sub="agendamentos pagos (mock)"
            icon={IconCreditCard}
            color="violet"
          />
        </div>
      )}

      {/* Agendamentos recentes */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Agendamentos Recentes</h2>
          <Link
            to="/dashboard/agenda"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
          >
            Ver todos
          </Link>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
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
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition"
              >
                {/* Avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  {apt.patientName.charAt(0).toUpperCase()}
                </div>

                {/* Paciente + Exame */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{apt.patientName}</p>
                  <p className="text-xs text-slate-500 truncate">{apt.serviceName}</p>
                </div>

                {/* Data e Hora */}
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs font-medium text-slate-700">{formatDate(apt.date)}</p>
                  <p className="text-xs text-slate-400">{apt.time}</p>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  <StatusBadge status={apt.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Atalhos rápidos */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Meus Serviços', desc: 'Gerencie o catálogo de exames e consultas', to: '/dashboard/servicos', color: 'emerald' },
          { label: 'Agenda', desc: 'Confirme e acompanhe os agendamentos', to: '/dashboard/agenda', color: 'blue' },
          { label: 'Financeiro', desc: 'Resumo de receitas e chave PIX', to: '/dashboard/financeiro', color: 'violet' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition"
          >
            <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition">
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
