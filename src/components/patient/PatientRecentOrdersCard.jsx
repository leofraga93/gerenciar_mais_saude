import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { StatusBadge } from '../clinic/StatusBadge'

function PatientRecentOrdersCard({ appointments = [] }) {
  const [expandedOrderId, setExpandedOrderId] = useState('')
  const groupedOrders = Object.values(appointments.reduce((groups, appointment) => {
    const orderId = appointment.orderId || appointment.appointmentId || appointment.id
    if (!groups[orderId]) groups[orderId] = { orderId, items: [], createdAt: appointment.createdAt }
    groups[orderId].items.push(appointment)
    return groups
  }, {})).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs" aria-labelledby="patient-orders-title">
      <h2 id="patient-orders-title" className="text-lg font-bold text-slate-900">Meus agendamentos</h2>
      {groupedOrders.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">Suas solicitações de agendamento aparecerão aqui.</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {groupedOrders.map((order) => {
            const isExpanded = expandedOrderId === order.orderId
            return (
              <li key={order.orderId} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">Pedido {order.orderId}</p>
                    <p className="mt-1 text-xs text-slate-500">{order.items.length} {order.items.length === 1 ? 'agendamento' : 'agendamentos'}</p>
                  </div>
                  <button type="button" aria-expanded={isExpanded} onClick={() => setExpandedOrderId(isExpanded ? '' : order.orderId)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
                    {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}{isExpanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
                <ul className="mt-3 space-y-3">
                  {order.items.map((item) => (
                    <li key={item.appointmentId || item.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div><p className="text-sm font-semibold text-slate-800">{item.examName || item.serviceName}</p><p className="mt-1 text-xs text-slate-600">{new Date(`${item.selectedDate || item.date}T12:00:00`).toLocaleDateString('pt-BR')} às {item.selectedTimeSlot || item.time} · {item.clinicName || 'Clínica'}</p></div>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      {isExpanded && <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm text-slate-600"><p><strong className="text-slate-700">Pagamento:</strong> {item.paymentType === 'CONVENIO' ? item.insurance : 'Particular'}</p>{item.descriptionPrep && <p><strong className="text-slate-700">Preparo:</strong> {item.descriptionPrep}</p>}</div>}
                    </li>
                  ))}
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
