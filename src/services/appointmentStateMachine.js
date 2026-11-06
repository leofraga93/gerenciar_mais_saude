/**
 * Máquina de Estados de Agendamento (SPEC-09 & AGENTS.md §4)
 * Funções puras para validação de transições e permissões de ação por papel (role).
 */

export const APPOINTMENT_STATUS = Object.freeze({
  SOLICITADO: 'SOLICITADO',
  CONFIRMADO_CLINICA: 'CONFIRMADO_CLINICA',
  REALIZADO: 'REALIZADO',
  NAO_COMPARECEU: 'NAO_COMPARECEU',
  CANCELADO: 'CANCELADO',
})

export const APPOINTMENT_ROLES = Object.freeze({
  CLINICA: 'ROLE_CLINICA',
  PACIENTE: 'ROLE_USUARIO',
  ADMIN: 'ROLE_ADMIN',
})

/**
 * Normaliza qualquer variação de role para o padrão canônico ('ROLE_CLINICA', 'ROLE_USUARIO', 'ROLE_ADMIN')
 */
export function normalizeRole(role) {
  if (!role) return APPOINTMENT_ROLES.CLINICA
  const upper = String(role).toUpperCase().trim()
  if (upper === 'CLINICA' || upper === 'ROLE_CLINICA') return APPOINTMENT_ROLES.CLINICA
  if (upper === 'PACIENTE' || upper === 'USUARIO' || upper === 'ROLE_USUARIO') return APPOINTMENT_ROLES.PACIENTE
  if (upper === 'ADMIN' || upper === 'ROLE_ADMIN') return APPOINTMENT_ROLES.ADMIN
  return upper
}

/**
 * Verifica se a transição entre estados é permitida pelo ator (role) e contexto do agendamento.
 *
 * @param {string} from Status atual
 * @param {string} to Novo status pretendido
 * @param {string} [role] Papel executando a ação (default: ROLE_CLINICA)
 * @param {object} [context] Contexto do agendamento (checkedInAt, checkInMethod, etc.)
 * @returns {boolean}
 */
export function canTransition(from, to, role = APPOINTMENT_ROLES.CLINICA, context = {}) {
  const normRole = normalizeRole(role)

  // Estados terminais estritos
  if (from === APPOINTMENT_STATUS.REALIZADO || from === APPOINTMENT_STATUS.CANCELADO) {
    return false
  }

  // De: SOLICITADO
  if (from === APPOINTMENT_STATUS.SOLICITADO) {
    if (to === APPOINTMENT_STATUS.CONFIRMADO_CLINICA) {
      return normRole === APPOINTMENT_ROLES.CLINICA || normRole === APPOINTMENT_ROLES.ADMIN
    }
    if (to === APPOINTMENT_STATUS.CANCELADO) {
      return (
        normRole === APPOINTMENT_ROLES.CLINICA ||
        normRole === APPOINTMENT_ROLES.PACIENTE ||
        normRole === APPOINTMENT_ROLES.ADMIN
      )
    }
    return false
  }

  // De: CONFIRMADO_CLINICA
  if (from === APPOINTMENT_STATUS.CONFIRMADO_CLINICA) {
    if (to === APPOINTMENT_STATUS.REALIZADO) {
      if (normRole !== APPOINTMENT_ROLES.CLINICA && normRole !== APPOINTMENT_ROLES.ADMIN) {
        return false
      }
      // REALIZADO exige checkedInAt preenchido OU checkInMethod MANUAL
      const isCheckedIn = Boolean(context?.checkedInAt) || context?.checkInMethod === 'MANUAL'
      return isCheckedIn
    }

    if (to === APPOINTMENT_STATUS.NAO_COMPARECEU) {
      return normRole === APPOINTMENT_ROLES.CLINICA || normRole === APPOINTMENT_ROLES.ADMIN
    }

    if (to === APPOINTMENT_STATUS.CANCELADO) {
      return (
        normRole === APPOINTMENT_ROLES.CLINICA ||
        normRole === APPOINTMENT_ROLES.PACIENTE ||
        normRole === APPOINTMENT_ROLES.ADMIN
      )
    }

    return false
  }

  // De: NAO_COMPARECEU
  if (from === APPOINTMENT_STATUS.NAO_COMPARECEU) {
    // Reversão por prova de guichê (token) permitida apenas para clínica ou admin
    if (to === APPOINTMENT_STATUS.REALIZADO) {
      const isReversal =
        context?.checkInMethod === 'MANUAL_REVERSAL' ||
        Boolean(context?.hasTokenProof) ||
        Boolean(context?.token)
      return (
        (normRole === APPOINTMENT_ROLES.CLINICA || normRole === APPOINTMENT_ROLES.ADMIN) &&
        Boolean(isReversal)
      )
    }
    return false
  }

  return false
}

/**
 * Valida a transição e lança erro específico caso seja inválida.
 *
 * @param {string} from
 * @param {string} to
 * @param {string} [role]
 * @param {object} [context]
 * @throws {Error} com mensagem em português claro
 */
