import { ORDER_FEE_STATUS, PLATFORM_FEE_BRL } from '../constants/billingConstants'
import { APPOINTMENT_STATUS } from './appointmentStateMachine'

const ORDER_FEES_STORAGE_KEY = 'gerenciar_saude_order_fees_v1'
const MOCK_DELAY_MS = 180

export const DEFAULT_ORDER_FEES = [
  {
    orderId: 'ORD-2026-000101',
    patientId: 'pat-default',
    amount: PLATFORM_FEE_BRL,
    status: ORDER_FEE_STATUS.AGUARDANDO_CONFIRMACAO,
    paymentMethod: null,
    pixTxId: null,
    createdAt: '2026-11-16T14:30:00.000Z',
    paidAt: null,
    updatedAt: '2026-11-16T14:30:00.000Z',
  },
  {
    orderId: 'ORD-2026-000102',
    patientId: 'pat-default',
    amount: PLATFORM_FEE_BRL,
    status: ORDER_FEE_STATUS.PENDENTE_PAGAMENTO,
    paymentMethod: null,
    pixTxId: null,
    createdAt: '2026-11-17T11:00:00.000Z',
    paidAt: null,
    updatedAt: '2026-11-17T11:30:00.000Z',
  },
  {
    orderId: 'ORD-2026-000103',
    patientId: 'pat-default',
    amount: PLATFORM_FEE_BRL,
    status: ORDER_FEE_STATUS.PAGA,
    paymentMethod: 'PIX',
    pixTxId: 'PIX-GMS-20261110-00103',
    createdAt: '2026-11-08T09:15:00.000Z',
    paidAt: '2026-11-08T10:02:00.000Z',
    updatedAt: '2026-11-08T10:02:00.000Z',
  },
  {
    orderId: 'ORD-2026-000104',
    patientId: 'pat-default',
    amount: PLATFORM_FEE_BRL,
    status: ORDER_FEE_STATUS.PAGA,
    paymentMethod: 'PIX',
    pixTxId: 'PIX-GMS-20261014-00104',
    createdAt: '2026-10-12T16:45:00.000Z',
    paidAt: '2026-10-12T17:10:00.000Z',
    updatedAt: '2026-10-12T17:10:00.000Z',
  },
  {
    orderId: 'ORD-2026-000105',
    patientId: 'pat-default',
    amount: PLATFORM_FEE_BRL,
    status: ORDER_FEE_STATUS.ISENTA,
    paymentMethod: null,
    pixTxId: null,
    createdAt: '2026-09-18T08:00:00.000Z',
    paidAt: null,
    updatedAt: '2026-09-18T09:00:00.000Z',
  },
]

