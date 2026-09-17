import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import brandLogo from '../assets/logo-500-sem-fundo.png'
import FormField from '../components/common/FormField'
import PasswordInput from '../components/common/PasswordInput'
import Toast from '../components/common/Toast'
import PatientSignupStepper from '../components/patient/PatientSignupStepper'
import { INSURANCES } from '../data/insurances'
import { useRegisterPatient } from '../hooks/usePatientProfile'
import { inputClassName } from '../utils/formUtils'
import {
  formatCpf,
  formatPhone,
  PATIENT_SIGNUP_STEP_FIELDS,
  validatePatientSignup,
  validatePatientSignupField,
} from '../utils/patientSignupValidation'

const INITIAL_FORM = {
  fullName: '',
  cpf: '',
  birthDate: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  insuranceIds: ['ins-particular'],
  acceptTerms: false,
}

function PatientSignupPage() {
  const navigate = useNavigate()
  const registerMutation = useRegisterPatient()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type })
  }

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }

  // Atualiza campo genérico
  const handleChange = (field, value) => {
    let formattedValue = value

    if (field === 'cpf') {
      formattedValue = formatCpf(value)
    } else if (field === 'phone') {
      formattedValue = formatPhone(value)
    }

    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }))

    // Se já foi tocado, limpa ou atualiza erro
    if (touched[field]) {
      const fieldError = validatePatientSignupField(field, formattedValue, {
        ...formData,
        [field]: formattedValue,
      })
      setErrors((prev) => ({
        ...prev,
        [field]: fieldError,
      }))
    }
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const fieldError = validatePatientSignupField(field, formData[field], formData)
    setErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }))
  }

  // Toggle de convênios na Etapa 3
  const handleToggleInsurance = (insuranceId) => {
    setFormData((prev) => {
      let updated

      if (insuranceId === 'ins-particular') {
        // Se clicar em Particular, desmarca os outros ou alterna
        updated = ['ins-particular']
      } else {
        const withoutParticular = prev.insuranceIds.filter((id) => id !== 'ins-particular')
        if (withoutParticular.includes(insuranceId)) {
          updated = withoutParticular.filter((id) => id !== insuranceId)
          if (updated.length === 0) {
            updated = ['ins-particular']
          }
        } else {
          updated = [...withoutParticular, insuranceId]
        }
      }

      return {
        ...prev,
        insuranceIds: updated,
      }
    })
  }

  // Valida uma etapa específica
  const validateStep = (stepNumber) => {
    const stepErrors = validatePatientSignup(formData, stepNumber)
    const fields = PATIENT_SIGNUP_STEP_FIELDS[stepNumber] || []
    
    // Marca campos da etapa como tocados
    setTouched((prev) => {
      const nextTouched = { ...prev }
      fields.forEach((f) => {
        nextTouched[f] = true
      })
      return nextTouched
    })

    setErrors((prev) => ({
      ...prev,
      ...stepErrors,
    }))

    return Object.keys(stepErrors).length === 0
  }

  // Avançar para próxima etapa
  const handleNextStep = () => {
    const isValid = validateStep(step)
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 3))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Foca no primeiro campo com erro
      const fields = PATIENT_SIGNUP_STEP_FIELDS[step] || []
      const firstInvalidField = fields.find((f) => errors[f] || validatePatientSignupField(f, formData[f], formData))
      if (firstInvalidField) {
        document.getElementById(firstInvalidField)?.focus()
      }
    }
  }

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Navegação direta pelo Stepper
  const handleSelectStep = (targetStep) => {
    if (targetStep < step) {
      // Pode voltar livremente
      setStep(targetStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (targetStep > step) {
      // Valida etapa atual antes de avançar livremente
      const isValid = validateStep(step)
      if (isValid) {
        setStep(targetStep)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        showToast('Preencha os campos obrigatórios antes de avançar.', 'error')
      }
    }
  }

  // Envio final
  const handleSubmit = async (event) => {
    event.preventDefault()

    // 1. Valida etapas anteriores para garantir que nada foi ignorado
    for (let s = 1; s <= 3; s += 1) {
      const stepErrors = validatePatientSignup(formData, s)
      if (Object.keys(stepErrors).length > 0) {
        setTouched((prev) => {
          const nextTouched = { ...prev }
          PATIENT_SIGNUP_STEP_FIELDS[s].forEach((f) => {
            nextTouched[f] = true
          })
          return nextTouched
        })
        setErrors((prev) => ({ ...prev, ...stepErrors }))

        // Fallback automático para a primeira etapa com pendência
        setStep(s)
        showToast(`Por favor, corrija as pendências na Etapa ${s}.`, 'error')
        setTimeout(() => {
          const firstErr = PATIENT_SIGNUP_STEP_FIELDS[s].find((f) => stepErrors[f])
          if (firstErr) {
            document.getElementById(firstErr)?.focus()
          }
        }, 100)
        return
      }
    }

    try {
      await registerMutation.mutateAsync({
        fullName: formData.fullName,
        cpf: formData.cpf,
        birthDate: formData.birthDate,
        email: formData.email,
        phone: formData.phone,
        insuranceIds:
          formData.insuranceIds && formData.insuranceIds.length > 0
            ? formData.insuranceIds
            : ['ins-particular'],
        termsAccepted: formData.acceptTerms,
      })

      showToast('Cadastro realizado com sucesso!', 'success')

      setTimeout(() => {
        navigate('/paciente/inicio', {
          state: {
            email: formData.email,
            name: formData.fullName,
            welcomeMessage: 'Cadastro realizado com sucesso!',
          },
        })
      }, 700)
    } catch {
      showToast('Não foi possível concluir seu cadastro. Tente novamente.', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header simplificado e seguro */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={brandLogo} alt="Gerenciar Mais Saúde" className="h-10 w-10 object-contain" />
            <div>
              <p className="font-semibold text-slate-900">Gerenciar Mais Saúde</p>
              <p className="text-xs text-slate-500">Credenciamento de Paciente</p>
            </div>
          </Link>

          <Link
            to="/"
            className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
          >
            Voltar ao início
          </Link>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Acesso do Paciente
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Crie sua conta de paciente
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Cadastre-se para consultar agendamentos, acompanhar preparos de exames e usufruir de
            nossa rede credenciada no app.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <PatientSignupStepper currentStep={step} onSelectStep={handleSelectStep} />
        </div>

        {/* Card do Formulário */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} noValidate>
            {/* ETAPA 1: DADOS PESSOAIS */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">1. Dados Pessoais</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Preencha suas informações para identificação segura na plataforma.
                  </p>
                </div>

                <FormField
                  label="Nome Completo"
                  htmlFor="fullName"
                  required
                  error={touched.fullName ? errors.fullName : undefined}
                  hint="Nome e sobrenome, sem abreviações."
                >
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Ex.: Maria Silva Santos"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    className={inputClassName(Boolean(touched.fullName && errors.fullName))}
                  />
                </FormField>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    label="CPF"
                    htmlFor="cpf"
                    required
                    error={touched.cpf ? errors.cpf : undefined}
                    hint="Digite apenas números ou com pontuação."
                  >
                    <input
                      id="cpf"
                      name="cpf"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      required
                      placeholder="000.000.000-00"
                      maxLength={14}
                      value={formData.cpf}
                      onChange={(e) => handleChange('cpf', e.target.value)}
                      onBlur={() => handleBlur('cpf')}
                      className={inputClassName(Boolean(touched.cpf && errors.cpf))}
                    />
                  </FormField>

                  <FormField
                    label="Data de Nascimento"
                    htmlFor="birthDate"
                    required
                    error={touched.birthDate ? errors.birthDate : undefined}
                    hint="Você deve ter pelo menos 18 anos."
                  >
                    <input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      autoComplete="bday"
                      required
                      value={formData.birthDate}
                      onChange={(e) => handleChange('birthDate', e.target.value)}
                      onBlur={() => handleBlur('birthDate')}
                      className={inputClassName(Boolean(touched.birthDate && errors.birthDate))}
                    />
                  </FormField>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2: ACESSO E CONTATO */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">2. Acesso e Contato</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Defina suas credenciais para entrar no sistema e receber atualizações.
                  </p>
                </div>

                <FormField
                  label="E-mail"
                  htmlFor="email"
                  required
                  error={touched.email ? errors.email : undefined}
                  hint="Será utilizado para acessar o portal e o aplicativo."
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={inputClassName(Boolean(touched.email && errors.email))}
                  />
                </FormField>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    label="Senha de Acesso"
                    htmlFor="password"
                    required
                    error={touched.password ? errors.password : undefined}
                    hint="Mínimo 8 caracteres com letras e números."
                  >
                    <PasswordInput
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      required
                      placeholder="Crie sua senha"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      hasError={Boolean(touched.password && errors.password)}
                    />
                  </FormField>

                  <FormField
                    label="Confirmação de Senha"
                    htmlFor="confirmPassword"
                    required
                    error={touched.confirmPassword ? errors.confirmPassword : undefined}
                    hint="Repita exatamente a mesma senha."
                  >
                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      autoComplete="new-password"
                      required
                      placeholder="Repita sua senha"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      hasError={Boolean(touched.confirmPassword && errors.confirmPassword)}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Telefone / Celular (com WhatsApp)"
                  htmlFor="phone"
                  required
                  error={touched.phone ? errors.phone : undefined}
                  hint="DDD + número do celular para confirmação de agendamento."
                >
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    placeholder="(71) 98888-7777"
                    maxLength={15}
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    className={inputClassName(Boolean(touched.phone && errors.phone))}
                  />
                </FormField>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Voltar
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: SAÚDE E TERMOS */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">3. Saúde e Termos</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Indique os convênios que você utiliza (opcional) e revise os termos de privacidade.
                  </p>
                </div>

                {/* Seleção de Convênios em Pills */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Planos de Saúde e Convênios (Opcional)
                  </label>
                  <p className="mt-1 text-xs text-slate-500">
                    Selecione um ou mais convênios para filtrarmos serviços cobertos pelo seu plano.
                    Caso não tenha plano ou prefira pagamento direto, mantenha selecionado Particular.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {INSURANCES.map((insurance) => {
                      const isSelected = formData.insuranceIds.includes(insurance.id)

                      return (
                        <button
                          key={insurance.id}
                          type="button"
                          onClick={() => handleToggleInsurance(insurance.id)}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-600'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected && <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />}
                          <span>{insurance.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Aceite de Termos e LGPD */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      required
                      checked={formData.acceptTerms}
                      onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                      onBlur={() => handleBlur('acceptTerms')}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-slate-700">
                      Declaro que li e concordo com os{' '}
                      <span className="font-semibold text-emerald-800 underline">
                        Termos de Uso
                      </span>{' '}
                      e a{' '}
                      <span className="font-semibold text-emerald-800 underline">
                        Política de Privacidade (LGPD)
                      </span>{' '}
                      do Gerenciar Mais Saúde para fins de atendimento médico e gestão de saúde.
                    </label>
                  </div>
                  {touched.acceptTerms && errors.acceptTerms && (
                    <p className="mt-2 text-sm text-red-600" role="alert" id="acceptTerms-error">
                      {errors.acceptTerms}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Voltar
                  </button>

                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {registerMutation.isPending ? 'Salvando...' : 'Concluir Cadastro'}
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Rodapé informativo */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>
            Já possui cadastro?{' '}
            <Link to="/" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Acesse sua conta na página inicial
            </Link>
          </p>
        </div>
      </main>

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
  )
}

export default PatientSignupPage
