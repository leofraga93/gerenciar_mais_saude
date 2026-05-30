import { CLINIC_SESSION_KEY } from '../constants/clinicStorage'

const MOCK_DELAY_MS = 600

/**
 * Simula POST /clinics/register.
 * Persiste no sessionStorage para o dashboard exibir nome e banner até haver API.
 */
export function registerClinic(payload) {
  const record = {
    id: `clinic-mock-${Date.now()}`,
    tradeName: payload.tradeName.trim(),
    cnpj: payload.cnpj,
    email: payload.email.trim(),
    managerName: payload.managerName.trim(),
    phone: payload.phone,
    referralCode: payload.referralCode?.trim() || null,
    profileComplete: false,
    registeredAt: new Date().toISOString(),
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      sessionStorage.setItem(CLINIC_SESSION_KEY, JSON.stringify(record))
      resolve(record)
    }, MOCK_DELAY_MS)
  })
}

/** Lê a clínica credenciada no mock (null se não houver sessão). */
export function getRegisteredClinic() {
  try {
    const raw = sessionStorage.getItem(CLINIC_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearRegisteredClinic() {
  sessionStorage.removeItem(CLINIC_SESSION_KEY)
}
