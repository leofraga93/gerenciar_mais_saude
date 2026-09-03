import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faTriangleExclamation,
  faArrowUpRightFromSquare,
  faShieldHalved,
  faGaugeHigh,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons'
import CategoriaIcon from './CategoriaIcon'
import { formatBRL } from '../format'

export default function Resultado({ recomendacao, onReiniciar }) {
  if (!recomendacao) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <FontAwesomeIcon icon={faCircleCheck} className="h-6 w-6" />
        </span>
        <div>
          <h3 className="text-xl font-bold text-white">Sua montagem esta pronta!</h3>
          <p className="mt-1 text-sm text-slate-400">
            Plataforma <span className="text-slate-200">{recomendacao.plataforma}</span>
            {recomendacao.receitaNome && (
              <>
                {' '}
                &middot; baseada na receita{' '}
                <span className="text-slate-200">{recomendacao.receitaNome}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-4 text-center">
          <span className="block text-xs text-slate-400">Total estimado</span>
          <span className="mt-1 block text-lg font-bold text-white">
            {formatBRL(recomendacao.total)}
          </span>
        </div>
        <div className="card p-4 text-center">
          <span className="flex items-center justify-center gap-1 text-xs text-slate-400">
            <FontAwesomeIcon icon={faGaugeHigh} className="h-3.5 w-3.5" /> Indice de desempenho
          </span>
          <span className="mt-1 block text-lg font-bold text-brand-300">
            {recomendacao.pesoGeralCalculado}
          </span>
        </div>
        <div className="card p-4 text-center">
          <span className="block text-xs text-slate-400">Componentes</span>
          <span className="mt-1 block text-lg font-bold text-white">
            {recomendacao.itens.length}
          </span>
        </div>
        <div className="card p-4 text-center">
          <span className="flex items-center justify-center gap-1 text-xs text-slate-400">
            <FontAwesomeIcon icon={faShieldHalved} className="h-3.5 w-3.5" /> Compatibilidade
          </span>
          <span className="mt-1 block text-lg font-bold text-emerald-400">Garantida</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Componente</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Compatibilidade</th>
              <th className="px-4 py-3 text-right font-medium">Preco</th>
              <th className="px-4 py-3 text-right font-medium">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 bg-slate-900/40">
            {recomendacao.itens.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-brand-300">
                      <CategoriaIcon categoria={item.categoria} className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <span className="block font-medium text-white">{item.nome}</span>
                      <span className="block text-xs text-slate-500">{item.destaque}</span>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="text-xs text-slate-400">
                    {[item.plataforma, item.tipoMemoria].filter(Boolean).join(' \u00B7 ') ||
                      '\u2014'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-white">
                  {formatBRL(item.preco)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <a
                    href={item.linkAfiliado}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-600/15 px-3 py-1.5 text-xs font-medium text-brand-300 transition hover:bg-brand-600/30"
                  >
                    Ver produto
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-900/80">
            <tr>
              <td className="px-4 py-3 font-semibold text-white">Total estimado</td>
              <td className="hidden px-4 py-3 sm:table-cell" />
              <td className="px-4 py-3 text-right text-lg font-bold text-brand-300">
                {formatBRL(recomendacao.total)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {recomendacao.observacoes?.length > 0 && (
        <ul className="space-y-2">
          {recomendacao.observacoes.map((obs, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200"
            >
              <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4 shrink-0" />
              {obs}
            </li>
          ))}
        </ul>
      )}

      <div className="text-center">
        <button onClick={onReiniciar} className="btn-ghost">
          <FontAwesomeIcon icon={faRotateLeft} className="h-4 w-4" />
          Montar outra configuracao
        </button>
      </div>
    </div>
  )
}
