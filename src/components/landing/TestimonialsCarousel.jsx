import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Star,
  Quote,
  Building2,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react'

const TESTIMONIALS_DATA = [
  {
    id: 1,
    type: 'clinic',
    author: 'Dra. Juliana Guimarães',
    role: 'Diretora Médica',
    organization: 'Policlínica Vilas Saúde',
    location: 'Lauro de Freitas, BA',
    avatar:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    impactMetric: '-38% de faltas com preparo automático',
    badgeType: 'Clínica Credenciada',
    quote:
      'A padronização das instruções de preparo de exames laboratoriais e a confirmação ágil transformaram nossa rotina. Reduzimos as faltas em 38% e nossa recepção trabalha com previsibilidade real.',
    date: 'Parceira há 8 meses',
  },
  {
    id: 2,
    type: 'patient',
    author: 'Carlos Eduardo Bahia',
    role: 'Paciente particular',
    organization: 'Atendido na Clínica São Lucas',
    location: 'Vilas do Atlântico, Lauro de Freitas',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    impactMetric: 'Economia de R$ 190 em exames',
    badgeType: 'Paciente Verificado',
    quote:
      'Consegui comparar clínicas com clareza na minha região e agendar ecocardiograma com valor 35% mais acessível. O aplicativo me deu a certeza de preço e orientações de preparo sem nenhuma surpresa.',
    date: 'Consulta este mês',
  },
  {
    id: 3,
    type: 'clinic',
    author: 'Dr. Marcelo Alencar',
    role: 'Médico Radiologista & Gestor',
    organization: 'Instituto de Diagnóstico RMS',
    location: 'Estrada do Coco, Lauro de Freitas',
    avatar:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    impactMetric: '+65 novos pacientes/mês no catálogo',
    badgeType: 'Clínica Credenciada',
    quote:
      'A sincronização dos convênios por serviço e códigos TUSS resolveu nossos gargalos de faturamento. Hoje recebemos pacientes já instruídos sobre autorizações e horários marcados.',
    date: 'Parceira há 1 ano',
  },
  {
    id: 4,
    type: 'patient',
    author: 'Mariana Sampaio',
    role: 'Usuária Bradesco Saúde',
    organization: 'Atendida no Centro Médico Litoral',
    location: 'Buraquinho, Lauro de Freitas',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    impactMetric: 'Agendamento confirmado em 2 min',
    badgeType: 'Paciente Verificado',
    quote:
      'Filtrar médicos que aceitam meu plano perto de casa acabou com o transtorno de ligar para dezenas de consultórios. Recebi a confirmação e o comprovante direto no celular sem burocracia.',
    date: 'Atendimento recente',
  },
  {
    id: 5,
    type: 'clinic',
    author: 'Patrícia Vasconcelos',
    role: 'Coordenadora de Atendimento',
    organization: 'Laboratório Vida & Saúde',
    location: 'Pitangueiras, Lauro de Freitas',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    impactMetric: 'Taxa simbólica de R$ 5,00 zerou abandono',
    badgeType: 'Clínica Credenciada',
    quote:
      'A taxa de agendamento de R$ 5,00 via PIX foi a solução ideal: o paciente valoriza a vaga reservada e nossa equipe não perde horários nobres de coleta. Uma virada de chave para clínicas da RMS.',
    date: 'Parceira há 6 meses',
  },
  {
    id: 6,
    type: 'patient',
    author: 'Roberto Nogueira',
    role: 'Usuário SulAmérica',
    organization: 'Atendido no Cardiocentro Lauro',
    location: 'Ipitanga, Lauro de Freitas',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    impactMetric: 'Preparo com clareza e sem cancelamento',
    badgeType: 'Paciente Verificado',
    quote:
      'Fiz endoscopia e teste ergométrico. As recomendações de jejum e suspensão prévia de remédios foram tão detalhadas que não tive receio. Excelente acolhimento e pontualidade na rede.',
    date: 'Atendimento no último mês',
  },
]

