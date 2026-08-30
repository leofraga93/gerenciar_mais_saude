/**
 * Componente reutilizável de grupo de botões / pills de filtro.
 * Segue o padrão de abas/chips em destaque da plataforma.
 */
export function FilterButtonGroup({
  label,
  icon,
  options = [],
  selectedValue,
  onChange,
}) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          {icon && <span className="shrink-0 text-emerald-600">{icon}</span>}
          <span>{label}</span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((opt) => {
          const isSelected = selectedValue === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition border ${
                isSelected
                  ? 'bg-emerald-100/90 text-emerald-900 border-emerald-300 shadow-sm ring-1 ring-emerald-400/30'
                  : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <span>{opt.label}</span>
              {opt.count !== undefined && (
                <span
                  className={`text-[11px] ${
                    isSelected ? 'text-emerald-700 font-medium' : 'text-slate-400'
                  }`}
                >
                  ({opt.count})
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
