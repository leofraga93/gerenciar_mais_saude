import { useMemo, useState } from 'react'
import { Activity, ArrowRight, CheckCircle2, Clock3, FileText, FlaskConical, HeartPulse, Stethoscope } from 'lucide-react'
import { STANDARD_PROCEDURES_CATALOG } from '../../data/standardCatalog'
import { MOCK_SERVICES_CATALOG } from '../../data/catalogData'
import { DEFAULT_SEARCH_LOCATION_ID, MOCK_SEARCH_LOCATIONS, getHaversineDistanceKm } from '../../data/locationCatalog'
import { SERVICE_CATEGORIES } from '../../constants/catalogConstants'
import { INSURANCES, getInsuranceNames } from '../../data/insurances'
import { formatCurrencyBRL } from '../../utils/serviceValidation'
import { CatalogFilters } from '../catalog/CatalogFilters'
import { TestimonialsCarousel } from './TestimonialsCarousel'
import LocationSearchInput from '../patient/LocationSearchInput'
import { APPOINTMENT_PERIODS, getAvailableClinicSlots } from '../../data/clinicAvailability'

const CLINIC_LOCATION_BY_NEIGHBORHOOD = {
  'Vilas do Atlântico': 'vilas-atlantico',
  'Estrada do Coco': 'estrada-coco',
  Centro: 'centro-lauro',
}

function getCategoryIcon(category) {
  switch (category) {
    case 'laboratorio':
      return <FlaskConical className="h-4 w-4 text-sky-600" aria-hidden="true" />
    case 'imagem':
      return <Activity className="h-4 w-4 text-emerald-600" aria-hidden="true" />
    case 'cardiologia':
      return <HeartPulse className="h-4 w-4 text-rose-600" aria-hidden="true" />
    case 'consultas':
      return <Stethoscope className="h-4 w-4 text-indigo-600" aria-hidden="true" />
    default:
      return <FileText className="h-4 w-4 text-teal-600" aria-hidden="true" />
  }
}

