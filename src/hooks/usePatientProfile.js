import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  clearRegisteredPatient,
  getPatientProfile,
  registerPatient,
  updatePatientProfile,
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
 * Hook mutation para registrar o paciente.
 */
export function useRegisterPatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: registerPatient,
    onSuccess: (savedPatient) => {
      queryClient.setQueryData(PATIENT_QUERY_KEYS.profile, savedPatient)
      queryClient.invalidateQueries({ queryKey: PATIENT_QUERY_KEYS.profile })
      queryClient.invalidateQueries({ queryKey: ['landing', 'registered-profiles'] })
    },
  })
}

/**
 * Hook mutation para editar e-mail, telefone e convênios mantendo CPF fixo.
 */
export function useUpdatePatientProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePatientProfile,
    onSuccess: (updatedPatient) => {
      queryClient.setQueryData(PATIENT_QUERY_KEYS.profile, updatedPatient)
      queryClient.invalidateQueries({ queryKey: PATIENT_QUERY_KEYS.profile })
      queryClient.invalidateQueries({ queryKey: ['landing', 'registered-profiles'] })
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
