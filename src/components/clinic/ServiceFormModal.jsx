import { useEffect, useRef, useState } from 'react'
import { SERVICE_CATEGORIES } from '../../constants/catalogConstants'
import { INSURANCES } from '../../data/insurances'
import {
  EMPTY_SERVICE_FORM,
  serviceFormToPayload,
  serviceToForm,
  validateServiceField,
  validateServiceForm,
} from '../../utils/serviceValidation'
import FormField, { inputClassName } from '../common/FormField'
import {
  IconCamera,
  IconClose,
  IconPhoto,
  IconTrash,
  IconUpload,
} from '../common/Icons'

function ServiceFormModal({ isOpen, initialService, onClose, onSave, isSaving }) {
  const formRef = useRef(null)
  const fileInputRef = useRef(null)
  const [form, setForm] = useState(EMPTY_SERVICE_FORM)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setForm(serviceToForm(initialService))
      setErrors({})
      setSubmitError('')
    }
  }, [isOpen, initialService])

  if (!isOpen) return null

  const isEditing = Boolean(form.id)

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setSubmitError('Selecione um arquivo de imagem válido.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      updateField('imageUrl', event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const toggleInsurance = (insuranceId) => {
    setForm((prev) => {
      const ids = prev.insuranceIds.includes(insuranceId)
        ? prev.insuranceIds.filter((id) => id !== insuranceId)
        : [...prev.insuranceIds, insuranceId]
      return { ...prev, insuranceIds: ids }
    })
    setErrors((prev) => {
      if (!prev.insuranceIds) return prev
      const next = { ...prev }
      delete next.insuranceIds
      return next
    })
  }

  const handleBlur = (fieldName) => {
    const message = validateServiceField(fieldName, form)
    setErrors((prev) => {
      const next = { ...prev }
      if (message) next[fieldName] = message
      else delete next[fieldName]
      return next
    })
  }

  const focusFirstError = (formErrors) => {
    const first = Object.keys(formErrors)[0]
    if (!first || !formRef.current) return
    const el = formRef.current.querySelector(`[name="${first}"]`)
    el?.focus()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formErrors = validateServiceForm(form)
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      focusFirstError(formErrors)
      return
    }

    setSubmitError('')
    try {
      await onSave(serviceFormToPayload(form))
      onClose()
    } catch {
      setSubmitError('Não foi possível salvar o serviço. Tente novamente.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Fechar modal"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <h2 id="service-modal-title" className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Editar serviço' : 'Novo serviço'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <IconClose />
          </button>
        </div>

        <form ref={formRef} className="space-y-4 p-6" onSubmit={handleSubmit} noValidate>
          <FormField label="Nome do procedimento" htmlFor="name" required error={errors.name}>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              aria-invalid={Boolean(errors.name)}
              className={inputClassName(Boolean(errors.name))}
              placeholder="Ex.: Ressonância Magnética com Contraste"
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Categoria" htmlFor="category" required error={errors.category}>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                onBlur={() => handleBlur('category')}
                aria-invalid={Boolean(errors.category)}
                className={inputClassName(Boolean(errors.category))}
              >
                <option value="">Selecione…</option>
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Código TUSS"
              htmlFor="tussCode"
              error={errors.tussCode}
              hint="Opcional. 6 a 8 dígitos (ANS)."
            >
              <input
                id="tussCode"
                name="tussCode"
                type="text"
                inputMode="numeric"
                value={form.tussCode}
                onChange={(e) => updateField('tussCode', e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('tussCode')}
                aria-invalid={Boolean(errors.tussCode)}
                className={inputClassName(Boolean(errors.tussCode))}
                placeholder="40304361"
              />
            </FormField>
          </div>

          {/* Anexo de Foto do Procedimento / Equipamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Foto do Procedimento / Equipamento (Opcional)
            </label>
            <p className="mt-0.5 text-xs text-slate-500">
              Ajuda o paciente a visualizar a tecnologia e a sala de atendimento utilizada.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {form.imageUrl ? (
              <div className="relative mt-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src={form.imageUrl}
                  alt="Pré-visualização do procedimento"
                  className="h-36 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => updateField('imageUrl', '')}
                  className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs hover:bg-slate-900"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                  Remover foto
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-emerald-500 hover:bg-emerald-50/40"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 border border-slate-200">
                    <IconCamera className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Anexar imagem do exame ou sala
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Clique para escolher um arquivo do seu computador/celular
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200">
                  <IconUpload className="h-3.5 w-3.5" />
                  Escolher foto
                </span>
              </div>
            )}
          </div>

          <FormField
            label="Descrição / preparo para o paciente"
            htmlFor="descriptionPrep"
            required
            error={errors.descriptionPrep}
            hint="Exibido ao selecionar o serviço — reduz cancelamentos por preparo inadequado."
          >
            <textarea
              id="descriptionPrep"
              name="descriptionPrep"
              rows={3}
              value={form.descriptionPrep}
              onChange={(e) => updateField('descriptionPrep', e.target.value)}
              onBlur={() => handleBlur('descriptionPrep')}
              aria-invalid={Boolean(errors.descriptionPrep)}
              className={inputClassName(Boolean(errors.descriptionPrep))}
              placeholder="Ex.: Jejum de 8 horas. Trazer exames anteriores."
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Valor particular (R$)"
              htmlFor="privatePrice"
              required
              error={errors.privatePrice}
            >
              <input
                id="privatePrice"
                name="privatePrice"
                type="text"
                inputMode="decimal"
                value={form.privatePrice}
                onChange={(e) => updateField('privatePrice', e.target.value)}
                onBlur={() => handleBlur('privatePrice')}
                aria-invalid={Boolean(errors.privatePrice)}
                className={inputClassName(Boolean(errors.privatePrice))}
                placeholder="180.00"
              />
            </FormField>

            <FormField
              label="Duração estimada (minutos)"
              htmlFor="durationMinutes"
              error={errors.durationMinutes}
              hint="Recomendado."
            >
              <input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                min={5}
                value={form.durationMinutes}
                onChange={(e) => updateField('durationMinutes', e.target.value)}
                onBlur={() => handleBlur('durationMinutes')}
                aria-invalid={Boolean(errors.durationMinutes)}
                className={inputClassName(Boolean(errors.durationMinutes))}
                placeholder="30"
              />
            </FormField>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700">
              Convênios aceitos neste serviço <span className="text-red-600">*</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Seleção por procedimento (N:N). O app só exibirá este serviço para pacientes com
              planos selecionados.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {INSURANCES.map((insurance) => (
                <label
                  key={insurance.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    form.insuranceIds.includes(insurance.id)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="insuranceIds"
                    checked={form.insuranceIds.includes(insurance.id)}
                    onChange={() => toggleInsurance(insurance.id)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  {insurance.name}
                </label>
              ))}
            </div>
            {errors.insuranceIds ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.insuranceIds}
              </p>
            ) : null}
          </div>

          <FormField
            label="Regra de valor por convênio"
            htmlFor="insurancePricingNotes"
            hint="Opcional. Ex.: coparticipação, tabela ou sob consulta."
          >
            <textarea
              id="insurancePricingNotes"
              name="insurancePricingNotes"
              rows={2}
              value={form.insurancePricingNotes}
              onChange={(e) => updateField('insurancePricingNotes', e.target.value)}
              className={inputClassName(false)}
            />
          </FormField>

          <FormField label="Observações comerciais" htmlFor="commercialNotes" hint="Opcional.">
            <input
              id="commercialNotes"
              name="commercialNotes"
              type="text"
              value={form.commercialNotes}
              onChange={(e) => updateField('commercialNotes', e.target.value)}
              className={inputClassName(false)}
              placeholder="Promoções, pacotes…"
            />
          </FormField>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => updateField('active', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">Serviço ativo no catálogo</span>
          </label>

          {submitError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSaving ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Cadastrar serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ServiceFormModal
