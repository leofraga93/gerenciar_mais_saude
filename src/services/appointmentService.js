import { DEFAULT_APPOINTMENTS } from '../data/appointments'
import { MOCK_SERVICES_CATALOG } from '../data/catalogData'
import { getAvailableClinicSlots } from '../data/clinicAvailability'
import { INSURANCES } from '../data/insurances'
import {
  CHECK_IN_METHOD,
  PATIENT_ATTENDANCE,
  generateCheckInToken,
} from '../constants/billingConstants'
import {
  APPOINTMENT_STATUS,
  canTransition,
  shouldPromptPatientAttendance,
} from './appointmentStateMachine'
import {
  activateOrderFeeOnConfirm,
  ensureOrderFeeCreated,
  exemptOrderFeeIfAllCancelled,
  getPendingOrderFeesSync,
} from './orderFeeService'

const APPOINTMENTS_STORAGE_KEY = 'gerenciar_saude_appointments_v1'
const TOKEN_ATTEMPTS_STORAGE_KEY = 'gerenciar_saude_token_attempts_v1'
const MAX_TOKEN_FAILURES = 5
const MOCK_DELAY_MS = 250

function createId(prefix) {
  return `${prefix}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`
}

function createReadableOrderId(existing = []) {
  const year = new Date().getFullYear()
  const baseNumber = 107 + existing.length
  return `ORD-${year}-${String(baseNumber).padStart(6, '0')}`
}

function normalizeAppointmentRecord(item) {
  if (!item || typeof item !== 'object') return item
  const normalizedStatus = item.status === 'PAGO' ? APPOINTMENT_STATUS.REALIZADO : item.status
  const normalizedDate = item.selectedDate || item.date
  const normalizedTime = item.selectedTimeSlot || item.time
  const paymentType =
    item.paymentType ||
    (item.insurance && item.insurance !== 'Particular' ? 'CONVENIO' : 'PARTICULAR')

  return {
    ...item,
    id: item.id || item.appointmentId,
    appointmentId: item.appointmentId || item.id,
    status: normalizedStatus,
    date: normalizedDate,
    selectedDate: normalizedDate,
    time: normalizedTime,
    selectedTimeSlot: normalizedTime,
    examName: item.examName || item.serviceName,
    serviceName: item.serviceName || item.examName,
    descriptionPrep: item.descriptionPrep || item.prepInstructions || '',
    prepInstructions: item.prepInstructions || item.descriptionPrep || '',
    paymentType,
    checkedInAt:
      normalizedStatus === APPOINTMENT_STATUS.REALIZADO && !item.checkedInAt
        ? item.updatedAt || item.createdAt || new Date().toISOString()
        : item.checkedInAt || null,
  }
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

function loadAppointmentsFromStorage() {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY)
    if (raw === null) {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_APPOINTMENTS))
      return DEFAULT_APPOINTMENTS.map(normalizeAppointmentRecord)
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEFAULT_APPOINTMENTS.map(normalizeAppointmentRecord)
    return parsed.map(normalizeAppointmentRecord)
  } catch {
    return DEFAULT_APPOINTMENTS.map(normalizeAppointmentRecord)
  }
}

function saveAppointmentsToStorage(appointments) {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments))
  } catch (error) {
    console.error('Erro ao salvar agendamentos no localStorage:', error)
  }
}

