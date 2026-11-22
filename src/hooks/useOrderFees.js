import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getOrderFeesForPatient, payOrderFee, waiveOrderFee } from '../services/orderFeeService'
import { PATIENT_APPOINTMENTS_QUERY_KEY } from './usePatientAppointments'
import { APPOINTMENTS_QUERY_KEY } from './useAppointments'

export const ORDER_FEES_QUERY_KEY = ['patient', 'order-fees']

export function usePatientOrderFees(patientId) {
  return useQuery({
    queryKey: [...ORDER_FEES_QUERY_KEY, patientId],
    queryFn: () => getOrderFeesForPatient(patientId),
    enabled: Boolean(patientId),
  })
}

export function usePayOrderFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId) => payOrderFee(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_FEES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: PATIENT_APPOINTMENTS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
    },
  })
}

export function useWaiveOrderFee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, reason }) => waiveOrderFee(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDER_FEES_QUERY_KEY })
    },
  })
}
