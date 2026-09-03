import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComputer, faDesktop, faCheck } from '@fortawesome/free-solid-svg-icons'

const opcoes = [
  {
    valor: false,
    titulo: 'Apenas a Torre',
    desc: 'Somente o gabinete e as pecas internas. Voce ja tem monitor e acessorios.',
    icon: faComputer,
  },
  {
    valor: true,
    titulo: 'Kit Completo',
    desc: 'PC + Monitor + Acessorios (teclado e mouse). Tudo para comecar.',
    icon: faDesktop,
  },
]

export default function PeripheralsStep({ valor, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">O que voce precisa montar?</h3>
        <p className="mt-1 text-sm text-slate-400">
          Essa escolha define quais itens entram na montagem.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {opcoes.map((o) => {
          const ativo = valor === o.valor
          return (
            <button
              key={o.titulo}
              onClick={() => onChange(o.valor)}
              className={`relative flex flex-col gap-3 rounded-2xl border p-6 text-left transition ${
                ativo
                  ? 'border-brand-500 bg-brand-600/15 ring-1 ring-brand-500'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-600'
              }`}
            >
              {ativo && (
                <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                  <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                </span>
              )}
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  ativo ? 'bg-brand-600/20 text-brand-300' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <FontAwesomeIcon icon={o.icon} className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-bold text-white">{o.titulo}</span>
                <span className="mt-1 block text-sm text-slate-400">{o.desc}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