function readTokenAttempts() {
  try {
    const raw = localStorage.getItem(TOKEN_ATTEMPTS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : { failures: 0, locked: false }
    return {
      failures: Number(parsed?.failures) || 0,
      locked: Boolean(parsed?.locked),
    }
  } catch {
    return { failures: 0, locked: false }
  }
}

function writeTokenAttempts(state) {
  try {
    localStorage.setItem(TOKEN_ATTEMPTS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // noop
  }
}

export function resetTokenCheckInLock() {
  writeTokenAttempts({ failures: 0, locked: false })
}

export function getTokenCheckInAttemptState() {
  return readTokenAttempts()
}

/**
 * Cria um pedido único e persiste seus agendamentos + taxa única de R$ 5,00 (SPEC-09).
 * Bloqueia se houver taxa PENDENTE_PAGAMENTO ou confirmação de presença pendente do paciente.
 */
export function createAppointmentOrder({ items, patient }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!Array.isArray(items) || items.length === 0) {
          throw new Error('Adicione ao menos um exame ao carrinho.')
        }
        if (!patient?.id || !patient?.fullName) {
          throw new Error('Acesse sua conta de paciente para solicitar os agendamentos.')
        }

        const pendingFees = getPendingOrderFeesSync(patient.id)
        if (pendingFees.length > 0) {
          const error = new Error(
            `Você possui ${pendingFees.length === 1 ? 'uma taxa de agendamento de R$ 5,00 pendente' : `${pendingFees.length} taxas de agendamento de R$ 5,00 pendentes`}. Quite no seu portal para liberar novos pedidos.`,
          )
          error.code = 'FEE_PAYMENT_PENDING'
          error.pendingOrderIds = pendingFees.map((fee) => fee.orderId)
          throw error
        }

        const stored = loadAppointmentsFromStorage()
        const pendingAttendanceItems = stored.filter(
          (appointment) =>
            appointment.patientId === patient.id && shouldPromptPatientAttendance(appointment),
        )
        if (pendingAttendanceItems.length > 0) {
          const error = new Error(
            'Confirme no seu portal se compareceu ao agendamento anterior já encerrado antes de concluir um novo pedido.',
          )
          error.code = 'ATTENDANCE_PENDING'
          throw error
        }

        items.forEach((item) => {
          if (!item.selectedDate || !item.selectedTimeSlot) {
            throw new Error(`Selecione uma data e um horário disponíveis para ${item.examName}.`)
          }
          validateOrderItem(item)
        })

        const now = new Date().toISOString()
        const orderId = createReadableOrderId(stored)
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
            patientPhone: patient.phone || '(71) 99999-0000',
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
            paymentMethod:
              item.paymentType === 'CONVENIO'
                ? `Guia Convênio ${insurance?.name || ''}`.trim()
                : 'Pagamento direto na clínica (Particular)',
            descriptionPrep: item.descriptionPrep || '',
            prepInstructions: item.descriptionPrep || '',
            checkInToken: null,
            checkedInAt: null,
            checkInMethod: null,
            patientAttendance: null,
            attendanceDispute: false,
            createdAt: now,
            status: APPOINTMENT_STATUS.SOLICITADO,
          }
        })

        saveAppointmentsToStorage([...appointments, ...stored])
        ensureOrderFeeCreated(orderId, patient.id)
        resolve({ orderId, appointments, createdAt: now })
      } catch (error) {
        reject(error)
      }
    }, MOCK_DELAY_MS)
  })
}

export function getAppointmentsForPatient(patientId) {
  return getAppointments().then((appointments) =>
    appointments.filter((appointment) => appointment.patientId === patientId),
  )
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
            saved = normalizeAppointmentRecord({
              ...item,
              ...payload,
              updatedAt: new Date().toISOString(),
            })
            return saved
          }
          return item
        })
      } else {
        const appointmentId = `apt-${Date.now()}`
        const targetDate = payload.date || new Date().toISOString().split('T')[0]
        const targetTime = payload.time || '10:00'
        saved = normalizeAppointmentRecord({
          id: appointmentId,
          appointmentId,
          orderId: payload.orderId || createReadableOrderId(appointments),
          patientId: payload.patientId || 'pat-default',
          patientName: payload.patientName.trim(),
          patientPhone: payload.patientPhone || '(71) 99999-0000',
          patientCpf: payload.patientCpf || '***.***.***-**',
          serviceName: payload.serviceName.trim(),
          examName: payload.serviceName.trim(),
          serviceCategory: payload.serviceCategory || 'outros',
          date: targetDate,
          selectedDate: targetDate,
          time: targetTime,
          selectedTimeSlot: targetTime,
          status: payload.status || APPOINTMENT_STATUS.SOLICITADO,
          paymentType: payload.insurance && payload.insurance !== 'Particular' ? 'CONVENIO' : 'PARTICULAR',
          insurance: payload.insurance || 'Particular',
          price: parseFloat(payload.price) || 100.0,
          paymentMethod: payload.paymentMethod || 'Pagamento direto na clínica',
          prepInstructions: payload.prepInstructions || 'Trazer documento com foto.',
          descriptionPrep: payload.prepInstructions || 'Trazer documento com foto.',
          notes: payload.notes || '',
          createdAt: new Date().toISOString(),
        })
        updatedList = [saved, ...appointments]
      }

      saveAppointmentsToStorage(updatedList)
      resolve(saved)
    }, MOCK_DELAY_MS)
  })
}

/**
 * Transição de status da Máquina de Estados (SPEC-09 §4.1):
 * SOLICITADO -> CONFIRMADO_CLINICA (gera checkInToken de 6 chars por orderId e ativa orderFee -> PENDENTE_PAGAMENTO)
 * CONFIRMADO_CLINICA -> REALIZADO (exige checkedInAt preenchido) | NAO_COMPARECEU | CANCELADO
 * NAO_COMPARECEU -> REALIZADO (somente via checkInByToken / MANUAL_REVERSAL)
 */
