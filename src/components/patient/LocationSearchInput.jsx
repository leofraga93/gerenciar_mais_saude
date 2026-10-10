import { useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'
import { findMockLocations } from '../../data/locationCatalog'

function LocationSearchInput({ value, onChange }) {
  const [query, setQuery] = useState(value.label)
  const [isOpen, setIsOpen] = useState(false)
  const options = useMemo(() => findMockLocations(query), [query])

  const selectLocation = (location) => {
    onChange(location)
    setQuery(location.label)
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      <label htmlFor="patient-search-location" className="block text-sm font-medium text-slate-700">
        Localização para buscar clínicas
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          id="patient-search-location"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="patient-location-options"
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          placeholder="Digite endereço, bairro ou CEP"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
        />
        {isOpen && options.length > 0 && (
          <ul id="patient-location-options" role="listbox" className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            {options.map((location) => (
              <li key={location.id} role="option" aria-selected={location.id === value.id}>
                <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectLocation(location)} className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none">
                  {location.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        {isOpen && query.trim() && options.length === 0 && (
          <p role="status" className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-lg">
            Nenhuma região mock corresponde à busca. Escolha uma das regiões disponíveis.
          </p>
        )}
      </div>
      <p className="text-xs text-slate-500">As opções e distâncias desta etapa usam referências locais de demonstração.</p>
    </div>
  )
}

export default LocationSearchInput
