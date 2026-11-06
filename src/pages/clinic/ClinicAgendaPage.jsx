import { useMemo, useState } from 'react'
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_CONFIG,
  getAvailableActions,
} from '../../data/appointments'
import {
  useAppointments,
  useUpdateAppointmentStatus,
  useCheckInAppointment,
} from '../../hooks/useAppointments'
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
import { CheckCircle2, RotateCcw, UserCheck } from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function formatTime(isoString) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Modal de Check-in por Token / Prova de Guichê
// ---------------------------------------------------------------------------

function CheckInModal({ appointment, isReversal = false, onClose, onSuccess }) {
  const [tokenInput, setTokenInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const checkIn = useCheckInAppointment()
  const updateStatus = useUpdateAppointmentStatus()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const cleanToken = tokenInput.trim().toUpperCase()

    if (!cleanToken && !isReversal) {
      setError('Informe o código de 6 caracteres do paciente.')
      return
    }

    setLoading(true)
    try {
      if (isReversal) {
        await updateStatus.mutateAsync({
          id: appointment.id,
          newStatus: APPOINTMENT_STATUS.REALIZADO,
          token: cleanToken,
          checkInMethod: 'MANUAL_REVERSAL',
        })
        onSuccess(
          'Prova de guichê registrada. O agendamento voltou para Realizado e foi sinalizado para revisão administrativa.',
        )
      } else {
        await checkIn.mutateAsync({
          id: appointment.id,
          token: cleanToken,
          method: 'TOKEN',
        })
        onSuccess("Chegada registrada. Clique em 'Marcar realizado' para encerrar o atendimento.")
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Token inválido ou não encontrado.')
    } finally {
      setLoading(false)
    }
  }

  const handleManualCheckIn = async () => {
    setError('')
    setLoading(true)
    try {
      await checkIn.mutateAsync({
        id: appointment.id,
        method: 'MANUAL',
      })
      onSuccess("Chegada manual registrada. Clique em 'Marcar realizado' para encerrar o atendimento.")
      onClose()
    } catch (err) {
      setError(err.message || 'Falha ao registrar chegada manual.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isReversal ? 'Reversão por Prova de Guichê' : 'Registrar Chegada (Check-in)'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Paciente: <strong className="text-slate-800">{appointment.patientName}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="token-input" className="block text-xs font-semibold text-slate-700">
              Código de Presença (6 caracteres)
            </label>
            <input
              id="token-input"
              type="text"
              maxLength={6}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
              placeholder="Ex: 234567"
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-center font-mono text-xl font-bold tracking-widest uppercase text-slate-900 placeholder:text-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              autoFocus
            />
            {appointment.checkInToken && (
              <p className="mt-1 text-[11px] text-slate-400">
                Token gerado no pedido: <span className="font-mono font-semibold">{appointment.checkInToken}</span>
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {loading ? 'Validando…' : isReversal ? 'Confirmar Prova de Guichê' : 'Validar Chegada'}
            </button>

            {!isReversal && (
              <button
                type="button"
                disabled={loading}
                onClick={handleManualCheckIn}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 py-1 transition"
              >
                Registrar chegada manual (sem token)
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Card de Agendamento
// ---------------------------------------------------------------------------

function AppointmentCard({ appointment, onAction, onOpenCheckIn, isUpdating }) {
  const [expanded, setExpanded] = useState(false)
  const isCheckedIn = Boolean(appointment.checkedInAt) || appointment.checkInMethod === 'MANUAL'
  const actions = getAvailableActions(appointment.status, 'ROLE_CLINICA', appointment)

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

          {/* Indicador visual de Check-in registrado */}
          {isCheckedIn && appointment.status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
              <span>Chegada confirmada às {formatTime(appointment.checkedInAt)}</span>
            </div>
          )}

          {/* Indicador de disputa/divergência */}
          {appointment.attendanceDispute && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
              <span>Em análise administrativa (divergência ou prova de guichê)</span>
            </div>
          )}
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
            {appointment.paymentMethod || (appointment.paymentType === 'CONVENIO' ? 'Guia Convênio' : 'Particular na Clínica')}
          </div>
          {appointment.checkInToken && (
            <div>
              <span className="font-semibold text-slate-700">Token de Presença: </span>
              <span className="font-mono font-bold text-slate-800">{appointment.checkInToken}</span>
            </div>
          )}
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Confirmação de vaga */}
          {actions.some((a) => a.id === 'confirm') && (
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

          {/* Passo 1: Registrar Chegada (Check-in) */}
          {actions.some((a) => a.id === 'check_in') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onOpenCheckIn(appointment, false)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <UserCheck className="h-3.5 w-3.5" />
              Registrar Chegada
            </button>
          )}

          {/* Passo 2: Marcar Realizado (após check-in) */}
          {actions.some((a) => a.id === 'complete') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onAction(appointment.id, APPOINTMENT_STATUS.REALIZADO)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <IconCheck className="h-3.5 w-3.5" />
              Marcar Realizado
            </button>
          )}

          {/* Não compareceu */}
          {actions.some((a) => a.id === 'no_show') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onAction(appointment.id, APPOINTMENT_STATUS.NAO_COMPARECEU)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition"
            >
              Não Compareceu
            </button>
          )}

          {/* Prova de Guichê: Reverter Não Compareceu -> Realizado */}
          {actions.some((a) => a.id === 'revert_with_token') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onOpenCheckIn(appointment, true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Apresentar Token (Reverter)
            </button>
          )}

          {/* Cancelar / Recusar */}
          {actions.some((a) => a.id === 'cancel') && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onAction(appointment.id, APPOINTMENT_STATUS.CANCELADO)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition"
            >
              <IconClose className="h-3.5 w-3.5" />
              {appointment.status === APPOINTMENT_STATUS.SOLICITADO ? 'Recusar' : 'Cancelar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Página Principal da Agenda
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
  const [checkInModalData, setCheckInModalData] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const handleAction = async (id, newStatus) => {
    try {
      await updateStatus.mutateAsync({ id, newStatus })
      const label = APPOINTMENT_STATUS_CONFIG[newStatus]?.label ?? newStatus
      showToast(`Status atualizado para: ${label}`)
    } catch (error) {
      showToast(error.message || 'Não foi possível atualizar o status.', 'error')
    }
  }

  const handleOpenCheckIn = (appointment, isReversal = false) => {
    setCheckInModalData({ appointment, isReversal })
  }

  // Contagens por status para os filtros
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
  const pendingCount = appointments.filter((a) => a.status === APPOINTMENT_STATUS.SOLICITADO).length
  const completedCount = appointments.filter((a) => a.status === APPOINTMENT_STATUS.REALIZADO).length

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie o fluxo de atendimento da clínica e registre a chegada e conclusão dos procedimentos.
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
            label: 'Realizados',
            value: completedCount,
            cls: 'border-emerald-100 text-emerald-700 bg-emerald-50/40',
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-xl border bg-white px-4 py-3 ${item.cls}`}
          >
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p className="text-2xl font-bold leading-none mt-0.5">{item.value}</p>
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
                onOpenCheckIn={handleOpenCheckIn}
                isUpdating={updateStatus.isPending}
              />
            ))}
          </div>
        </>
      )}

      {/* Legenda da máquina de estados */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="mb-2 text-xs font-semibold text-slate-600">Fluxo operacional de estados (SPEC-09):</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {Object.values(APPOINTMENT_STATUS_CONFIG).map((c, idx, arr) => (
            <span key={c.id} className="flex items-center gap-1.5">
              <StatusBadge status={c.id} size="sm" />
              {idx < arr.length - 1 && <span className="text-slate-300">→</span>}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Realizado e Cancelado são estados finais. A chegada pelo token habilita a marcação de Realizado pela clínica.
        </p>
      </div>

      {/* Modal de Check-in */}
      {checkInModalData && (
        <CheckInModal
          appointment={checkInModalData.appointment}
          isReversal={checkInModalData.isReversal}
          onClose={() => setCheckInModalData(null)}
          onSuccess={(msg) => showToast(msg, 'success')}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