export function updateAppointmentStatus(id, newStatus, reasonOrOptions = '') {
  const options =
    typeof reasonOrOptions === 'string'
      ? { reason: reasonOrOptions }
      : reasonOrOptions || {}

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const appointments = loadAppointmentsFromStorage()
      const appointment = appointments.find((item) => item.id === id)

      if (!appointment) {
        reject(new Error('Agendamento não encontrado.'))
        return
      }

      const role = options.role || 'CLINIC'
      const checkedInAt = options.checkedInAt || appointment.checkedInAt
      const checkInMethod = options.checkInMethod || appointment.checkInMethod

      if (
        !canTransition(appointment.status, newStatus, role, {
          checkedInAt,
          checkInMethod,
        })
      ) {
        let message = 'Esta alteração não é permitida para o status atual do agendamento.'
        if (
          appointment.status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA &&
          newStatus === APPOINTMENT_STATUS.REALIZADO &&
          !checkedInAt
        ) {
          message = 'Registre primeiro a chegada (check-in por token ou busca manual) antes de marcar o exame como realizado.'
        } else if (
          appointment.status === APPOINTMENT_STATUS.NAO_COMPARECEU &&
          newStatus === APPOINTMENT_STATUS.REALIZADO
        ) {
          message = 'A reversão de ausência exige a validação presencial do token de 6 caracteres no guichê.'
        }
        reject(new Error(message))
        return
      }

      const now = new Date().toISOString()
      const orderKey = appointment.orderId || appointment.id
      let orderToken = appointment.checkInToken

      if (newStatus === APPOINTMENT_STATUS.CONFIRMADO_CLINICA) {
        if (!orderToken) {
          const siblingWithToken = appointments.find(
            (item) => (item.orderId || item.id) === orderKey && item.checkInToken,
          )
          orderToken =
            siblingWithToken?.checkInToken ||
            generateCheckInToken(appointments.map((item) => item.checkInToken))
        }
        activateOrderFeeOnConfirm(orderKey, appointment.patientId)
      }

      const attendanceDispute =
        (newStatus === APPOINTMENT_STATUS.NAO_COMPARECEU &&
          appointment.patientAttendance === PATIENT_ATTENDANCE.ATTENDED) ||
        (newStatus === APPOINTMENT_STATUS.REALIZADO &&
          appointment.patientAttendance === PATIENT_ATTENDANCE.NOT_ATTENDED) ||
        checkInMethod === CHECK_IN_METHOD.MANUAL_REVERSAL ||
        Boolean(appointment.attendanceDispute)

      const updatedItem = normalizeAppointmentRecord({
        ...appointment,
        status: newStatus,
        checkInToken: orderToken ?? appointment.checkInToken,
        checkedInAt:
          newStatus === APPOINTMENT_STATUS.REALIZADO
            ? checkedInAt || now
            : appointment.checkedInAt,
        checkInMethod:
          newStatus === APPOINTMENT_STATUS.REALIZADO
            ? checkInMethod || CHECK_IN_METHOD.TOKEN
            : appointment.checkInMethod,
        attendanceDispute,
        cancelReason: newStatus === APPOINTMENT_STATUS.CANCELADO ? options.reason || '' : appointment.cancelReason,
        updatedAt: now,
      })

      const updatedList = appointments.map((item) => {
        if (item.id === id) return updatedItem
        if (
          newStatus === APPOINTMENT_STATUS.CONFIRMADO_CLINICA &&
          orderToken &&
          (item.orderId || item.id) === orderKey &&
          !item.checkInToken
        ) {
          return { ...item, checkInToken: orderToken }
        }
        return item
      })

      saveAppointmentsToStorage(updatedList)

      if (newStatus === APPOINTMENT_STATUS.CANCELADO) {
        const orderItems = updatedList.filter((item) => (item.orderId || item.id) === orderKey)
        exemptOrderFeeIfAllCancelled(orderKey, orderItems)
      }

      resolve(updatedItem)
    }, MOCK_DELAY_MS)
  })
}

/**
 * Etapa 1 da recepção: valida token de 6 caracteres.
 * - Em CONFIRMADO_CLINICA: registra checkedInAt e checkInMethod = TOKEN (habilita "Marcar realizado").
 * - Em NAO_COMPARECEU: aplica reversão por prova de guichê (REALIZADO + MANUAL_REVERSAL + attendanceDispute).
 * - Após 5 erros seguidos, bloqueia busca por token até desbloqueio/uso da busca manual.
 */
