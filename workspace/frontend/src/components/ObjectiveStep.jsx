import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookOpen,
  faBriefcase,
  faGamepad,
  faTableCellsLarge,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'

const icones = {
  Estudos: faBookOpen,
  Trabalho: faBriefcase,
  Lazer: faGamepad,
  Escritorio: faTableCellsLarge,
}

const dicas = {
  Estudos: 'Pesquisa, Aulas online e pacote office.',
  Trabalho: 'Planilhas, videochamadas e multitarefa.',
  Lazer: 'Filmes, musica e redes sociais.',
  Escritorio: 'Navegador, e-mail e documentos.',
}

export default function ObjectiveStep({ objetivos, selecionados, onToggle }) {
  const lista = objetivos || []
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Qual e o objetivo principal?</h3>
        <p className="mt-1 text-sm text-slate-400">
          Selecione um ou mais. Ajustamos o equilibrio entre processador, video e memoria.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {lista.map((o) => {
          const ativo = selecionados.includes(o.id)
          return (
            <button
              key={o.id}
              onClick={() => onToggle(o.id)}
              title={dicas[o.nome]}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                ativo
                  ? 'border-brand-500 bg-brand-600/15 ring-1 ring-brand-500'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-600'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  ativo ? 'bg-brand-600/20 text-brand-300' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {ativo ? (
                  <FontAwesomeIcon icon={faCheck} className="h-5 w-5" />
                ) : (
                  <FontAwesomeIcon icon={icones[o.nome] || faTableCellsLarge} className="h-5 w-5" />
                )}
              </span>
              <span>
                <span className="block font-medium text-white">{o.nome}</span>
                <span className="block text-xs text-slate-400">{dicas[o.nome]}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
