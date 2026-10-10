import { CLINIC_SESSION_KEY } from '../constants/clinicStorage'
import { DEFAULT_CLINIC_PROFILE } from '../data/clinicProfileData'
import { formatCnpj, formatPhone } from '../utils/clinicSignupValidation'

const PROFILE_STORAGE_KEY = 'gerenciar_saude_clinic_profile_v1'
const CLINIC_REGISTRY_STORAGE_KEY = 'gerenciar_saude_clinics_registry_v1'
const MOCK_DELAY_MS = 400

export const CLINIC_APPROVAL_STATUS = Object.freeze({
  PENDING: 'PENDENTE_APROVACAO_ADMIN',
  APPROVED: 'APROVADO',
  SUSPENDED: 'SUSPENSO',
  REJECTED: 'REJEITADO',
})

function readClinicRegistry() {
  try {
    const raw = localStorage.getItem(CLINIC_REGISTRY_STORAGE_KEY)
    const clinics = raw ? JSON.parse(raw) : []
    return Array.isArray(clinics) ? clinics : []
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
      ? clinics.map((registeredClinic) => registeredClinic.id === clinic.id ? clinic : registeredClinic)
      : [clinic, ...clinics],
  )
}

/**
 * Simula POST /clinics/register.
 * Persiste no sessionStorage para o dashboard exibir nome e banner até haver API.
 */
export function registerClinic(payload) {
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
    statusUpdatedAt: new Date().toISOString(),
    registeredAt: new Date().toISOString(),
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
    return {
      ...clinic,
      statusAprovacao: clinic.statusAprovacao || CLINIC_APPROVAL_STATUS.PENDING,
    }
  } catch {
    return null
  }
}

/** Atualiza o status de moderação no mock persistido da sessão da clínica. */
export function updateClinicApprovalStatus(clinicId, status) {
  const allowedStatuses = Object.values(CLINIC_APPROVAL_STATUS)
  if (!allowedStatuses.includes(status)) {
    throw new Error('Status de moderação inválido.')
  }

  if (!clinicId) throw new Error('Identificador da clínica não informado.')
  const clinics = readClinicRegistry()
  const clinic = clinics.find((registeredClinic) => registeredClinic.id === clinicId)
  if (!clinic) throw new Error('Clínica não encontrada no registro mock.')

  const updatedClinic = {
    ...clinic,
    statusAprovacao: status,
    statusUpdatedAt: new Date().toISOString(),
  }
  writeClinicRegistry(clinics.map((registeredClinic) => registeredClinic.id === clinicId ? updatedClinic : registeredClinic))
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

        // Se houver dados de credenciamento na sessão, mescla o nome fantasia, CNPJ e contatos
        if (clinicSession) {
          profile = {
            ...profile,
            legalName: clinicSession.legalName || profile.legalName,
            tradeName: clinicSession.tradeName || profile.tradeName,
            cnpj: clinicSession.cnpj ? formatCnpj(clinicSession.cnpj) : profile.cnpj,
            email: clinicSession.email || profile.email,
            phone: clinicSession.phone ? formatPhone(clinicSession.phone) : profile.phone,
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

        // Se for capa, remove capa anterior
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

        // Se removeu a capa e ainda restam fotos, a primeira vira capa
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
