import { CLINIC_SESSION_KEY } from '../constants/clinicStorage'
import {
  CLINIC_MONTHLY_PLAN_BRL,
  CLINIC_SUBSCRIPTION_STATUS,
  TRIAL_DURATION_DAYS,
} from '../constants/billingConstants'
import { DEFAULT_CLINIC_PROFILE } from '../data/clinicProfileData'
import { formatCnpj } from '../utils/clinicSignupValidation'

const PROFILE_STORAGE_KEY = 'gerenciar_saude_clinic_profile_v1'
const CLINIC_REGISTRY_STORAGE_KEY = 'gerenciar_saude_clinics_registry_v1'
const MOCK_DELAY_MS = 400

export const CLINIC_APPROVAL_STATUS = Object.freeze({
  PENDING: 'PENDENTE_APROVACAO_ADMIN',
  APPROVED: 'APROVADO',
  SUSPENDED: 'SUSPENSO',
  REJECTED: 'REJEITADO',
})

function addDaysIso(baseDate, days) {
  const next = new Date(baseDate.getTime())
  next.setDate(next.getDate() + days)
  return next.toISOString()
}

export function normalizeClinicTrialState(clinic, now = new Date()) {
  if (!clinic) return null
  const normalized = {
    ...clinic,
    statusAprovacao: clinic.statusAprovacao || CLINIC_APPROVAL_STATUS.PENDING,
    trialStartedAt: clinic.trialStartedAt || null,
    trialEndsAt: clinic.trialEndsAt || null,
    subscriptionStatus: clinic.subscriptionStatus || CLINIC_SUBSCRIPTION_STATUS.TRIAL,
    monthlyPlanPrice: clinic.monthlyPlanPrice ?? CLINIC_MONTHLY_PLAN_BRL,
  }

  if (
    normalized.statusAprovacao === CLINIC_APPROVAL_STATUS.APPROVED &&
    normalized.trialEndsAt &&
    normalized.subscriptionStatus !== CLINIC_SUBSCRIPTION_STATUS.ACTIVE_SUBSCRIPTION &&
    now.getTime() > new Date(normalized.trialEndsAt).getTime()
  ) {
    return {
      ...normalized,
      statusAprovacao: CLINIC_APPROVAL_STATUS.SUSPENDED,
      subscriptionStatus: CLINIC_SUBSCRIPTION_STATUS.TRIAL_EXPIRED,
      suspensionReason: 'TRIAL_EXPIRED',
    }
  }

  return normalized
}

export function getClinicTrialRemainingDays(clinic, now = new Date()) {
  if (!clinic?.trialEndsAt) return null
  const diffMs = new Date(clinic.trialEndsAt).getTime() - now.getTime()
  if (Number.isNaN(diffMs)) return null
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

function readClinicRegistry() {
  try {
    const raw = localStorage.getItem(CLINIC_REGISTRY_STORAGE_KEY)
    const clinics = raw ? JSON.parse(raw) : []
    return Array.isArray(clinics) ? clinics.map((c) => normalizeClinicTrialState(c)) : []
  } catch {
    return []
  }
}

function writeClinicRegistry(clinics) {
  localStorage.setItem(CLINIC_REGISTRY_STORAGE_KEY, JSON.stringify(clinics))
}

function upsertClinicRegistry(clinic) {
  const clinics = readClinicRegistry()
  const exists = clinics.some((registeredClinic) => registeredClinic.id === clinic.id)
  writeClinicRegistry(
    exists
      ? clinics.map((registeredClinic) => (registeredClinic.id === clinic.id ? clinic : registeredClinic))
      : [clinic, ...clinics],
  )
}

/**
 * Simula POST /clinics/register.
 * Persiste no sessionStorage para o dashboard exibir nome e banner até haver API.
 */
export function registerClinic(payload) {
  const nowIso = new Date().toISOString()
  const record = {
    id: `clinic-mock-${Date.now()}`,
    legalName: payload.legalName.trim(),
    tradeName: payload.tradeName.trim(),
    cnpj: payload.cnpj,
    email: payload.email.trim(),
    managerName: payload.managerName.trim(),
    phone: payload.phone,
    referralCode: payload.referralCode?.trim() || null,
    profileComplete: false,
    statusAprovacao: CLINIC_APPROVAL_STATUS.PENDING,
    trialStartedAt: null,
    trialEndsAt: null,
    subscriptionStatus: CLINIC_SUBSCRIPTION_STATUS.TRIAL,
    monthlyPlanPrice: CLINIC_MONTHLY_PLAN_BRL,
    statusUpdatedAt: nowIso,
    registeredAt: nowIso,
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        sessionStorage.setItem(CLINIC_SESSION_KEY, JSON.stringify(record))
        upsertClinicRegistry(record)
        resolve(record)
      } catch {
        resolve(record)
      }
    }, 600)
  })
}

