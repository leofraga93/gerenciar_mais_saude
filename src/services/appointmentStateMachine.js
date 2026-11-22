import { CHECK_IN_METHOD } from '../constants/billingConstants'

/**
 * Máquina de Estados de Agendamento — Máquina 1 (SPEC-09).
 * Estados oficiais e compartilhados entre paciente, clínica e admin:
 * SOLICITADO | CONFIRMADO_CLINICA | REALIZADO | NAO_COMPARECEU | CANCELADO
 */
export const APPOINTMENT_STATUS = Object.freeze({
  SOLICITADO: 'SOLICITADO',
  CONFIRMADO_CLINICA: 'CONFIRMADO_CLINICA',
  REALIZADO: 'REALIZADO',
  NAO_COMPARECEU: 'NAO_COMPARECEU',
  CANCELADO: 'CANCELADO',
})

export const APPOINTMENT_STATUS_CONFIG = Object.freeze({
  [APPOINTMENT_STATUS.SOLICITADO]: {
    id: APPOINTMENT_STATUS.SOLICITADO,
    label: 'Solicitado pelo Paciente',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
    description: 'Aguardando validação de vaga e confirmação pela clínica.',
  },
  [APPOINTMENT_STATUS.CONFIRMADO_CLINICA]: {
    id: APPOINTMENT_STATUS.CONFIRMADO_CLINICA,
    label: 'Vaga Confirmada',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
    description: 'Horário reservado pela clínica. Token presencial gerado para check-in.',
  },
  [APPOINTMENT_STATUS.REALIZADO]: {
    id: APPOINTMENT_STATUS.REALIZADO,
    label: 'Atendimento Realizado',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-600',
    description: 'Check-in validado no guichê e atendimento concluído pela clínica.',
  },
  [APPOINTMENT_STATUS.NAO_COMPARECEU]: {
    id: APPOINTMENT_STATUS.NAO_COMPARECEU,
    label: 'Não Compareceu',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotClass: 'bg-slate-600',
    description: 'Ausência registrada pela clínica após o horário agendado.',
  },
  [APPOINTMENT_STATUS.CANCELADO]: {
    id: APPOINTMENT_STATUS.CANCELADO,
    label: 'Cancelado / Recusado',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
    description: 'Horário liberado. Atendimento não será realizado.',
  },
})

export function canTransition(fromStatus, toStatus, role = 'CLINIC', context = {}) {
  const normalizedRole = String(role || 'CLINIC').toUpperCase()
  const hasCheckIn = Boolean(context?.checkedInAt)
  const isTokenReversal = context?.checkInMethod === CHECK_IN_METHOD.MANUAL_REVERSAL

  switch (fromStatus) {
    case APPOINTMENT_STATUS.SOLICITADO:
      if (toStatus === APPOINTMENT_STATUS.CANCELADO) return true
      if (toStatus === APPOINTMENT_STATUS.CONFIRMADO_CLINICA) {
        return normalizedRole === 'CLINIC' || normalizedRole === 'ADMIN'
      }
      return false

    case APPOINTMENT_STATUS.CONFIRMADO_CLINICA:
      if (toStatus === APPOINTMENT_STATUS.CANCELADO) return true
      if (normalizedRole !== 'CLINIC' && normalizedRole !== 'ADMIN') return false
      if (toStatus === APPOINTMENT_STATUS.REALIZADO) return hasCheckIn
      if (toStatus === APPOINTMENT_STATUS.NAO_COMPARECEU) return true
      return false

    case APPOINTMENT_STATUS.NAO_COMPARECEU:
      if (
        (normalizedRole === 'CLINIC' || normalizedRole === 'ADMIN') &&
        toStatus === APPOINTMENT_STATUS.REALIZADO
      ) {
        return hasCheckIn && isTokenReversal
      }
      return false

    case APPOINTMENT_STATUS.REALIZADO:
    case APPOINTMENT_STATUS.CANCELADO:
    default:
      return false
  }
}

export function getAvailableActions(status, role = 'CLINIC', context = {}) {
  const actions = []
  const normalizedRole = String(role || 'CLINIC').toUpperCase()

  if (canTransition(status, APPOINTMENT_STATUS.CONFIRMADO_CLINICA, normalizedRole, context)) {
    actions.push('confirm')
  }

  if (
    status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA &&
    (normalizedRole === 'CLINIC' || normalizedRole === 'ADMIN')
  ) {
    if (context?.checkedInAt) {
      actions.push('complete')
    } else {
      actions.push('checkin_manual')
    }
    actions.push('no_show')
  }

  if (
    status === APPOINTMENT_STATUS.NAO_COMPARECEU &&
    (normalizedRole === 'CLINIC' || normalizedRole === 'ADMIN')
  ) {
    actions.push('reverse_token')
  }

  if (canTransition(status, APPOINTMENT_STATUS.CANCELADO, normalizedRole, context)) {
    actions.push('cancel')
  }

  return actions
}

export function isPastAppointmentDate(appointment, referenceDate = new Date()) {
  const dateStr = appointment?.selectedDate || appointment?.date
  const timeStr = appointment?.selectedTimeSlot || appointment?.time || '23:59'
  if (!dateStr) return false
  const parsed = new Date(`${dateStr}T${timeStr}:00`)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed.getTime() < referenceDate.getTime()
}

export function shouldPromptPatientAttendance(appointment, referenceDate = new Date()) {
  if (!appointment) return false
  if (appointment.status !== APPOINTMENT_STATUS.CONFIRMADO_CLINICA) return false
  if (appointment.patientAttendance) return false
  return isPastAppointmentDate(appointment, referenceDate)
}
