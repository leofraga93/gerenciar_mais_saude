import { DEFAULT_APPOINTMENTS, APPOINTMENT_STATUS } from '../data/appointments'

const APPOINTMENTS_STORAGE_KEY = 'gerenciar_saude_appointments_v1'
const MOCK_DELAY_MS = 300

function loadAppointmentsFromStorage() {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY)
    if (raw === null) {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_APPOINTMENTS))
      return DEFAULT_APPOINTMENTS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : DEFAULT_APPOINTMENTS
  } catch {
    return DEFAULT_APPOINTMENTS
  }
}

function saveAppointmentsToStorage(appointments) {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments))
  } catch (error) {
    console.error('Erro ao salvar agendamentos no localStorage:', error)
  }
}

export function getAppointments() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = loadAppointmentsFromStorage()
      resolve([...data])
    }, MOCK_DELAY_MS)
  })
}

export function saveAppointment(payload) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const appointments = loadAppointmentsFromStorage()
      let updatedList = []
      let saved = null

      if (payload.id) {
        updatedList = appointments.map((item) => {
          if (item.id === payload.id) {
            saved = {
              ...item,
              ...payload,
              updatedAt: new Date().toISOString(),
            }
            return saved
          }
          return item
        })
      } else {
        saved = {
          id: `apt-${Date.now()}`,
          patientName: payload.patientName.trim(),
          patientPhone: payload.patientPhone || '(71) 99999-0000',
          patientCpf: payload.patientCpf || '***.***.***-**',
          serviceName: payload.serviceName.trim(),
          serviceCategory: payload.serviceCategory || 'outros',
          date: payload.date || new Date().toISOString().split('T')[0],
          time: payload.time || '10:00',
          status: payload.status || APPOINTMENT_STATUS.SOLICITADO,
          insurance: payload.insurance || 'Particular',
          price: parseFloat(payload.price) || 100.0,
          paymentMethod: payload.paymentMethod || 'A definir',
          prepInstructions: payload.prepInstructions || 'Trazer documento com foto.',
          notes: payload.notes || '',
          createdAt: new Date().toISOString(),
        }
        updatedList = [saved, ...appointments]
      }

      saveAppointmentsToStorage(updatedList)
      resolve(saved)
    }, MOCK_DELAY_MS)
  })
}

/**
 * Transição de status da Máquina de Estados:
 * SOLICITADO -> CONFIRMADO_CLINICA -> PAGO
 * ou qualquer estado -> CANCELADO
 */
export function updateAppointmentStatus(id, newStatus, reason = '') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const appointments = loadAppointmentsFromStorage()
      let updatedItem = null

      const updatedList = appointments.map((item) => {
        if (item.id === id) {
          // Validação da máquina de estados: não pode ir para PAGO direto de SOLICITADO
          if (newStatus === APPOINTMENT_STATUS.PAGO && item.status === APPOINTMENT_STATUS.SOLICITADO) {
            console.warn('Ação bloqueada: É necessário confirmar a vaga na clínica antes de registrar pagamento.')
          }

          updatedItem = {
            ...item,
            status: newStatus,
            cancelReason: newStatus === APPOINTMENT_STATUS.CANCELADO ? reason : undefined,
            updatedAt: new Date().toISOString(),
          }
          return updatedItem
        }
        return item
      })

      if (updatedItem) {
        saveAppointmentsToStorage(updatedList)
        resolve(updatedItem)
      } else {
        reject(new Error('Agendamento não encontrado'))
      }
    }, MOCK_DELAY_MS)
  })
}

export function deleteAppointment(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const appointments = loadAppointmentsFromStorage()
      const updatedList = appointments.filter((item) => item.id !== id)
      saveAppointmentsToStorage(updatedList)
      resolve(true)
    }, MOCK_DELAY_MS)
  })
}
