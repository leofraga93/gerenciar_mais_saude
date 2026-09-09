import { APPOINTMENT_STATUS_CONFIG } from '../../data/appointments'

/**
 * Badge colorido da Máquina de Estados de Agendamento.
 * Exibe ponto colorido + label. Reutilizável na Agenda, Dashboard e Financeiro.
 *
 * @param {{ status: string, size?: 'sm' | 'md' }} props
 */
export function StatusBadge({ status, size = 'md' }) {
  const config = APPOINTMENT_STATUS_CONFIG[status]
  if (!config) return null

  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs'
  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold ${textSize} ${config.badgeClass}`}
    >
      <span className={`shrink-0 rounded-full ${dotSize} ${config.dotClass}`} />
      {config.label}
    </span>
  )
}
