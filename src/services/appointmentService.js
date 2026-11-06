import { DEFAULT_APPOINTMENTS } from '../data/appointments'
import {
  APPOINTMENT_STATUS,
  APPOINTMENT_ROLES,
  validateTransition,
  normalizeRole,
} from './appointmentStateMachine'
import { MOCK_SERVICES_CATALOG } from '../data/catalogData'
import { getAvailableClinicSlots } from '../data/clinicAvailability'
import { INSURANCES } from '../data/insurances'
import { recordFeeTriggerForAppointment } from './feeLedgerService'

const APPOINTMENTS_STORAGE_KEY = 'gerenciar_saude_appointments_v1'
const MOCK_DELAY_MS = 300

const TOKEN_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

/**
 * Gera token alfanumérico seguro de 6 caracteres (sem caracteres ambíguos 0/O, 1/I).
 */
export function generateCheckInToken() {
  let token = ''
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * TOKEN_ALPHABET.length)
    token += TOKEN_ALPHABET[idx]
  }
  return token
}

function createId(prefix) {
  return `${prefix}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`
}

function getClinicForService(serviceId, clinicId) {
  const service = MOCK_SERVICES_CATALOG.find((item) => item.id === serviceId && item.clinic.id === clinicId)
  if (!service) return null
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
            patientPhone: patient.phone || '(71) 98888-0000',
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
            checkInToken: null,
            tokenIssuedAt: null,
            checkedInAt: null,
            checkInMethod: null,
            patientAttendance: null,
            attendanceDispute: false,
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
          orderId: payload.orderId || createId('ORD'),
          patientName: payload.patientName.trim(),
          patientPhone: payload.patientPhone || '(71) 99999-0000',
          patientCpf: payload.patientCpf || '***.***.***-**',
          serviceName: payload.serviceName.trim(),
          examName: payload.serviceName.trim(),
          serviceCategory: payload.serviceCategory || 'outros',
          date: payload.date || new Date().toISOString().split('T')[0],
          time: payload.time || '10:00',
          selectedDate: payload.date || new Date().toISOString().split('T')[0],
          selectedTimeSlot: payload.time || '10:00',
          status: payload.status || APPOINTMENT_STATUS.SOLICITADO,
          paymentType: payload.paymentType || 'PARTICULAR',
          insurance: payload.insurance || 'Particular',
          price: parseFloat(payload.price) || 100.0,
          paymentMethod: payload.paymentMethod || 'A definir',
          prepInstructions: payload.prepInstructions || 'Trazer documento com foto.',
          descriptionPrep: payload.prepInstructions || 'Trazer documento com foto.',
          notes: payload.notes || '',
          checkInToken: null,
          tokenIssuedAt: null,
          checkedInAt: null,
          checkInMethod: null,
          patientAttendance: null,
          attendanceDispute: false,
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
 * Realiza o Check-in (Passo 1) de um agendamento.
 * Registra checkedInAt e checkInMethod sem alterar o status (permanece CONFIRMADO_CLINICA).
 * Habilita a ação "Marcar Realizado" para a clínica.
 *
 * @param {string} id ID do agendamento
 * @param {object} [options]
 * @param {string} [options.token] Código informado pelo paciente
 * @param {string} [options.method] 'TOKEN' | 'MANUAL' (default: 'TOKEN')
 */
export function checkInAppointment(id, options = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const appointments = loadAppointmentsFromStorage()
        const appointment = appointments.find((item) => item.id === id)

        if (!appointment) {
          throw new Error('Agendamento não encontrado.')
        }

        if (appointment.status !== APPOINTMENT_STATUS.CONFIRMADO_CLINICA) {
          throw new Error('O check-in só pode ser realizado em agendamentos com vaga confirmada.')
        }

        if (appointment.checkedInAt) {
          throw new Error('A presença deste pedido já foi registrada nesta clínica.')
        }

        const method = options.method || 'TOKEN'

        if (method === 'TOKEN') {
          const providedToken = String(options.token || '').trim().toUpperCase()
          if (!providedToken) {
            throw new Error('Token não encontrado. Confira o código informado pelo paciente.')
          }

          // Se o agendamento possuir token gerado, deve coincidir
          if (appointment.checkInToken && appointment.checkInToken.toUpperCase() !== providedToken) {
            throw new Error('Token não encontrado. Confira o código informado pelo paciente.')
          }
        }

        const now = new Date().toISOString()
        const updatedItem = {
          ...appointment,
          checkedInAt: now,
          checkInMethod: method,
          updatedAt: now,
        }

        const updatedList = appointments.map((item) => (item.id === id ? updatedItem : item))
        saveAppointmentsToStorage(updatedList)
        resolve(updatedItem)
      } catch (error) {
        reject(error)
      }
    }, MOCK_DELAY_MS)
  })
}

