import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAppointmentOrder,
  getAppointmentsForPatient,
  submitPatientAttendance,
} from '../services/appointmentService'
import { appointmentsQueryKey } from '../constants/appointmentQueryKeys'
import { ORDER_FEES_QUERY_KEY } from './useOrderFees'

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
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKey })
      queryClient.invalidateQueries({ queryKey: PATIENT_APPOINTMENTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ORDER_FEES_QUERY_KEY })
      return order
    },
  })
}

export function useSubmitPatientAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appointmentId, attendance }) =>
      submitPatientAttendance(appointmentId, attendance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKey })
      queryClient.invalidateQueries({ queryKey: PATIENT_APPOINTMENTS_QUERY_KEY })
    },
  })
}
