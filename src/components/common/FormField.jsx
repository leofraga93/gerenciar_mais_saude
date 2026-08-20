export function inputClassName(hasError) {
  const base = 'mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2'
  return hasError
    ? `${base} border-red-400 focus:border-red-500 focus:ring-red-100`
    : `${base} border-slate-300 focus:border-emerald-500 focus:ring-emerald-200`
}

function FormField({ label, htmlFor, required, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      {error ? (
        <p className="mt-1 text-sm text-red-600" role="alert" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default FormField
