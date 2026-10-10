export const EXAM_CART_STORAGE_KEY = 'gms_exam_cart'

function getSessionStorage() {
  if (typeof window === 'undefined') return null

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function createCartItemId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `cart-item-${crypto.randomUUID()}`
  }

  return `cart-item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getCartItems() {
  const storage = getSessionStorage()
  if (!storage) return []

  try {
    const storedItems = storage.getItem(EXAM_CART_STORAGE_KEY)
    if (!storedItems) return []

    const parsedItems = JSON.parse(storedItems)
    return Array.isArray(parsedItems) ? parsedItems : []
  } catch {
    return []
  }
}

function saveCartItems(items) {
  const storage = getSessionStorage()
  if (!storage) return items

  try {
    storage.setItem(EXAM_CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Não foi possível salvar o carrinho de exames na sessão:', error)
  }

  return items
}

export function addCartItem(item) {
  if (!item?.examId || !item?.examName) {
    throw new Error('O exame precisa ter examId e examName para entrar no carrinho.')
  }

  const cartItem = {
    ...item,
    cartItemId: item.cartItemId || createCartItemId(),
    selectedDate: item.selectedDate || '',
    selectedTimeSlot: item.selectedTimeSlot || '',
    selectedPeriod: item.selectedPeriod || '',
    paymentType: item.paymentType || 'PARTICULAR',
    selectedInsuranceId: item.selectedInsuranceId || '',
  }

  return saveCartItems([...getCartItems(), cartItem])
}

export function updateCartItem(cartItemId, updates) {
  const updatedItems = getCartItems().map((item) =>
    item.cartItemId === cartItemId ? { ...item, ...updates, cartItemId } : item
  )

  return saveCartItems(updatedItems)
}

export function removeCartItem(cartItemId) {
  return saveCartItems(getCartItems().filter((item) => item.cartItemId !== cartItemId))
}

export function clearCartItems() {
  return saveCartItems([])
}
