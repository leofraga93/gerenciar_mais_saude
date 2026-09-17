import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { inputClassName } from '../../utils/formUtils'

function PasswordInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  hasError = false,
  autoComplete = 'current-password',
  placeholder = 'Digite sua senha',
  disabled = false,
  required = false,
}) {
  const [isVisible, setIsVisible] = useState(false)

  const revealPassword = (event) => {
    event.preventDefault()
    setIsVisible(true)
  }

  const hidePassword = () => {
    setIsVisible(false)
  }

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={isVisible ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`${inputClassName(hasError)} pr-10`}
      />
      <button
        type="button"
        tabIndex={-1}
        onPointerDown={revealPassword}
        onPointerUp={hidePassword}
        onPointerLeave={hidePassword}
        onPointerCancel={hidePassword}
        aria-label="Segure para mostrar a senha"
        className="absolute right-2 top-1/2 -translate-y-1/2 touch-none select-none rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        {isVisible ? (
          <EyeOff className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Eye className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

export default PasswordInput
