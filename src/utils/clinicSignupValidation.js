const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const NAME_PATTERN = /^[\p{L}\s'.-]+$/u
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

/** DDDs válidos no Brasil (ANATEL). */
const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
])

export const SIGNUP_STEP_FIELDS = {
  1: ['tradeName', 'cnpj'],
  2: ['email', 'password', 'confirmPassword'],
  3: ['managerName', 'phone', 'referralCode'],
  4: ['acceptTerms'],
}

export function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function formatCnpj(value) {
  const d = digitsOnly(value).slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

export function formatPhone(value) {
  const d = digitsOnly(value).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function calcCnpjCheckDigit(base, weights) {
  const sum = weights.reduce((acc, weight, index) => acc + Number(base[index]) * weight, 0)
  const rest = sum % 11
  return rest < 2 ? 0 : 11 - rest
}

export function isValidCnpj(value) {
  const cnpj = digitsOnly(value)
  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const firstDigit = calcCnpjCheckDigit(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  if (firstDigit !== Number(cnpj[12])) return false

  const secondDigit = calcCnpjCheckDigit(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return secondDigit === Number(cnpj[13])
}

function isValidBrazilianPhone(value) {
  const phone = digitsOnly(value)
  if (phone.length !== 10 && phone.length !== 11) return false

  const ddd = Number(phone.slice(0, 2))
  if (!VALID_DDDS.has(ddd)) return false

  if (phone.length === 11 && phone[2] !== '9') {
    return false
  }

  if (phone.length === 10 && !['2', '3', '4', '5'].includes(phone[2])) {
    return false
  }

  return true
}

function validateTradeName(value) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return 'Informe a razão social ou o nome fantasia.'
  if (trimmed.length < 3) return 'O nome deve ter pelo menos 3 caracteres.'
  if (trimmed.length > 200) return 'O nome deve ter no máximo 200 caracteres.'
  if (!/[A-Za-zÀ-ÿ]/.test(trimmed)) return 'O nome deve conter letras.'
  return null
}

function validateCnpj(value) {
  const cnpj = digitsOnly(value)
  if (!cnpj) return 'Informe o CNPJ.'
  if (cnpj.length !== 14) return 'CNPJ deve ter 14 dígitos.'
  if (!isValidCnpj(cnpj)) return 'CNPJ inválido. Verifique os números informados.'
  return null
}

function validateEmail(value) {
  const email = value?.trim() ?? ''
  if (!email) return 'Informe o e-mail administrativo.'
  if (email.length > 254) return 'E-mail muito longo.'
  if (!EMAIL_PATTERN.test(email)) return 'E-mail inválido.'
  return null
}

function validatePassword(value) {
  if (!value) return 'Defina uma senha.'
  if (!PASSWORD_PATTERN.test(value)) {
    return 'Use pelo menos 8 caracteres, com letras e números.'
  }
  return null
}

function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Confirme a senha.'
  if (password !== confirmPassword) return 'As senhas não coincidem.'
  return null
}

function validateManagerName(value) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return 'Informe o nome do responsável.'
  if (trimmed.length < 3) return 'O nome deve ter pelo menos 3 caracteres.'
  if (!NAME_PATTERN.test(trimmed)) return 'Use apenas letras no nome.'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length < 2) return 'Informe o nome completo (nome e sobrenome).'
  if (parts.some((part) => part.length < 2)) {
    return 'Cada parte do nome deve ter pelo menos 2 letras.'
  }
  return null
}

function validatePhone(value) {
  const phone = digitsOnly(value)
  if (!phone) return 'Informe o telefone ou WhatsApp comercial.'
  if (!isValidBrazilianPhone(phone)) {
    return 'Telefone inválido. Use DDD + número (fixo ou celular com 9 dígitos).'
  }
  return null
}

function validateReferralCode(value) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return null
  if (trimmed.length < 4) return 'Código deve ter pelo menos 4 caracteres.'
  if (trimmed.length > 30) return 'Código deve ter no máximo 30 caracteres.'
  if (!/^[A-Za-z0-9-]+$/.test(trimmed)) {
    return 'Use apenas letras, números e hífen no código.'
  }
  return null
}

function validateAcceptTerms(value) {
  if (!value) return 'É necessário aceitar os termos para continuar.'
  return null
}

const FIELD_VALIDATORS = {
  tradeName: (form) => validateTradeName(form.tradeName),
  cnpj: (form) => validateCnpj(form.cnpj),
  email: (form) => validateEmail(form.email),
  password: (form) => validatePassword(form.password),
  confirmPassword: (form) => validateConfirmPassword(form.password, form.confirmPassword),
  managerName: (form) => validateManagerName(form.managerName),
  phone: (form) => validatePhone(form.phone),
  referralCode: (form) => validateReferralCode(form.referralCode),
  acceptTerms: (form) => validateAcceptTerms(form.acceptTerms),
}

/** Valida um único campo; retorna mensagem de erro ou null. */
export function validateClinicSignupField(fieldName, form) {
  const validator = FIELD_VALIDATORS[fieldName]
  return validator ? validator(form) : null
}

/**
 * Valida um passo do wizard ou o formulário inteiro (step = null).
 * Retorna objeto { fieldName: 'mensagem' } vazio quando válido.
 */
export function validateClinicSignup(form, step = null) {
  const errors = {}
  const fieldsToCheck =
    step === null
      ? Object.keys(FIELD_VALIDATORS)
      : SIGNUP_STEP_FIELDS[step] ?? []

  for (const fieldName of fieldsToCheck) {
    const message = validateClinicSignupField(fieldName, form)
    if (message) errors[fieldName] = message
  }

  return errors
}