/**
 * Transição de status da Máquina de Estados (SPEC-09 §4.1).
 * Valida permissões por papel (role) e pré-requisitos (como check-in prévio para REALIZADO).
 *
 * @param {string} id
 * @param {string} newStatus
 * @param {string | object} [optionsOrReason] Se string, motivo de cancelamento. Se objeto: { role, reason, checkInMethod, token }
 */
export function updateAppointmentStatus(id, newStatus, optionsOrReason = '') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const appointments = loadAppointmentsFromStorage()
        const appointment = appointments.find((item) => item.id === id)

        if (!appointment) {
          throw new Error('Agendamento não encontrado.')
        }

        const options =
          typeof optionsOrReason === 'string'
            ? { reason: optionsOrReason, role: APPOINTMENT_ROLES.CLINICA }
            : { role: APPOINTMENT_ROLES.CLINICA, ...optionsOrReason }

        const role = normalizeRole(options.role || APPOINTMENT_ROLES.CLINICA)

        const context = {
          checkedInAt: appointment.checkedInAt,
          checkInMethod: options.checkInMethod || appointment.checkInMethod,
          token: options.token,
          hasTokenProof: Boolean(options.token && appointment.checkInToken === options.token.toUpperCase().trim()),
        }

        // Validação estrita pela máquina pura
        validateTransition(appointment.status, newStatus, role, context)

        const now = new Date().toISOString()
        let updatedItem = {
          ...appointment,
          status: newStatus,
          updatedAt: now,
        }

        // Caso 1: CONFIRMAÇÃO PELA CLÍNICA -> Gera ou propaga o checkInToken único do pedido
        let updatedList = appointments
        if (newStatus === APPOINTMENT_STATUS.CONFIRMADO_CLINICA) {
          const orderId = appointment.orderId
          let orderToken = appointment.checkInToken

          if (!orderToken && orderId) {
            // Verifica se algum item do pedido já tem token
            const existingWithToken = appointments.find(
              (item) => item.orderId === orderId && item.checkInToken,
            )
            orderToken = existingWithToken ? existingWithToken.checkInToken : generateCheckInToken()
          }

          if (orderToken) {
            updatedItem.checkInToken = orderToken
            updatedItem.tokenIssuedAt = appointment.tokenIssuedAt || now

            // Propaga para todos os itens do mesmo pedido
            updatedList = updatedList.map((item) => {
              if (item.orderId === orderId) {
                return {
                  ...item,
                  checkInToken: orderToken,
                  tokenIssuedAt: item.tokenIssuedAt || now,
                }
              }
              return item
            })
          }
        }

        // Caso 2: CANCELAMENTO
        if (newStatus === APPOINTMENT_STATUS.CANCELADO) {
          updatedItem.cancelledBy =
            role === APPOINTMENT_ROLES.PACIENTE
              ? 'PACIENTE'
              : role === APPOINTMENT_ROLES.ADMIN
                ? 'ADMIN'
                : 'CLINICA'
          updatedItem.cancelReason = options.reason || 'Cancelado pela operação.'
        }

        // Caso 3: PROVA DE GUICHÊ (Reversão NAO_COMPARECEU -> REALIZADO)
        if (
          appointment.status === APPOINTMENT_STATUS.NAO_COMPARECEU &&
          newStatus === APPOINTMENT_STATUS.REALIZADO
        ) {
          updatedItem.checkInMethod = 'MANUAL_REVERSAL'
          updatedItem.attendanceDispute = true
          updatedItem.checkedInAt = updatedItem.checkedInAt || now
        }

        // Caso 4: REALIZADO com busca manual direta
        if (newStatus === APPOINTMENT_STATUS.REALIZADO && !updatedItem.checkedInAt) {
          if (options.checkInMethod === 'MANUAL') {
            updatedItem.checkedInAt = now
            updatedItem.checkInMethod = 'MANUAL'
          }
        }

        updatedList = updatedList.map((item) => (item.id === id ? updatedItem : item))
        saveAppointmentsToStorage(updatedList)

        // Fato Gerador da Taxa (Máquina 2 - feeLedger):
        // Disparado ao transitar para estado faturável (REALIZADO ou NAO_COMPARECEU)
        if (
          newStatus === APPOINTMENT_STATUS.REALIZADO ||
          newStatus === APPOINTMENT_STATUS.NAO_COMPARECEU
        ) {
          recordFeeTriggerForAppointment(updatedItem, updatedList)
        }

        resolve(updatedItem)
      } catch (error) {
        reject(error)
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
