import { useState } from 'react'
import { ChevronDown, ChevronUp, CreditCard, KeyRound } from 'lucide-react'
import { StatusBadge } from '../clinic/StatusBadge'
import { ORDER_FEE_STATUS, PLATFORM_FEE_BRL } from '../../constants/billingConstants'
import { shouldPromptPatientAttendance } from '../../services/appointmentStateMachine'
import { formatCurrencyBRL } from '../../utils/serviceValidation'

function PatientRecentOrdersCard({
  appointments = [],
  orderFees = [],
  onPayOrderFee,
  payingOrderId = '',
  onDeclareAttendance,
}) {
  const [expandedOrderId, setExpandedOrderId] = useState('')

  const feeByOrderId = orderFees.reduce((acc, fee) => {
    acc[fee.orderId] = fee
    return acc
  }, {})

  const groupedOrders = Object.values(
    appointments.reduce((groups, appointment) => {
      const orderId = appointment.orderId || appointment.appointmentId || appointment.id
      if (!groups[orderId]) {
        groups[orderId] = {
          orderId,
          items: [],
          createdAt: appointment.createdAt,
          checkInToken: appointment.checkInToken || null,
        }
      }
      if (appointment.checkInToken && !groups[orderId].checkInToken) {
        groups[orderId].checkInToken = appointment.checkInToken
      }
      groups[orderId].items.push(appointment)
      return groups
    }, {}),
  ).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
      aria-labelledby="patient-orders-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="patient-orders-title" className="text-lg font-bold text-slate-900">
          Meus agendamentos
        </h2>
        <span className="text-xs text-slate-500">
          Taxa única de {formatCurrencyBRL(PLATFORM_FEE_BRL)} por pedido após confirmação da clínica
        </span>
      </div>

      {groupedOrders.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          Suas solicitações de agendamento aparecerão aqui.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {groupedOrders.map((order) => {
            const isExpanded = expandedOrderId === order.orderId
            const fee = feeByOrderId[order.orderId]
            const isFeePending = fee?.status === ORDER_FEE_STATUS.PENDENTE_PAGAMENTO

            return (
              <li key={order.orderId} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">Pedido {order.orderId}</p>
                      {fee && <StatusBadge status={fee.status} type="orderFee" size="sm" />}
                      {order.checkInToken && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-xs font-bold text-emerald-800 tabular-nums">
                          <KeyRound className="h-3 w-3" aria-hidden="true" />
                          Token: {order.checkInToken}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {order.items.length} {order.items.length === 1 ? 'agendamento' : 'agendamentos'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isFeePending && onPayOrderFee && (
                      <button
                        type="button"
                        disabled={Boolean(payingOrderId)}
                        onClick={() => onPayOrderFee(order.orderId)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                      >
                        <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                        {payingOrderId === order.orderId
                          ? 'Quitando…'
                          : `Pagar taxa (${formatCurrencyBRL(PLATFORM_FEE_BRL)})`}
                      </button>
                    )}

                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedOrderId(isExpanded ? '' : order.orderId)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
                    >
                      {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <ul className="mt-3 space-y-3">
                  {order.items.map((item) => {
                    const needsAttendancePrompt = shouldPromptPatientAttendance(item)
                    return (
                      <li
                        key={item.appointmentId || item.id}
                        className="rounded-lg border border-slate-200 p-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {item.examName || item.serviceName}
                            </p>
                            <p className="mt-1 text-xs text-slate-600 tabular-nums">
                              {new Date(
                                `${item.selectedDate || item.date}T12:00:00`,
                              ).toLocaleDateString('pt-BR')}{' '}
                              às {item.selectedTimeSlot || item.time} ·{' '}
                              {item.clinicName || 'Clínica'}
                            </p>
                          </div>
                          <StatusBadge status={item.status} size="sm" />
                        </div>

                        {needsAttendancePrompt && onDeclareAttendance && (
                          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
                            <span>Esta data já passou. Você realizou o exame?</span>
                            <button
                              type="button"
                              onClick={() => onDeclareAttendance(item)}
                              className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900 cursor-pointer"
                            >
                              Informar comparecimento
                            </button>
                          </div>
                        )}

                        {isExpanded && (
                          <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
                            <p>
                              <strong className="text-slate-700">Pagamento do exame:</strong>{' '}
                              {item.paymentType === 'CONVENIO'
                                ? `Convênio (${item.insurance})`
                                : `Particular (${formatCurrencyBRL(item.price || 0)} direto na clínica)`}
                            </p>
                            {item.descriptionPrep && (
                              <p>
                                <strong className="text-slate-700">Preparo:</strong>{' '}
                                {item.descriptionPrep}
                              </p>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default PatientRecentOrdersCard
