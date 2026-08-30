import { Search, X, RotateCcw } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons'
import { FilterButtonGroup } from './FilterButtonGroup'
import { PriceRangeFilter } from './PriceRangeFilter'

export function CatalogFilters({
  searchTerm,
  onSearchChange,
  categoryOptions,
  selectedCategory,
  onCategoryChange,
  insuranceOptions,
  selectedInsurance,
  onInsuranceChange,
  baseMinPrice,
  baseMaxPrice,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  hasActiveFilters,
  onResetFilters,
  displayedCount,
  totalFilteredCount,
}) {
  return (
    <div className="space-y-5">
      {/* Linha de Busca e Reset Minimalista */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome do exame, código TUSS ou preparo (ex: Jejum, Hemograma, Ecocardiograma)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status e Botão Minimalista de Limpar Filtros */}
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="text-xs font-medium text-slate-500">
            Exibindo <strong>{displayedCount}</strong> de {totalFilteredCount} itens
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
              title="Restaurar todos os filtros"
            >
              <RotateCcw className="h-3 w-3 text-rose-500 transition group-hover:rotate-180" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Categorias (Botões no padrão de abas) */}
      <div className="space-y-1.5 border-b border-slate-100 pb-3">
        <FilterButtonGroup
          label="Categoria do Procedimento:"
          options={categoryOptions}
          selectedValue={selectedCategory}
          onChange={onCategoryChange}
        />
      </div>

      {/* Grade com Convênio (Pills) e Faixa de Preço (Slider Duplo + Inputs) */}
      <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
        {/* Filtro por Convênio (Botões no mesmo padrão) */}
        <div className="space-y-1.5 lg:col-span-7">
          <FilterButtonGroup
            label="Plano / Convênio de Saúde:"
            icon={<FontAwesomeIcon icon={faCreditCard} className="h-3.5 w-3.5" />}
            options={insuranceOptions}
            selectedValue={selectedInsurance}
            onChange={onInsuranceChange}
          />
        </div>

        {/* Filtro por Faixa de Valor (Slider Duplo + Inputs) */}
        <div className="lg:col-span-5">
          <PriceRangeFilter
            baseMin={baseMinPrice}
            baseMax={baseMaxPrice}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onChangeMin={onMinPriceChange}
            onChangeMax={onMaxPriceChange}
          />
        </div>
      </div>
    </div>
  )
}