export function validateTransition(from, to, role = APPOINTMENT_ROLES.CLINICA, context = {}) {
  // Proibição de status legados/inexistentes
  const validStatuses = Object.values(APPOINTMENT_STATUS)
  if (!validStatuses.includes(to)) {
    throw new Error(`Status de agendamento inválido: ${to}.`)
  }

  if (from === to) {
    throw new Error('O agendamento já se encontra neste status.')
  }

  if (from === APPOINTMENT_STATUS.REALIZADO || from === APPOINTMENT_STATUS.CANCELADO) {
    throw new Error('Agendamentos finalizados (Realizado ou Cancelado) não permitem novas alterações de status.')
  }

  if (from === APPOINTMENT_STATUS.SOLICITADO && to === APPOINTMENT_STATUS.REALIZADO) {
    throw new Error('O agendamento precisa ser confirmado pela clínica antes de ser realizado.')
  }

  if (from === APPOINTMENT_STATUS.CONFIRMADO_CLINICA && to === APPOINTMENT_STATUS.REALIZADO) {
    const isCheckedIn = Boolean(context?.checkedInAt) || context?.checkInMethod === 'MANUAL'
    if (!isCheckedIn) {
      throw new Error('É necessário registrar a chegada pelo token antes de marcar como realizado.')
    }
  }

  if (from === APPOINTMENT_STATUS.NAO_COMPARECEU && to === APPOINTMENT_STATUS.REALIZADO) {
    const isReversal =
      context?.checkInMethod === 'MANUAL_REVERSAL' ||
      Boolean(context?.hasTokenProof) ||
      Boolean(context?.token)
    if (!isReversal) {
      throw new Error('A reversão de Não Compareceu para Realizado exige a apresentação do token (prova de guichê).')
    }
  }

  if (!canTransition(from, to, role, context)) {
    throw new Error('Esta alteração de status não é permitida para o perfil ou status atual do agendamento.')
  }
}

/**
 * Retorna a lista de ações operacionais disponíveis para o agendamento de acordo com o status, role e contexto.
 *
 * @param {string} status
 * @param {string} [role]
 * @param {object} [context]
 * @returns {Array<{ id: string, label: string, targetStatus: string, variant: string }>}
 */
export function getAvailableActions(status, role = APPOINTMENT_ROLES.CLINICA, context = {}) {
  const normRole = normalizeRole(role)
  const isCheckedIn = Boolean(context?.checkedInAt) || context?.checkInMethod === 'MANUAL'

  if (normRole === APPOINTMENT_ROLES.CLINICA) {
    if (status === APPOINTMENT_STATUS.SOLICITADO) {
      return [
        {
          id: 'confirm',
          label: 'Confirmar',
          targetStatus: APPOINTMENT_STATUS.CONFIRMADO_CLINICA,
          variant: 'primary',
        },
        {
          id: 'cancel',
          label: 'Recusar',
          targetStatus: APPOINTMENT_STATUS.CANCELADO,
          variant: 'danger',
        },
      ]
    }

    if (status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA) {
      const actions = []

      if (!isCheckedIn) {
        actions.push({
          id: 'check_in',
          label: 'Registrar Chegada',
          targetStatus: null, // Ação de check-in (mantém status CONFIRMADO_CLINICA e grava checkedInAt)
          variant: 'indigo',
        })
      } else {
        actions.push({
          id: 'complete',
          label: 'Marcar Realizado',
          targetStatus: APPOINTMENT_STATUS.REALIZADO,
          variant: 'success',
        })
      }

      actions.push({
        id: 'no_show',
        label: 'Não Compareceu',
        targetStatus: APPOINTMENT_STATUS.NAO_COMPARECEU,
        variant: 'secondary',
      })

      actions.push({
        id: 'cancel',
        label: 'Cancelar',
        targetStatus: APPOINTMENT_STATUS.CANCELADO,
        variant: 'danger',
      })

      return actions
    }

    if (status === APPOINTMENT_STATUS.NAO_COMPARECEU) {
      return [
        {
          id: 'revert_with_token',
          label: 'Apresentar Token (Reverter)',
          targetStatus: APPOINTMENT_STATUS.REALIZADO,
          variant: 'warning',
        },
      ]
    }

    return []
  }

  if (normRole === APPOINTMENT_ROLES.PACIENTE) {
    if (status === APPOINTMENT_STATUS.SOLICITADO || status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA) {
      return [
        {
          id: 'cancel',
          label: 'Cancelar Solicitação',
          targetStatus: APPOINTMENT_STATUS.CANCELADO,
          variant: 'danger',
        },
      ]
    }
    return []
  }

  if (normRole === APPOINTMENT_ROLES.ADMIN) {
    if (status === APPOINTMENT_STATUS.SOLICITADO || status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA) {
      return [
        {
          id: 'cancel',
          label: 'Cancelar Agendamento',
          targetStatus: APPOINTMENT_STATUS.CANCELADO,
          variant: 'danger',
        },
      ]
    }
    return []
  }

  return []
}

