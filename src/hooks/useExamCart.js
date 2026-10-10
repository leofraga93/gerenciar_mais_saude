import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addCartItem,
  clearCartItems,
  getCartItems,
  removeCartItem,
  updateCartItem,
} from '../data/cartStore'

export const EXAM_CART_QUERY_KEY = ['patient', 'exam-cart']

function useCartMutation(mutationFn) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (items) => {
      queryClient.setQueryData(EXAM_CART_QUERY_KEY, items)
    },
  })
}

export function useExamCart() {
  const cartQuery = useQuery({
    queryKey: EXAM_CART_QUERY_KEY,
    queryFn: getCartItems,
    staleTime: Infinity,
  })

  const addItemMutation = useCartMutation(addCartItem)
  const updateItemMutation = useCartMutation(({ cartItemId, updates }) =>
    updateCartItem(cartItemId, updates)
  )
  const removeItemMutation = useCartMutation(removeCartItem)
  const clearCartMutation = useCartMutation(clearCartItems)

  const items = cartQuery.data ?? []

  return {
    items,
    itemCount: items.length,
    isLoading: cartQuery.isLoading,
    addItem: (item) => addItemMutation.mutateAsync(item),
    updateItem: (cartItemId, updates) =>
      updateItemMutation.mutateAsync({ cartItemId, updates }),
    removeItem: (cartItemId) => removeItemMutation.mutateAsync(cartItemId),
    clearCart: () => clearCartMutation.mutateAsync(),
    isMutating:
      addItemMutation.isPending ||
      updateItemMutation.isPending ||
      removeItemMutation.isPending ||
      clearCartMutation.isPending,
  }
}