export function TestimonialsCarousel() {
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'clinic' | 'patient'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [itemsPerView, setItemsPerView] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3
      if (window.innerWidth >= 768) return 2
    }
    return 1
  })

  const touchStartX = useRef(null)
  const touchEndX = useRef(null)

  // Atualização responsiva da quantidade de cards por visualização
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3)
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2)
      } else {
        setItemsPerView(1)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Filtra os depoimentos com base na aba ativa
  const filteredTestimonials = useMemo(() => {
    if (activeFilter === 'all') return TESTIMONIALS_DATA
    return TESTIMONIALS_DATA.filter((item) => item.type === activeFilter)
  }, [activeFilter])

  // Limite máximo de translação
  const maxIndex = Math.max(0, filteredTestimonials.length - itemsPerView)

  // Ao mudar de filtro, reposiciona para o primeiro slide
  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setCurrentIndex(0)
  }

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  // Reprodução automática com pausa quando em foco/hover
  useEffect(() => {
    if (!isAutoPlaying || maxIndex === 0) return

    const timer = setInterval(() => {
      handleNext()
    }, 6000)

    return () => clearInterval(timer)
  }, [isAutoPlaying, maxIndex, handleNext])

  // Suporte a gestos touch para mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrev()
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  const totalDots = maxIndex + 1

  return (
    <section
      id="depoimentos"
      aria-label="Depoimentos de Clínicas e Pacientes"
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs md:p-8"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Topo da Seção: Título e Filtros Interativos */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-6">
        <div>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Histórias reais de quem confia na rede
          </h2>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Transparência para pacientes e eficiência operacional para clínicas e consultórios parceiros.
          </p>
        </div>

        {/* Abas de Filtro */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Todos</span>
            <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
              {TESTIMONIALS_DATA.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('clinic')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeFilter === 'clinic'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Clínicas & Gestores</span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('patient')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeFilter === 'patient'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Pacientes</span>
          </button>
        </div>
      </div>

      {/* Controles do Carrossel e Barra de Métricas */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-bold text-slate-800">4.9 / 5.0</span>
   
        </div>

        {/* Botões de Navegação */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            title={isAutoPlaying ? 'Pausar carrossel' : 'Retomar rotação automática'}
            aria-label={isAutoPlaying ? 'Pausar carrossel' : 'Retomar rotação automática'}
            className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
          >
            {isAutoPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={handlePrev}
            aria-label="Depoimento anterior"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Próximo depoimento"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Janela de Slides (Carrossel Dinâmico) */}
      <div
        className="overflow-hidden py-1"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {filteredTestimonials.map((item) => (
            <div
              key={item.id}
              className="shrink-0 px-2.5"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <article className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/50 to-white p-5 shadow-xs transition duration-200 hover:border-emerald-300 hover:shadow-sm">
                <div>
                  {/* Topo do Card: Aspas à esquerda e estrelas alinhadas à direita */}
                  <div className="flex items-center justify-between gap-2">
                    <Quote className="h-5 w-5 text-emerald-300" />
                    <div className="flex items-center gap-0.5">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Citação do depoimento */}
                  <p className="mt-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{item.quote}"
                  </p>
                </div>

                  {/* Rodapé do Card: Autor, Cargo e Localização */}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.author}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-100"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                          {item.author}
                        </h3>
                        <p className="truncate text-xs text-emerald-800 font-medium">
                          {item.role} • {item.organization}
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span className="truncate">{item.location}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            ))
          }
        </div>
      </div>

      {/* Indicadores de Paginação / Dots */}
      <div className="flex items-center justify-center gap-1.5 pt-2">
        {[...Array(totalDots)].map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            title={`Ir para o slide ${idx + 1}`}
            aria-label={`Ir para o slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === idx
                ? 'w-6 bg-emerald-600'
                : 'w-2 bg-slate-200 hover:bg-slate-300'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
