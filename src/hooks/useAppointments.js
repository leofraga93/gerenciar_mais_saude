import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteAppointment,
  getAppointments,
  updateAppointmentStatus,
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
 * Transição de status via Máquina de Estados.
 * Ao resolver, invalida o cache para forçar re-fetch.
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newStatus, reason }) =>
      updateAppointmentStatus(id, newStatus, reason),
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
