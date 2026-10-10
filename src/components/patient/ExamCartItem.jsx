import { useMemo } from 'react'
import { CalendarDays, Clock3, Info } from 'lucide-react'
import { INSURANCES } from '../../data/insurances'
import { getAvailableClinicSlots } from '../../data/clinicAvailability'

const PAYMENT_OPTIONS = [
  { id: 'PARTICULAR', label: 'Particular' },
  { id: 'CONVENIO', label: 'Convênio' },
]

function formatDateLabel(dateValue) {
  const [year, month, day] = dateValue.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
  })
}

function ExamCartItem({ item, onUpdate, selectionError = false, disabled = false }) {
  const availableDays = useMemo(
    () => getAvailableClinicSlots(item.clinicId, new Date(), item.selectedPeriod || ''),
    [item.clinicId, item.selectedPeriod]
  )
  const selectedDay = availableDays.find((day) => day.date === item.selectedDate)
  const compatibleInsurances = INSURANCES.filter(
    (insurance) =>
      insurance.id !== 'ins-particular' &&
      (item.insuranceIds || []).includes(insurance.id)
  )
  const offersParticular = (item.insuranceIds || []).includes('ins-particular')
  const selectedInsuranceIsCompatible = compatibleInsurances.some(
    (insurance) => insurance.id === item.selectedInsuranceId
  )

  const updatePaymentType = (paymentType) => {
    if (paymentType === 'PARTICULAR' && !offersParticular) return
    if (paymentType === 'CONVENIO' && compatibleInsurances.length === 0) return

    onUpdate(item.cartItemId, {
      paymentType,
      selectedInsuranceId:
        paymentType === 'CONVENIO'
          ? compatibleInsurances[0].id
          : '',
    })
  }

  return (
    <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
      {selectionError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">Escolha uma data e um horário disponibilizados pela clínica para este exame.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-1.5 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Data disponível
          </span>
          <select
            value={item.selectedDate}
            disabled={disabled}
            onChange={(event) =>
              onUpdate(item.cartItemId, {
                selectedDate: event.target.value,
                selectedTimeSlot: '',
              })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">Selecione uma data</option>
            {availableDays.map((day) => (
              <option key={day.date} value={day.date}>{formatDateLabel(day.date)}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          <span className="mb-1.5 flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Horário disponível
          </span>
          <select
            value={item.selectedTimeSlot}
            onChange={(event) => onUpdate(item.cartItemId, { selectedTimeSlot: event.target.value })}
            disabled={!selectedDay || disabled}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">Selecione um horário</option>
            {selectedDay?.timeSlots.map((timeSlot) => (
              <option key={timeSlot} value={timeSlot}>{timeSlot}</option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Forma de pagamento</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PAYMENT_OPTIONS.map((option) => {
            const isUnavailable = option.id === 'CONVENIO'
              ? compatibleInsurances.length === 0
              : !offersParticular
            const isSelected = item.paymentType === option.id
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSelected}
                disabled={isUnavailable || disabled}
                onClick={() => updatePaymentType(option.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-300'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        {item.paymentType === 'CONVENIO' && compatibleInsurances.length > 0 ? (
          <label className="mt-3 block text-sm font-medium text-slate-700">
            Convênio
            <select
              value={selectedInsuranceIsCompatible ? item.selectedInsuranceId : compatibleInsurances[0].id}
              disabled={disabled}
              onChange={(event) =>
                onUpdate(item.cartItemId, { selectedInsuranceId: event.target.value })
              }
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              {compatibleInsurances.map((insurance) => (
                <option key={insurance.id} value={insurance.id}>{insurance.name}</option>
              ))}
            </select>
          </label>
        ) : item.paymentType === 'CONVENIO' ? (
          <p className="mt-2 text-sm text-red-700">Este exame não atende aos convênios do perfil. Selecione Particular ou altere o plano.</p>
        ) : compatibleInsurances.length === 0 ? (
          <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Não há convênio em comum entre o perfil do paciente e este exame.
          </p>
        ) : null}
      </fieldset>
    </div>
  )
}

export default ExamCartItem
