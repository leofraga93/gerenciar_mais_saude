const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

/**
 * Valida um passo do wizard ou o formulário inteiro (step = null).
 * Retorna objeto { fieldName: 'mensagem' } vazio quando válido.
 */
export function validateClinicSignup(form, step = null) {
  const errors = {}

  const checkCompany = step === null || step === 1
  const checkAccess = step === null || step === 2
  const checkContact = step === null || step === 3
  const checkTerms = step === null || step === 4

  if (checkCompany) {
    if (!form.tradeName?.trim()) {
      errors.tradeName = 'Informe a razão social ou o nome fantasia.'
    }
    const cnpj = digitsOnly(form.cnpj)
    if (cnpj.length !== 14) {
      errors.cnpj = 'CNPJ deve ter 14 dígitos.'
    }
  }

  if (checkAccess) {
    const email = form.email?.trim() ?? ''
    if (!email) {
      errors.email = 'Informe o e-mail administrativo.'
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'E-mail inválido.'
    }
    if (!form.password) {
      errors.password = 'Defina uma senha.'
    } else if (form.password.length < 8) {
      errors.password = 'A senha deve ter no mínimo 8 caracteres.'
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem.'
    }
  }

  if (checkContact) {
    if (!form.managerName?.trim()) {
      errors.managerName = 'Informe o nome do responsável.'
    }
    const phone = digitsOnly(form.phone)
    if (phone.length < 10) {
      errors.phone = 'Informe um telefone válido (mínimo 10 dígitos).'
    }
  }

  if (checkTerms) {
    if (!form.acceptTerms) {
      errors.acceptTerms = 'É necessário aceitar os termos para continuar.'
    }
  }

  return errors
}
