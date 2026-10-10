import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import FormField from '../common/FormField'
import PasswordInput from '../common/PasswordInput'
import { inputClassName } from '../../utils/formUtils'
import { ADMIN_MOCK_PASSWORD, ADMIN_MOCK_USERNAME } from '../../constants/adminAccess'

function AdminAccessModal({ onClose, onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (username.trim() !== ADMIN_MOCK_USERNAME || password !== ADMIN_MOCK_PASSWORD) {
      setError('Usuário ou senha incorretos.')
      return
    }
    setError('')
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="admin-access-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id="admin-access-title" className="text-2xl font-bold text-slate-900">Acesso administrativo</h2>
            <p className="mt-1 text-sm text-slate-600">Entre para moderar os cadastros de clínicas.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar acesso administrativo" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"><X className="h-5 w-5" aria-hidden="true" /></button>
        </header>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormField label="Usuário" htmlFor="admin-username" required>
            <input id="admin-username" name="username" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} className={inputClassName(Boolean(error))} />
          </FormField>
          <FormField label="Senha" htmlFor="admin-password" required error={error}>
            <PasswordInput id="admin-password" name="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} hasError={Boolean(error)} />
          </FormField>
          <button type="submit" className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">Entrar</button>
        </form>
      </section>
    </div>
  )
}

export default AdminAccessModal
