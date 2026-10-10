import { MapPin, X } from 'lucide-react'
import { getInsuranceNames } from '../../data/insurances'
import { formatCurrencyBRL } from '../../utils/serviceValidation'

function ExamRequestReviewModal({ items, onClose, onConfirm }) {
  if (!items?.length) return null
  const total = items.reduce((sum, item) => sum + (item.paymentType === 'PARTICULAR' ? item.privatePrice : 0), 0)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="exam-review-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
        <header className="flex items-start justify-between gap-4">
          <div><h2 id="exam-review-title" className="text-2xl font-bold text-slate-900">Revise sua solicitação</h2><p className="mt-1 text-sm text-slate-600">Confira os exames antes de entrar ou criar sua conta para continuar.</p></div>
          <button type="button" onClick={onClose} aria-label="Fechar revisão" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"><X className="h-5 w-5" aria-hidden="true" /></button>
        </header>
        <ul className="mt-5 space-y-3">
          {items.map((item) => <li key={item.cartItemId} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-slate-900">{item.examName}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><MapPin className="h-4 w-4" aria-hidden="true" />{item.clinicName}</p></div><span className="font-semibold text-slate-800">{item.paymentType === 'PARTICULAR' ? formatCurrencyBRL(item.privatePrice) : 'Via convênio'}</span></div>
            <p className="mt-3 text-sm text-slate-700">{new Date(`${item.selectedDate}T12:00:00`).toLocaleDateString('pt-BR')} às {item.selectedTimeSlot}</p>
            <p className="mt-1 text-sm text-slate-600">{item.paymentType === 'CONVENIO' ? `Convênio: ${getInsuranceNames([item.selectedInsuranceId])[0] || 'selecionado'}` : 'Pagamento particular'}</p>
            {item.descriptionPrep && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">Preparo: {item.descriptionPrep}</p>}
          </li>)}
        </ul>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 text-sm"><span className="font-semibold text-slate-700">Total particular</span><strong className="text-emerald-800">{formatCurrencyBRL(total)}</strong></div>
        <p className="mt-4 text-sm text-slate-600">Sua lista será mantida durante o acesso ou cadastro. A solicitação só será enviada depois que você entrar e confirmar.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Voltar à lista</button><button type="button" onClick={onConfirm} className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Concluir</button></div>
      </section>
    </div>
  )
}

export default ExamRequestReviewModal
