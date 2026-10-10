import { CheckCircle2, X } from 'lucide-react'
import { getInsuranceNames } from '../../data/insurances'
import { formatCurrencyBRL } from '../../utils/serviceValidation'

function OrderSummaryModal({ order, onClose }) {
  if (!order) return null

  const total = order.appointments.reduce((sum, item) => sum + item.price, 0)
  const preparations = [...new Set(order.appointments.map((item) => item.descriptionPrep).filter(Boolean))]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="order-summary-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /><span className="text-sm font-semibold">Solicitação registrada</span></div>
            <h2 id="order-summary-title" className="mt-2 text-2xl font-bold text-slate-900">Resumo dos agendamentos</h2>
            <p className="mt-1 text-sm text-slate-600">Pedido {order.orderId}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar resumo" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"><X className="h-5 w-5" aria-hidden="true" /></button>
        </header>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600"><tr><th className="px-4 py-3 font-semibold">Exame e clínica</th><th className="px-4 py-3 font-semibold">Data e horário</th><th className="px-4 py-3 font-semibold">Pagamento</th><th className="px-4 py-3 text-right font-semibold">Valor</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {order.appointments.map((item) => (
                <tr key={item.appointmentId}>
                  <td className="px-4 py-3"><p className="font-semibold text-slate-800">{item.examName}</p><p className="mt-1 text-xs text-slate-500">{item.clinicName}</p></td>
                  <td className="px-4 py-3 text-slate-700">{new Date(`${item.selectedDate}T12:00:00`).toLocaleDateString('pt-BR')} às {item.selectedTimeSlot}</td>
                  <td className="px-4 py-3 text-slate-700">{item.paymentType === 'CONVENIO' ? `Via Convênio ${getInsuranceNames([item.insuranceId])[0] || ''}` : 'Particular'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrencyBRL(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 text-sm"><span className="font-semibold text-slate-700">Total particular</span><strong className="text-emerald-800">{formatCurrencyBRL(total)}</strong></div>

        {preparations.length > 0 && (
          <section className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="font-semibold text-amber-950">Orientações de preparo</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">{preparations.map((preparation) => <li key={preparation}>{preparation}</li>)}</ul>
          </section>
        )}

        <p className="mt-4 text-xs text-slate-500">As solicitações estão aguardando confirmação das clínicas.</p>
        <button type="button" onClick={onClose} className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">Concluir</button>
      </section>
    </div>
  )
}

export default OrderSummaryModal
