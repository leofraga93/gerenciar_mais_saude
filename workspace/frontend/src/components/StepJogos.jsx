import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faGamepad,
  faClapperboard,
  faBriefcase,
  faCircleCheck,
  faCircle,
} from '@fortawesome/free-solid-svg-icons'

const fallbackIcon = {
  'Edicao de video': faClapperboard,
  'Trabalho': faBriefcase,
  'Estudos': faBriefcase,
}

function iconFor(nome) {
  const chave = Object.keys(fallbackIcon).find((k) => nome.includes(k))
  return (
    <FontAwesomeIcon
      icon={chave ? fallbackIcon[chave] : faGamepad}
      className="h-5 w-5 text-brand-300"
    />
  )
}

export default function StepJogos({ jogos, selecionados, onToggle }) {
  if (!jogos || jogos.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Carregando opcoes de uso... Se nenhum item aparecer, verifique a conexao com o servidor.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Para que voce vai usar o PC?</h3>
        <p className="mt-1 text-sm text-slate-400">
          Selecione um ou mais. Isso ajuda a priorizar processador, placa de video e memoria.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {jogos.map((jogo) => {
          const ativo = selecionados.includes(jogo.id)
          return (
            <button
              key={jogo.id}
              onClick={() => onToggle(jogo.id)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                ativo
                  ? 'border-brand-500 bg-brand-600/15 ring-1 ring-brand-500'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-600'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  ativo ? 'bg-brand-600/20' : 'bg-slate-800'
                }`}
              >
                {ativo ? (
                  <FontAwesomeIcon icon={faCheck} className="h-5 w-5 text-brand-300" />
                ) : (
                  iconFor(jogo.nome)
                )}
              </span>
              <span className="flex-1">
                <span className="block font-medium text-white">{jogo.nome}</span>
                <span className="block text-xs text-slate-400">
                  CPU {jogo.pesoCpu}/4 &middot; GPU {jogo.pesoGpu}/4 &middot; RAM{' '}
                  {jogo.pesoRam}/4
                </span>
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center ${
                  ativo ? 'text-brand-400' : 'text-slate-700'
                }`}
              >
                <FontAwesomeIcon
                  icon={ativo ? faCircleCheck : faCircle}
                  className="h-6 w-6"
                />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
