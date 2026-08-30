import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  User,
  Clock,
  Check,
  ShieldCheck,
  Stethoscope,
  FlaskConical,
  Activity,
  HeartPulse,
  FileText,
  Smartphone,
  ChevronRight,
  ChevronDown,
  Info,
  X,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Layers,
} from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faWhatsapp,
} from '@fortawesome/free-brands-svg-icons'
import {
  faMagnifyingGlass,
  faCalendarCheck,
  faBell,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons'
import brandLogo from '../assets/logo-500-sem-fundo.png'
import { STANDARD_PROCEDURES_CATALOG } from '../data/standardCatalog'
import { SERVICE_CATEGORIES } from '../constants/catalogConstants'
import { INSURANCES, getInsuranceNames } from '../data/insurances'
import { formatCurrencyBRL } from '../utils/serviceValidation'
import { CatalogFilters } from '../components/catalog/CatalogFilters'

/** Mock até API: perfil escolhido no modal define o destino (ROLE_CLINICA vs ROLE_USUARIO). */
function LandingPage() {
  const navigate = useNavigate()
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)
  const [activeAudience, setActiveAudience] = useState('clinic')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Valores de referência do catálogo padrão
  const allPrices = useMemo(
    () => STANDARD_PROCEDURES_CATALOG.map((item) => item.suggestedPrivatePrice || 0),
    []
  )
  const baseMinPrice = useMemo(() => Math.min(...allPrices), [allPrices])
  const baseMaxPrice = useMemo(() => Math.max(...allPrices), [allPrices])

  // Estados do Catálogo Público
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedInsurance, setSelectedInsurance] = useState('all')
  const [minPrice, setMinPrice] = useState(baseMinPrice)
  const [maxPrice, setMaxPrice] = useState(baseMaxPrice)
  const [visibleCount, setVisibleCount] = useState(9) // Inicialmente 9 opções

  const metrics = [
    { label: 'Clínicas parceiras ativas', value: '120+' },
    { label: 'Solicitações respondidas em 24h', value: '94%' },
    { label: 'Pacientes satisfeitos', value: '4.8/5' },
  ]

  const testimonials = [
    {
      quote:
        'Conseguimos comparar opções com clareza e fechar meu atendimento com ótimo custo-benefício.',
      author: 'Camila, paciente',
    },
    {
      quote:
        'A plataforma trouxe novos pacientes para nossa clínica e melhorou nossa visibilidade local.',
      author: 'Dr. Renato, gestor clínico',
    },
  ]

  const openAccessModal = (audience) => {
    setActiveAudience(audience)
    setIsAccessModalOpen(true)
  }

  const handleAccessSubmit = (event) => {
    event.preventDefault()
    setIsAccessModalOpen(false)
    if (activeAudience === 'clinic') {
      navigate('/dashboard')
      return
    }
    navigate('/paciente/inicio', { state: { email: email.trim() } })
  }

  const handleGoToClinicSignup = () => {
    setIsAccessModalOpen(false)
    navigate('/cadastro-clinica')
  }

  // Mudança de categoria reseta a paginação para 9
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId)
    setVisibleCount(9)
  }

  // Mudança de convênio reseta a paginação para 9
  const handleInsuranceSelect = (insuranceId) => {
    setSelectedInsurance(insuranceId)
    setVisibleCount(9)
  }

  // Mudança de preço mínimo
  const handleMinPriceChange = (val) => {
    setMinPrice(val)
    setVisibleCount(9)
  }

  // Mudança de preço máximo
  const handleMaxPriceChange = (val) => {
    setMaxPrice(val)
    setVisibleCount(9)
  }

  // Mudança na busca reseta a paginação para 9
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setVisibleCount(9)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedInsurance('all')
    setMinPrice(baseMinPrice)
    setMaxPrice(baseMaxPrice)
    setVisibleCount(9)
  }

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    selectedInsurance !== 'all' ||
    minPrice > baseMinPrice ||
    maxPrice < baseMaxPrice

  // Filtragem dos procedimentos para a vitrine pública
  const filteredCatalog = useMemo(() => {
    return STANDARD_PROCEDURES_CATALOG.filter((item) => {
      // 1. Categoria
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory

      // 2. Convênio
      const matchInsurance =
        selectedInsurance === 'all' ||
        (selectedInsurance === 'ins-particular'
          ? !item.suggestedInsuranceIds ||
            item.suggestedInsuranceIds.length === 0 ||
            item.suggestedInsuranceIds.includes('ins-particular')
          : item.suggestedInsuranceIds?.includes(selectedInsurance))

      // 3. Faixa de Valor (Mínimo e Máximo)
      const price = item.suggestedPrivatePrice || 0
      const matchPrice = price >= minPrice && price <= maxPrice

      // 4. Termo de Busca
      const term = searchTerm.toLowerCase().trim()
      if (!term) return matchCategory && matchInsurance && matchPrice

      const matchName = item.name.toLowerCase().includes(term)
      const matchTuss = item.tussCode?.toLowerCase().includes(term)
      const matchPrep = item.suggestedPrep?.toLowerCase().includes(term)

      return (
        matchCategory &&
        matchInsurance &&
        matchPrice &&
        (matchName || matchTuss || matchPrep)
      )
    })
  }, [searchTerm, selectedCategory, selectedInsurance, minPrice, maxPrice])

  // Itens atualmente visíveis com base na paginação (9 iniciais + 6 a cada clique)
  const displayedCatalog = useMemo(() => {
    return filteredCatalog.slice(0, visibleCount)
  }, [filteredCatalog, visibleCount])

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'laboratorio':
        return <FlaskConical className="h-4 w-4 text-sky-600" />
      case 'imagem':
        return <Activity className="h-4 w-4 text-emerald-600" />
      case 'cardiologia':
        return <HeartPulse className="h-4 w-4 text-rose-600" />
      case 'consultas':
        return <Stethoscope className="h-4 w-4 text-indigo-600" />
      default:
        return <FileText className="h-4 w-4 text-teal-600" />
    }
  }

  // Opções formatadas para o grupo de botões de Categoria
  const categoryOptions = useMemo(() => {
    const allOption = {
      id: 'all',
      label: 'Todos',
      count: STANDARD_PROCEDURES_CATALOG.length,
    }
    const catOptions = SERVICE_CATEGORIES.map((cat) => ({
      id: cat.id,
      label: cat.label,
      icon: getCategoryIcon(cat.id),
      count: STANDARD_PROCEDURES_CATALOG.filter((item) => item.category === cat.id).length,
    }))
    return [allOption, ...catOptions]
  }, [])

  // Opções formatadas para o grupo de botões de Convênio
  const insuranceOptions = useMemo(() => {
    const allOption = {
      id: 'all',
      label: 'Todos os Planos',
      count: STANDARD_PROCEDURES_CATALOG.length,
    }
    const insList = INSURANCES.map((ins) => {
      const count = STANDARD_PROCEDURES_CATALOG.filter((item) =>
        ins.id === 'ins-particular'
          ? !item.suggestedInsuranceIds ||
            item.suggestedInsuranceIds.length === 0 ||
            item.suggestedInsuranceIds.includes('ins-particular')
          : item.suggestedInsuranceIds?.includes(ins.id)
      ).length
      return {
        id: ins.id,
        label: ins.name,
        count,
      }
    })
    return [allOption, ...insList]
  }, [])

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'laboratorio':
        return 'bg-sky-50 text-sky-700 border-sky-200'
      case 'imagem':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'cardiologia':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'consultas':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 md:px-10">
        {/* Header com Navegação e Acessos */}
        <header id="inicio" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={brandLogo}
              alt="Logo Gerenciar Mais Saúde"
              className="h-16 w-16 object-contain md:h-20 md:w-20"
            />
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">Gerenciar Mais Saúde</p>
              <p className="text-sm text-slate-500">Porta de entrada para clínicas e pacientes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openAccessModal('clinic')}
              className="flex items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 shadow-sm"
            >
              <Building2 className="h-4 w-4" />
              <span>Sou Clínica</span>
            </button>
            <button
              type="button"
              onClick={() => openAccessModal('patient')}
              className="flex items-center gap-2 rounded-lg border border-emerald-600 bg-transparent px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              <User className="h-4 w-4" />
              <span>Sou Paciente</span>
            </button>
          </div>
        </header>

        {/* Hero Section com Imagem de Destaque e CTAs */}
        <section className="grid items-center gap-10 md:grid-cols-12">
          <div className="space-y-5 md:col-span-7">
            {/* <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1 text-sm font-medium text-emerald-800">
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              Marketplace de saúde para quem cuida e para quem precisa
            </span> */}
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
              Saúde sem burocracia para quem cuida e para quem precisa.
            </h1>
            <p className="text-base text-slate-600 md:text-lg">
              A plataforma conecta clínicas e pacientes em uma jornada simples, com
              mais previsibilidade para o atendimento e mais transparência para a escolha.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => openAccessModal('clinic')}
                className="flex items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Building2 className="h-4 w-4" />
                <span>Sou Clínica</span>
              </button>
              <button
                type="button"
                onClick={() => openAccessModal('patient')}
                className="flex items-center gap-2 rounded-lg border border-emerald-600 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                <User className="h-4 w-4" />
                <span>Sou Paciente</span>
              </button>
            </div>

            {/* Destaque rápido de credibilidade */}
            <div className="flex items-center gap-6 pt-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Clínicas Credenciadas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span>Agendamento Ágil</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Tabela TUSS e Convênios</span>
              </div>
            </div>
          </div>

          {/* Card Visual Hero com Imagem Otimizada de Saúde Digital */}
          <div className="relative md:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80"
                alt="Profissional de saúde utilizando prontuário e gestão digital de atendimento"
                className="h-64 w-full object-cover sm:h-72"
                loading="eager"
              />
              <div className="space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Atendimento Integrado
                  </span>
                  <span className="text-xs text-slate-400">Região Metropolitana</span>
                </div>
                <p className="text-sm font-medium text-slate-800">
                  Conexão direta entre prestadores e pacientes para consultas e exames especializados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PASSO A PASSO / DEMONSTRAÇÃO DO FLUXO (DESTAQUE VERDE)       */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white shadow-md md:p-9">
          <div className="max-w-3xl space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200 backdrop-blur-sm">
              <Layers className="h-3.5 w-3.5" />
              Como Funciona a Plataforma
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Jornada ágil e transparente em 4 passos simples
            </h2>
            <p className="text-sm text-emerald-100/90 md:text-base">
              Processo simplificado e integrado para clínicas organizarem a demanda e pacientes realizarem o melhor atendimento.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Passo 1 */}
            <div className="flex flex-col justify-between rounded-xl bg-white/10 p-5 backdrop-blur-sm transition duration-200 hover:bg-white/15 border border-white/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-300">01</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Encontre especialistas
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-100/80">
                    Busque por serviços de saúde na região. Filtre por planos de saúde, tratamentos, exames ou disponibilidade.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex flex-col justify-between rounded-xl bg-white/10 p-5 backdrop-blur-sm transition duration-200 hover:bg-white/15 border border-white/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm">
                    <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-300">02</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Marque consultas & exames
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-100/80">
                    Escolha a clínica, dia e horário que desejar, agendando seu atendimento com agilidade e sem complicação.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex flex-col justify-between rounded-xl bg-white/10 p-5 backdrop-blur-sm transition duration-200 hover:bg-white/15 border border-white/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm">
                    <FontAwesomeIcon icon={faBell} className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-300">03</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Receba lembretes & preparo
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-100/80">
                    Confirmação imediata com orientações de preparo enviadas via WhatsApp e e-mail antes do horário marcado.
                  </p>
                </div>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="flex flex-col justify-between rounded-xl bg-white/10 p-5 backdrop-blur-sm transition duration-200 hover:bg-white/15 border border-white/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm">
                    <FontAwesomeIcon icon={faThumbsUp} className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-300">04</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Atendimento & avaliação
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-100/80">
                    Após o atendimento, deixe sua avaliação e acompanhe seu histórico de saúde de forma simples e segura.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Benefícios com Imagens de Apoio */}
        <section id="beneficios" className="space-y-6">
          <div className="text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Benefícios para os dois públicos
            </h2>
            <p className="mt-1 text-slate-600">
              Uma experiência pensada para transformar a rotina da clínica e a jornada do paciente.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Card Clínica */}
            <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div className="h-44 w-full overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=700&auto=format&fit=crop&q=80"
                    alt="Consultório médico moderno e equipe clínica"
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Para Clínicas</h3>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>Redução de no-show e agenda mais organizada.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>Fluxo comercial com menos tarefas manuais e catálogo padronizado.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>Recebimento facilitado com suporte a PIX e gestão de convênios.</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleGoToClinicSignup}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <span>Credenciar Minha Clínica</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Card Paciente */}
            <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div className="h-44 w-full overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&auto=format&fit=crop&q=80"
                    alt="Paciente em consulta médica com acolhimento e clareza"
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Para Pacientes</h3>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>Agendamento mais simples, transparente e rápido.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>Transparência de preços por atendimento e instruções de preparo.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>Busca por clínica com convênio compatível (Bradesco, Unimed, etc.).</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => openAccessModal('patient')}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <span>Acessar Como Paciente</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Métricas de Desempenho */}
        <section id="metricas" className="space-y-6">
          <h2 className="text-2xl font-semibold">Métricas de desempenho</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-3xl font-bold text-emerald-700">{metric.value}</p>
                <p className="mt-2 text-slate-600">{metric.label}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SEÇÃO DE CATÁLOGO E FILTRO DE SERVIÇOS PÚBLICOS */}
        {/* Posicionado logo acima de Depoimentos e do Container Verde   */}
        {/* ============================================================ */}
        <section id="catalogo" className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              {/* <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <Stethoscope className="h-3.5 w-3.5" />
                Catálogo de Procedimentos e Exames
              </span> */}
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Catálogo de serviços disponíveis na rede
              </h2>
              <p className="text-sm text-slate-600 md:text-base">
                Filtre por categoria, veja orientações de preparo, preços de referência e convênios aceitos.
              </p>
            </div>
          </div>

          {/* Componente Modular de Filtros de Catálogo */}
          <CatalogFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            categoryOptions={categoryOptions}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategorySelect}
            insuranceOptions={insuranceOptions}
            selectedInsurance={selectedInsurance}
            onInsuranceChange={handleInsuranceSelect}
            baseMinPrice={baseMinPrice}
            baseMaxPrice={baseMaxPrice}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={handleMinPriceChange}
            onMaxPriceChange={handleMaxPriceChange}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
            displayedCount={displayedCatalog.length}
            totalFilteredCount={filteredCatalog.length}
            totalCatalogCount={STANDARD_PROCEDURES_CATALOG.length}
          />

          {/* Grid de Serviços do Catálogo (Inicialmente 9, expansão de 6 em 6) */}
          {displayedCatalog.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
              <Info className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-700">
                Nenhum procedimento encontrado com os filtros selecionados
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Tente ajustar o convênio, faixa de valor ou termo de busca para encontrar outros exames.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 shadow-sm"
              >
                Restaurar todos os filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayedCatalog.map((service) => {
                  const insurances = getInsuranceNames(service.suggestedInsuranceIds || [])
                  return (
                    <div
                      key={service.id}
                      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${getCategoryBadgeClass(
                              service.category
                            )}`}
                          >
                            {getCategoryIcon(service.category)}
                            <span className="capitalize">{service.category}</span>
                          </span>
                          {service.tussCode && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                              TUSS: {service.tussCode}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-semibold leading-snug text-slate-900">
                          {service.name}
                        </h3>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                          <span className="text-slate-500">Valor Estimado:</span>
                          <span className="font-semibold text-emerald-700">
                            {formatCurrencyBRL(service.suggestedPrivatePrice || 0)}
                          </span>
                        </div>

                        {service.suggestedDuration && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>Duração média: {service.suggestedDuration} min</span>
                          </div>
                        )}

                        {/* Preparo */}
                        {service.suggestedPrep && (
                          <div className="rounded-lg bg-amber-50/70 p-2 text-[11px] text-amber-900 border border-amber-200/50">
                            <p className="font-medium text-amber-800">Preparo / Orientações:</p>
                            <p className="mt-0.5 line-clamp-2 text-amber-900/90">{service.suggestedPrep}</p>
                          </div>
                        )}

                        {/* Convênios Aceitos */}
                        {insurances.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Convênios aceitos
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {insurances.slice(0, 3).map((ins) => (
                                <span
                                  key={ins}
                                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                                >
                                  {ins}
                                </span>
                              ))}
                              {insurances.length > 3 && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                                  +{insurances.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => openAccessModal('patient')}
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-600 bg-transparent py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          <Smartphone className="h-3.5 w-3.5" />
                          <span>Agendar pelo Aplicativo</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Botão de Expansão Progressiva (9 + 6 + 6...) */}
              {visibleCount < filteredCatalog.length ? (
                <div className="mt-8 flex flex-col items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-600 hover:text-white"
                  >
                    <span>Carregar mais</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <p className="text-xs text-slate-500">
                    Exibindo {displayedCatalog.length} de {filteredCatalog.length} procedimentos disponíveis
                  </p>
                </div>
              ) : (
                filteredCatalog.length > 9 && (
                  <div className="mt-6 text-center text-xs text-slate-400">
                    Todos os {filteredCatalog.length} procedimentos desta categoria estão sendo exibidos.
                  </div>
                )
              )}
            </>
          )}
        </section>

        {/* Seção de Depoimentos */}
        <section id="depoimentos" className="space-y-6">
          <h2 className="text-2xl font-semibold">Depoimentos</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <blockquote
                key={testimonial.author}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-slate-700">"{testimonial.quote}"</p>
                <footer className="mt-4 text-sm font-medium text-slate-500">
                  {testimonial.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* Container Verde de Chamada Final */}
        <section className="rounded-2xl bg-emerald-600 px-6 py-8 text-center text-white">
          <h2 className="text-2xl font-semibold">Pronto para começar sua jornada na plataforma?</h2>
          <p className="mt-2 text-emerald-50">
            Escolha seu perfil e entre na experiência pensada para clínicas e pacientes.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openAccessModal('clinic')}
              className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-emerald-800 transition hover:bg-emerald-100 shadow-sm"
            >
              <Building2 className="h-4 w-4" />
              <span>Sou Clínica</span>
            </button>
            <button
              type="button"
              onClick={() => openAccessModal('patient')}
              className="flex items-center gap-2 rounded-lg border border-white bg-transparent px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              <User className="h-4 w-4" />
              <span>Sou Paciente</span>
            </button>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* RODAPÉ PREMIUM RESPONSIVO (Dark Theme com Alto Contraste)    */}
      {/* ============================================================ */}
      <footer className="mt-20 border-t border-slate-900 bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
            {/* Coluna 1: Identidade e Descrição */}
            <div className="space-y-4 lg:col-span-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
                  <img
                    src={brandLogo}
                    alt="Logo Gerenciar Mais Saúde"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-base font-bold tracking-tight text-white">
                    Gerenciar Mais Saúde
                  </p>
                  <p className="text-xs font-medium text-emerald-400">
                    Saúde Integrada & Sem Burocracia
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Conectando clínicas credenciadas e pacientes para um atendimento humanizado,
                ágil e transparente na Região Metropolitana e Lauro de Freitas - BA.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Plataforma Segura e Em Conformidade com a LGPD</span>
              </div>
            </div>

            {/* Coluna 2: Contato e Localização */}
            <div className="space-y-3 lg:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contato & Atendimento
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                  <a href="tel:+557132880000" className="transition hover:text-white">
                    +55 (71) 3288-0000
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  <a
                    href="https://wa.me/5571999990000"
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-white"
                  >
                    WhatsApp: (71) 9 9999-0000
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-emerald-400" />
                  <a
                    href="mailto:contato@gerenciarmaissaude.com.br"
                    className="transition hover:text-white"
                  >
                    contato@gerenciarmaissaude.com.br
                  </a>
                </li>
                <li className="flex items-start gap-2.5 pt-1 text-slate-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Lauro de Freitas & Salvador - BA</span>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Navegação do Projeto */}
            <div className="space-y-3 lg:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Navegação Rápida
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('inicio')}
                    className="transition hover:text-emerald-400"
                  >
                    Início
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('beneficios')}
                    className="transition hover:text-emerald-400"
                  >
                    Benefícios para Clínicas e Pacientes
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('catalogo')}
                    className="transition hover:text-emerald-400"
                  >
                    Catálogo de Procedimentos e Exames
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('metricas')}
                    className="transition hover:text-emerald-400"
                  >
                    Métricas de Desempenho
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleGoToClinicSignup}
                    className="transition hover:text-emerald-400 font-medium text-emerald-300"
                  >
                    Credenciar Minha Clínica
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openAccessModal('patient')}
                    className="transition hover:text-emerald-400"
                  >
                    Portal do Paciente
                  </button>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Redes Sociais e Canais */}
            <div className="space-y-3 lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Canais & Redes
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Acompanhe atualizações sobre a rede e comunicados de saúde.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-300 transition duration-200 hover:bg-emerald-600 hover:text-white shadow-sm"
                >
                  <FontAwesomeIcon icon={faFacebookF} className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-300 transition duration-200 hover:bg-emerald-600 hover:text-white shadow-sm"
                >
                  <FontAwesomeIcon icon={faInstagram} className="h-4 w-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-300 transition duration-200 hover:bg-emerald-600 hover:text-white shadow-sm"
                >
                  <FontAwesomeIcon icon={faLinkedinIn} className="h-4 w-4" />
                </a>
                <a
                  href="https://wa.me/5571999990000"
                  target="_blank"
                  rel="noreferrer"
                  title="WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-300 transition duration-200 hover:bg-emerald-600 hover:text-white shadow-sm"
                >
                  <FontAwesomeIcon icon={faWhatsapp} className="h-4 w-4" />
                </a>
                <a
                  href="mailto:contato@gerenciarmaissaude.com.br"
                  title="E-mail Direto"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-300 transition duration-200 hover:bg-emerald-600 hover:text-white shadow-sm"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Divisor e Rodapé Inferior */}
          <div className="mt-12 border-t border-slate-900 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-400 sm:flex-row">
              <p>© 2026 Gerenciar Mais Saúde. Todos os direitos reservados.</p>
              <div className="flex items-center gap-6">
                <span className="cursor-pointer transition hover:text-slate-200">Termos de Uso</span>
                <span>•</span>
                <span className="cursor-pointer transition hover:text-slate-200">Políticas de Privacidade</span>
              </div>
            </div>
            <div className="mt-4 text-center text-[11px] text-slate-600">
              GERENCIAR MAIS SAÚDE TECNOLOGIA LTDA • CNPJ: 00.000.000/0001-00 • LAURO DE FREITAS - BA
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Acesso Unificado */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Acesso à plataforma</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Escolha seu perfil para continuar. Após validar os dados, você será direcionado
                  conforme o tipo de acesso.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAccessModalOpen(false)}
                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveAudience('clinic')}
                className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition ${activeAudience === 'clinic'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
                  }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Acesso Clínica</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveAudience('patient')}
                className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition ${activeAudience === 'patient'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
                  }`}
              >
                <User className="h-4 w-4" />
                <span>Acesso Paciente</span>
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleAccessSubmit}>
              <div>
                <label htmlFor="access-email" className="mb-1 block text-sm font-medium text-slate-700">
                  E-mail
                </label>
                <input
                  id="access-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
                  placeholder={
                    activeAudience === 'clinic'
                      ? 'contato@clinica.com.br'
                      : 'seuemail@exemplo.com'
                  }
                />
              </div>

              <div>
                <label htmlFor="access-password" className="mb-1 block text-sm font-medium text-slate-700">
                  Senha
                </label>
                <input
                  id="access-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
                  placeholder="Digite sua senha"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <button type="button" className="font-medium text-emerald-700 hover:text-emerald-800">
                  Esqueceu a senha?
                </button>
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
                  {activeAudience === 'clinic' ? 'Entrar no portal' : 'Entrar como paciente'}
                </button>
              </div>
            </form>

            {activeAudience === 'clinic' ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-900">
                  Ainda não é parceiro da plataforma?
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Credencie sua clínica para aumentar a captação de pacientes, reduzir
                  no-show e organizar seu fluxo comercial.
                </p>
                <button
                  type="button"
                  onClick={handleGoToClinicSignup}
                  className="mt-3 w-full rounded-lg border border-emerald-700 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Quero credenciar minha clínica
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-900">
                  Boas-vindas ao acesso do paciente
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Você pode acompanhar seu perfil no web. Para agendamento completo,
                  continue sua jornada no aplicativo.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <a
                    href="https://apps.apple.com"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-emerald-700 bg-white px-4 py-2 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    App Store
                  </a>
                  <a
                    href="https://play.google.com/store"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-emerald-700 bg-white px-4 py-2 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Google Play
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage
