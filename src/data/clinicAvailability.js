import { DEFAULT_OPERATING_DAYS } from './clinicProfileData'

const WEEKDAY_KEYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
const AVAILABILITY_WINDOW_DAYS = 30

export const APPOINTMENT_PERIODS = [
  { id: 'MANHA', label: 'Manhã' },
  { id: 'TARDE', label: 'Tarde' },
  { id: 'NOITE', label: 'Noite' },
]

const PERIOD_TIME_RANGES = {
  MANHA: { start: '00:00', end: '12:00' },
  TARDE: { start: '12:00', end: '18:00' },
  NOITE: { start: '18:00', end: '24:00' },
}

export function filterSlotsByPeriod(timeSlots, period) {
  if (!period) return timeSlots
  const range = PERIOD_TIME_RANGES[period]
  if (!range) return []
  return timeSlots.filter((timeSlot) => timeSlot >= range.start && timeSlot < range.end)
}

/**
 * Slots mock efetivamente oferecidos por cada clínica para o catálogo público.
 * Esta lista representa disponibilidade demonstrativa; a reserva concorrente
 * será integrada ao backend quando a agenda real estiver disponível.
 */
export const MOCK_CLINIC_APPOINTMENT_SLOTS = {
  'cli-1': {
    seg: ['08:00', '09:30', '14:00', '15:30'],
    ter: ['08:30', '10:00', '13:30', '15:00'],
    qua: ['08:00', '09:30', '14:00', '15:30'],
    qui: ['08:30', '10:00', '13:30', '15:00', '18:00'],
    sex: ['08:00', '09:30', '14:00', '17:30'],
    sab: ['08:00', '10:00'],
  },
  'cli-2': {
    seg: ['07:00', '08:00', '09:00', '10:00'],
    ter: ['07:30', '08:30', '09:30', '10:30'],
    qua: ['07:00', '08:00', '09:00', '10:00', '18:00'],
    qui: ['07:30', '08:30', '09:30', '10:30'],
    sex: ['07:00', '08:00', '09:00', '10:00'],
    sab: ['07:30', '08:30', '09:30'],
  },
  'cli-3': {
    seg: ['08:00', '10:00', '14:00', '16:00'],
    ter: ['08:30', '10:30', '14:30', '16:30'],
    qua: ['08:00', '10:00', '14:00', '16:00'],
    qui: ['08:30', '10:30', '14:30', '16:30', '18:00'],
    sex: ['08:00', '10:00', '14:00', '17:30'],
  },
  'cli-4': {
    seg: ['08:00', '09:00', '13:00', '14:00'],
    ter: ['08:30', '09:30', '13:30', '14:30'],
    qua: ['08:00', '09:00', '13:00', '14:00'],
    qui: ['08:30', '09:30', '13:30', '14:30'],
    sex: ['08:00', '09:00', '13:00'],
    sab: ['08:00', '09:00'],
  },
  'cli-5': {
    seg: ['08:00', '10:00', '14:00', '16:00'],
    ter: ['08:30', '10:30', '14:30', '16:30'],
    qua: ['08:00', '10:00', '14:00', '16:00'],
    qui: ['08:30', '10:30', '14:30', '16:30'],
    sex: ['08:00', '10:00', '14:00'],
  },
}

function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Retorna somente as datas e os horários mock publicados pela clínica. */
export function getAvailableClinicSlots(clinicId, startDate = new Date(), period = '') {
  const clinicSchedule = MOCK_CLINIC_APPOINTMENT_SLOTS[clinicId]
  if (!clinicSchedule) return []
  const operatingDays = DEFAULT_OPERATING_DAYS.filter((day) => day.active).map((day) => day.key)

  const availableDays = []

  for (let dayOffset = 0; dayOffset < AVAILABILITY_WINDOW_DAYS; dayOffset += 1) {
    const date = new Date(startDate)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + dayOffset)

    const weekdayKey = WEEKDAY_KEYS[date.getDay()]
    if (!operatingDays.includes(weekdayKey)) continue
    let timeSlots = filterSlotsByPeriod(clinicSchedule[weekdayKey] || [], period)
    if (dayOffset === 0) {
      const currentTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`
      timeSlots = timeSlots.filter((timeSlot) => timeSlot > currentTime)
    }
    if (timeSlots.length === 0) continue

    availableDays.push({ date: formatLocalDate(date), timeSlots })
  }

  return availableDays
}
