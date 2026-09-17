import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import brandLogo from '../assets/logo-500-sem-fundo.png'
import ClinicSignupStepper from '../components/clinic/ClinicSignupStepper'
import PasswordInput from '../components/common/PasswordInput'
import { registerClinic } from '../services/clinicService'
import {
  digitsOnly,
  formatCnpj,
  formatPhone,
  validateClinicSignup,
  validateClinicSignupField,
} from '../utils/clinicSignupValidation'

const STEPS = [
  {
    id: 1,
    title: 'Dados da empresa',
    description: 'Identificação jurídica da clínica na plataforma.',
    firstField: 'tradeName',
  },
  {
    id: 2,
    title: 'Acesso ao portal',
    description: 'E-mail e senha que serão usados no login administrativo.',
    firstField: 'email',
  },
  {
    id: 3,
    title: 'Responsável e contato',
    description: 'Quem a plataforma contata sobre credenciamento e operação.',
    firstField: 'managerName',
  },
  {
    id: 4,
    title: 'Termos e confirmação',
    description: 'Revise e aceite para concluir o credenciamento.',
    firstField: 'acceptTerms',
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

function inputClassName(hasError, withToggle = false) {
  const base = `mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2${
    withToggle ? ' pr-10' : ''
  }`
  return hasError
    ? `${base} border-red-400 focus:border-red-500 focus:ring-red-100`
    : `${base} border-slate-300 focus:border-emerald-500 focus:ring-emerald-200`
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
      {error ? (
        <p className="mt-1 text-sm text-red-600" role="alert" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Tela /cadastro-clinica — wizard de credenciamento (checklist §2.1).
 * Cada passo valida todos os campos obrigatórios antes de avançar e
 * gerencia o foco automático no primeiro campo da etapa para navegação rápida via teclado e tabulação.
 */
function ClinicSignupPage() {
  const navigate = useNavigate()
  const formRef = useRef(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [stepError, setStepError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const currentStepMeta = STEPS[step - 1]

  // Foca automaticamente no primeiro campo da etapa quando o step muda ou a página carrega
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!formRef.current) return
      const targetFieldName = currentStepMeta.firstField
      const targetEl =
        formRef.current.querySelector(`[name="${targetFieldName}"]`) ||
        formRef.current.querySelector('input:not([type="hidden"]), select, textarea, button')
      targetEl?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [step, currentStepMeta.firstField])

  const focusFirstInvalidField = (stepErrors) => {
    const firstField = Object.keys(stepErrors)[0]
    if (!firstField || !formRef.current) return
    const input = formRef.current.querySelector(`[name="${firstField}"]`)
    input?.focus()
  }

  const updateField = (name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'acceptTerms') {
        setErrors((current) => {
          const updated = { ...current }
          if (value) {
            delete updated.acceptTerms
          }
          return updated
        })
      } else if (name === 'password' || name === 'confirmPassword') {
        setErrors((current) => {
          const updated = { ...current }
          delete updated[name]
          if (name === 'password' && updated.confirmPassword && next.confirmPassword) {
            const confirmMsg = validateClinicSignupField('confirmPassword', next)
            if (confirmMsg) updated.confirmPassword = confirmMsg
            else delete updated.confirmPassword
          }
          return updated
        })
      } else {
        setErrors((current) => {
          if (!current[name]) return current
          const updated = { ...current }
          delete updated[name]
          return updated
        })
      }
      return next
    })
    setStepError('')
  }

  const handleFieldBlur = (fieldName) => {
    const message = validateClinicSignupField(fieldName, form)
    setErrors((prev) => {
      const next = { ...prev }
      if (message) next[fieldName] = message
      else delete next[fieldName]
      return next
    })
  }

  const goNext = () => {
    const stepErrors = validateClinicSignup(form, step)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      setStepError('Corrija os campos destacados antes de continuar.')
      focusFirstInvalidField(stepErrors)
      return
    }
    setErrors({})
    setStepError('')
    setStep((s) => Math.min(s + 1, STEPS.length))
  }

  const goBack = () => {
    setErrors({})
    setStepError('')
    setStep((s) => Math.max(s - 1, 1))
  }

  const goToStepDirectly = (targetStep) => {
    if (targetStep === step) return
    if (targetStep < step) {
      setErrors({})
      setStepError('')
      setStep(targetStep)
      return
    }
    // Para avançar diretamente, valida o passo atual
    const stepErrors = validateClinicSignup(form, step)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      setStepError('Corrija os campos antes de avançar.')
      focusFirstInvalidField(stepErrors)
      return
    }
    setErrors({})
    setStepError('')
    setStep(targetStep)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const allErrors = validateClinicSignup(form, null)
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors)
      setStepError('Revise os dados informados antes de concluir.')
      const firstStepWithError = [1, 2, 3, 4].find(
        (s) => Object.keys(validateClinicSignup(form, s)).length > 0,
      )
      if (firstStepWithError) setStep(firstStepWithError)
      focusFirstInvalidField(allErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setStepError('')
    try {
      const clinic = await registerClinic({
        tradeName: form.tradeName.trim(),
        cnpj: digitsOnly(form.cnpj),
        email: form.email.trim(),
        password: form.password,
        managerName: form.managerName.trim(),
        phone: digitsOnly(form.phone),
        referralCode: form.referralCode,
      })
      navigate('/dashboard/servicos', {
        state: {
          welcomeFromSignup: true,
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
        <div className="mb-8">
          <ClinicSignupStepper currentStep={step} onSelectStep={goToStepDirectly} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-slate-900">{currentStepMeta.title}</h1>
          <p className="mt-2 text-slate-600">{currentStepMeta.description}</p>

          {stepError ? (
            <p
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {stepError}
            </p>
          ) : null}

          <form
            ref={formRef}
            className="mt-8 space-y-5"
            onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()}
            noValidate
          >
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
                    name="tradeName"
                    type="text"
                    autoComplete="organization"
                    value={form.tradeName}
                    onChange={(e) => updateField('tradeName', e.target.value)}
                    onBlur={() => handleFieldBlur('tradeName')}
                    aria-invalid={Boolean(errors.tradeName)}
                    aria-describedby={errors.tradeName ? 'tradeName-error' : undefined}
                    className={inputClassName(Boolean(errors.tradeName))}
                    placeholder="Ex.: Clínica Vida Plena"
                  />
                </Field>
                <Field label="CNPJ" htmlFor="cnpj" required error={errors.cnpj}>
                  <input
                    id="cnpj"
                    name="cnpj"
                    type="text"
                    inputMode="numeric"
                    value={form.cnpj}
                    onChange={(e) => updateField('cnpj', formatCnpj(e.target.value))}
                    onBlur={() => handleFieldBlur('cnpj')}
                    aria-invalid={Boolean(errors.cnpj)}
                    aria-describedby={errors.cnpj ? 'cnpj-error' : undefined}
                    className={inputClassName(Boolean(errors.cnpj))}
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
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={inputClassName(Boolean(errors.email))}
                  />
                </Field>
                <Field
                  label="Senha"
                  htmlFor="password"
                  required
                  error={errors.password}
                  hint="Mínimo de 8 caracteres, com letras e números."
                >
                  <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    onBlur={() => handleFieldBlur('password')}
                    hasError={Boolean(errors.password)}
                  />
                </Field>
                <Field
                  label="Confirmar senha"
                  htmlFor="confirmPassword"
                  required
                  error={errors.confirmPassword}
                  hint="Segure o ícone de olho para conferir se está igual à senha acima."
                >
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    onBlur={() => handleFieldBlur('confirmPassword')}
                    hasError={Boolean(errors.confirmPassword)}
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
                  hint="Informe nome e sobrenome."
                >
                  <input
                    id="managerName"
                    name="managerName"
                    type="text"
                    autoComplete="name"
                    value={form.managerName}
                    onChange={(e) => updateField('managerName', e.target.value)}
                    onBlur={() => handleFieldBlur('managerName')}
                    aria-invalid={Boolean(errors.managerName)}
                    aria-describedby={errors.managerName ? 'managerName-error' : undefined}
                    className={inputClassName(Boolean(errors.managerName))}
                  />
                </Field>
                <Field
                  label="Telefone / WhatsApp comercial"
                  htmlFor="phone"
                  required
                  error={errors.phone}
                  hint="DDD + número. Celular: 11 dígitos começando com 9 após o DDD."
                >
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', formatPhone(e.target.value))}
                    onBlur={() => handleFieldBlur('phone')}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    className={inputClassName(Boolean(errors.phone))}
                    placeholder="(00) 00000-0000"
                  />
                </Field>
                <Field
                  label="Código de indicação / parceiro"
                  htmlFor="referralCode"
                  error={errors.referralCode}
                  hint="Opcional. Letras, números e hífen (mín. 4 caracteres se preenchido)."
                >
                  <input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    value={form.referralCode}
                    onChange={(e) => updateField('referralCode', e.target.value)}
                    onBlur={() => handleFieldBlur('referralCode')}
                    aria-invalid={Boolean(errors.referralCode)}
                    aria-describedby={errors.referralCode ? 'referralCode-error' : undefined}
                    className={inputClassName(Boolean(errors.referralCode))}
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
                      <dd className="font-medium text-right">{form.tradeName.trim() || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">CNPJ</dt>
                      <dd className="font-medium text-right">{form.cnpj || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">E-mail</dt>
                      <dd className="font-medium text-right">{form.email.trim() || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Responsável</dt>
                      <dd className="font-medium text-right">{form.managerName.trim() || '—'}</dd>
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
                      name="acceptTerms"
                      checked={form.acceptTerms}
                      onChange={(e) => updateField('acceptTerms', e.target.checked)}
                      aria-invalid={Boolean(errors.acceptTerms)}
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
