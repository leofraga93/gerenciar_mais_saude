export function inputClassName(hasError) {
  const base = 'mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2'
  return hasError
    ? `${base} border-red-400 focus:border-red-500 focus:ring-red-100`
    : `${base} border-slate-300 focus:border-emerald-500 focus:ring-emerald-200`
}
