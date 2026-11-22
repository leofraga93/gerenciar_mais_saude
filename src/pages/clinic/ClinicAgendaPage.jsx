import { useMemo, useState } from 'react'
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_CONFIG,
  getAvailableActions,
} from '../../data/appointments'
import { CHECK_IN_METHOD } from '../../constants/billingConstants'
import {
  useAppointments,
  useManualCheckIn,
  useUpdateAppointmentStatus,
} from '../../hooks/useAppointments'
import { StatusBadge } from '../../components/clinic/StatusBadge'
import TokenCheckInForm from '../../components/clinic/TokenCheckInForm'
import Toast from '../../components/common/Toast'
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconClose,
  IconCreditCard,
  IconFilter,
  IconPhone,
  IconUser,
} from '../../components/common/Icons'
import { formatCurrencyBRL } from '../../utils/serviceValidation'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function getCheckInLabel(appointment) {
  if (!appointment.checkedInAt) return null
  if (appointment.checkInMethod === CHECK_IN_METHOD.MANUAL) return 'Check-in manual registrado'
  if (appointment.checkInMethod === CHECK_IN_METHOD.MANUAL_REVERSAL) {
    return 'Reversão presencial por token'
  }
  return 'Check-in validado por token'
}

function AppointmentCard({ appointment, onAction, onManualCheckIn, isUpdating }) {
  const [expanded, setExpanded] = useState(false)
  const actions = getAvailableActions(appointment.status, 'CLINIC', {
    checkedInAt: appointment.checkedInAt,
    checkInMethod: appointment.checkInMethod,
  })
  const checkInLabel = getCheckInLabel(appointment)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
          {appointment.patientName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{appointment.patientName}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <IconPhone className="h-3 w-3" />
                {appointment.patientPhone}
              </p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          <p className="mt-2 text-sm font-medium text-slate-800">{appointment.serviceName}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 tabular-nums">
              <IconCalendar className="h-3.5 w-3.5" />
              {formatDate(appointment.date)}
            </span>
            <span className="flex items-center gap-1 tabular-nums">
              <IconClock className="h-3.5 w-3.5" />
              {appointment.time}
            </span>
            <span className="flex items-center gap-1">
              <IconCreditCard className="h-3.5 w-3.5" />
              {appointment.insurance}
            </span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {appointment.paymentType === 'CONVENIO'
                ? 'Via Convênio'
                : formatCurrencyBRL(appointment.price)}
            </span>
          </div>

          {(checkInLabel || appointment.attendanceDispute || appointment.orderId) && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              {appointment.orderId && <span className="font-mono">Pedido {appointment.orderId}</span>}
              {checkInLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-emerald-700">{checkInLabel}</span>
                </>
              )}
              {appointment.attendanceDispute && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-amber-700">Divergência auditada</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="space-y-2 border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          {appointment.prepInstructions && (
            <div>
              <span className="font-semibold text-slate-700">Instruções de preparo: </span>
              {appointment.prepInstructions}
            </div>
          )}
          {appointment.notes && (
            <div>
              <span className="font-semibold text-slate-700">Observações: </span>
              {appointment.notes}
            </div>
          )}
          <div>
            <span className="font-semibold text-slate-700">Modalidade: </span>
            {appointment.paymentMethod || appointment.insurance}
          </div>
          {appointment.checkInToken && (
            <div>
              <span className="font-semibold text-slate-700">Token do pedido: </span>
              <span className="font-mono font-bold text-slate-800">{appointment.checkInToken}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-slate-500 transition hover:text-slate-700 cursor-pointer"
        >
          {expanded ? 'Ocultar detalhes' : 'Ver detalhes'}
        </button>

        <div className="flex flex-wrap gap-2">
          {actions.includes('confirm') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onAction(appointment.id, APPOINTMENT_STATUS.CONFIRMADO_CLINICA)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
            >
              <IconCheck className="h-3.5 w-3.5" />
              Confirmar vaga
            </button>
          )}

          {actions.includes('checkin_manual') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onManualCheckIn(appointment.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 disabled:opacity-50 cursor-pointer"
            >
              Registrar chegada (Manual)
            </button>
          )}

          {actions.includes('complete') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() =>
                onAction(appointment.id, APPOINTMENT_STATUS.REALIZADO, {
                  checkedInAt: appointment.checkedInAt,
                  checkInMethod: appointment.checkInMethod || CHECK_IN_METHOD.TOKEN,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
            >
              <IconCheck className="h-3.5 w-3.5" />
              Marcar realizado
            </button>
          )}

          {actions.includes('no_show') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onAction(appointment.id, APPOINTMENT_STATUS.NAO_COMPARECEU)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 cursor-pointer"
            >
              Não compareceu
            </button>
          )}

          {actions.includes('reverse_token') && (
            <span className="text-[11px] font-medium text-slate-500">
              Para reverter ausência, valide o token acima.
            </span>
          )}

          {actions.includes('cancel') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onAction(appointment.id, APPOINTMENT_STATUS.CANCELADO)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 cursor-pointer"
            >
              <IconClose className="h-3.5 w-3.5" />
              Recusar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const STATUS_FILTER_OPTIONS = [
  { id: 'all', label: 'Todos' },
  ...Object.values(APPOINTMENT_STATUS_CONFIG).map((c) => ({ id: c.id, label: c.label })),
]

export default function ClinicAgendaPage() {
  const { data: appointments = [], isLoading, isError } = useAppointments()
  const updateStatus = useUpdateAppointmentStatus()
  const manualCheckInMutation = useManualCheckIn()

  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const handleAction = async (id, newStatus, extra = {}) => {
    try {
      await updateStatus.mutateAsync({ id, newStatus, role: 'CLINIC', ...extra })
      const label = APPOINTMENT_STATUS_CONFIG[newStatus]?.label ?? newStatus
      showToast(`Status atualizado para: ${label}`)
    } catch (error) {
      showToast(error.message || 'Não foi possível atualizar o status.', 'error')
    }
  }

  const handleManualCheckIn = async (appointmentId) => {
    try {
      await manualCheckInMutation.mutateAsync({
        appointmentId,
        reason: 'Paciente identificado presencialmente na recepção',
      })
      showToast('Chegada manual registrada. Clique em "Marcar realizado" após o exame.')
    } catch (error) {
      showToast(error.message || 'Não foi possível registrar a chegada manual.', 'error')
    }
  }

  const countByStatus = useMemo(() => {
    const counts = {}
    appointments.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1
    })
    return counts
  }, [appointments])

  const filtered = useMemo(() => {
    let list = [...appointments]
    if (filterStatus !== 'all') list = list.filter((a) => a.status === filterStatus)
    if (filterDate) list = list.filter((a) => a.date === filterDate)
    return list
  }, [appointments, filterStatus, filterDate])

  const today = new Date().toISOString().split('T')[0]
  const todayCount = appointments.filter((a) => a.date === today).length
  const pendingCount = appointments.filter(
    (a) => a.status === APPOINTMENT_STATUS.SOLICITADO,
  ).length
  const realizedCount = appointments.filter(
    (a) => a.status === APPOINTMENT_STATUS.REALIZADO,
  ).length

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
        <p className="mt-1 text-sm text-slate-500">
          Confirme solicitações, valide o token presencial do paciente e conclua os atendimentos realizados.
        </p>
      </div>

      <TokenCheckInForm
        onSuccessToast={(msg) => showToast(msg, 'success')}
        onErrorToast={(msg) => showToast(msg, 'error')}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Total de agendamentos',
            value: appointments.length,
            cls: 'border-slate-200 text-slate-700',
          },
          {
            label: 'Hoje',
            value: todayCount,
            cls: 'border-blue-100 bg-blue-50/40 text-blue-700',
          },
          {
            label: 'Solicitações pendentes',
            value: pendingCount,
            cls: 'border-amber-100 bg-amber-50/40 text-amber-700',
          },
          {
            label: 'Exames realizados',
            value: realizedCount,
            cls: 'border-emerald-100 bg-emerald-50/40 text-emerald-700',
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border bg-white px-4 py-3 ${item.cls}`}
          >
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p className="mt-0.5 text-2xl font-bold leading-none tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <IconFilter className="h-3.5 w-3.5 text-emerald-600" />
            <span>Filtrar por status:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTER_OPTIONS.map((opt) => {
              const count = opt.id === 'all' ? appointments.length : (countByStatus[opt.id] ?? 0)
              const isSelected = filterStatus === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFilterStatus(opt.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'border-emerald-300 bg-emerald-100/90 text-emerald-900 shadow-sm ring-1 ring-emerald-400/30'
                      : 'border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                  <span className={`text-[11px] tabular-nums ${isSelected ? 'font-medium text-emerald-700' : 'text-slate-400'}`}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="filter-date"
            className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-700"
          >
            <IconCalendar className="h-3.5 w-3.5 text-emerald-600" />
            Data:
          </label>
          <input
            id="filter-date"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20"
          />
          {filterDate && (
            <button
              type="button"
              onClick={() => setFilterDate('')}
              className="text-xs text-rose-500 transition hover:text-rose-700 cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <p className="py-10 text-center text-sm text-slate-400">Carregando agendamentos…</p>
      )}
      {isError && (
        <p className="py-10 text-center text-sm text-red-600">
          Não foi possível carregar os agendamentos.
        </p>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <IconUser className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">
            {filterStatus !== 'all' || filterDate
              ? 'Nenhum agendamento encontrado para os filtros aplicados.'
              : 'Nenhum agendamento registrado ainda.'}
          </p>
          {(filterStatus !== 'all' || filterDate) && (
            <button
              type="button"
              onClick={() => { setFilterStatus('all'); setFilterDate('') }}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <p className="text-xs text-slate-400 tabular-nums">
            Exibindo <strong>{filtered.length}</strong> de {appointments.length} agendamentos
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onAction={handleAction}
                onManualCheckIn={handleManualCheckIn}
                isUpdating={updateStatus.isPending || manualCheckInMutation.isPending}
              />
            ))}
          </div>
        </>
      )}

      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="mb-2 text-xs font-semibold text-slate-600">Fluxo de estados:</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {Object.values(APPOINTMENT_STATUS_CONFIG).map((c, idx, arr) => (
            <span key={c.id} className="flex items-center gap-1.5">
              <StatusBadge status={c.id} size="sm" />
              {idx < arr.length - 1 && <span className="text-slate-300">→</span>}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          REALIZADO e CANCELADO são estados terminais. A transição para REALIZADO exige check-in prévio na recepção; NAO_COMPARECEU só pode ser revertido mediante validação de token presencial.
        </p>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
