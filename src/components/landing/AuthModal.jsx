import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import FormField from '../common/FormField'
import PasswordInput from '../common/PasswordInput'
import { inputClassName } from '../../utils/formUtils'

function AuthModal({ audience, onClose, onSubmit, onSuccess, onGoToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const isPatient = audience === 'patient'
  const title = isPatient ? 'Acesso do paciente' : 'Acesso da clínica'

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const validateEmail = (value) => {
    const normalized = value.trim()
    if (!normalized) return 'Informe seu e-mail.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return 'Informe um e-mail válido.'
    return ''
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {
      email: validateEmail(email),
      password: password ? '' : 'Informe sua senha.',
    }
    setErrors(nextErrors)

    if (nextErrors.email) {
      emailRef.current?.focus()
      return
    }
    if (nextErrors.password) {
      passwordRef.current?.querySelector('input')?.focus()
      return
    }

    const handleSuccess = onSuccess || onSubmit
    handleSuccess({ email: email.trim(), password })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        aria-labelledby="auth-modal-title"
        aria-modal="true"
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Gerenciar Mais Saúde</p>
            <h2 id="auth-modal-title" className="mt-1 text-2xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">Acesse sua área para continuar.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600" aria-label="Fechar modal">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit}>
          <FormField label="E-mail" htmlFor="auth-email" required error={errors.email}>
            <input
              ref={emailRef}
              id="auth-email"
              name="email"
              type="email"
              autoFocus
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setErrors((current) => ({ ...current, email: validateEmail(email) }))}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'auth-email-error' : undefined}
              className={inputClassName(Boolean(errors.email))}
              placeholder="seuemail@exemplo.com"
            />
          </FormField>

          <FormField label="Senha" htmlFor="auth-password" required error={errors.password}>
            <div ref={passwordRef}>
              <PasswordInput
                id="auth-password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => setErrors((current) => ({ ...current, password: password ? '' : 'Informe sua senha.' }))}
                hasError={Boolean(errors.password)}
                required
              />
            </div>
          </FormField>

          <button type="submit" className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
            Entrar
          </button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
          <p className="text-sm text-slate-600">{isPatient ? 'Ainda não tem cadastro?' : 'Sua clínica ainda não está na rede?'}</p>
          <button type="button" onClick={onGoToSignup} className="mt-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:underline">
            {isPatient ? 'Cadastre-se' : 'Credenciar minha clínica'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default AuthModal
