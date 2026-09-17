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

export const PATIENT_SIGNUP_STEP_FIELDS = {
  1: ['fullName', 'cpf', 'birthDate'],
  2: ['email', 'password', 'confirmPassword', 'phone'],
  3: ['acceptTerms'],
}

export function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '')
}

/**
 * Formata CPF como 000.000.000-00.
 */
export function formatCpf(value) {
  const digits = digitsOnly(value).slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

/**
 * Mascara CPF para exibição segura (ex: ***.456.789-**).
 */
export function maskCpf(value) {
  const digits = digitsOnly(value)
  if (digits.length !== 11) return value || '—'
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`
}

/**
 * Validação oficial de CPF pelos dígitos verificadores.
 */
export function isValidCpf(value) {
  const cpf = digitsOnly(value)
  if (cpf.length !== 11) return false
  // Rejeita sequências com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number(cpf[9])) return false

  sum = 0
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== Number(cpf[10])) return false

  return true
}

/**
 * Formata telefone brasileiro.
 */
export function formatPhone(value) {
  const digits = digitsOnly(value).slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function isValidBrazilianPhone(value) {
  const phone = digitsOnly(value)
  if (phone.length !== 10 && phone.length !== 11) return false

  const ddd = Number(phone.slice(0, 2))
  if (!VALID_DDDS.has(ddd)) return false

  // Celulares no Brasil possuem 11 dígitos e começam com 9 após o DDD
  if (phone.length === 11 && phone[2] !== '9') {
    return false
  }

  return true
}

/**
 * Calcula idade dinamicamente a partir da data de nascimento.
 */
export function calculateAge(birthDateString) {
  if (!birthDateString) return 0
  const birth = new Date(birthDateString)
  if (Number.isNaN(birth.getTime())) return 0

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

export function validatePatientSignupField(field, value, form = {}) {
  const str = String(value ?? '').trim()

  switch (field) {
    case 'fullName': {
      if (!str) return 'Informe seu nome completo.'
      const words = str.split(/\s+/).filter(Boolean)
      if (words.length < 2) {
        return 'Informe seu nome e sobrenome.'
      }
      if (!NAME_PATTERN.test(str)) {
        return 'O nome deve conter apenas letras e espaços.'
      }
      return ''
    }

    case 'cpf': {
      if (!str) return 'Informe seu CPF.'
      const digits = digitsOnly(str)
      if (digits.length !== 11) {
        return 'CPF incompleto. O CPF deve ter 11 dígitos.'
      }
      if (!isValidCpf(str)) {
        return 'CPF inválido. Verifique os números digitados.'
      }
      return ''
    }

    case 'birthDate': {
      if (!str) return 'Informe sua data de nascimento.'
      const date = new Date(str)
      if (Number.isNaN(date.getTime())) {
        return 'Data de nascimento inválida.'
      }
      const age = calculateAge(str)
      if (age < 18) {
        return 'Você deve ter pelo menos 18 anos para se cadastrar.'
      }
      if (age > 120) {
        return 'Data de nascimento inválida.'
      }
      return ''
    }

    case 'email': {
      if (!str) return 'Informe seu e-mail.'
      if (!EMAIL_PATTERN.test(str) || str.length > 254) {
        return 'Informe um e-mail válido (ex.: seuemail@exemplo.com).'
      }
      return ''
    }

    case 'password': {
      if (!str) return 'Crie uma senha de acesso.'
      if (str.length < 8) {
        return 'A senha deve ter no mínimo 8 caracteres.'
      }
      if (!PASSWORD_PATTERN.test(str)) {
        return 'A senha deve conter no mínimo 8 caracteres, com letras e números.'
      }
      return ''
    }

    case 'confirmPassword': {
      if (!str) return 'Confirme sua senha.'
      if (str !== form.password) {
        return 'As senhas não coincidem.'
      }
      return ''
    }

    case 'phone': {
      if (!str) return 'Informe seu telefone ou celular.'
      if (!isValidBrazilianPhone(str)) {
        return 'Informe um telefone válido com DDD (ex.: (71) 98888-7777).'
      }
      return ''
    }

    case 'acceptTerms': {
      if (!value) {
        return 'Você deve aceitar os termos para prosseguir.'
      }
      return ''
    }

    default:
      return ''
  }
}

export function validatePatientSignup(form, step) {
  const errors = {}
  const fields =
    typeof step === 'number'
      ? PATIENT_SIGNUP_STEP_FIELDS[step] ?? []
      : Object.values(PATIENT_SIGNUP_STEP_FIELDS).flat()

  for (const field of fields) {
    const err = validatePatientSignupField(field, form[field], form)
    if (err) {
      errors[field] = err
    }
  }

  return errors
}
