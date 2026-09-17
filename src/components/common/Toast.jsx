import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

function Toast({ isVisible = true, message, type = 'success', onClose }) {
  useEffect(() => {
    if (!isVisible || !message) return
    const timer = setTimeout(() => {
      if (onClose) onClose()
    }, 4000)
    return () => clearTimeout(timer)
  }, [isVisible, message, onClose])

  if (!isVisible || !message) return null

  const isSuccess = type === 'success'

  const styles = isSuccess
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : 'border-red-200 bg-red-50 text-red-900'

  return (
    <aside
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[100] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${styles}`}
    >
      {isSuccess ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
      )}
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Fechar notificação"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </aside>
  )
}

export default Toast
