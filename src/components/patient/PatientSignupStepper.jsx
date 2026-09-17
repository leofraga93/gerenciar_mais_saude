import { Check, User, Lock, HeartPulse } from 'lucide-react'

const STEP_DEFINITIONS = [
  {
    id: 1,
    title: 'Dados pessoais',
    icon: User,
  },
  {
    id: 2,
    title: 'Acesso e contato',
    icon: Lock,
  },
  {
    id: 3,
    title: 'Saúde e termos',
    icon: HeartPulse,
  },
]

function PatientSignupStepper({ currentStep, onSelectStep }) {
  return (
    <nav aria-label="Progresso do credenciamento" className="w-full">
      <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {STEP_DEFINITIONS.map((step) => {
          const isCurrent = step.id === currentStep
          const isCompleted = step.id < currentStep
          const IconComponent = step.icon

          let badgeStyle = 'border-slate-300 bg-white text-slate-500'
          let containerStyle = 'border-slate-200 bg-white'

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
                className={`flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all ${containerStyle}`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${badgeStyle}`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <IconComponent className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Etapa {step.id}
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                        Atual
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-xs sm:text-sm font-semibold leading-tight ${
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

export default PatientSignupStepper
