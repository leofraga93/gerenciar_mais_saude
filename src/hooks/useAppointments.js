import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  checkInByToken,
  deleteAppointment,
  getAppointments,
  manualCheckIn,
  updateAppointmentStatus,
} from '../services/appointmentService'
import { appointmentsQueryKey } from '../constants/appointmentQueryKeys'
import { PATIENT_APPOINTMENTS_QUERY_KEY } from './usePatientAppointments'
import { ORDER_FEES_QUERY_KEY } from './useOrderFees'

export const APPOINTMENTS_QUERY_KEY = appointmentsQueryKey

function invalidateAllAppointmentRelatedQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
  queryClient.invalidateQueries({ queryKey: PATIENT_APPOINTMENTS_QUERY_KEY })
  queryClient.invalidateQueries({ queryKey: ORDER_FEES_QUERY_KEY })
}

/** Leitura dos agendamentos mock. */
export function useAppointments() {
  return useQuery({
    queryKey: APPOINTMENTS_QUERY_KEY,
    queryFn: getAppointments,
  })
}

/**
 * Transição de status via Máquina de Estados (SPEC-09).
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newStatus, reason, role, checkInMethod, checkedInAt }) =>
      updateAppointmentStatus(id, newStatus, {
        reason,
        role,
        checkInMethod,
        checkedInAt,
      }),
    onSuccess: () => invalidateAllAppointmentRelatedQueries(queryClient),
  })
}

/** Etapa 1 na recepção: check-in presencial por token de 6 caracteres (ou reversão). */
export function useCheckInByToken() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (token) => checkInByToken(token),
    onSuccess: () => invalidateAllAppointmentRelatedQueries(queryClient),
  })
}

/** Etapa 1 alternativa: check-in manual registrado com justificativa. */
export function useManualCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appointmentId, reason }) => manualCheckIn(appointmentId, reason),
    onSuccess: () => invalidateAllAppointmentRelatedQueries(queryClient),
  })
}

/** Remove permanentemente um agendamento do mock (ação administrativa). */
export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteAppointment(id),
    onSuccess: () => invalidateAllAppointmentRelatedQueries(queryClient),
  })
}
