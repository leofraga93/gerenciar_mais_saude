import { formatOperatingHoursString, DEFAULT_OPERATING_DAYS } from '../../data/clinicProfileData'

/**
 * Editor interativo de horário de atendimento por dias da semana e horários.
 * Projetado para caber perfeitamente tanto em coluna única quanto em layouts divididos.
 */
export function ClinicScheduleEditor({
  operatingDays = DEFAULT_OPERATING_DAYS,
  onChange,
}) {
  const currentDays = operatingDays && operatingDays.length > 0 ? operatingDays : DEFAULT_OPERATING_DAYS

  const handleToggleDay = (key) => {
    const updated = currentDays.map((d) =>
      d.key === key ? { ...d, active: !d.active } : d
    )
    const formatted = formatOperatingHoursString(updated)
    onChange(updated, formatted)
  }

  const handleTimeChange = (key, field, value) => {
    const updated = currentDays.map((d) =>
      d.key === key ? { ...d, [field]: value } : d
    )
    const formatted = formatOperatingHoursString(updated)
    onChange(updated, formatted)
  }

  const applyPreset = (type) => {
    let newDays
    if (type === 'standard') {
      newDays = [
        { key: 'seg', label: 'Segunda-feira', shortLabel: 'Seg', active: true, open: '07:00', close: '19:00' },
        { key: 'ter', label: 'Terça-feira', shortLabel: 'Ter', active: true, open: '07:00', close: '19:00' },
        { key: 'qua', label: 'Quarta-feira', shortLabel: 'Qua', active: true, open: '07:00', close: '19:00' },
        { key: 'qui', label: 'Quinta-feira', shortLabel: 'Qui', active: true, open: '07:00', close: '19:00' },
        { key: 'sex', label: 'Sexta-feira', shortLabel: 'Sex', active: true, open: '07:00', close: '19:00' },
        { key: 'sab', label: 'Sábado', shortLabel: 'Sáb', active: true, open: '07:00', close: '13:00' },
        { key: 'dom', label: 'Domingo', shortLabel: 'Dom', active: false, open: '08:00', close: '12:00' },
      ]
    } else if (type === 'weekdays_only') {
      newDays = currentDays.map((d) => {
        if (['seg', 'ter', 'qua', 'qui', 'sex'].includes(d.key)) {
          return { ...d, active: true, open: '08:00', close: '18:00' }
        }
        return { ...d, active: false }
      })
    } else if (type === 'all_week') {
      newDays = currentDays.map((d) => ({
        ...d,
        active: true,
        open: d.key === 'dom' ? '08:00' : '07:00',
        close: d.key === 'dom' ? '14:00' : '19:00',
      }))
    }
    if (newDays) {
      onChange(newDays, formatOperatingHoursString(newDays))
    }
  }

  const summary = formatOperatingHoursString(currentDays)

  return (
    <div className="space-y-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      {/* Cabeçalho do Bloco de Horários */}
      <div className="flex flex-col gap-1 border-b border-slate-200/70 pb-2.5">
        <label className="text-xs font-bold text-slate-800">
          Dias e Horários de Atendimento da Clínica
        </label>
        <p className="text-xs font-medium text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200/60 inline-block">
          Resumo: <span className="font-semibold">{summary}</span>
        </p>
      </div>

      {/* Botões de Predefinições Rápidas */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Predefinições Rápidas:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset('standard')}
            className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition shadow-2xs"
          >
            Seg a Sex (07h-19h) + Sáb (07h-13h)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('weekdays_only')}
            className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition shadow-2xs"
          >
            Seg a Sex (08h às 18h)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('all_week')}
            className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition shadow-2xs"
          >
            Todos os dias
          </button>
        </div>
      </div>

      {/* Lista Limpa e Alinhada dos Dias da Semana */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Programação por Dia:
        </span>
        <div className="divide-y divide-slate-200/80 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {currentDays.map((d) => (
            <div
              key={d.key}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 transition ${
                d.active ? 'bg-white' : 'bg-slate-50/70 opacity-70'
              }`}
            >
              {/* Lado Esquerdo: Checkbox + Nome do Dia */}
              <div className="flex items-center gap-3 min-w-[140px]">
                <input
                  id={`day-${d.key}`}
                  type="checkbox"
                  checked={d.active}
                  onChange={() => handleToggleDay(d.key)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor={`day-${d.key}`}
                  className={`text-xs font-bold cursor-pointer select-none ${
                    d.active ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {d.label}
                </label>
              </div>

              {/* Lado Direito: Status + Inputs de Horário */}
              <div className="flex items-center gap-2 sm:justify-end flex-wrap">
                {d.active ? (
                  <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-medium text-slate-500">De</span>
                    <input
                      type="time"
                      value={d.open}
                      onChange={(e) => handleTimeChange(d.key, 'open', e.target.value)}
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-medium text-slate-500">às</span>
                    <input
                      type="time"
                      value={d.close}
                      onChange={(e) => handleTimeChange(d.key, 'close', e.target.value)}
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ml-1">
                      Aberto
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 italic">Fechado / Sem atendimento</span>
                    <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      Fechado
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
