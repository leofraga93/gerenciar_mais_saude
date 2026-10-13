import { DEFAULT_APPOINTMENTS, APPOINTMENT_STATUS, canTransitionAppointment } from '../data/appointments'
import { MOCK_SERVICES_CATALOG } from '../data/catalogData'
import { getAvailableClinicSlots } from '../data/clinicAvailability'
import { INSURANCES } from '../data/insurances'

const APPOINTMENTS_STORAGE_KEY = 'gerenciar_saude_appointments_v1'
const MOCK_DELAY_MS = 300

function createId(prefix) {
  return `${prefix}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`
}

function getClinicForService(serviceId, clinicId) {
  const service = MOCK_SERVICES_CATALOG.find((item) => item.id === serviceId && item.clinic.id === clinicId)
  if (!service) return null
  // As clínicas publicadas no catálogo mock representam ofertas ativas e aprovadas nesta fase.
  return { ...service.clinic, active: true, statusAprovacao: 'APROVADO' }
}

function validateOrderItem(item) {
  const clinic = getClinicForService(item.serviceId, item.clinicId)
  if (!clinic || clinic.active !== true || clinic.statusAprovacao !== 'APROVADO') {
    throw new Error(`O exame ${item.examName} não está mais disponível para agendamento no momento.`)
  }

  const service = MOCK_SERVICES_CATALOG.find((entry) => entry.id === item.serviceId)
  const serviceInsuranceIds = (service?.insurances || []).map((insuranceId) =>
    insuranceId.startsWith('ins-') ? insuranceId : `ins-${insuranceId}`
  )
  const day = getAvailableClinicSlots(item.clinicId, new Date(), item.selectedPeriod || '').find((availableDay) => availableDay.date === item.selectedDate)
  if (!day || !day.timeSlots.includes(item.selectedTimeSlot)) {
    throw new Error(`O horário selecionado para ${item.examName} não está mais disponível. Escolha outra opção.`)
  }

  if (item.paymentType === 'PARTICULAR' && !serviceInsuranceIds.includes('ins-particular')) {
    throw new Error(`O serviço ${item.examName} não oferece pagamento particular.`)
  }
  if (item.paymentType === 'CONVENIO' && !serviceInsuranceIds.includes(item.selectedInsuranceId)) {
    throw new Error(`O convênio selecionado para ${item.examName} não está disponível.`)
  }
  if (!['PARTICULAR', 'CONVENIO'].includes(item.paymentType)) {
    throw new Error(`Escolha uma forma de pagamento disponível para ${item.examName}.`)
  }
}

const SERVICE_CATEGORY_FROM_CART = {
  LAB: 'laboratorio',
  IMG: 'imagem',
  CARDIO: 'cardiologia',
  CONSULT: 'consultas',
  OUTROS: 'outros',
}

/** Cria um pedido único e persiste seus agendamentos no mesmo mock usado pelo portal da clínica. */
export function createAppointmentOrder({ items, patient }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!Array.isArray(items) || items.length === 0) throw new Error('Adicione ao menos um exame ao carrinho.')
        if (!patient?.id || !patient?.fullName) throw new Error('Acesse sua conta de paciente para solicitar os agendamentos.')
        items.forEach((item) => {
          if (!item.selectedDate || !item.selectedTimeSlot) {
            throw new Error(`Selecione uma data e um horário disponíveis para ${item.examName}.`)
          }
          validateOrderItem(item)
        })

        const now = new Date().toISOString()
        const orderId = createId('ORD')
        const appointments = items.map((item) => {
          const insurance = INSURANCES.find((entry) => entry.id === item.selectedInsuranceId)
          const appointmentId = createId('apt')
          const price = item.paymentType === 'PARTICULAR' ? Number(item.privatePrice) || 0 : 0
          return {
            id: appointmentId,
            appointmentId,
            orderId,
            patientId: patient.id,
            patientName: patient.fullName,
            clinicId: item.clinicId,
            clinicName: item.clinicName,
            examId: item.examId,
            examName: item.examName,
            serviceName: item.examName,
            serviceCategory: SERVICE_CATEGORY_FROM_CART[item.category] || 'outros',
            selectedDate: item.selectedDate,
            date: item.selectedDate,
            selectedTimeSlot: item.selectedTimeSlot,
            time: item.selectedTimeSlot,
            selectedPeriod: item.selectedPeriod || '',
            paymentType: item.paymentType,
            insuranceId: item.paymentType === 'CONVENIO' ? item.selectedInsuranceId : '',
            insurance: item.paymentType === 'CONVENIO' ? insurance?.name || 'Convênio' : 'Particular',
            price,
            status: APPOINTMENT_STATUS.SOLICITADO,
            descriptionPrep: item.descriptionPrep || '',
            prepInstructions: item.descriptionPrep || '',
            createdAt: now,
          }
        })

        const stored = loadAppointmentsFromStorage()
        saveAppointmentsToStorage([...appointments, ...stored])
        resolve({ orderId, appointments, createdAt: now })
      } catch (error) {
        reject(error)
      }
    }, MOCK_DELAY_MS)
  })
}

export function getAppointmentsForPatient(patientId) {
  return getAppointments().then((appointments) =>
    appointments.filter((appointment) => appointment.patientId === patientId)
  )
}

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
 * PAGO e CANCELADO sÃ£o estados terminais.
 */
export function updateAppointmentStatus(id, newStatus, reason = '') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const appointments = loadAppointmentsFromStorage()
      const appointment = appointments.find((item) => item.id === id)

      if (!appointment) {
        reject(new Error('Agendamento não encontrado'))
        return
      }

      if (!canTransitionAppointment(appointment.status, newStatus)) {
        const message = appointment.status === APPOINTMENT_STATUS.SOLICITADO && newStatus === APPOINTMENT_STATUS.PAGO
          ? 'O agendamento precisa ser confirmado pela clínica antes do registro de pagamento.'
          : 'Esta alteração não é permitida para o status atual do agendamento.'
        reject(new Error(message))
        return
      }

      const updatedItem = {
        ...appointment,
        status: newStatus,
        cancelReason: newStatus === APPOINTMENT_STATUS.CANCELADO ? reason : undefined,
        updatedAt: new Date().toISOString(),
      }
      const updatedList = appointments.map((item) => item.id === id ? updatedItem : item)

      saveAppointmentsToStorage(updatedList)
      resolve(updatedItem)
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
