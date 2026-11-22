import { useState } from 'react'
import { AlertCircle, Check, ClipboardCopy, CreditCard, KeyRound } from 'lucide-react'
import { APPOINTMENT_STATUS } from '../../data/appointments'
import { ORDER_FEE_STATUS, PLATFORM_FEE_BRL } from '../../constants/billingConstants'
import { shouldPromptPatientAttendance } from '../../services/appointmentStateMachine'
import { formatCurrencyBRL } from '../../utils/serviceValidation'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export default function PatientTopPriorityBar({
  appointments = [],
  orderFees = [],
  onPayOrderFee,
  payingOrderId = '',
  onDeclareAttendance,
}) {
  const [copiedToken, setCopiedToken] = useState('')

  // Agrupamento de tokens ativos por pedido (apenas itens CONFIRMADO_CLINICA com token gerado)
  const activeTokens = Object.values(
    appointments
      .filter(
        (apt) => apt.status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA && Boolean(apt.checkInToken),
      )
      .reduce((acc, apt) => {
        const orderKey = apt.orderId || apt.id
        if (!acc[orderKey]) {
          acc[orderKey] = {
            orderId: orderKey,
            token: apt.checkInToken,
            items: [],
          }
        }
        acc[orderKey].items.push(apt)
        return acc
      }, {}),
  )

  const pendingFees = orderFees.filter(
    (fee) => fee.status === ORDER_FEE_STATUS.PENDENTE_PAGAMENTO,
  )

  const pendingAttendanceItems = appointments.filter((apt) => shouldPromptPatientAttendance(apt))

  if (
    activeTokens.length === 0 &&
    pendingFees.length === 0 &&
    pendingAttendanceItems.length === 0
  ) {
    return null
  }

  const handleCopyToken = (token) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(token).then(() => {
        setCopiedToken(token)
        window.setTimeout(() => setCopiedToken(''), 2200)
      })
    }
  }

  return (
    <section aria-label="Ações prioritárias do paciente" className="space-y-4">
      {activeTokens.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Token de atendimento presencial ativo
                </h2>
                <p className="mt-0.5 text-xs text-slate-600">
                  Apresente este código de 6 caracteres na recepção da clínica no dia do exame para confirmar sua chegada.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {activeTokens.map((entry) => {
                  const first = entry.items[0]
                  const isCopied = copiedToken === entry.token
                  return (
                    <div
                      key={entry.orderId}
                      className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-emerald-900">
                          Pedido {entry.orderId}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-700">
                          {first?.examName || first?.serviceName}
                          {entry.items.length > 1 ? ` (+${entry.items.length - 1})` : ''}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                          {formatDate(first?.selectedDate || first?.date)} às{' '}
                          {first?.selectedTimeSlot || first?.time}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyToken(entry.token)}
                        title="Copiar token"
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 font-mono text-base font-bold tracking-widest text-emerald-800 shadow-2xs transition hover:bg-emerald-50 cursor-pointer tabular-nums"
                      >
                        <span>{entry.token}</span>
                        {isCopied ? (
                          <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                        ) : (
                          <ClipboardCopy className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingFees.length > 0 && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                <CreditCard className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Taxa única de agendamento pendente ({formatCurrencyBRL(PLATFORM_FEE_BRL)} por pedido)
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-700">
                  Você pode quitar a taxa agora via PIX ou comparecer presencialmente com seu token. Enquanto houver taxa pendente de um pedido confirmado, novos pedidos no site ficam bloqueados até a quitação.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:shrink-0">
              {pendingFees.map((fee) => {
                const isPaying = payingOrderId === fee.orderId
                return (
                  <button
                    key={fee.orderId}
                    type="button"
                    disabled={Boolean(payingOrderId)}
                    onClick={() => onPayOrderFee(fee.orderId)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer tabular-nums"
                  >
                    <CreditCard className="h-4 w-4" aria-hidden="true" />
                    {isPaying
                      ? 'Confirmando PIX…'
                      : `Pagar ${formatCurrencyBRL(fee.amount)} (${fee.orderId})`}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {pendingAttendanceItems.length > 0 && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Confirme seu comparecimento em agendamento anterior
                </h2>
                <p className="mt-0.5 text-xs text-slate-700">
                  O exame <strong>{pendingAttendanceItems[0].examName || pendingAttendanceItems[0].serviceName}</strong> em{' '}
                  {formatDate(pendingAttendanceItems[0].selectedDate || pendingAttendanceItems[0].date)} já passou da data prevista. Informe se compareceu para liberar novos pedidos.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDeclareAttendance(pendingAttendanceItems[0])}
              className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
            >
              Confirmar comparecimento
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
