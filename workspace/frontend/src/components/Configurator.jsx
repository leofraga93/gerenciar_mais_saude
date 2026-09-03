import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightFromSquare,
  faRotateLeft,
  faArrowLeft,
  faGaugeHigh,
  faMicrochip,
  faMemory,
} from '@fortawesome/free-solid-svg-icons'
import CategoriaIcon from './CategoriaIcon'
import AlertBanner from './AlertBanner'
import SubstitutionModal from './SubstitutionModal'
import { formatBRL } from '../format'
import { CATEGORIA_LABEL, isMonitor } from '../labels'
import { substitutos } from '../api'

export default function Configurator({ build, orcamento, onSubstituir, onVoltar, onReiniciar }) {
  const [modal, setModal] = useState(null)

  const abrirSubstituicao = async (item) => {
    setModal({ item, alternativas: [], carregando: true, erro: '' })
    try {
      const ids = build.itens.map((i) => i.id)
      const res = await substitutos(item.id, ids)
      setModal((prev) => ({
        ...prev,
        alternativas: res.substitutos || [],
        carregando: false,
      }))
    } catch (e) {
      setModal((prev) => ({ ...prev, carregando: false, erro: e.message }))
    }
  }

  const escolherAlternativa = (alt) => {
    const novoItem = {
      id: alt.id,
      nome: alt.nome,
      categoria: alt.categoria,
      preco: alt.preco,
      linkAfiliado: alt.linkAfiliado,
      plataforma: alt.plataforma,
      tipoMemoria: alt.tipoMemoria,
      destaque: CATEGORIA_LABEL[alt.categoria] || 'Periferico',
    }
    onSubstituir(modal.item.id, novoItem)
    setModal(null)
  }

  const resumo = build.itens.reduce(
    (acc, i) => ({
      cpu: acc.cpu || (i.categoria === 'CPU' ? i.nome : null),
      gpu: acc.gpu || (i.categoria === 'GPU' ? i.nome : null),
      ram: acc.ram || (i.categoria === 'RAM' ? i.nome : null),
    }),
    {}
  )

  return (
    <div>
      <AlertBanner total={build.total} orcamento={orcamento} />

      <div className="space-y-6 pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Configurador</h3>
            <p className="mt-1 text-sm text-slate-400">
              Plataforma <span className="text-slate-200">{build.plataforma}</span> &middot;{' '}
              {build.itens.length} pecas &middot; Clique em &quot;Substituir por mais barata&quot;
              para trocar qualquer peca.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={onVoltar} className="btn-ghost">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
              Voltar as opcoes
            </button>
            <button onClick={onReiniciar} className="btn-ghost">
              <FontAwesomeIcon icon={faRotateLeft} className="h-4 w-4" />
              Nova busca
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="card flex items-center gap-3 p-3">
            <FontAwesomeIcon icon={faMicrochip} className="h-5 w-5 shrink-0 text-brand-300" />
            <div className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wide text-slate-500">CPU</span>
              <span className="block truncate text-xs font-medium text-slate-200">
                {resumo.cpu}
              </span>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-3">
            <span className="text-brand-300">
              <CategoriaIcon categoria="GPU" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wide text-slate-500">GPU</span>
              <span className="block truncate text-xs font-medium text-slate-200">
                {resumo.gpu}
              </span>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-3">
            <FontAwesomeIcon icon={faMemory} className="h-5 w-5 shrink-0 text-brand-300" />
            <div className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wide text-slate-500">RAM</span>
              <span className="block truncate text-xs font-medium text-slate-200">
                {resumo.ram}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Peca</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Compatibilidade</th>
                <th className="px-4 py-3 text-right font-medium">Preco</th>
                <th className="px-4 py-3 text-right font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 bg-slate-900/40">
              {build.itens.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-brand-300">
                        <CategoriaIcon categoria={item.categoria} className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="block font-medium text-white">{item.nome}</span>
                        <span className="block text-xs text-slate-500">
                          {item.destaque}
                          {isMonitor(item) ? ' (Monitor)' : ''}
                        </span>
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
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={item.linkAfiliado}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                        title="Link de afiliado"
                      >
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3 w-3" />
                        Comprar
                      </a>
                      <button
                        onClick={() => abrirSubstituicao(item)}
                        className="rounded-lg bg-brand-600/15 px-3 py-1.5 text-xs font-medium text-brand-300 transition hover:bg-brand-600/30"
                        title="Substituir por uma peca mais barata"
                      >
                        Substituir por mais barata
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900/80">
              <tr>
                <td className="px-4 py-3 font-semibold text-white">Total</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <FontAwesomeIcon icon={faGaugeHigh} className="h-3.5 w-3.5" /> Indice de
                    desempenho: {build.pesoGeralCalculado}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-lg font-bold text-brand-300">
                  {formatBRL(build.total)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {build.observacoes?.length > 0 && (
          <ul className="space-y-2">
            {build.observacoes.map((obs, i) => (
              <li
                key={i}
                className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200"
              >
                {obs}
              </li>
            ))}
          </ul>
        )}
      </div>

      {modal && (
        <SubstitutionModal
          item={modal.item}
          alternativas={modal.alternativas}
          carregando={modal.carregando}
          erro={modal.erro}
          onSelecionar={escolherAlternativa}
          onFechar={() => setModal(null)}
        />
      )}
    </div>
  )
}