function readOrderFees() {
  try {
    const raw = localStorage.getItem(ORDER_FEES_STORAGE_KEY)
    if (raw === null) {
      localStorage.setItem(ORDER_FEES_STORAGE_KEY, JSON.stringify(DEFAULT_ORDER_FEES))
      return [...DEFAULT_ORDER_FEES]
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [...DEFAULT_ORDER_FEES]
  } catch {
    return [...DEFAULT_ORDER_FEES]
  }
}

function writeOrderFees(list) {
  try {
    localStorage.setItem(ORDER_FEES_STORAGE_KEY, JSON.stringify(list))
  } catch (error) {
    console.error('Erro ao salvar taxas no localStorage:', error)
  }
}

export function getOrderFeesSync() {
  return readOrderFees()
}

export function getOrderFeesForPatientSync(patientId) {
  if (!patientId) return []
  return readOrderFees().filter((fee) => fee.patientId === patientId)
}

export function getPendingOrderFeesSync(patientId) {
  if (!patientId) return []
  return readOrderFees().filter(
    (fee) => fee.patientId === patientId && fee.status === ORDER_FEE_STATUS.PENDENTE_PAGAMENTO,
  )
}

export function getOrderFeeByOrderIdSync(orderId) {
  if (!orderId) return null
  return readOrderFees().find((fee) => fee.orderId === orderId) || null
}

export function ensureOrderFeeCreated(orderId, patientId) {
  const list = readOrderFees()
  const existing = list.find((fee) => fee.orderId === orderId)
  if (existing) return existing

  const now = new Date().toISOString()
  const newFee = {
    orderId,
    patientId,
    amount: PLATFORM_FEE_BRL,
    status: ORDER_FEE_STATUS.AGUARDANDO_CONFIRMACAO,
    paymentMethod: null,
    pixTxId: null,
    createdAt: now,
    paidAt: null,
    updatedAt: now,
  }
  writeOrderFees([newFee, ...list])
  return newFee
}

export function activateOrderFeeOnConfirm(orderId, patientId) {
  if (!orderId) return null
  const list = readOrderFees()
  const now = new Date().toISOString()
  const existing = list.find((fee) => fee.orderId === orderId)

  if (!existing) {
    const newFee = {
      orderId,
      patientId: patientId || 'pat-default',
      amount: PLATFORM_FEE_BRL,
      status: ORDER_FEE_STATUS.PENDENTE_PAGAMENTO,
      paymentMethod: null,
      pixTxId: null,
      createdAt: now,
      paidAt: null,
      updatedAt: now,
    }
    writeOrderFees([newFee, ...list])
    return newFee
  }

  if (existing.status !== ORDER_FEE_STATUS.AGUARDANDO_CONFIRMACAO) {
    return existing
  }

  const updated = {
    ...existing,
    status: ORDER_FEE_STATUS.PENDENTE_PAGAMENTO,
    updatedAt: now,
  }
  writeOrderFees(list.map((fee) => (fee.orderId === orderId ? updated : fee)))
  return updated
}

export function exemptOrderFeeIfAllCancelled(orderId, appointmentsInOrder = []) {
  if (!orderId || appointmentsInOrder.length === 0) return null
  const allCancelled = appointmentsInOrder.every(
    (item) => item.status === APPOINTMENT_STATUS.CANCELADO,
  )
  if (!allCancelled) return null

  const list = readOrderFees()
  const existing = list.find((fee) => fee.orderId === orderId)
  if (!existing || existing.status !== ORDER_FEE_STATUS.AGUARDANDO_CONFIRMACAO) {
    return existing || null
  }

  const updated = {
    ...existing,
    status: ORDER_FEE_STATUS.ISENTA,
    updatedAt: new Date().toISOString(),
  }
  writeOrderFees(list.map((fee) => (fee.orderId === orderId ? updated : fee)))
  return updated
}

export function getOrderFeesForPatient(patientId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getOrderFeesForPatientSync(patientId))
    }, MOCK_DELAY_MS)
  })
}

export function payOrderFee(orderId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const list = readOrderFees()
      const existing = list.find((fee) => fee.orderId === orderId)
      if (!existing) {
        reject(new Error('Taxa do pedido não encontrada.'))
        return
      }
      if (existing.status === ORDER_FEE_STATUS.PAGA) {
        resolve(existing)
        return
      }
      if (existing.status !== ORDER_FEE_STATUS.PENDENTE_PAGAMENTO) {
        reject(new Error('Esta taxa não está disponível para pagamento neste momento.'))
        return
      }

      const now = new Date().toISOString()
      const updated = {
        ...existing,
        status: ORDER_FEE_STATUS.PAGA,
        paymentMethod: 'PIX',
        pixTxId: `PIX-GMS-${Date.now().toString(36).toUpperCase()}`,
        paidAt: now,
        updatedAt: now,
      }
      writeOrderFees(list.map((fee) => (fee.orderId === orderId ? updated : fee)))
      resolve(updated)
    }, MOCK_DELAY_MS)
  })
}

export function waiveOrderFee(orderId, reason = 'Isenção administrativa') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const list = readOrderFees()
      const existing = list.find((fee) => fee.orderId === orderId)
      if (!existing) {
        reject(new Error('Taxa do pedido não encontrada.'))
        return
      }
      const now = new Date().toISOString()
      const updated = {
        ...existing,
        status: ORDER_FEE_STATUS.ISENTA,
        waiveReason: reason,
        updatedAt: now,
      }
      writeOrderFees(list.map((fee) => (fee.orderId === orderId ? updated : fee)))
      resolve(updated)
    }, MOCK_DELAY_MS)
  })
}
