import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faGamepad } from '@fortawesome/free-solid-svg-icons'

const cores = {
  Roblox: 'from-red-500/40 to-orange-500/40',
  Fortnite: 'from-violet-500/40 to-blue-500/40',
  'GTA 6': 'from-pink-500/40 to-rose-500/40',
  'Cities Skylines 2': 'from-cyan-500/40 to-teal-500/40',
}

function logo(jogo) {
  const grad = cores[jogo.nome] || 'from-slate-600/40 to-slate-700/40'
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-lg font-extrabold text-white/90 shadow-inner`}
    >
      {jogo.nome.charAt(0)}
    </span>
  )
}

export default function GamesStep({ jogos, selecionados, onToggle }) {
  if (!jogos || jogos.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Carregando lista de jogos... Verifique a conexao com o servidor.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Quais jogos voce costuma jogar?</h3>
        <p className="mt-1 text-sm text-slate-400">
          O coracao da logica: selecione os titulos para priorizar os componentes certos.
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
              {logo(jogo)}
              <span className="flex-1">
                <span className="block font-medium text-white">{jogo.nome}</span>
                <span className="block text-xs text-slate-400">
                  CPU {jogo.pesoCpu}/4 &middot; GPU {jogo.pesoGpu}/4 &middot; RAM{' '}
                  {jogo.pesoRam}/4
                </span>
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                  ativo
                    ? 'border-brand-500 bg-brand-600 text-white'
                    : 'border-slate-700 text-slate-700'
                }`}
              >
                {ativo ? (
                  <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                ) : (
                  <FontAwesomeIcon icon={faGamepad} className="h-3.5 w-3.5" />
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
