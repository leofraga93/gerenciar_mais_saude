import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins } from '@fortawesome/free-solid-svg-icons'

/**
 * Componente de seleção de faixa de preço com slider duplo e inputs numéricos diretos.
 */
export function PriceRangeFilter({
  baseMin = 0,
  baseMax = 1000,
  minPrice,
  maxPrice,
  onChangeMin,
  onChangeMax,
}) {
  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)

  useEffect(() => {
    setLocalMin(minPrice)
  }, [minPrice])

  useEffect(() => {
    setLocalMax(maxPrice)
  }, [maxPrice])

  const handleSliderMin = (e) => {
    const val = Math.min(Number(e.target.value), localMax)
    setLocalMin(val)
    onChangeMin(val)
  }

  const handleSliderMax = (e) => {
    const val = Math.max(Number(e.target.value), localMin)
    setLocalMax(val)
    onChangeMax(val)
  }

  const handleInputMinBlur = () => {
    let val = Number(localMin)
    if (isNaN(val) || val < baseMin) val = baseMin
    if (val > localMax) val = localMax
    setLocalMin(val)
    onChangeMin(val)
  }

  const handleInputMaxBlur = () => {
    let val = Number(localMax)
    if (isNaN(val) || val > baseMax) val = baseMax
    if (val < localMin) val = localMin
    setLocalMax(val)
    onChangeMax(val)
  }

  // Porcentagens para estilizar o preenchimento da barra verde
  const rangeSpan = Math.max(1, baseMax - baseMin)
  const minPercent = Math.max(0, Math.min(100, ((localMin - baseMin) / rangeSpan) * 100))
  const maxPercent = Math.max(0, Math.min(100, ((localMax - baseMin) / rangeSpan) * 100))

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <FontAwesomeIcon icon={faCoins} className="h-3.5 w-3.5 text-emerald-600" />
          <span>Faixa de Valor de Referência:</span>
        </div>
        <span className="text-xs font-semibold text-emerald-700">
          R$ {Number(localMin || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })} — R${' '}
          {Number(localMax || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
        </span>
      </div>

      {/* Slider Duplo com Trilha Colorida */}
      <div className="relative py-2">
        <div className="relative h-2 w-full rounded-full bg-slate-200">
          <div
            className="absolute h-2 rounded-full bg-emerald-500"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />
          <input
            type="range"
            min={baseMin}
            max={baseMax}
            value={localMin}
            onChange={handleSliderMin}
            className="pointer-events-none absolute -top-1 left-0 h-4 w-full appearance-none bg-transparent accent-emerald-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-emerald-700 [&::-webkit-slider-thumb]:shadow-md"
          />
          <input
            type="range"
            min={baseMin}
            max={baseMax}
            value={localMax}
            onChange={handleSliderMax}
            className="pointer-events-none absolute -top-1 left-0 h-4 w-full appearance-none bg-transparent accent-emerald-600 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-emerald-700 [&::-webkit-slider-thumb]:shadow-md"
          />
        </div>
      </div>

      {/* Inputs Numéricos Diretos */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-bold text-slate-300">De</span>
        <div className="flex flex-1 items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20">
          
          <span className="text-xs font-medium text-slate-400 mr-1">R$</span>
          <input
            type="number"
            min={baseMin}
            max={localMax}
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={handleInputMinBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleInputMinBlur()}
            className="w-full text-xs font-semibold text-slate-800 outline-none"
          />
        </div>
        <span className="text-xs font-bold text-slate-300">até</span>
        <div className="flex flex-1 items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20">
          <span className="text-xs font-medium text-slate-400 mr-1">R$</span>
          <input
            type="number"
            min={localMin}
            max={baseMax}
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={handleInputMaxBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleInputMaxBlur()}
            className="w-full text-xs font-semibold text-slate-800 outline-none"
          />
        </div>
      </div>
    </div>
  )
}
