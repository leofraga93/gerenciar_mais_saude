import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { servicesQueryKey } from '../constants/serviceQueryKeys'
import {
  deleteClinicService,
  getClinicServices,
  saveClinicService,
  toggleClinicServiceStatus,
} from '../services/serviceCatalogService'

export function useServices() {
  return useQuery({
    queryKey: servicesQueryKey,
    queryFn: getClinicServices,
  })
}

export function useSaveService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveClinicService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey })
    },
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteClinicService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey })
    },
  })
}

export function useToggleServiceStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleClinicServiceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey })
    },
  })
}
