import { useState } from 'react'
import { AlertTriangle, CheckCircle2, KeyRound } from 'lucide-react'
import FormField from '../common/FormField'
import { inputClassName } from '../../utils/formUtils'
import { useCheckInByToken } from '../../hooks/useAppointments'
import { getTokenCheckInAttemptState } from '../../services/appointmentService'

export default function TokenCheckInForm({ onSuccessToast, onErrorToast }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [attemptState, setAttemptState] = useState(() => getTokenCheckInAttemptState())
  const checkInMutation = useCheckInByToken()

  const handleChange = (event) => {
    const cleaned = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6)
    setToken(cleaned)
    if (error) setError('')
    if (feedback) setFeedback('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setFeedback('')

    if (token.trim().length !== 6) {
      setError('Digite o código completo de 6 caracteres informado pelo paciente.')
      return
    }

    try {
      const result = await checkInMutation.mutateAsync(token)
      setAttemptState(getTokenCheckInAttemptState())
      setToken('')

      const count = result.updatedItems?.length || 0
      const message =
        result.reversedCount > 0
          ? `Token ${result.token} validado: ${result.reversedCount} atendimento(s) revertido(s) de ausência para realizado.`
          : `Check-in registrado pelo token ${result.token} para ${count} item(ns). Agora você pode clicar em "Marcar realizado".`

      setFeedback(message)
      onSuccessToast?.(message)
    } catch (err) {
      setAttemptState(getTokenCheckInAttemptState())
      const msg = err?.message || 'Não foi possível validar o token.'
      setError(msg)
      onErrorToast?.(msg)
    }
  }

  return (
    <section
      aria-labelledby="checkin-token-title"
      className="rounded-xl border border-emerald-200 bg-white p-5 shadow-xs"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 id="checkin-token-title" className="text-base font-bold text-slate-900">
              Check-in presencial por token
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Solicite o código de 6 caracteres ao paciente na recepção para liberar o botão &ldquo;Marcar realizado&rdquo; ou reverter uma falta registrada.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row sm:items-start md:w-auto">
          <div className="w-full sm:w-52">
            <FormField
              label="Código do pedido"
              htmlFor="reception-checkin-token"
              error={error}
            >
              <input
                id="reception-checkin-token"
                name="reception-checkin-token"
                type="text"
                value={token}
                onChange={handleChange}
                maxLength={6}
                placeholder="Ex.: GM8K4P"
                disabled={attemptState.locked || checkInMutation.isPending}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'reception-checkin-token-error' : undefined}
                className={`${inputClassName(Boolean(error))} font-mono uppercase tracking-widest`}
              />
            </FormField>
          </div>
          <button
            type="submit"
            disabled={attemptState.locked || checkInMutation.isPending}
            className="sm:mt-6 shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {checkInMutation.isPending ? 'Validando…' : 'Validar token'}
          </button>
        </form>
      </div>

      {attemptState.locked && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            Validação por token bloqueada após 5 tentativas inválidas. Utilize o botão &ldquo;Registrar Chegada (Manual)&rdquo; no cartão do agendamento abaixo para desbloquear.
          </span>
        </div>
      )}

      {feedback && (
        <div
          role="status"
          className="mt-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-900"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{feedback}</span>
        </div>
      )}
    </section>
  )
}
