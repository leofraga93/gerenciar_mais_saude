import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import brandLogo from '../assets/logo-500-sem-fundo.png'
import {
  MOCK_CATEGORIES,
  MOCK_INSURANCES,
  MOCK_LOCATIONS,
  MOCK_SERVICES_CATALOG,
} from '../data/catalogData'
import {
  IconSearch,
  IconSearchOff,
  IconClose,
  IconStar,
  IconHospital,
  IconMapPin,
  IconClipboard,
  IconClock,
} from '../components/common/Icons'

function LandingPage() {
  const navigate = useNavigate()
  
  // Modal de Login / Acesso
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)
  const [activeAudience, setActiveAudience] = useState('clinic')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Filtros da Vitrine Dinâmica de Serviços e Clínicas
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedInsurance, setSelectedInsurance] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')

  // Modal de Detalhes do Serviço Selecionado
  const [selectedServiceModal, setSelectedServiceModal] = useState(null)

  const metrics = [
    { label: 'Clínicas e Laboratórios Parceiros', value: '120+' },
    { label: 'Exames e Consultas Disponíveis', value: '850+' },
    { label: 'Solicitações Respondidas em 24h', value: '94%' },
    { label: 'Avaliação dos Pacientes', value: '4.9/5' },
  ]

  const testimonials = [
    {
      quote:
        'Consegui comparar o valor do meu ultrassom entre 3 clínicas de Lauro de Freitas e verificar qual aceitava meu plano Bradesco. Prático e rápido!',
      author: 'Camila R., paciente',
      role: 'Vilas do Atlântico',
    },
    {
      quote:
        'A vitrine transparente trouxe novos pacientes para nossa clínica e reduziu dúvidas sobre preparos de exames antes do atendimento.',
      author: 'Dr. Renato Souza, gestor clínico',
      role: 'Clínica Imagem & Vida',
    },
  ]

  // Lógica de filtragem dinâmica em tempo real
  const filteredServices = useMemo(() => {
    return MOCK_SERVICES_CATALOG.filter((service) => {
      // Busca por texto (Nome do exame, Código TUSS ou Nome da clínica)
      const matchesSearch =
        searchTerm.trim() === '' ||
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.tussCode.includes(searchTerm.trim()) ||
        service.clinic.name.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de Categoria
      const matchesCategory =
        selectedCategory === 'all' || service.category === selectedCategory

      // Filtro de Convênio
      const matchesInsurance =
        selectedInsurance === 'all' ||
        service.insurances.includes(selectedInsurance)

      // Filtro de Localização / Bairro
      const matchesLocation =
        selectedLocation === 'all' ||
        service.clinic.neighborhood.toLowerCase().includes(
          selectedLocation.replace('_', ' ').toLowerCase()
        )

      return matchesSearch && matchesCategory && matchesInsurance && matchesLocation
    })
  }, [searchTerm, selectedCategory, selectedInsurance, selectedLocation])

  const handleAccessSubmit = (event) => {
    event.preventDefault()
    setIsAccessModalOpen(false)
    if (activeAudience === 'clinic') {
      navigate('/dashboard')
      return
    }
    navigate('/paciente/inicio', { state: { email: email.trim() } })
  }

  const openAccessModal = (audience) => {
    setActiveAudience(audience)
    setIsAccessModalOpen(true)
  }

  const handleGoToClinicSignup = () => {
    navigate('/cadastro-clinica')
  }

  const formatPrice = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Banner / Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:py-4">
          <div className="flex items-center gap-3">
            <img
              src={brandLogo}
              alt="Logo Gerenciar Mais Saúde"
              className="h-12 w-12 object-contain sm:h-14 sm:w-14"
            />
            <div>
              <p className="text-base font-bold text-slate-900 sm:text-lg">
                Gerenciar Mais Saúde
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Mercado de saúde para clínicas e pacientes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => openAccessModal('clinic')}
              className="rounded-xl border border-emerald-700 bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:px-4 sm:text-sm"
            >
              Sou Clínica
            </button>
            <button
              type="button"
              onClick={() => openAccessModal('patient')}
              className="rounded-xl border border-emerald-600 bg-emerald-50/50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100/60 sm:px-4 sm:text-sm"
            >
              Sou Paciente
            </button>
          </div>
        </div>
      </header>

      {/* Hero & Apresentação */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900/5 via-slate-50 to-slate-50 pb-12 pt-8 md:pb-16 md:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Busque exames, consultas e clínicas{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                antes mesmo de se cadastrar
              </span>
            </h1>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Compare valores particulares, convênios cobertos, preparos de exames e localização de clínicas com total clareza e agilidade.
            </p>
          </div>

          {/* Barra de Pesquisa e Filtros da Vitrine Interativa */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50 md:p-6">
            <div className="grid gap-3 md:grid-cols-12">
              {/* Pesquisa por Texto */}
              <div className="md:col-span-5">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Qual exame, especialidade ou código TUSS você busca?
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <IconSearch className="h-4.5 w-4.5 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ex: Ultrassom, Hemograma, TUSS 40901124..."
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-8 text-sm outline-none ring-emerald-500 focus:border-emerald-500 focus:ring-2"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <IconClose className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Seletor de Convênio */}
              <div className="md:col-span-4">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Filtrar por Convênio ou Particular
                </label>
                <div className="relative w-full">
                  <select
                    value={selectedInsurance}
                    onChange={(e) => setSelectedInsurance(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-3 pr-8 text-sm outline-none transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {MOCK_INSURANCES.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Seletor de Região / Bairro */}
              <div className="md:col-span-3">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Região
                </label>
                <div className="relative w-full">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-3 pr-8 text-sm outline-none transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {MOCK_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Chips de Categoria */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <span className="mr-1 text-xs font-medium text-slate-500">Categorias:</span>
              {MOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vitrine Interativa de Exames e Clínicas */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Serviços e Clínicas Disponíveis
            </h2>
            <p className="text-sm text-slate-500">
              {filteredServices.length === 1
                ? '1 serviço encontrado'
                : `${filteredServices.length} serviços encontrados`}
            </p>
          </div>
          
          {(searchTerm || selectedCategory !== 'all' || selectedInsurance !== 'all' || selectedLocation !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedInsurance('all')
                setSelectedLocation('all')
              }}
              className="text-xs font-medium text-emerald-700 underline hover:text-emerald-800"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>

        {filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="flex justify-center text-slate-300">
              <IconSearchOff className="h-12 w-12" />
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-800">
              Nenhum serviço encontrado para essa busca
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Tente alterar os termos de pesquisa, limpar os filtros ou selecionar outra categoria.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedInsurance('all')
                setSelectedLocation('all')
              }}
              className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Ver todos os serviços
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <article
                key={service.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      {service.clinic.badge}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <IconStar className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {service.clinic.rating}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-emerald-700">
                    {service.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Código TUSS: <span className="font-mono text-slate-700">{service.tussCode}</span>
                  </p>

                  <div className="mt-3 rounded-xl bg-slate-50 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <IconHospital className="h-4 w-4 text-emerald-600 shrink-0" />
                      {service.clinic.name}
                    </p>
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
                      <IconMapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>{service.clinic.address}</span>
                    </p>
                  </div>

                  <div className="mt-3">
                    <p className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                      <IconClipboard className="h-3.5 w-3.5 text-emerald-600" />
                      Preparo rápido:
                    </p>
                    <p className="line-clamp-2 mt-0.5 text-xs text-slate-600 pl-4.5">
                      {service.descriptionPrep}
                    </p>
                  </div>

                  {/* Badges de Convênios */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {service.insurances.map((insId) => {
                      const insObj = MOCK_INSURANCES.find((i) => i.id === insId)
                      return (
                        <span
                          key={insId}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          {insObj ? insObj.name : insId}
                        </span>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Particular</span>
                    <span className="text-lg font-extrabold text-emerald-700">
                      {formatPrice(service.privatePrice)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedServiceModal(service)}
                    className="rounded-xl border border-emerald-600 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Métricas do Ecossistema */}
      <section className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center shadow-xs"
              >
                <p className="text-3xl font-extrabold text-emerald-700">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-600">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          O que dizem sobre nossa plataforma
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <blockquote
              key={t.author}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
            >
              <p className="text-slate-700 italic">"{t.quote}"</p>
              <footer className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-sm font-bold text-slate-900">{t.author}</span>
                <span className="text-xs text-slate-500">{t.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 py-8 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="Logo" className="h-10 w-10 opacity-80" />
            <div>
              <p className="text-sm font-semibold text-white">Gerenciar Mais Saúde</p>
              <p className="text-xs text-slate-400">Plataforma e Marketplace de Saúde</p>
            </div>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} Gerenciar Mais Saúde. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Modal 1: Detalhes do Serviço Selecionado */}
      {selectedServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  {selectedServiceModal.clinic.badge}
                </span>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {selectedServiceModal.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Código TUSS: <span className="font-mono">{selectedServiceModal.tussCode}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedServiceModal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-700">
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="flex items-center gap-1.5 font-bold text-slate-900">
                  <IconHospital className="h-4 w-4 text-emerald-600 shrink-0" />
                  {selectedServiceModal.clinic.name}
                </p>
                <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-600">
                  <IconMapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedServiceModal.clinic.address}</span>
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                  <IconStar className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  {selectedServiceModal.clinic.rating} ({selectedServiceModal.clinic.reviewsCount} avaliações)
                </p>
              </div>

              <div>
                <p className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <IconClipboard className="h-4 w-4 text-emerald-600" />
                  Orientações de Preparo:
                </p>
                <p className="mt-1 rounded-lg bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
                  {selectedServiceModal.descriptionPrep}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <span className="flex items-center gap-1 text-xs text-slate-500 mb-0.5">
                    <IconClock className="h-3.5 w-3.5 text-slate-400" />
                    Duração estimada
                  </span>
                  <span className="font-bold text-slate-800">{selectedServiceModal.durationMinutes} minutos</span>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <span className="text-xs text-slate-500 block">Valor Particular</span>
                  <span className="font-bold text-emerald-700 text-base">
                    {formatPrice(selectedServiceModal.privatePrice)}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-900 mb-1">Convênios Atendidos:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedServiceModal.insurances.map((insId) => {
                    const insObj = MOCK_INSURANCES.find((i) => i.id === insId)
                    return (
                      <span
                        key={insId}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
                      >
                        {insObj ? insObj.name : insId}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedServiceModal(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedServiceModal(null)
                  openAccessModal('patient')
                }}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Solicitar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Acesso à Plataforma (Sou Clínica vs Sou Paciente) */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Acesso à Plataforma</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Escolha o seu tipo de acesso para continuar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAccessModalOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            {/* Abas */}
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveAudience('clinic')}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                  activeAudience === 'clinic'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Acesso Clínica
              </button>
              <button
                type="button"
                onClick={() => setActiveAudience('patient')}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                  activeAudience === 'patient'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Acesso Paciente
              </button>
            </div>

            {/* Formulário de Login Mock */}
            <form className="space-y-4" onSubmit={handleAccessSubmit}>
              <div>
                <label htmlFor="access-email" className="mb-1 block text-xs font-semibold text-slate-700">
                  E-mail
                </label>
                <input
                  id="access-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
                  placeholder={
                    activeAudience === 'clinic'
                      ? 'contato@clinica.com.br'
                      : 'seuemail@exemplo.com'
                  }
                />
              </div>

              <div>
                <label htmlFor="access-password" className="mb-1 block text-xs font-semibold text-slate-700">
                  Senha
                </label>
                <input
                  id="access-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2"
                  placeholder="Digite sua senha"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button type="button" className="font-medium text-emerald-700 hover:underline">
                  Esqueceu a senha?
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  {activeAudience === 'clinic' ? 'Entrar no Portal da Clínica' : 'Entrar como Paciente'}
                </button>
              </div>
            </form>

            {/* Rodapé do Modal */}
            {activeAudience === 'clinic' ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                <p className="text-xs font-bold text-emerald-950">
                  Ainda não é parceiro credenciado?
                </p>
                <p className="mt-1 text-xs text-emerald-800">
                  Credencie sua clínica para divulgar exames, receber solicitações de pacientes e gerenciar seu catálogo.
                </p>
                <button
                  type="button"
                  onClick={handleGoToClinicSignup}
                  className="mt-3 w-full rounded-xl border border-emerald-700 bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                >
                  Credenciar Minha Clínica Agora
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-900">
                  Agendamentos completos pelo App
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Utilize nosso app móvel para acompanhar convênios e agendar exames diretamente.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <a
                    href="https://apps.apple.com"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    App Store
                  </a>
                  <a
                    href="https://play.google.com/store"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Google Play
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default LandingPage
