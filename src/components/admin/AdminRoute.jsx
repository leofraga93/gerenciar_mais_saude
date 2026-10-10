import { Navigate } from 'react-router-dom'
import { ADMIN_SESSION_STORAGE_KEY } from '../../constants/adminAccess'

function AdminRoute({ children }) {
  let isAuthenticated = false
  try {
    isAuthenticated = window.sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true'
  } catch {
    isAuthenticated = false
  }

  return isAuthenticated ? children : <Navigate to="/" replace />
}

export default AdminRoute
