import { Link } from 'react-router-dom'
import {
  IconCamera,
  IconCheck,
  IconMapPin,
  IconPlus,
  IconUpload,
} from '../common/Icons'

/**
 * Componente padrão de Banner de Ação Recomendada / Alerta da Clínica.
 * Utilizado nas páginas de Serviços, Perfil e Dashboard para manter consistência visual.
 */
export default function ClinicActionBanner({
  type = 'warning', // 'warning' | 'success' | 'info'
  badge = 'Ação recomendada',
  badgeDetail = '',
  title = '',
  description = '',
  icon: CustomIcon,
  actionLabel = '',
  actionTo = '',
  onAction = null,
  actionIcon: CustomActionIcon,
}) {
  const isSuccess = type === 'success'

  const IconComponent = CustomIcon || (isSuccess ? IconCheck : IconCamera)
  const ActionIconComponent = CustomActionIcon || (isSuccess ? IconCamera : IconUpload)

  const borderClass = isSuccess ? 'border-emerald-200' : 'border-amber-200'
  const bgClass = isSuccess
    ? 'bg-gradient-to-r from-emerald-50 via-white to-slate-50'
    : 'bg-gradient-to-r from-amber-50 via-white to-amber-50/70'
  const iconBoxClass = isSuccess
    ? 'bg-emerald-600 text-white shadow-xs'
    : 'bg-amber-500 text-white shadow-xs'
  const badgeClass = isSuccess
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-amber-100 text-amber-800'
  const badgeDetailClass = isSuccess ? 'text-emerald-900' : 'text-amber-900'

  const buttonClass = isSuccess
    ? 'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer'
    : 'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition cursor-pointer'

  return (
    <section
      aria-label={title || badge}
      className={`rounded-2xl border ${borderClass} ${bgClass} p-5 shadow-xs transition`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBoxClass}`}
          >
            <IconComponent className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
              >
                {badge}
              </span>
              {badgeDetail ? (
                <span className={`text-xs font-semibold ${badgeDetailClass}`}>
                  {badgeDetail}
                </span>
              ) : null}
            </div>
            {title ? (
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
            ) : null}
            {description ? (
              <p className="max-w-2xl text-xs text-slate-600 leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actionLabel && (
          <div>
            {actionTo ? (
              <Link to={actionTo} className={buttonClass}>
                {ActionIconComponent && <ActionIconComponent className="h-4 w-4" />}
                {actionLabel}
              </Link>
            ) : onAction ? (
              <button type="button" onClick={onAction} className={buttonClass}>
                {ActionIconComponent && <ActionIconComponent className="h-4 w-4" />}
                {actionLabel}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
