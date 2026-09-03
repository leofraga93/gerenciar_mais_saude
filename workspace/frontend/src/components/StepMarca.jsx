import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrochip, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'

const opcoes = [
  { valor: '', rotulo: 'Indiferente', desc: 'Escolho a melhor plataforma', icon: faWandMagicSparkles },
  { valor: 'AMD', rotulo: 'AMD', desc: 'Ryzen AM4 / AM5', icon: faMicrochip },
  { valor: 'INTEL', rotulo: 'Intel', desc: 'Core LGA1700 / LGA1851', icon: faMicrochip },
]

export default function StepMarca({ marca, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Prefere alguma marca?</h3>
        <p className="mt-1 text-sm text-slate-400">
          Opcional. Se nao tiver preferencia, escolhemos a melhor plataforma para o seu orcamento.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {opcoes.map((o) => {
          const ativo = marca === o.valor
          return (
            <button
              key={o.rotulo}
              onClick={() => onChange(o.valor)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-5 text-center transition ${
                ativo
                  ? 'border-brand-500 bg-brand-600/15 ring-1 ring-brand-500'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-600'
              }`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  ativo ? 'bg-brand-600/20 text-brand-300' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <FontAwesomeIcon icon={o.icon} className="h-6 w-6" />
              </span>
              <span className="font-semibold text-white">{o.rotulo}</span>
              <span className="text-xs text-slate-400">{o.desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
