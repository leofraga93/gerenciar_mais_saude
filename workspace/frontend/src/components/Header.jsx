import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrochip, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'

export default function Header() {
  return (
    <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/30">
            <FontAwesomeIcon icon={faMicrochip} className="h-5 w-5 text-white" />
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight text-white">
              Assistente de Hardware
            </span>
            <span className="block text-xs text-slate-400">Monte o PC ideal para você</span>
          </span>
        </a>
        <span className="hidden items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300 sm:flex">
          <FontAwesomeIcon icon={faWandMagicSparkles} className="h-3.5 w-3.5" />
          Recomendacoes inteligentes
        </span>
      </div>
    </header>
  )
}
