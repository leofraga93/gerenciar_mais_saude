import { getRegisteredClinic } from '../../services/clinicService'

function getInitials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return 'CL'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function ClinicTopBar({ clinicName, onMenuOpen, onLogout }) {
  const clinic = getRegisteredClinic()
  const displayName = clinicName || clinic?.tradeName || 'Sua clínica'
  const initials = getInitials(displayName)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
          aria-label="Abrir menu de navegação"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden
          >
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800"
          title="Logo da clínica (placeholder)"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{displayName}</p>
          <p className="hidden text-xs text-slate-500 sm:block">Portal da clínica</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
      >
        Sair
      </button>
    </header>
  )
}

export default ClinicTopBar
