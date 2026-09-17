import { Building2, Check, Lock, ShieldCheck, UserCheck } from 'lucide-react'

const CLINIC_STEPS = [
  {
    id: 1,
    title: 'Dados da empresa',
    icon: Building2,
  },
  {
    id: 2,
    title: 'Acesso ao portal',
    icon: Lock,
  },
  {
    id: 3,
    title: 'Responsável e contato',
    icon: UserCheck,
  },
  {
    id: 4,
    title: 'Termos e confirmação',
    icon: ShieldCheck,
  },
]

function ClinicSignupStepper({ currentStep, onSelectStep }) {
  return (
    <nav aria-label="Progresso do credenciamento da clínica" className="w-full">
      <ol className="grid grid-cols-2 gap-2 sm:gap-2.5 sm:grid-cols-4">
        {CLINIC_STEPS.map((step) => {
          const isCurrent = step.id === currentStep
          const isCompleted = step.id < currentStep
          const IconComponent = step.icon

          let badgeStyle = 'border-slate-300 bg-white text-slate-500'
          let containerStyle = 'border-slate-200 bg-white text-slate-600'

          if (isCurrent) {
            badgeStyle = 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
            containerStyle = 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
          } else if (isCompleted) {
            badgeStyle = 'border-emerald-600 bg-emerald-100 text-emerald-700'
            containerStyle = 'border-emerald-200 bg-white hover:border-emerald-300'
          }

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onSelectStep(step.id)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex w-full items-center gap-2 rounded-xl border p-2 text-left transition-all sm:gap-2.5 sm:p-2.5 ${containerStyle}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-colors ${badgeStyle}`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <IconComponent className="h-4 w-4" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Etapa {step.id}
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-medium text-emerald-800">
                        Atual
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] font-semibold leading-tight sm:text-xs ${
                      isCurrent ? 'text-emerald-950 font-bold' : 'text-slate-800'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default ClinicSignupStepper
