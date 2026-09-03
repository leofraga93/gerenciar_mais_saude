import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAward, faMicrochip, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { formatBRL } from '../format'
import CategoriaIcon from './CategoriaIcon'

export default function ReceitasSection({ receitas }) {
  if (!receitas || receitas.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300">
          <FontAwesomeIcon icon={faAward} className="h-3.5 w-3.5" />
          Receitas pre-montadas
        </span>
        <h2 className="mt-4 text-2xl font-bold text-white">
          Configuracoes prontas, validadas pelos especialistas
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Combos equilibrados por plataforma. Use como ponto de partida ou crie a sua montagem.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {receitas.map((r) => {
          const total = r.itens.reduce((acc, i) => acc + Number(i.preco), 0)
          return (
            <div key={r.id} className="card flex flex-col p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{r.nome}</h3>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-brand-300">
                    <FontAwesomeIcon icon={faMicrochip} className="h-3 w-3" />
                    {r.arquiteturaMarca}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-slate-400">Total</span>
                  <span className="block text-lg font-bold text-brand-300">
                    {formatBRL(total)}
                  </span>
                </div>
              </div>
              <ul className="mb-4 space-y-2.5">
                {r.itens.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 text-sm">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-brand-300">
                      <CategoriaIcon categoria={item.categoria} className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1 text-slate-300">{item.nome}</span>
                    <span className="text-slate-400">{formatBRL(item.preco)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-500">
                  Indice de desempenho: {r.pesoGeralCalculado}
                </span>
                <a
                  href={r.itens[0]?.linkAfiliado}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-300 hover:text-brand-200"
                >
                  Ver pecas por peca
                  <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
