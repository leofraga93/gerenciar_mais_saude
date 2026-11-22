/** Constantes de cobrança da plataforma e período de teste de clínicas (SPEC-05 & SPEC-09). */
export const PLATFORM_FEE_BRL = 5
export const TRIAL_DURATION_DAYS = 90
export const CLINIC_MONTHLY_PLAN_BRL = 99

export const CLINIC_SUBSCRIPTION_STATUS = Object.freeze({
  TRIAL: 'TRIAL',
  ACTIVE_SUBSCRIPTION: 'ACTIVE_SUBSCRIPTION',
  TRIAL_EXPIRED: 'TRIAL_EXPIRED',
})

export const ORDER_FEE_STATUS = Object.freeze({
  AGUARDANDO_CONFIRMACAO: 'AGUARDANDO_CONFIRMACAO',
  PENDENTE_PAGAMENTO: 'PENDENTE_PAGAMENTO',
  PAGA: 'PAGA',
  ISENTA: 'ISENTA',
})

export const ORDER_FEE_STATUS_CONFIG = Object.freeze({
  [ORDER_FEE_STATUS.AGUARDANDO_CONFIRMACAO]: {
    id: ORDER_FEE_STATUS.AGUARDANDO_CONFIRMACAO,
    label: 'Taxa aguardando confirmação',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-500',
    description: 'A taxa única de R$ 5,00 será liberada após a primeira clínica confirmar o pedido.',
  },
  [ORDER_FEE_STATUS.PENDENTE_PAGAMENTO]: {
    id: ORDER_FEE_STATUS.PENDENTE_PAGAMENTO,
    label: 'Taxa de R$ 5,00 pendente',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
    description: 'Quitável via PIX no portal ou antes de concluir um novo pedido.',
  },
  [ORDER_FEE_STATUS.PAGA]: {
    id: ORDER_FEE_STATUS.PAGA,
    label: 'Taxa de R$ 5,00 paga',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-600',
    description: 'Taxa única da plataforma quitada via PIX.',
  },
  [ORDER_FEE_STATUS.ISENTA]: {
    id: ORDER_FEE_STATUS.ISENTA,
    label: 'Taxa isenta',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    dotClass: 'bg-slate-400',
    description: 'Pedido cancelado antes da confirmação ou isentado pela administração.',
  },
})

export const CHECK_IN_METHOD = Object.freeze({
  TOKEN: 'TOKEN',
  MANUAL: 'MANUAL',
  MANUAL_REVERSAL: 'MANUAL_REVERSAL',
})

export const PATIENT_ATTENDANCE = Object.freeze({
  ATTENDED: 'ATTENDED',
  NOT_ATTENDED: 'NOT_ATTENDED',
})

/** Alfabeto sem caracteres ambíguos (sem 0/O/1/I) para token de 6 caracteres. */
export const TOKEN_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

export function generateCheckInToken(existingTokens = []) {
  const used = new Set(
    (Array.isArray(existingTokens) ? existingTokens : [])
      .filter(Boolean)
      .map((token) => String(token).trim().toUpperCase()),
  )

  for (let attempt = 0; attempt < 25; attempt += 1) {
    let token = ''
    for (let i = 0; i < 6; i += 1) {
      const index = Math.floor(Math.random() * TOKEN_ALPHABET.length)
      token += TOKEN_ALPHABET[index]
    }
    if (!used.has(token)) return token
  }

  return `${Date.now().toString(36).toUpperCase()}GM9K`.slice(0, 6)
}
