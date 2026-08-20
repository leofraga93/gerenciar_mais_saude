import { CLINIC_SESSION_KEY } from '../constants/clinicStorage'
import { DEFAULT_CLINIC_PROFILE } from '../data/clinicProfileData'

const PROFILE_STORAGE_KEY = 'gerenciar_saude_clinic_profile_v1'
const MOCK_DELAY_MS = 400

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
    }, 600)
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

        // Se houver dados de credenciamento na sessão, mescla o nome fantasia e contatos
        if (clinicSession) {
          profile = {
            ...profile,
            tradeName: clinicSession.tradeName || profile.tradeName,
            cnpj: clinicSession.cnpj || profile.cnpj,
            email: clinicSession.email || profile.email,
            phone: clinicSession.phone || profile.phone,
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
