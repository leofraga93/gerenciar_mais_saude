import { SERVICE_CATEGORIES } from '../constants/catalogConstants'

const VALID_CATEGORY_IDS = new Set(SERVICE_CATEGORIES.map((c) => c.id))

export const EMPTY_SERVICE_FORM = {
  id: null,
  name: '',
  category: '',
  tussCode: '',
  privatePrice: '',
  descriptionPrep: '',
  durationMinutes: '',
  active: true,
  imageUrl: '',
  insuranceIds: [],
  insurancePricingNotes: '',
  commercialNotes: '',
}

export function formatCurrencyBRL(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return '—'
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function validateServiceField(fieldName, form) {
  const errors = validateServiceForm(form)
  return errors[fieldName] ?? null
}

export function validateServiceForm(form) {
  const errors = {}

  const name = form.name?.trim() ?? ''
  if (!name) {
    errors.name = 'Informe o nome do procedimento.'
  } else if (name.length < 3) {
    errors.name = 'O nome deve ter pelo menos 3 caracteres.'
  }

  if (!form.category || !VALID_CATEGORY_IDS.has(form.category)) {
    errors.category = 'Selecione uma categoria.'
  }

  const price = parseFloat(String(form.privatePrice).replace(',', '.'))
  if (form.privatePrice === '' || form.privatePrice === null || Number.isNaN(price)) {
    errors.privatePrice = 'Informe o valor particular.'
  } else if (price <= 0) {
    errors.privatePrice = 'O valor deve ser maior que zero.'
  }

  const description = form.descriptionPrep?.trim() ?? ''
  if (!description) {
    errors.descriptionPrep = 'Informe a descrição ou preparo para o paciente.'
  } else if (description.length < 10) {
    errors.descriptionPrep = 'Descreva com pelo menos 10 caracteres.'
  }

  if (form.durationMinutes !== '' && form.durationMinutes !== null) {
    const duration = parseInt(String(form.durationMinutes), 10)
    if (Number.isNaN(duration) || duration < 5) {
      errors.durationMinutes = 'Duração mínima de 5 minutos.'
    }
  }

  if (!Array.isArray(form.insuranceIds) || form.insuranceIds.length === 0) {
    errors.insuranceIds = 'Selecione pelo menos um convênio aceito para este serviço.'
  }

  const tuss = form.tussCode?.trim() ?? ''
  if (tuss && !/^\d{6,8}$/.test(tuss)) {
    errors.tussCode = 'Código TUSS deve conter 6 a 8 dígitos.'
  }

  return errors
}

export function serviceFormToPayload(form) {
  return {
    id: form.id || undefined,
    name: form.name.trim(),
    category: form.category,
    tussCode: form.tussCode?.trim() ?? '',
    privatePrice: parseFloat(String(form.privatePrice).replace(',', '.')),
    descriptionPrep: form.descriptionPrep.trim(),
    durationMinutes: form.durationMinutes
      ? parseInt(String(form.durationMinutes), 10)
      : 30,
    active: Boolean(form.active),
    imageUrl: form.imageUrl?.trim() ?? '',
    insuranceIds: form.insuranceIds,
    insurancePricingNotes: form.insurancePricingNotes?.trim() ?? '',
    commercialNotes: form.commercialNotes?.trim() ?? '',
  }
}

export function serviceToForm(service) {
  if (!service) return { ...EMPTY_SERVICE_FORM }
  return {
    id: service.id,
    name: service.name ?? '',
    category: service.category ?? '',
    tussCode: service.tussCode ?? '',
    privatePrice: String(service.privatePrice ?? ''),
    descriptionPrep: service.descriptionPrep ?? '',
    durationMinutes: service.durationMinutes ? String(service.durationMinutes) : '',
    active: service.active !== false,
    imageUrl: service.imageUrl ?? '',
    insuranceIds: service.insuranceIds ?? [],
    insurancePricingNotes: service.insurancePricingNotes ?? '',
    commercialNotes: service.commercialNotes ?? '',
  }
}