/** Lê a clínica credenciada no mock (null se não houver sessão). */
export function getRegisteredClinic() {
  try {
    const raw = sessionStorage.getItem(CLINIC_SESSION_KEY)
    if (!raw) return null
    const clinic = JSON.parse(raw)
    return normalizeClinicTrialState(clinic)
  } catch {
    return null
  }
}

/** Atualiza o status de moderação e inicializa trial de 90 dias na primeira aprovação (SPEC-05). */
export function updateClinicApprovalStatus(clinicId, status) {
  const allowedStatuses = Object.values(CLINIC_APPROVAL_STATUS)
  if (!allowedStatuses.includes(status)) {
    throw new Error('Status de moderação inválido.')
  }

  if (!clinicId) throw new Error('Identificador da clínica não informado.')
  const clinics = readClinicRegistry()
  const clinic = clinics.find((registeredClinic) => registeredClinic.id === clinicId)
  if (!clinic) throw new Error('Clínica não encontrada no registro mock.')

  const now = new Date()
  const nowIso = now.toISOString()
  let nextTrialStartedAt = clinic.trialStartedAt || null
  let nextTrialEndsAt = clinic.trialEndsAt || null
  let nextSubscriptionStatus = clinic.subscriptionStatus || CLINIC_SUBSCRIPTION_STATUS.TRIAL
  let nextSuspensionReason = clinic.suspensionReason || null

  if (status === CLINIC_APPROVAL_STATUS.APPROVED) {
    if (!nextTrialStartedAt) {
      nextTrialStartedAt = nowIso
      nextTrialEndsAt = addDaysIso(now, TRIAL_DURATION_DAYS)
      nextSubscriptionStatus = CLINIC_SUBSCRIPTION_STATUS.TRIAL
    } else if (nextSubscriptionStatus === CLINIC_SUBSCRIPTION_STATUS.TRIAL_EXPIRED) {
      nextSubscriptionStatus = CLINIC_SUBSCRIPTION_STATUS.ACTIVE_SUBSCRIPTION
    }
    nextSuspensionReason = null
  }

  const updatedClinic = normalizeClinicTrialState({
    ...clinic,
    statusAprovacao: status,
    trialStartedAt: nextTrialStartedAt,
    trialEndsAt: nextTrialEndsAt,
    subscriptionStatus: nextSubscriptionStatus,
    monthlyPlanPrice: clinic.monthlyPlanPrice ?? CLINIC_MONTHLY_PLAN_BRL,
    suspensionReason: nextSuspensionReason,
    statusUpdatedAt: nowIso,
  }, now)

  writeClinicRegistry(clinics.map((registeredClinic) => (registeredClinic.id === clinicId ? updatedClinic : registeredClinic)))
  const activeClinic = getRegisteredClinic()
  if (activeClinic?.id === clinicId) {
    sessionStorage.setItem(CLINIC_SESSION_KEY, JSON.stringify(updatedClinic))
  }
  return updatedClinic
}

/** Lista os cadastros mock persistidos para a área administrativa. */
export function getRegisteredClinics() {
  const clinics = readClinicRegistry()
  const activeClinic = getRegisteredClinic()
  if (activeClinic && !clinics.some((clinic) => clinic.id === activeClinic.id)) {
    clinics.unshift(activeClinic)
    try {
      writeClinicRegistry(clinics)
    } catch {
      // A sessão ativa ainda pode ser exibida mesmo se o armazenamento local falhar.
    }
  }
  return [...clinics].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
}

