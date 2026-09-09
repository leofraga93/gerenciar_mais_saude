import { useMemo, useState } from 'react'
import { APPOINTMENT_STATUS, APPOINTMENT_STATUS_CONFIG } from '../../data/appointments'
import { useAppointments, useUpdateAppointmentStatus } from '../../hooks/useAppointments'
import { StatusBadge } from '../../components/clinic/StatusBadge'
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Retorna os botões de ação permitidos pela máquina de estados. */
function getAvailableActions(status) {
  switch (status) {
    case APPOINTMENT_STATUS.SOLICITADO:
      return ['confirm', 'cancel']
    case APPOINTMENT_STATUS.CONFIRMADO_CLINICA:
      return ['pay', 'cancel']
    default:
      return [] // PAGO e CANCELADO são terminais
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function AppointmentCard({ appointment, onAction, isUpdating }) {
  const [expanded, setExpanded] = useState(false)
  const actions = getAvailableActions(appointment.status)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Cabeçalho do card */}
      <div className="flex items-start gap-3 p-4">
        {/* Avatar paciente */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
          {appointment.patientName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{appointment.patientName}</p>
              <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
                <IconPhone className="h-3 w-3" />
                {appointment.patientPhone}
              </p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          <p className="mt-2 text-sm font-medium text-slate-800">{appointment.serviceName}</p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <IconCalendar className="h-3.5 w-3.5" />
              {formatDate(appointment.date)}
            </span>
            <span className="flex items-center gap-1">
              <IconClock className="h-3.5 w-3.5" />
              {appointment.time}
            </span>
            <span className="flex items-center gap-1">
              <IconCreditCard className="h-3.5 w-3.5" />
              {appointment.insurance}
            </span>
            <span className="font-semibold text-slate-700">
              {formatCurrencyBRL(appointment.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Painel expandido: instruções + observações */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600 space-y-2">
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
            <span className="font-semibold text-slate-700">Pagamento previsto: </span>
            {appointment.paymentMethod}
          </div>
        </div>
      )}

      {/* Rodapé de ações */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-slate-400 hover:text-slate-600 transition"
        >
          {expanded ? 'Ocultar detalhes' : 'Ver detalhes'}
        </button>

        <div className="flex gap-2">
          {actions.includes('confirm') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onAction(appointment.id, APPOINTMENT_STATUS.CONFIRMADO_CLINICA)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <IconCheck className="h-3.5 w-3.5" />
              Confirmar
            </button>
          )}

          {actions.includes('pay') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onAction(appointment.id, APPOINTMENT_STATUS.PAGO)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition"
            >
              <IconCreditCard className="h-3.5 w-3.5" />
              Registrar Pagamento
            </button>
          )}

          {actions.includes('cancel') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onAction(appointment.id, APPOINTMENT_STATUS.CANCELADO)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition"
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

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

const STATUS_FILTER_OPTIONS = [
  { id: 'all', label: 'Todos' },
  ...Object.values(APPOINTMENT_STATUS_CONFIG).map((c) => ({ id: c.id, label: c.label })),
]

export default function ClinicAgendaPage() {
  const { data: appointments = [], isLoading, isError } = useAppointments()
  const updateStatus = useUpdateAppointmentStatus()

  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const handleAction = async (id, newStatus) => {
    try {
      await updateStatus.mutateAsync({ id, newStatus })
      const label = APPOINTMENT_STATUS_CONFIG[newStatus]?.label ?? newStatus
      showToast(`Status atualizado para: ${label}`)
    } catch {
      showToast('Não foi possível atualizar o status.', 'error')
    }
  }

  // Contagens por status para os badges de filtro
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

  // Agendamentos do dia para o indicador de resumo
  const today = new Date().toISOString().split('T')[0]
  const todayCount = appointments.filter((a) => a.date === today).length
  const pendingCount = appointments.filter(
    (a) => a.status === APPOINTMENT_STATUS.SOLICITADO,
  ).length

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie as solicitações de agendamento e avance o status via Máquina de Estados.
        </p>
      </div>

      {/* Resumo rápido */}
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
            cls: 'border-blue-100 text-blue-700 bg-blue-50/40',
          },
          {
            label: 'Pendentes',
            value: pendingCount,
            cls: 'border-amber-100 text-amber-700 bg-amber-50/40',
          },
          {
            label: 'Pagos (mês)',
            value: appointments.filter((a) => a.status === APPOINTMENT_STATUS.PAGO).length,
            cls: 'border-emerald-100 text-emerald-700 bg-emerald-50/40',
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border bg-white px-4 py-3 ${item.cls}`}
          >
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p className={`text-2xl font-bold leading-none mt-0.5`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 space-y-3">
        {/* Filtro por status (pills) */}
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
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-emerald-100/90 text-emerald-900 border-emerald-300 shadow-sm ring-1 ring-emerald-400/30'
                      : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                  <span className={`text-[11px] ${isSelected ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                    ({count})
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Filtro por data */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="filter-date"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0"
          >
            <IconCalendar className="h-3.5 w-3.5 text-emerald-600" />
            Data:
          </label>
          <input
            id="filter-date"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 transition"
          />
          {filterDate && (
            <button
              type="button"
              onClick={() => setFilterDate('')}
              className="text-xs text-rose-500 hover:text-rose-700 transition"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Estados de loading / erro / vazio */}
      {isLoading && (
        <p className="text-center text-sm text-slate-400 py-10">Carregando agendamentos…</p>
      )}
      {isError && (
        <p className="text-center text-sm text-red-600 py-10">
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
              className="mt-3 text-xs font-semibold text-emerald-600 hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Lista de cards */}
      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <p className="text-xs text-slate-400">
            Exibindo <strong>{filtered.length}</strong> de {appointments.length} agendamentos
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onAction={handleAction}
                isUpdating={updateStatus.isPending}
              />
            ))}
          </div>
        </>
      )}

      {/* Legenda da máquina de estados */}
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
        <p className="mt-2 text-[11px] text-slate-400">
          PAGO e CANCELADO são estados terminais — nenhuma ação adicional está disponível.
        </p>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
