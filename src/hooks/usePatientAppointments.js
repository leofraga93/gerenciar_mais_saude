import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAppointmentOrder, getAppointmentsForPatient } from '../services/appointmentService'

export const PATIENT_APPOINTMENTS_QUERY_KEY = ['patient', 'appointments']

export function usePatientAppointments(patientId) {
  return useQuery({
    queryKey: [...PATIENT_APPOINTMENTS_QUERY_KEY, patientId],
    queryFn: () => getAppointmentsForPatient(patientId),
    enabled: Boolean(patientId),
  })
}

export function useCreateAppointmentOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAppointmentOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: PATIENT_APPOINTMENTS_QUERY_KEY })
      return order
    },
  })
}