export function clearRegisteredClinic() {
  sessionStorage.removeItem(CLINIC_SESSION_KEY)
}

/**
 * Carrega o perfil completo e fotos da clínica do localStorage ou inicializa padrão.
 * O telefone direto do gestor (Etapa 3) NÃO sobrescreve o telefone comercial público da clínica.
 */
export function getClinicProfile() {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
        const clinicSession = getRegisteredClinic()
        let profile = DEFAULT_CLINIC_PROFILE

        if (raw) {
          profile = JSON.parse(raw)
        }

        if (clinicSession) {
          profile = {
            ...profile,
            legalName: clinicSession.legalName || profile.legalName,
            tradeName: clinicSession.tradeName || profile.tradeName,
            cnpj: clinicSession.cnpj ? formatCnpj(clinicSession.cnpj) : profile.cnpj,
            email: clinicSession.email || profile.email,
          }
        }

        resolve({ ...profile })
      } catch {
        resolve({ ...DEFAULT_CLINIC_PROFILE })
      }
    }, MOCK_DELAY_MS)
  })
}

/**
 * Salva atualizações cadastrais do perfil da clínica.
 */
export function saveClinicProfile(payload) {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload))
        resolve(payload)
      } catch (error) {
        console.error('Erro ao salvar perfil da clínica:', error)
        resolve(payload)
      }
    }, MOCK_DELAY_MS)
  })
}

/**
 * Adiciona uma nova foto à galeria da clínica.
 */
export function addClinicPhoto(photo) {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
        const profile = raw ? JSON.parse(raw) : { ...DEFAULT_CLINIC_PROFILE }
        const photos = profile.photos || []

        const newPhoto = {
          id: `photo-${Date.now()}`,
          title: photo.title || 'Foto do Estabelecimento',
          category: photo.category || 'FACHADA',
          url: photo.url,
          isCover: photos.length === 0 || Boolean(photo.isCover),
          uploadedAt: new Date().toISOString(),
        }

        const updatedPhotos = newPhoto.isCover
          ? [newPhoto, ...photos.map((p) => ({ ...p, isCover: false }))]
          : [newPhoto, ...photos]

        const updatedProfile = { ...profile, photos: updatedPhotos }
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile))
        resolve(newPhoto)
      } catch (err) {
        console.error('Erro ao adicionar foto:', err)
        resolve(null)
      }
    }, MOCK_DELAY_MS)
  })
}

/**
 * Define uma foto existente como a capa principal da clínica (Fachada exibida aos pacientes).
 */
export function setClinicCoverPhoto(photoId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
        const profile = raw ? JSON.parse(raw) : { ...DEFAULT_CLINIC_PROFILE }
        const updatedPhotos = (profile.photos || []).map((p) => ({
          ...p,
          isCover: p.id === photoId,
        }))
        const updatedProfile = { ...profile, photos: updatedPhotos }
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile))
        resolve(updatedProfile)
      } catch {
        resolve(null)
      }
    }, MOCK_DELAY_MS)
  })
}

/**
 * Remove uma foto da galeria da clínica.
 */
export function deleteClinicPhoto(photoId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
        const profile = raw ? JSON.parse(raw) : { ...DEFAULT_CLINIC_PROFILE }
        let photos = (profile.photos || []).filter((p) => p.id !== photoId)

        const hasCover = photos.some((p) => p.isCover)
        if (!hasCover && photos.length > 0) {
          photos[0].isCover = true
        }

        const updatedProfile = { ...profile, photos }
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile))
        resolve(true)
      } catch {
        resolve(false)
      }
    }, MOCK_DELAY_MS)
  })
}

/** Aliases checklist §3.2 — implementação em serviceCatalogService.js */
export {
  getClinicServices as getServices,
  saveClinicService as saveService,
  deleteClinicService as deleteService,
} from './serviceCatalogService'
