function NicheSegmentedControl({ value, onChange }) {
  return (
    <div
      className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
      role="group"
      aria-label="Escolher experiência"
    >
      <button
        type="button"
        onClick={() => onChange('PATIENT')}
        aria-pressed={value === 'PATIENT'}
        className={`rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 ${
          value === 'PATIENT'
            ? 'bg-emerald-600 text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        Paciente
      </button>
      <button
        type="button"
        onClick={() => onChange('CLINIC')}
        aria-pressed={value === 'CLINIC'}
        className={`rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
          value === 'CLINIC'
            ? 'bg-blue-700 text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        Clínica
      </button>
    </div>
  )
}

export default NicheSegmentedControl
