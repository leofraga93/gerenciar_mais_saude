/**
 * Constantes de Cobrança e Faturamento da Plataforma (SPEC-09)
 */

export const PLATFORM_FEE_BRL = 5.0

export const TIMEZONE_BAHIA = 'America/Bahia'

export const FEE_LEDGER_STATUS = Object.freeze({
  EM_ANALISE: 'EM_ANALISE',
  DEVIDA: 'DEVIDA',
  COBRANCA_GERADA: 'COBRANCA_GERADA',
  PAGA: 'PAGA',
  EM_ATRASO: 'EM_ATRASO',
  ISENTA: 'ISENTA',
})

export const SETTLEMENT_MODE = Object.freeze({
  FEE_ONLY: 'FEE_ONLY',
  FULL_AMOUNT: 'FULL_AMOUNT',
})

export const BILLING_GROUPING = Object.freeze({
  INDIVIDUAL: 'INDIVIDUAL',
  ACCUMULATED: 'ACCUMULATED',
})

export const WEEKLY_BILL_STATUS = Object.freeze({
  EMITIDO: 'EMITIDO',
  LIQUIDADO: 'LIQUIDADO',
  ESTORNADO: 'ESTORNADO',
})

/**
 * Calcula a chave da semana ISO (YYYY-Www) no fuso America/Bahia.
 * Exemplo: '2026-W34'
 *
 * @param {Date | string} [date]
 * @returns {string}
 */
export function getIsoWeekKey(date = new Date()) {
  const target = new Date(date)
  if (Number.isNaN(target.getTime())) {
    return '2026-W01'
  }

  // Fuso America/Bahia (UTC-3)
  const d = new Date(Date.UTC(target.getFullYear(), target.getMonth(), target.getDate()))
  // Dia da semana ISO (segunda = 1 ... domingo = 7)
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)

  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

