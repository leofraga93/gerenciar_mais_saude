import { CheckCircle2, X, XCircle } from 'lucide-react'
import { PATIENT_ATTENDANCE } from '../../constants/billingConstants'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export default function AttendanceDeclarationModal({
  appointment,
  isSubmitting = false,
  onClose,
  onSubmit,
}) {
  if (!appointment) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 id="attendance-modal-title" className="text-lg font-bold text-slate-900">
              Você realizou este atendimento?
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Sua confirmação nos ajuda a manter o histórico atualizado.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fechar confirmação"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-slate-900">
            {appointment.examName || appointment.serviceName}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {appointment.clinicName || 'Clínica credenciada'} ·{' '}
            {formatDate(appointment.selectedDate || appointment.date)} às{' '}
            {appointment.selectedTimeSlot || appointment.time}
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmit(appointment.id, PATIENT_ATTENDANCE.ATTENDED)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Sim, compareci
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmit(appointment.id, PATIENT_ATTENDANCE.NOT_ATTENDED)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            <XCircle className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Não compareci
          </button>
        </div>
      </section>
    </div>
  )
}