export function checkInByToken(rawToken) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const attemptState = readTokenAttempts()
      if (attemptState.locked) {
        const error = new Error(
          'Validação por token bloqueada temporariamente após 5 tentativas inválidas. Utilize o check-in manual por nome ou CPF.',
        )
        error.code = 'TOKEN_LOCKED'
        reject(error)
        return
      }

      const token = String(rawToken ?? '').trim().toUpperCase()
      if (token.length !== 6) {
        reject(new Error('Informe o código completo de 6 caracteres.'))
        return
      }

      const appointments = loadAppointmentsFromStorage()
      const matches = appointments.filter(
        (item) => String(item.checkInToken ?? '').trim().toUpperCase() === token,
      )

      const eligible = matches.filter(
        (item) =>
          item.status === APPOINTMENT_STATUS.CONFIRMADO_CLINICA ||
          item.status === APPOINTMENT_STATUS.NAO_COMPARECEU,
      )

      if (eligible.length === 0) {
        const nextFailures = attemptState.failures + 1
        const locked = nextFailures >= MAX_TOKEN_FAILURES
        writeTokenAttempts({ failures: nextFailures, locked })
        const error = new Error(
          locked
            ? 'Limite de 5 tentativas inválidas atingido. Use a busca manual para confirmar a chegada do paciente.'
            : `Token não encontrado ou sem item elegível para check-in. Restam ${MAX_TOKEN_FAILURES - nextFailures} tentativa(s).`,
        )
        error.code = locked ? 'TOKEN_LOCKED' : 'TOKEN_INVALID'
        reject(error)
        return
      }

      resetTokenCheckInLock()
      const now = new Date().toISOString()
      const touchedIds = new Set(eligible.map((item) => item.id))
      const updatedItems = []

      const updatedList = appointments.map((item) => {
        if (!touchedIds.has(item.id)) return item

        if (item.status === APPOINTMENT_STATUS.NAO_COMPARECEU) {
          const reversed = normalizeAppointmentRecord({
            ...item,
            status: APPOINTMENT_STATUS.REALIZADO,
            checkedInAt: now,
            checkInMethod: CHECK_IN_METHOD.MANUAL_REVERSAL,
            attendanceDispute: true,
            updatedAt: now,
          })
          updatedItems.push(reversed)
          return reversed
        }

        const checkedIn = normalizeAppointmentRecord({
          ...item,
          checkedInAt: item.checkedInAt || now,
          checkInMethod: item.checkInMethod || CHECK_IN_METHOD.TOKEN,
          updatedAt: now,
        })
        updatedItems.push(checkedIn)
        return checkedIn
      })

      saveAppointmentsToStorage(updatedList)
      resolve({
        token,
        updatedItems,
        reversedCount: updatedItems.filter(
          (item) => item.checkInMethod === CHECK_IN_METHOD.MANUAL_REVERSAL,
        ).length,
      })
    }, MOCK_DELAY_MS)
  })
}

/** Etapa 1 alternativa: check-in manual registrado com justificativa pela clínica. */
export function manualCheckIn(appointmentId, reason = 'Paciente identificado no guichê sem token') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const appointments = loadAppointmentsFromStorage()
      const target = appointments.find((item) => item.id === appointmentId)
      if (!target) {
        reject(new Error('Agendamento não encontrado.'))
        return
      }
      if (target.status !== APPOINTMENT_STATUS.CONFIRMADO_CLINICA) {
        reject(new Error('O check-in manual só pode ser registrado para vagas confirmadas.'))
        return
      }

      const now = new Date().toISOString()
      const updatedItem = normalizeAppointmentRecord({
        ...target,
        checkedInAt: now,
        checkInMethod: CHECK_IN_METHOD.MANUAL,
        manualCheckInReason: reason?.trim() || 'Identificado no guichê sem token',
        updatedAt: now,
      })

      saveAppointmentsToStorage(
        appointments.map((item) => (item.id === appointmentId ? updatedItem : item)),
      )
      resetTokenCheckInLock()
      resolve(updatedItem)
    }, MOCK_DELAY_MS)
  })
}

/** Declaração de comparecimento feita pelo paciente apenas para itens passados ainda em CONFIRMADO_CLINICA. */
export function submitPatientAttendance(appointmentId, attendance) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!Object.values(PATIENT_ATTENDANCE).includes(attendance)) {
        reject(new Error('Opção de comparecimento inválida.'))
        return
      }

      const appointments = loadAppointmentsFromStorage()
      const target = appointments.find((item) => item.id === appointmentId)
      if (!target) {
        reject(new Error('Agendamento não encontrado.'))
        return
      }
      if (!shouldPromptPatientAttendance(target)) {
        reject(new Error('Este agendamento não está elegível para declaração do paciente.'))
        return
      }

      const now = new Date().toISOString()
      const updatedItem = normalizeAppointmentRecord({
        ...target,
        patientAttendance: attendance,
        patientAttendanceAt: now,
        updatedAt: now,
      })

      saveAppointmentsToStorage(
        appointments.map((item) => (item.id === appointmentId ? updatedItem : item)),
      )
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
