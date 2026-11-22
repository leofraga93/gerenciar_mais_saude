import { DEFAULT_PATIENT_PROFILE } from '../data/patientProfile'
import { validatePatientSignupField } from '../utils/patientSignupValidation'

export const PATIENT_STORAGE_KEY = 'gms_patient_session'

function safeParse(json) {
  try {
    return json ? JSON.parse(json) : null
  } catch {
    return null
  }
}

function normalizeInsuranceIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return ['ins-particular']
  const normalized = ids
    .filter(Boolean)
    .map((id) => (String(id).startsWith('ins-') ? String(id) : `ins-${id}`))
  return normalized.length > 0 ? [...new Set(normalized)] : ['ins-particular']
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
    insuranceIds: normalizeInsuranceIds(patientData.insuranceIds),
    termsAccepted: Boolean(patientData.termsAccepted ?? patientData.acceptTerms),
    createdAt: patientData.createdAt || new Date().toISOString(),
  }

  window.sessionStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(newPatient))
  return newPatient
}

/**
 * Atualiza somente e-mail, telefone e convênios do paciente mantendo CPF, nome e nascimento fixos (SPEC-09).
 */
export async function updatePatientProfile({ email, phone, insuranceIds }) {
  await new Promise((resolve) => setTimeout(resolve, 180))
  if (typeof window === 'undefined') return null

  const emailErr = validatePatientSignupField('email', email)
  if (emailErr) throw new Error(emailErr)

  const phoneErr = validatePatientSignupField('phone', phone)
  if (phoneErr) throw new Error(phoneErr)

  const current = (await getRegisteredPatient()) || { ...DEFAULT_PATIENT_PROFILE }
  const updatedPatient = {
    ...current,
    email: String(email).trim().toLowerCase(),
    phone: String(phone).trim(),
    insuranceIds: normalizeInsuranceIds(insuranceIds),
    updatedAt: new Date().toISOString(),
  }

  window.sessionStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(updatedPatient))
  return updatedPatient
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