function getCategoryBadgeClass(category) {
  switch (category) {
    case 'laboratorio':
      return 'border-sky-200 bg-sky-50 text-sky-700'
    case 'imagem':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'cardiologia':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    case 'consultas':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
}

const CART_CATEGORY_BY_CATALOG_CATEGORY = {
  laboratorio: 'LAB',
  imagem: 'IMG',
  cardiologia: 'CARDIO',
  consultas: 'CONSULT',
  outros: 'OUTROS',
}

function getClinicService(exam) {
  return MOCK_SERVICES_CATALOG.find((item) => item.name === exam.name) ||
    MOCK_SERVICES_CATALOG.find((item) => item.tussCode === exam.tussCode)
}

function getClinicInsuranceIds(clinicService) {
  return (clinicService?.insurances || []).map((insuranceId) =>
    insuranceId.startsWith('ins-') ? insuranceId : `ins-${insuranceId}`
  )
}

function PatientNicheView({ onOpenAuth, onGoToSignup, onAddToCart }) {
  const allPrices = useMemo(
    () => STANDARD_PROCEDURES_CATALOG.map((item) => item.suggestedPrivatePrice || 0),
    []
  )
  const baseMinPrice = useMemo(() => Math.min(...allPrices), [allPrices])
  const baseMaxPrice = useMemo(() => Math.max(...allPrices), [allPrices])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedInsurance, setSelectedInsurance] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [minPrice, setMinPrice] = useState(baseMinPrice)
  const [maxPrice, setMaxPrice] = useState(baseMaxPrice)
  const [visibleCount, setVisibleCount] = useState(9)
  const [searchLocation, setSearchLocation] = useState(
    MOCK_SEARCH_LOCATIONS.find((location) => location.id === DEFAULT_SEARCH_LOCATION_ID)
  )

  const resetVisibleCount = (callback) => (value) => {
    callback(value)
    setVisibleCount(9)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedInsurance('all')
    setSelectedPeriod('all')
    setMinPrice(baseMinPrice)
    setMaxPrice(baseMaxPrice)
    setSearchLocation(MOCK_SEARCH_LOCATIONS.find((location) => location.id === DEFAULT_SEARCH_LOCATION_ID))
    setVisibleCount(9)
  }

  const filteredCatalog = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()

    return STANDARD_PROCEDURES_CATALOG.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const clinicService = getClinicService(item)
      const clinicInsuranceIds = getClinicInsuranceIds(clinicService)
      const matchesInsurance = selectedInsurance === 'all' || clinicInsuranceIds.includes(selectedInsurance)
      const matchesPeriod = selectedPeriod === 'all' || getAvailableClinicSlots(clinicService?.clinic.id, new Date(), selectedPeriod).length > 0
      const price = item.suggestedPrivatePrice || 0
      const matchesPrice = price >= minPrice && price <= maxPrice
      const matchesTerm =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.tussCode?.toLowerCase().includes(term) ||
        item.suggestedPrep?.toLowerCase().includes(term)

      return matchesCategory && matchesInsurance && matchesPeriod && matchesPrice && matchesTerm
    })
  }, [maxPrice, minPrice, searchTerm, selectedCategory, selectedInsurance, selectedPeriod])

  const orderedCatalog = useMemo(() => {
    return filteredCatalog
      .map((service, originalIndex) => {
        const clinicService = getClinicService(service)
        const clinicLocationId = CLINIC_LOCATION_BY_NEIGHBORHOOD[clinicService?.clinic.neighborhood]
        const clinicLocation = MOCK_SEARCH_LOCATIONS.find((location) => location.id === clinicLocationId)
        return {
          service,
          originalIndex,
          rating: clinicService?.clinic.rating || 0,
          distance: clinicLocation ? getHaversineDistanceKm(searchLocation, clinicLocation) : Number.POSITIVE_INFINITY,
        }
      })
      .sort((a, b) => {
        if (Number.isFinite(a.distance) !== Number.isFinite(b.distance)) {
          return Number.isFinite(a.distance) ? -1 : 1
        }
        const distanceDifference = a.distance - b.distance
        if (Number.isFinite(distanceDifference) && Math.abs(distanceDifference) > 0.001) return distanceDifference
        if (Math.abs(distanceDifference) <= 0.001) return b.rating - a.rating || a.originalIndex - b.originalIndex
        return a.originalIndex - b.originalIndex
      })
      .map(({ service }) => service)
  }, [filteredCatalog, searchLocation])

  const displayedCatalog = useMemo(
    () => orderedCatalog.slice(0, visibleCount),
    [orderedCatalog, visibleCount]
  )

  const categoryOptions = useMemo(
    () => [
      { id: 'all', label: 'Todos', count: STANDARD_PROCEDURES_CATALOG.length },
      ...SERVICE_CATEGORIES.map((category) => ({
        id: category.id,
        label: category.label,
        icon: getCategoryIcon(category.id),
        count: STANDARD_PROCEDURES_CATALOG.filter((item) => item.category === category.id).length,
      })),
    ],
    []
  )

  const insuranceOptions = useMemo(
    () => [
      { id: 'all', label: 'Todos os Planos', count: STANDARD_PROCEDURES_CATALOG.length },
      ...INSURANCES.map((insurance) => ({
        id: insurance.id,
        label: insurance.name,
        count: STANDARD_PROCEDURES_CATALOG.filter((item) => getClinicInsuranceIds(getClinicService(item)).includes(insurance.id)).length,
      })),
    ],
    []
  )

  const periodOptions = useMemo(() => [
    { id: 'all', label: 'Todos os períodos', count: STANDARD_PROCEDURES_CATALOG.length },
    ...APPOINTMENT_PERIODS.map((period) => ({
      ...period,
      count: STANDARD_PROCEDURES_CATALOG.filter((item) =>
        getAvailableClinicSlots(getClinicService(item)?.clinic.id, new Date(), period.id).length > 0
      ).length,
    })),
  ], [])

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    selectedInsurance !== 'all' ||
    selectedPeriod !== 'all' ||
    searchLocation.id !== DEFAULT_SEARCH_LOCATION_ID ||
    minPrice > baseMinPrice ||
    maxPrice < baseMaxPrice

  return (
    <div className="w-full flex-1 space-y-16 pb-16">
      <section className="relative isolate overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=2000&q=85"
          alt="Profissional de saúde em um ambiente de atendimento"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-950/85 via-emerald-900/70 to-slate-900/45" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-14 md:grid-cols-12 md:px-10 md:py-20">
          <div className="space-y-5 md:col-span-7">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-200">Sua jornada de cuidado</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
              Encontre exames e serviços de saúde com mais clareza.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/90">
              Compare valores de referência, orientações de preparo e convênios aceitos pela rede.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={onGoToSignup}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                Cadastre-se <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('patient')}
                className="rounded-lg border border-white/70 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              >
                Entrar
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm md:col-span-5">
            <h2 className="text-lg font-semibold text-slate-900">O que você encontra</h2>
            <ul className="mt-5 space-y-4 text-sm text-slate-600">
              <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /> Busca por nome e código TUSS</li>
              <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /> Preços de referência e convênios aceitos</li>
              <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /> Orientações para se preparar para o atendimento</li>
            </ul>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-16 px-6 md:px-10">
        <section id="catalogo-paciente" className="scroll-mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Catálogo da rede</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Encontre o exame ou serviço que procura</h2>
            <p className="mt-2 text-sm text-slate-600 md:text-base">Filtre por categoria, convênio e valor de referência.</p>
          </div>

          <LocationSearchInput value={searchLocation} onChange={(location) => { setSearchLocation(location); setVisibleCount(9) }} />

          <CatalogFilters
            searchTerm={searchTerm}
            onSearchChange={resetVisibleCount(setSearchTerm)}
            categoryOptions={categoryOptions}
            selectedCategory={selectedCategory}
            onCategoryChange={resetVisibleCount(setSelectedCategory)}
            insuranceOptions={insuranceOptions}
            selectedInsurance={selectedInsurance}
            onInsuranceChange={resetVisibleCount(setSelectedInsurance)}
            periodOptions={periodOptions}
            selectedPeriod={selectedPeriod}
            onPeriodChange={resetVisibleCount(setSelectedPeriod)}
            baseMinPrice={baseMinPrice}
            baseMaxPrice={baseMaxPrice}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={resetVisibleCount(setMinPrice)}
            onMaxPriceChange={resetVisibleCount(setMaxPrice)}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
            displayedCount={displayedCatalog.length}
            totalFilteredCount={filteredCatalog.length}
          />

          {displayedCatalog.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">Nenhum procedimento encontrado com esses filtros.</p>
              <p className="mt-1 text-xs text-slate-500">Ajuste os filtros ou restaure a busca para ver outras opções.</p>
              <button type="button" onClick={handleResetFilters} className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Restaurar filtros</button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedCatalog.map((service) => {
                const clinicService = getClinicService(service)
                const clinicInsuranceIds = getClinicInsuranceIds(clinicService)
                const insurances = getInsuranceNames(clinicInsuranceIds.filter((insuranceId) => insuranceId !== 'ins-particular'))
                const selectedOfferedInsuranceId =
                  selectedInsurance !== 'all' &&
                  selectedInsurance !== 'ins-particular' &&
                  clinicInsuranceIds.includes(selectedInsurance)
                    ? selectedInsurance
                    : ''
                const initialPaymentType = selectedOfferedInsuranceId || clinicInsuranceIds.includes('ins-particular')
                  ? (selectedOfferedInsuranceId ? 'CONVENIO' : 'PARTICULAR')
                  : 'CONVENIO'
                const initialInsuranceId = selectedOfferedInsuranceId || (
                  initialPaymentType === 'CONVENIO'
                    ? clinicInsuranceIds.find((insuranceId) => insuranceId !== 'ins-particular') || ''
                    : ''
                )
                const cartItem = clinicService
                  ? {
                      examId: service.id,
                      examName: service.name,
                      category: CART_CATEGORY_BY_CATALOG_CATEGORY[service.category] || 'OUTROS',
                      clinicId: clinicService.clinic.id,
                      clinicName: clinicService.clinic.name,
                      clinicAddress: clinicService.clinic.address,
                      clinicNeighborhood: clinicService.clinic.neighborhood,
                      clinicRating: clinicService.clinic.rating,
                      serviceId: clinicService.id,
                      privatePrice: clinicService.privatePrice,
                      tussCode: clinicService.tussCode || service.tussCode || '',
                      descriptionPrep: clinicService.descriptionPrep,
                      insuranceIds: clinicInsuranceIds,
                      paymentType: initialPaymentType,
                      selectedInsuranceId: initialInsuranceId,
                      selectedPeriod: selectedPeriod === 'all' ? '' : selectedPeriod,
                    }
                  : null
                return (
                  <article key={service.id} className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium ${getCategoryBadgeClass(service.category)}`}>
                          {getCategoryIcon(service.category)}<span className="capitalize">{service.category}</span>
                        </span>
                        {service.tussCode && <span className="rounded bg-slate-100 px-1.5 py-1 font-mono text-[10px] text-slate-600">TUSS: {service.tussCode}</span>}
                      </div>
                      <h3 className="text-base font-semibold leading-snug text-slate-900">{service.name}</h3>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        <span className="text-slate-500">Valor de referência</span>
                        <span className="font-semibold text-emerald-700">{formatCurrencyBRL(service.suggestedPrivatePrice || 0)}</span>
                      </div>
                      {service.suggestedDuration && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock3 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> Duração média: {service.suggestedDuration} min
                        </div>
                      )}
                      {service.suggestedPrep && (
                        <div className="rounded-lg border border-amber-200/70 bg-amber-50/70 p-2 text-[11px] text-amber-900">
                          <p className="font-medium text-amber-800">Preparo / orientações</p>
                          <p className="mt-0.5 line-clamp-3">{service.suggestedPrep}</p>
                        </div>
                      )}
                      {insurances.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Convênios aceitos</p>
                          <div className="flex flex-wrap gap-1">
                            {insurances.slice(0, 3).map((insurance) => <span key={insurance} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{insurance}</span>)}
                            {insurances.length > 3 && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">+{insurances.length - 3}</span>}
                          </div>
                        </div>
                      )}
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={!cartItem}
                          onClick={() => onAddToCart(cartItem)}
                          className="w-full rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                        >
                          {cartItem ? 'Solicitar agendamento' : 'Sem clínica disponível no catálogo mock'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {visibleCount < orderedCatalog.length && (
            <div className="flex justify-center pt-3">
              <button type="button" onClick={() => setVisibleCount((count) => count + 6)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white">
                Carregar mais <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </section>

        <section id="jornada-paciente" className="rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white shadow-md md:p-9">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-100">Sua experiência de cuidado</p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">Informação clara em cada etapa</h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['01', 'Encontre exames e especialistas', 'Busque por região, convênio, especialidade ou exame.'],
              ['02', 'Escolha como quer ser atendido', 'Compare opções e conheça os valores de referência.'],
              ['03', 'Prepare-se com tranquilidade', 'Consulte as orientações necessárias para o atendimento.'],
              ['04', 'Acompanhe sua jornada', 'Tenha mais clareza sobre as informações do seu atendimento.'],
            ].map(([number, title, description]) => (
              <article key={number} className="rounded-xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm font-bold text-emerald-200">{number}</p>
                <h3 className="mt-2 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-emerald-50">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <TestimonialsCarousel audience="patient" />
      </main>
    </div>
  )
}

export default PatientNicheView
