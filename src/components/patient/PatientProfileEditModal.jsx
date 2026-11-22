import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import FormField from '../common/FormField'
import { inputClassName } from '../../utils/formUtils'
import { INSURANCES } from '../../data/insurances'
import {
  formatPhone,
  maskCpf,
  validatePatientSignupField,
} from '../../utils/patientSignupValidation'

export default function PatientProfileEditModal({
  isOpen,
  patient,
  isSaving = false,
  onClose,
  onSave,
}) {
  const formRef = useRef(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [insuranceIds, setInsuranceIds] = useState(['ins-particular'])
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!isOpen || !patient) return
    setEmail(patient.email || '')
    setPhone(patient.phone || '')
    setInsuranceIds(
      Array.isArray(patient.insuranceIds) && patient.insuranceIds.length > 0
        ? patient.insuranceIds
        : ['ins-particular'],
    )
    setErrors({})
    setSubmitError('')
  }, [isOpen, patient])

  useEffect(() => {
    if (!isOpen) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape' && !isSaving) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, isSaving, onClose])

  if (!isOpen || !patient) return null

  const toggleInsurance = (id) => {
    setInsuranceIds((current) => {
      const exists = current.includes(id)
      const next = exists ? current.filter((item) => item !== id) : [...current, id]
      return next.length > 0 ? next : ['ins-particular']
    })
  }

  const handleBlur = (field, value) => {
    const message = validatePatientSignupField(field, value)
    setErrors((prev) => {
      const next = { ...prev }
      if (message) next[field] = message
      else delete next[field]
      return next
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    const emailError = validatePatientSignupField('email', email)
    const phoneError = validatePatientSignupField('phone', phone)
    const nextErrors = {}
    if (emailError) nextErrors.email = emailError
    if (phoneError) nextErrors.phone = phoneError

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstField = Object.keys(nextErrors)[0]
      formRef.current?.querySelector(`[name="${firstField}"]`)?.focus()
      return
    }

    try {
      await onSave({
        email: email.trim(),
        phone: phone.trim(),
        insuranceIds,
      })
    } catch (err) {
      setSubmitError(err?.message || 'Não foi possível salvar as alterações.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-edit-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 id="patient-edit-title" className="text-xl font-bold text-slate-900">
              Alterar cadastro
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Atualize seu e-mail, telefone e convênios. Por segurança, nome e CPF permanecem fixos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Fechar edição de cadastro"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:grid-cols-2">
            <div>
              <span className="text-slate-500">Nome completo (fixo)</span>
              <p className="mt-0.5 font-semibold text-slate-800">{patient.fullName || '—'}</p>
            </div>
            <div>
              <span className="text-slate-500">CPF (fixo)</span>
              <p className="mt-0.5 font-mono font-semibold text-slate-800">
                {patient.cpf ? maskCpf(patient.cpf) : '—'}
              </p>
            </div>
          </div>

          <FormField label="E-mail de acesso" htmlFor="edit-patient-email" required error={errors.email}>
            <input
              id="edit-patient-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
              onBlur={() => handleBlur('email', email)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'edit-patient-email-error' : undefined}
              className={inputClassName(Boolean(errors.email))}
            />
          </FormField>

          <FormField
            label="Telefone / WhatsApp"
            htmlFor="edit-patient-phone"
            required
            error={errors.phone}
          >
            <input
              id="edit-patient-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => {
                setPhone(formatPhone(e.target.value))
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }))
              }}
              onBlur={() => handleBlur('phone', phone)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'edit-patient-phone-error' : undefined}
              className={inputClassName(Boolean(errors.phone))}
              placeholder="(71) 98888-7777"
            />
          </FormField>

          <div>
            <p className="block text-sm font-medium text-slate-700">Convênios vinculados</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Selecione um ou mais planos aceitos por você.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {INSURANCES.map((ins) => {
                const selected = insuranceIds.includes(ins.id)
                return (
                  <button
                    key={ins.id}
                    type="button"
                    onClick={() => toggleInsurance(ins.id)}
                    aria-pressed={selected}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      selected
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {selected && <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />}
                    {ins.name}
                  </button>
                )
              })}
            </div>
          </div>

          {submitError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {submitError}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
