import { useMemo, useState } from 'react'
import { useAppointments } from '../../hooks/useAppointments'
import { APPOINTMENT_STATUS } from '../../data/appointments'
import { StatCard } from '../../components/clinic/StatCard'
import { StatusBadge } from '../../components/clinic/StatusBadge'
import Toast from '../../components/common/Toast'
import { formatCurrencyBRL } from '../../utils/serviceValidation'
import {
  IconCheckCircle,
  IconCreditCard,
  IconInfo,
  IconShieldCheck,
} from '../../components/common/Icons'
import { PLATFORM_FEE_BRL } from '../../constants/billingConstants'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function ClinicFinancePage() {
  const { data: appointments = [], isLoading } = useAppointments()
  const [toast, setToast] = useState(null)

  // Métricas derivadas dos agendamentos (SPEC-09)
  const metrics = useMemo(() => {
    const completed = appointments.filter((a) => a.status === APPOINTMENT_STATUS.REALIZADO)
    const confirmed = appointments.filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA)

    const revenue = completed.reduce((acc, a) => acc + (a.price || 0), 0)
    const expectedRevenue = confirmed.reduce((acc, a) => acc + (a.price || 0), 0)
    const avgTicket = completed.length > 0 ? revenue / completed.length : 0

    // Taxa da plataforma: R$ 5,00 por pedido único (orderId) com atendimento realizado
    const completedOrders = new Set(
      completed.map((a) => a.orderId || a.id),
    )
    const platformFeePayable = completedOrders.size * PLATFORM_FEE_BRL

    return { completed, confirmed, revenue, expectedRevenue, avgTicket, platformFeePayable }
  }, [appointments])

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
        <p className="mt-1 text-sm text-slate-500">
          Resumo de atendimentos realizados, valores recebidos diretamente no guichê e taxa semanal da plataforma.
        </p>
      </div>

      {/* Cards de métricas */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Receita Realizada"
            value={formatCurrencyBRL(metrics.revenue)}
            sub={`${metrics.completed.length} atendimento(s) realizado(s)`}
            icon={IconCheckCircle}
            color="emerald"
          />
          <StatCard
            label="Taxa da Plataforma Prevista"
            value={formatCurrencyBRL(metrics.platformFeePayable)}
            sub="R$ 5,00 por pedido realizado (boleto semanal)"
            icon={IconCreditCard}
            color="blue"
          />
          <StatCard
            label="Ticket Médio"
            value={formatCurrencyBRL(metrics.avgTicket)}
            sub="por atendimento particular"
            icon={IconShieldCheck}
            color="violet"
          />
        </div>
      )}

      {/* Bloco de esclarecimento do modelo de cobrança (SPEC-09) */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <IconInfo className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-blue-900">Modelo de Cobrança da Plataforma</h2>
            <p className="text-xs text-blue-800 leading-relaxed">
              O paciente realiza o pagamento dos exames e consultas <strong>diretamente à sua clínica</strong> (no guichê ou convênio).
              A plataforma cobra apenas a taxa de serviço de <strong>R$ 5,00 por pedido</strong> concluído, consolidada via boleto semanal emitido pela administração.
            </p>
          </div>
        </div>
      </div>

      {/* Histórico de atendimentos realizados */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Histórico de Atendimentos Realizados</h2>
          {!isLoading && (
            <span className="text-xs font-medium text-slate-400">
              {metrics.completed.length} registro(s)
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : metrics.completed.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-slate-400">
              Nenhum atendimento realizado ainda. Use a Agenda para registrar a chegada e concluir os atendimentos.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {metrics.completed.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition"
              >
                {/* Avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  {apt.patientName.charAt(0).toUpperCase()}
                </div>

                {/* Paciente + Serviço */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{apt.patientName}</p>
                  <p className="text-xs text-slate-500 truncate">{apt.serviceName}</p>
                </div>

                {/* Método e Data */}
                <div className="hidden sm:block shrink-0 text-right">
                  <p className="text-xs text-slate-500">{apt.paymentMethod || (apt.paymentType === 'CONVENIO' ? 'Convênio' : 'Particular')}</p>
                  <p className="text-xs text-slate-400">{formatDate(apt.date)}</p>
                </div>

                {/* Valor e status */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-emerald-700">{formatCurrencyBRL(apt.price)}</p>
                  <StatusBadge status={apt.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        {!isLoading && metrics.completed.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
            <span className="text-xs font-semibold text-slate-600">Total faturado no guichê</span>
            <span className="text-base font-bold text-emerald-700">
              {formatCurrencyBRL(metrics.revenue)}
            </span>
          </div>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}

export default ClinicFinancePage
