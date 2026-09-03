import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComputer, faBullseye, faGamepad, faWallet } from '@fortawesome/free-solid-svg-icons'

const passos = [
  { n: 1, titulo: 'Tipo de montagem', icon: faComputer },
  { n: 2, titulo: 'Objetivo', icon: faBullseye },
  { n: 3, titulo: 'Jogos', icon: faGamepad },
  { n: 4, titulo: 'Orcamento', icon: faWallet },
]

export default function PassoBar({ atual }) {
  return (
    <ol className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {passos.map((p, i) => {
        const ativo = p.n === atual
        const concluido = p.n < atual
        return (
          <li key={p.n} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  ativo
                    ? 'border-brand-500 bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                    : concluido
                      ? 'border-brand-500 bg-brand-500/20 text-brand-300'
                      : 'border-slate-700 bg-slate-900 text-slate-500'
                }`}
              >
                <FontAwesomeIcon icon={p.icon} className="h-4 w-4" />
              </span>
              <span
                className={`hidden text-sm font-medium sm:block ${
                  ativo ? 'text-white' : concluido ? 'text-brand-300' : 'text-slate-500'
                }`}
              >
                {p.titulo}
              </span>
            </div>
            {i < passos.length - 1 && (
              <span
                className={`h-0.5 w-8 rounded sm:w-12 ${
                  concluido ? 'bg-brand-500' : 'bg-slate-800'
                }`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
