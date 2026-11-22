import { APPOINTMENT_STATUS_CONFIG } from '../../data/appointments'
import { ORDER_FEE_STATUS_CONFIG } from '../../constants/billingConstants'

/**
 * Badge colorido compartilhado das Máquinas de Estado:
 * - type="appointment" (padrão): SOLICITADO, CONFIRMADO_CLINICA, REALIZADO, NAO_COMPARECEU, CANCELADO
 * - type="orderFee": AGUARDANDO_CONFIRMACAO, PENDENTE_PAGAMENTO, PAGA, ISENTA
 */
export function StatusBadge({ status, size = 'md', type = 'appointment' }) {
  const config =
    type === 'orderFee'
      ? ORDER_FEE_STATUS_CONFIG[status]
      : APPOINTMENT_STATUS_CONFIG[status]

  if (!config) return null

  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs'
  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold ${textSize} ${config.badgeClass}`}
    >
      <span className={`shrink-0 rounded-full ${dotSize} ${config.dotClass}`} aria-hidden="true" />
      {config.label}
    </span>
  )
}
