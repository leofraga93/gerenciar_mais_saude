import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ListChecks, LoaderCircle, MapPin, Pencil, Trash2, X } from 'lucide-react'
import ExamCartItem from './ExamCartItem'
import { formatCurrencyBRL } from '../../utils/serviceValidation'
import { getInsuranceNames } from '../../data/insurances'
import { getAvailableClinicSlots } from '../../data/clinicAvailability'
import { MOCK_SERVICES_CATALOG } from '../../data/catalogData'

function ExamCartDrawer({
  items,
  draftItem,
  isOpen,
  onClose,
  onAddDraft,
  onDraftAdded,
  onUpdateDraft,
  onRemoveItem,
  onEditItem,
  onClearCart,
  onRequestAppointments,
  isSubmitting = false,
  requestError = '',
}) {
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [draftStatus, setDraftStatus] = useState('idle')
  const [draftError, setDraftError] = useState('')
  const successTimeout = useRef(null)
  const isItemAvailable = (item) => MOCK_SERVICES_CATALOG.some((service) => service.id === item.serviceId && service.clinic.id === item.clinicId)
  const hasValidSlot = (item) => getAvailableClinicSlots(item.clinicId, new Date(), item.selectedPeriod || '').some((day) => day.date === item.selectedDate && day.timeSlots.includes(item.selectedTimeSlot))
  const hasValidPayment = (item) => {
    if (item.paymentType === 'PARTICULAR') return (item.insuranceIds || []).includes('ins-particular')
    return item.paymentType === 'CONVENIO' && (item.insuranceIds || []).includes(item.selectedInsuranceId)
  }
  const canAddDraft = Boolean(draftItem && isItemAvailable(draftItem) && hasValidSlot(draftItem) && hasValidPayment(draftItem))
  const isEditingItem = Boolean(draftItem && items.some((item) => item.cartItemId === draftItem.cartItemId))

  useEffect(() => {
    setDraftStatus('idle')
    setDraftError('')
    setHasAttemptedSubmit(false)
    return () => {
      if (successTimeout.current) window.clearTimeout(successTimeout.current)
    }
  }, [draftItem])

  const handleAddDraft = async () => {
    if (!canAddDraft) {
      setHasAttemptedSubmit(true)
      return
    }

    setDraftError('')
    setDraftStatus('loading')
    try {
      await Promise.all([
        onAddDraft(draftItem),
        new Promise((resolve) => window.setTimeout(resolve, 350)),
      ])
      setDraftStatus('saved')
      successTimeout.current = window.setTimeout(onDraftAdded, 850)
    } catch (error) {
      setDraftStatus('idle')
      setDraftError(error.message || 'Não foi possível adicionar o exame. Tente novamente.')
    }
  }

  const handleRequest = () => {
    const hasInvalidItem = items.some((item) => !isItemAvailable(item) || !hasValidSlot(item) || !hasValidPayment(item))
    if (hasInvalidItem) {
      setHasAttemptedSubmit(true)
      return
    }
    setHasAttemptedSubmit(false)
    onRequestAppointments()
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && draftStatus !== 'loading') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [draftStatus, isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/40"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && draftStatus !== 'loading') onClose()
      }}
    >
      <aside
        aria-labelledby="exam-cart-title"
        aria-modal="true"
        className="ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-2xl"
        role="dialog"
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id="exam-cart-title" className="text-xl font-bold text-slate-900">
              {draftItem ? (isEditingItem ? 'Editar exame' : 'Configurar exame') : 'Lista de exames'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {draftItem
                ? `${items.length} ${items.length === 1 ? 'exame já adicionado' : 'exames já adicionados'} à lista`
                : `${items.length} ${items.length === 1 ? 'exame selecionado' : 'exames selecionados'}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={draftStatus === 'loading'}
            aria-label={draftItem ? 'Fechar configuração do exame' : 'Fechar lista de exames'}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {draftItem ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <article className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{draftItem.examName}</h3>
                    <p className="mt-1 text-sm text-slate-600">{formatCurrencyBRL(draftItem.privatePrice)}</p>
                  </div>
                </div>
                {draftItem.clinicName && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {draftItem.clinicName}
                  </p>
                )}
                {draftItem.descriptionPrep && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                    {draftItem.descriptionPrep}
                  </p>
                )}
                <ExamCartItem
                  item={draftItem}
                  onUpdate={onUpdateDraft}
                  selectionError={hasAttemptedSubmit && !hasValidSlot(draftItem)}
                  disabled={draftStatus === 'loading' || draftStatus === 'saved'}
                />
                {hasAttemptedSubmit && !hasValidPayment(draftItem) && (
                  <p role="alert" className="mt-3 text-sm text-red-700">Escolha uma forma de pagamento oferecida pela clínica.</p>
                )}
              </article>
            </div>
            <footer className="border-t border-slate-200 p-4 sm:p-6">
              <div className="space-y-3">
                {!canAddDraft && !hasAttemptedSubmit && (
                  <p className="text-xs text-slate-600">Escolha uma data, um horário e uma forma de pagamento antes de adicionar o exame.</p>
                )}
                {draftError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{draftError}</p>}
                <button
                  type="button"
                  onClick={handleAddDraft}
                  disabled={!canAddDraft || draftStatus === 'loading' || draftStatus === 'saved'}
                  aria-live="polite"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed ${draftStatus === 'saved' ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300'}`}
                >
                  {draftStatus === 'loading' ? (
                    <><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Adicionando exame…</>
                  ) : draftStatus === 'saved' ? (
                    <><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Exame adicionado</>
                  ) : isEditingItem ? 'Salvar alterações' : 'Adicionar Exame'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={draftStatus === 'loading'}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isEditingItem ? 'Voltar à lista' : 'Cancelar'}
                </button>
              </div>
            </footer>
          </>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ListChecks className="h-10 w-10 text-slate-300" aria-hidden="true" />
            <p className="mt-4 font-semibold text-slate-800">Sua lista de exames está vazia</p>
            <p className="mt-1 text-sm text-slate-500">Escolha um exame na vitrine para iniciar sua solicitação.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
            >
              Voltar à vitrine
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
              {items.map((item) => {
                const isUnavailable = !isItemAvailable(item)
                const hasStoredSelection = Boolean(item.selectedDate || item.selectedTimeSlot)
                const isSlotInvalid = !hasValidSlot(item)
                const showSelectionError = isSlotInvalid && (hasAttemptedSubmit || hasStoredSelection)
                return (
                  <li key={item.cartItemId} className={`rounded-xl border p-4 ${isUnavailable || showSelectionError ? 'border-red-300 bg-red-50/40' : 'border-slate-200'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">{item.examName}</h3>
                        <p className="mt-1 text-sm text-slate-600">{formatCurrencyBRL(item.privatePrice)}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button type="button" onClick={() => onEditItem(item)} aria-label={`Editar ${item.examName}`} className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                        <button type="button" onClick={() => onRemoveItem(item.cartItemId)} aria-label={`Remover ${item.examName} da lista de exames`} className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                      </div>
                    </div>
                    {item.clinicName && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {item.clinicName}
                      </p>
                    )}
                    {isUnavailable && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">Esta clínica/serviço está indisponível no momento. Por favor, selecione outra clínica para este exame ou entre em contato direto.</p>}
                    {item.descriptionPrep && (
                      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                        {item.descriptionPrep}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-slate-700">{item.selectedDate ? new Date(`${item.selectedDate}T12:00:00`).toLocaleDateString('pt-BR') : 'Data não selecionada'}{item.selectedTimeSlot ? ` às ${item.selectedTimeSlot}` : ''}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.paymentType === 'CONVENIO' ? `Convênio: ${getInsuranceNames([item.selectedInsuranceId])[0] || 'selecionado'}` : 'Pagamento particular'}</p>
                    {showSelectionError && <p role="alert" className="mt-2 text-sm text-red-700">Selecione uma data e um horário disponíveis.</p>}
                  </li>
                )
              })}
            </ul>
            <footer className="border-t border-slate-200 p-4 sm:p-6">
              <div className="space-y-3">
                {requestError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{requestError}</p>}
                {items.some((item) => !hasValidSlot(item)) && <p className="text-xs text-slate-600">Selecione uma data e um horário disponível para cada exame antes de solicitar.</p>}
                <button
                  type="button"
                  onClick={handleRequest}
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? 'Enviando solicitação…' : 'Concluir solicitação'}
                </button>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                >
                  Remover todos
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}

export default ExamCartDrawer
