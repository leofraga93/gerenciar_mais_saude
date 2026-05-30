import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import brandLogo from '../assets/logo-500-sem-fundo.png'
import { registerClinic } from '../services/clinicService'
import {
  digitsOnly,
  formatCnpj,
  formatPhone,
  validateClinicSignup,
} from '../utils/clinicSignupValidation'

const STEPS = [
  {
    id: 1,
    title: 'Dados da empresa',
    description: 'Identificação jurídica da clínica na plataforma.',
  },
  {
    id: 2,
    title: 'Acesso ao portal',
    description: 'E-mail e senha que serão usados no login administrativo.',
  },
  {
    id: 3,
    title: 'Responsável e contato',
    description: 'Quem a plataforma contata sobre credenciamento e operação.',
  },
  {
    id: 4,
    title: 'Termos e confirmação',
    description: 'Revise e aceite para concluir o credenciamento.',
  },
]

const INITIAL_FORM = {
  tradeName: '',
  cnpj: '',
  email: '',
  password: '',
  confirmPassword: '',
  managerName: '',
  phone: '',
  referralCode: '',
  acceptTerms: false,
}

function Field({ label, htmlFor, required, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      {error ? <p className="mt-1 text-sm text-red-600" role="alert">{error}</p> : null}
    </div>
  )
}

/**
 * Tela /cadastro-clinica — wizard de credenciamento (checklist §2.1).
 * Cada passo corresponde a um bloco visual; validação é local, sem API.
 */
function ClinicSignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const currentStepMeta = STEPS[step - 1]

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const goNext = () => {
    const stepErrors = validateClinicSignup(form, step)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setStep((s) => Math.min(s + 1, STEPS.length))
  }

  const goBack = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const allErrors = validateClinicSignup(form, null)
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      const firstStepWithError = [1, 2, 3, 4].find((s) =>
        Object.keys(validateClinicSignup(form, s)).length > 0,
      )
      if (firstStepWithError) setStep(firstStepWithError)
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    try {
      const clinic = await registerClinic({
        tradeName: form.tradeName,
        cnpj: digitsOnly(form.cnpj),
        email: form.email,
        password: form.password,
        managerName: form.managerName,
        phone: digitsOnly(form.phone),
        referralCode: form.referralCode,
      })
      navigate('/dashboard', {
        state: {
          showCompleteProfileBanner: true,
          clinicName: clinic.tradeName,
        },
      })
    } catch {
      setSubmitError('Não foi possível concluir o credenciamento. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="Gerenciar Mais Saúde" className="h-12 w-12 object-contain" />
            <div>
              <p className="font-semibold text-slate-900">Credenciamento de clínica</p>
              <p className="text-sm text-slate-500">Etapa {step} de {STEPS.length}</p>
            </div>
          </div>
          <Link to="/" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
            Voltar ao início
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <nav aria-label="Progresso do credenciamento" className="mb-8">
          <ol className="grid gap-2 sm:grid-cols-4">
            {STEPS.map((item) => {
              const isActive = item.id === step
              const isDone = item.id < step
              return (
                <li
                  key={item.id}
                  className={`rounded-lg border px-3 py-2 text-xs sm:text-sm ${
                    isActive
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                      : isDone
                        ? 'border-emerald-200 bg-white text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  <span className="font-semibold">{item.id}. {item.title}</span>
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-slate-900">{currentStepMeta.title}</h1>
          <p className="mt-2 text-slate-600">{currentStepMeta.description}</p>

          <form className="mt-8 space-y-5" onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()}>
            {step === 1 && (
              <>
                <Field
                  label="Razão social ou nome fantasia"
                  htmlFor="tradeName"
                  required
                  error={errors.tradeName}
                >
                  <input
                    id="tradeName"
                    type="text"
                    autoComplete="organization"
                    value={form.tradeName}
                    onChange={(e) => updateField('tradeName', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    placeholder="Ex.: Clínica Vida Plena"
                  />
                </Field>
                <Field label="CNPJ" htmlFor="cnpj" required error={errors.cnpj}>
                  <input
                    id="cnpj"
                    type="text"
                    inputMode="numeric"
                    value={form.cnpj}
                    onChange={(e) => updateField('cnpj', formatCnpj(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    placeholder="00.000.000/0000-00"
                  />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field
                  label="E-mail administrativo (login)"
                  htmlFor="email"
                  required
                  error={errors.email}
                  hint="Será usado para entrar no portal da clínica."
                >
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </Field>
                <Field label="Senha" htmlFor="password" required error={errors.password}>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </Field>
                <Field
                  label="Confirmar senha"
                  htmlFor="confirmPassword"
                  required
                  error={errors.confirmPassword}
                >
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </Field>
              </>
            )}

            {step === 3 && (
              <>
                <Field
                  label="Nome do responsável / gestor"
                  htmlFor="managerName"
                  required
                  error={errors.managerName}
                >
                  <input
                    id="managerName"
                    type="text"
                    autoComplete="name"
                    value={form.managerName}
                    onChange={(e) => updateField('managerName', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </Field>
                <Field
                  label="Telefone / WhatsApp comercial"
                  htmlFor="phone"
                  required
                  error={errors.phone}
                >
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', formatPhone(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    placeholder="(00) 00000-0000"
                  />
                </Field>
                <Field
                  label="Código de indicação / parceiro"
                  htmlFor="referralCode"
                  hint="Opcional."
                >
                  <input
                    id="referralCode"
                    type="text"
                    value={form.referralCode}
                    onChange={(e) => updateField('referralCode', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  />
                </Field>
              </>
            )}

            {step === 4 && (
              <>
                <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <h2 className="font-semibold text-slate-900">Resumo do credenciamento</h2>
                  <dl className="mt-3 space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Empresa</dt>
                      <dd className="font-medium text-right">{form.tradeName || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">CNPJ</dt>
                      <dd className="font-medium text-right">{form.cnpj || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">E-mail</dt>
                      <dd className="font-medium text-right">{form.email || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Responsável</dt>
                      <dd className="font-medium text-right">{form.managerName || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Telefone</dt>
                      <dd className="font-medium text-right">{form.phone || '—'}</dd>
                    </div>
                  </dl>
                </section>

                <div>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.acceptTerms}
                      onChange={(e) => updateField('acceptTerms', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-700">
                      Li e aceito os{' '}
                      <span className="font-medium text-emerald-700">termos de uso</span> e a{' '}
                      <span className="font-medium text-emerald-700">política de privacidade</span>.
                    </span>
                  </label>
                  {errors.acceptTerms ? (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {errors.acceptTerms}
                    </p>
                  ) : null}
                </div>
              </>
            )}

            {submitError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {submitError}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Voltar
                </button>
              ) : (
                <span />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {isSubmitting ? 'Credenciando…' : 'Concluir credenciamento'}
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Já possui conta?{' '}
          <Link to="/" className="font-medium text-emerald-700 hover:text-emerald-800">
            Acesse pelo início
          </Link>
        </p>
      </div>
    </main>
  )
}

export default ClinicSignupPage
