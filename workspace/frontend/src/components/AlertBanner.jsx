import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { formatBRL } from '../format'

export default function AlertBanner({ total, orcamento }) {
  const diff = Number(total) - Number(orcamento)
  if (diff <= 0) return null

  const pct = Number(orcamento) > 0 ? diff / Number(orcamento) : 0
  const severo = pct > 0.1

  return (
    <div
      className={`sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 text-sm font-medium ${
        severo
          ? 'border-red-500/40 bg-red-950/90 text-red-200'
          : 'border-amber-500/40 bg-amber-950/90 text-amber-200'
      }`}
      role="alert"
    >
      <FontAwesomeIcon icon={faTriangleExclamation} className="h-5 w-5 shrink-0" />
      <div className="flex-1">
        {severo ? (
          <>
            Orcamento estourado! A montagem esta{' '}
            <strong>{formatBRL(diff)} acima</strong> do teto ({formatBRL(total)} de{' '}
            {formatBRL(orcamento)}).
          </>
        ) : (
          <>
            A montagem ultrapassou o orcamento em <strong>{formatBRL(diff)}</strong>. Fique de
            olho no total.
          </>
        )}
      </div>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
          severo ? 'bg-red-500/20 text-red-200' : 'bg-amber-500/20 text-amber-200'
        }`}
      >
        {severo ? 'ALERTA' : 'AVISO'}
      </span>
    </div>
  )
}
