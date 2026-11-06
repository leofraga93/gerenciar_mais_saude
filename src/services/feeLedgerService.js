import {
  PLATFORM_FEE_BRL,
  FEE_LEDGER_STATUS,
  SETTLEMENT_MODE,
  getIsoWeekKey,
} from '../constants/billingConstants'

const FEE_LEDGER_STORAGE_KEY = 'gerenciar_saude_fee_ledger_v1'

function createId(prefix) {
  return `${prefix}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`
}

export function loadFeeLedger() {
  try {
    const raw = localStorage.getItem(FEE_LEDGER_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveFeeLedger(entries) {
  try {
    localStorage.setItem(FEE_LEDGER_STORAGE_KEY, JSON.stringify(entries))
  } catch (error) {
    console.error('Erro ao persistir feeLedger no localStorage:', error)
  }
}

/**
 * Registra ou atualiza o lançamento da taxa (feeLedger) para um agendamento faturável.
 * Unidade de cobrança: Pedido por Clínica (orderId + clinicId).
 *
 * @param {object} appointment Agendamento que disparou o fato gerador
 * @param {Array<object>} allAppointments Lista completa de agendamentos no storage
 * @returns {object|null} Lançamento criado ou atualizado
 */
export function recordFeeTriggerForAppointment(appointment, allAppointments = []) {
  if (!appointment?.orderId || !appointment?.clinicId) return null

  const orderId = appointment.orderId
  const clinicId = appointment.clinicId

  // Agendamentos relacionados ao mesmo pedido e clínica
  const relatedAppointments = allAppointments.filter(
    (item) => item.orderId === orderId && item.clinicId === clinicId,
  )

  const entries = loadFeeLedger()
  const existingIndex = entries.findIndex(
    (entry) => entry.orderId === orderId && entry.clinicId === clinicId,
  )

  // Calcula soma dos serviços particulares cobráveis
  const billableItems = relatedAppointments.filter((item) =>
    ['REALIZADO', 'NAO_COMPARECEU'].includes(item.status),
  )

  const servicesAmount = billableItems.reduce((acc, item) => {
    if (item.paymentType === 'PARTICULAR') {
      return acc + (Number(item.price) || 0)
    }
    return acc
  }, 0)

  const hasDispute = relatedAppointments.some((item) => Boolean(item.attendanceDispute))
  const appointmentIds = relatedAppointments.map((item) => item.id)

  if (existingIndex >= 0) {
    const current = entries[existingIndex]
    const updated = {
      ...current,
      appointmentIds: Array.from(new Set([...current.appointmentIds, ...appointmentIds])),
      servicesAmount,
      totalAmount: PLATFORM_FEE_BRL,
      attendanceDispute: hasDispute,
      status:
        hasDispute && current.status !== FEE_LEDGER_STATUS.PAGA
          ? FEE_LEDGER_STATUS.EM_ANALISE
          : current.status,
      updatedAt: new Date().toISOString(),
    }
    entries[existingIndex] = updated
    saveFeeLedger(entries)
    return updated
  }

  // Novo lançamento
  const newEntry = {
    id: createId('FL'),
    orderId,
    clinicId,
    appointmentIds,
    weekKey: getIsoWeekKey(new Date()),
    feeAmount: PLATFORM_FEE_BRL,
    servicesAmount,
    totalAmount: PLATFORM_FEE_BRL,
    settlementMode: SETTLEMENT_MODE.FEE_ONLY,
    status: hasDispute ? FEE_LEDGER_STATUS.EM_ANALISE : FEE_LEDGER_STATUS.DEVIDA,
    triggerStatus: appointment.status,
    weeklyBillId: null,
    attendanceDispute: hasDispute,
    createdAt: new Date().toISOString(),
  }

  entries.push(newEntry)
  saveFeeLedger(entries)
  return newEntry
}

