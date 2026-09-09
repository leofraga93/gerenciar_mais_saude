import { useMemo, useState } from 'react'
import { useAppointments } from '../../hooks/useAppointments'
import { APPOINTMENT_STATUS } from '../../data/appointments'
import { StatCard } from '../../components/clinic/StatCard'
import { StatusBadge } from '../../components/clinic/StatusBadge'
import Toast from '../../components/common/Toast'
import { formatCurrencyBRL } from '../../utils/serviceValidation'
import {
  IconCheck,
  IconCheckCircle,
  IconCreditCard,
  IconInfo,
  IconShieldCheck,
} from '../../components/common/Icons'

// Chave PIX mock derivada do perfil (pode ser sobrescrita na integração com clinicService)
const MOCK_PIX_KEY = 'clinica@gerenciarsaude.com.br'
const MOCK_BANK = 'Banco do Brasil — Conta Corrente 12345-6 / Agência 1234'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

// Ícone PIX inline (sem emoji, conforme regras do projeto)
function IconPix({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.0006 2L7.00293 7.00293L9.17188 9.17188L12.0006 6.34375L14.8281 9.17188L17.0002 7.00293L12.0006 2Z" />
      <path d="M2 12.0006L7.00293 17.0002L9.17188 14.8281L6.34375 12.0006L9.17188 9.17188L7.00293 7.00293L2 12.0006Z" />
      <path d="M17.0002 17.0002L22.0006 12.0006L17.0002 7.00293L14.8281 9.17188L17.6562 12.0006L14.8281 14.8281L17.0002 17.0002Z" />
      <path d="M12.0006 22L17.0002 17.0002L14.8281 14.8281L12.0006 17.6562L9.17188 14.8281L7.00293 17.0002L12.0006 22Z" />
    </svg>
  )
}

function ClinicFinancePage() {
  const { data: appointments = [], isLoading } = useAppointments()
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const handleCopyPix = () => {
    navigator.clipboard.writeText(MOCK_PIX_KEY).then(() => {
      setCopied(true)
      showToast('Chave PIX copiada para a área de transferência.')
      setTimeout(() => setCopied(false), 2500)
    })
  }

  // Métricas derivadas dos agendamentos
  const metrics = useMemo(() => {
    const paid = appointments.filter((a) => a.status === APPOINTMENT_STATUS.PAGO)
    const confirmed = appointments.filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA)
    const revenue = paid.reduce((acc, a) => acc + (a.price || 0), 0)
    const expectedRevenue = confirmed.reduce((acc, a) => acc + (a.price || 0), 0)
    const avgTicket = paid.length > 0 ? revenue / paid.length : 0
    return { paid, confirmed, revenue, expectedRevenue, avgTicket }
  }, [appointments])

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
        <p className="mt-1 text-sm text-slate-500">
          Resumo de recebíveis e histórico de pagamentos. Dados derivados do mock de agendamentos.
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
            sub={`${metrics.paid.length} pagamento(s) confirmado(s)`}
            icon={IconCheckCircle}
            color="emerald"
          />
          <StatCard
            label="Receita Prevista"
            value={formatCurrencyBRL(metrics.expectedRevenue)}
            sub={`${metrics.confirmed.length} ag. confirmado(s)`}
            icon={IconCreditCard}
            color="blue"
          />
          <StatCard
            label="Ticket Médio"
            value={formatCurrencyBRL(metrics.avgTicket)}
            sub="por atendimento pago"
            icon={IconShieldCheck}
            color="violet"
          />
        </div>
      )}

      {/* Bloco de destaque PIX */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <IconPix className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-sm font-bold text-emerald-900">Recebimento via PIX</h2>
              <p className="text-xs text-emerald-700 mt-0.5">
                Compartilhe a chave abaixo com o paciente após confirmar o agendamento.
              </p>
            </div>

            {/* Chave PIX */}
            <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2.5">
              <span className="flex-1 font-mono text-sm font-semibold text-slate-800 break-all">
                {MOCK_PIX_KEY}
              </span>
              <button
                type="button"
                onClick={handleCopyPix}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
              >
                {copied ? (
                  <>
                    <IconCheck className="h-3.5 w-3.5" />
                    Copiado
                  </>
                ) : (
                  'Copiar Chave'
                )}
              </button>
            </div>

            {/* Dados bancários */}
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              <IconInfo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>{MOCK_BANK}</span>
            </div>

            <p className="text-[11px] text-emerald-600">
              Nenhuma integração bancária real nesta fase — a confirmação de pagamento é feita
              manualmente via botão &quot;Registrar Pagamento&quot; na Agenda.
            </p>
          </div>
        </div>
      </div>

      {/* Histórico de recebimentos (agendamentos com status PAGO) */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Histórico de Pagamentos Confirmados</h2>
          {!isLoading && (
            <span className="text-xs font-medium text-slate-400">
              {metrics.paid.length} registro(s)
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : metrics.paid.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-slate-400">
              Nenhum pagamento confirmado ainda. Use a Agenda para registrar pagamentos.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {metrics.paid.map((apt) => (
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

                {/* Método */}
                <div className="hidden sm:block shrink-0 text-right">
                  <p className="text-xs text-slate-500">{apt.paymentMethod}</p>
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
        {!isLoading && metrics.paid.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
            <span className="text-xs font-semibold text-slate-600">Total recebido</span>
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
