import { useEffect } from 'react'
import { IconCheckCircle, IconClose } from './Icons'

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  const styles =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : 'border-red-200 bg-red-50 text-red-900'

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-[100] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${styles}`}
    >
      {type === 'success' ? (
        <IconCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
      ) : null}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded p-1 opacity-70 hover:opacity-100"
        aria-label="Fechar notificação"
      >
        <IconClose className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Toast
