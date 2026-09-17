import { DEFAULT_PATIENT_PROFILE } from '../data/patientProfile'

export const PATIENT_STORAGE_KEY = 'gms_patient_session'

function safeParse(json) {
  try {
    return json ? JSON.parse(json) : null
  } catch {
    return null
  }
}

/**
 * Retorna o paciente salvo no sessionStorage ou null.
 */
export async function getRegisteredPatient() {
  await new Promise((resolve) => setTimeout(resolve, 50))
  if (typeof window === 'undefined') return null

  const raw = window.sessionStorage.getItem(PATIENT_STORAGE_KEY)
  const parsed = safeParse(raw)
  return parsed ?? null
}

/**
 * Salva ou atualiza os dados cadastrados do paciente no sessionStorage.
 */
export async function registerPatient(patientData) {
  await new Promise((resolve) => setTimeout(resolve, 150))
  if (typeof window === 'undefined') return null

  const newPatient = {
    id: patientData.id || `pat-${Date.now()}`,
    fullName: patientData.fullName?.trim(),
    cpf: patientData.cpf?.trim(),
    birthDate: patientData.birthDate,
    email: patientData.email?.trim().toLowerCase(),
    phone: patientData.phone?.trim(),
    insuranceIds:
      Array.isArray(patientData.insuranceIds) && patientData.insuranceIds.length > 0
        ? patientData.insuranceIds
        : ['ins-particular'],
    termsAccepted: Boolean(patientData.termsAccepted ?? patientData.acceptTerms),
    createdAt: patientData.createdAt || new Date().toISOString(),
  }

  window.sessionStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(newPatient))
  return newPatient
}

/**
 * Limpa a sessão do paciente.
 */
export async function clearRegisteredPatient() {
  await new Promise((resolve) => setTimeout(resolve, 50))
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(PATIENT_STORAGE_KEY)
}

/**
 * Retorna o perfil ativo ou fallback mock para visualização.
 */
export async function getPatientProfile() {
  const registered = await getRegisteredPatient()
  return registered || DEFAULT_PATIENT_PROFILE
}
