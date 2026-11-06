import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteAppointment,
  getAppointments,
  updateAppointmentStatus,
  checkInAppointment,
} from '../services/appointmentService'
import { appointmentsQueryKey } from '../constants/appointmentQueryKeys'

export const APPOINTMENTS_QUERY_KEY = appointmentsQueryKey

/** Leitura dos agendamentos mock. */
export function useAppointments() {
  return useQuery({
    queryKey: APPOINTMENTS_QUERY_KEY,
    queryFn: getAppointments,
  })
}

/**
 * Transição de status via Máquina de Estados (SPEC-09).
 * Ao resolver, invalida o cache para sincronizar a UI.
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newStatus, reason, role, checkInMethod, token }) =>
      updateAppointmentStatus(id, newStatus, { reason, role, checkInMethod, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['fee-ledger'] })
    },
  })
}

/**
 * Check-in de agendamento (Passo 1: confirmação de chegada).
 * Registra checkedInAt e habilita a conclusão do atendimento.
 */
export function useCheckInAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, token, method }) => checkInAppointment(id, { token, method }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
    },
  })
}

/** Remove permanentemente um agendamento do mock (ação administrativa). */
export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
    },
  })
}
