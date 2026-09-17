import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  clearRegisteredPatient,
  getPatientProfile,
  registerPatient,
} from '../services/patientService'

export const PATIENT_QUERY_KEYS = {
  profile: ['patient', 'profile'],
}

/**
 * Hook para consultar o perfil ativo do paciente.
 */
export function usePatientProfile() {
  return useQuery({
    queryKey: PATIENT_QUERY_KEYS.profile,
    queryFn: getPatientProfile,
  })
}

/**
 * Hook mutation para registrar ou atualizar o paciente.
 */
export function useRegisterPatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: registerPatient,
    onSuccess: (savedPatient) => {
      queryClient.setQueryData(PATIENT_QUERY_KEYS.profile, savedPatient)
      queryClient.invalidateQueries({ queryKey: PATIENT_QUERY_KEYS.profile })
    },
  })
}

/**
 * Hook mutation para encerrar a sessão do paciente.
 */
export function useLogoutPatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: clearRegisteredPatient,
    onSuccess: () => {
      queryClient.setQueryData(PATIENT_QUERY_KEYS.profile, null)
      queryClient.invalidateQueries({ queryKey: PATIENT_QUERY_KEYS.profile })
    },
  })
}
