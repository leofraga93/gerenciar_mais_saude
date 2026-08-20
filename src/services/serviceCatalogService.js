import { DEFAULT_CLINIC_SERVICES } from '../data/services'

const STORAGE_KEY = 'gerenciar_saude_clinic_services_v2'
const MOCK_DELAY_MS = 300

/**
 * Lê os serviços armazenados ou inicializa com o pré-cadastro padrão de serviços.
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CLINIC_SERVICES))
      return DEFAULT_CLINIC_SERVICES
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CLINIC_SERVICES))
      return DEFAULT_CLINIC_SERVICES
    }
    return parsed
  } catch {
    return DEFAULT_CLINIC_SERVICES
  }
}

/**
 * Persiste a lista atualizada no localStorage.
 */
function saveToStorage(services) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
  } catch (err) {
    console.error('Erro ao salvar serviços no localStorage:', err)
  }
}

/**
 * Simula GET /clinics/services
 */
export function getClinicServices() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const services = loadFromStorage()
      resolve([...services])
    }, MOCK_DELAY_MS)
  })
}

/**
 * Restaura / recarrega o pré-cadastro padrão de serviços da clínica.
 */
export function resetClinicServicesToDefault() {
  return new Promise((resolve) => {
    setTimeout(() => {
      saveToStorage(DEFAULT_CLINIC_SERVICES)
      resolve([...DEFAULT_CLINIC_SERVICES])
    }, MOCK_DELAY_MS)
  })
}


/**
 * Simula POST / PUT /clinics/services
 */
export function saveClinicService(payload) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const services = loadFromStorage()
      let updatedList = []
      let savedRecord = null

      if (payload.id) {
        // Edição de um serviço existente
        updatedList = services.map((item) => {
          if (item.id === payload.id) {
            savedRecord = {
              ...item,
              name: payload.name.trim(),
              category: payload.category,
              tussCode: payload.tussCode ? payload.tussCode.trim() : '',
              privatePrice: parseFloat(payload.privatePrice),
              insuranceIds: payload.insuranceIds || [],
              descriptionPrep: payload.descriptionPrep.trim(),
              durationMinutes: parseInt(payload.durationMinutes, 10) || 15,
              active: payload.active !== undefined ? payload.active : true,
              imageUrl: payload.imageUrl?.trim() ?? '',
              insurancePricingNotes: payload.insurancePricingNotes?.trim() ?? '',
              commercialNotes: payload.commercialNotes?.trim() ?? '',
              updatedAt: new Date().toISOString(),
            }
            return savedRecord
          }
          return item
        })
      } else {
        // Criação de novo serviço
        savedRecord = {
          id: `cli-srv-${Date.now()}`,
          name: payload.name.trim(),
          category: payload.category,
          tussCode: payload.tussCode ? payload.tussCode.trim() : '',
          privatePrice: parseFloat(payload.privatePrice),
          insuranceIds: payload.insuranceIds || [],
          descriptionPrep: payload.descriptionPrep.trim(),
          durationMinutes: parseInt(payload.durationMinutes, 10) || 15,
          active: payload.active !== undefined ? payload.active : true,
          imageUrl: payload.imageUrl?.trim() ?? '',
          insurancePricingNotes: payload.insurancePricingNotes?.trim() ?? '',
          commercialNotes: payload.commercialNotes?.trim() ?? '',
          createdAt: new Date().toISOString(),
        }
        updatedList = [savedRecord, ...services]
      }

      saveToStorage(updatedList)
      resolve(savedRecord)
    }, MOCK_DELAY_MS)
  })
}

/**
 * Simula PATCH /clinics/services/:id/status
 */
export function toggleClinicServiceStatus(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const services = loadFromStorage()
      let updatedService = null
      const updatedList = services.map((item) => {
        if (item.id === id) {
          updatedService = { ...item, active: !item.active }
          return updatedService
        }
        return item
      })

      saveToStorage(updatedList)
      resolve(updatedService)
    }, MOCK_DELAY_MS)
  })
}

/**
 * Simula DELETE /clinics/services/:id
 */
export function deleteClinicService(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const services = loadFromStorage()
      const updatedList = services.filter((item) => item.id !== id)
      saveToStorage(updatedList)
      resolve(true)
    }, MOCK_DELAY_MS)
  })
}
