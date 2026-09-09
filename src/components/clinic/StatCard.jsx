/**
 * Card de métrica numérica reutilizável.
 * Usado no Dashboard (§4.1) e no Financeiro (§4.5).
 *
 * @param {{
 *   label: string,
 *   value: string | number,
 *   sub?: string,
 *   icon: React.FC<{ className?: string }>,
 *   color?: 'emerald' | 'blue' | 'amber' | 'violet' | 'slate'
 * }} props
 */
export function StatCard({ label, value, sub, icon: Icon, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      icon: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: 'text-blue-500',
      border: 'border-blue-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: 'text-amber-500',
      border: 'border-amber-100',
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      icon: 'text-violet-500',
      border: 'border-violet-100',
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      icon: 'text-slate-500',
      border: 'border-slate-200',
    },
  }

  const c = colorMap[color] ?? colorMap.emerald

  return (
    <div className={`flex items-start gap-4 rounded-xl border ${c.border} bg-white p-5 shadow-sm`}>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
        {Icon && <Icon className={`h-5 w-5 ${c.icon}`} />}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className={`mt-0.5 text-2xl font-bold leading-none ${c.text}`}>{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}
