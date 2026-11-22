import { createElement, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2,
  Compass,
  HeartHandshake,
  Scale,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react'
import brandLogo from '../assets/logo-500-sem-fundo.png'
import { NICHE_STORAGE_KEY } from '../hooks/useNicheSelection'

const VALUES = [
  {
    icon: HeartHandshake,
    title: 'Respeito e empatia',
    description:
      'Compreender as necessidades de pacientes e clínicas, valorizando cada pessoa e sua realidade.',
  },
  {
    icon: Scale,
    title: 'Ética e transparência',
    description:
      'Construir relações baseadas na confiança, na clareza das informações e na responsabilidade.',
  },
  {
    icon: ShieldCheck,
    title: 'Compromisso e segurança',
    description:
      'Oferecer uma experiência de agendamento organizada, confiável e cuidadosa.',
  },
  {
    icon: Sparkles,
    title: 'Inovação e praticidade',
    description:
      'Utilizar a tecnologia para reduzir burocracias, economizar tempo e facilitar o acesso aos serviços de saúde.',
  },
]

const PILLARS = [
  {
    icon: UserCheck,
    title: 'Para os pacientes',
    description: 'Menos burocracia, mais praticidade e tranquilidade.',
  },
  {
    icon: Building2,
    title: 'Para as clínicas',
    description: 'Mais visibilidade, novas oportunidades e conexão com pacientes.',
  },
  {
    icon: Users,
    title: 'Para a sociedade',
    description:
      'Tecnologia aproximando pessoas e facilitando o acesso aos cuidados com a saúde.',
  },
]

function AboutPage() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const handleReturnHome = () => {
    try {
      window.sessionStorage.removeItem(NICHE_STORAGE_KEY)
    } catch {
      // Navegação continua normalmente mesmo sem acesso ao sessionStorage.
    }
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3 md:px-10">
          <button
            type="button"
            onClick={handleReturnHome}
            className="flex shrink-0 items-center gap-3 rounded-lg text-left transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 cursor-pointer"
            aria-label="Gerenciar Mais Saúde, voltar ao início"
          >
            <img src={brandLogo} alt="" className="h-11 w-11 object-contain" aria-hidden="true" />
            <span className="whitespace-nowrap text-base font-semibold tracking-tight text-slate-900">
              Gerenciar Mais Saúde
            </span>
          </button>

          <nav className="flex items-center gap-2.5 shrink-0" aria-label="Atalhos de acesso">
            <Link
              to="/?nicho=paciente"
              className="whitespace-nowrap shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:text-sm"
            >
              Sou Paciente
            </Link>
            <Link
              to="/?nicho=clinica"
              className="whitespace-nowrap shrink-0 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:text-sm"
            >
              Sou Clínica
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-12 px-6 py-12 md:px-10 md:py-16">
        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs md:p-10">
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Quem Somos
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-medium leading-relaxed text-emerald-800">
            Conectando pessoas, facilitando cuidados e transformando a maneira de agendar exames no Brasil.
          </p>
          <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-slate-600">
            <p>
              A Gerenciar Mais Saúde é uma empresa brasileira que nasceu com um propósito claro: simplificar o acesso aos exames de saúde, aproximando pacientes e clínicas por meio da tecnologia, da praticidade e do cuidado.
            </p>
            <p>
              Sabemos que encontrar uma clínica, comparar valores e agendar um exame nem sempre é uma tarefa simples. Muitas vezes, esse processo envolve inúmeras ligações, pesquisas demoradas e dificuldades que geram preocupação, estresse e desgaste emocional, especialmente em momentos em que a saúde exige atenção e agilidade.
            </p>
            <p className="font-medium text-slate-800">
              Foi pensando nessa realidade que decidimos transformar uma dificuldade em solução.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs md:p-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Nossa História</h2>
          <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-slate-600">
            <p>
              A Gerenciar Mais Saúde surgiu de uma experiência vivida por dois colegas que, ao enfrentarem dificuldades para agendar exames para si mesmos e para familiares próximos, perceberam que aquele problema não era apenas deles, mas uma realidade compartilhada por milhões de brasileiros.
            </p>
            <p>Dessa experiência nasceu uma pergunta:</p>
            <blockquote className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-6 py-5 text-base font-semibold leading-relaxed text-emerald-950 md:text-lg">
              &ldquo;E se fosse possível encontrar, comparar e agendar exames em diferentes clínicas, de maneira simples, rápida e em um só lugar?&rdquo;
            </blockquote>
            <p>
              Foi assim que uma necessidade real se transformou em uma ideia, e essa ideia deu origem à Gerenciar Mais Saúde.
            </p>
            <p>
              Mais do que desenvolver uma plataforma tecnológica, assumimos o compromisso de criar uma solução capaz de facilitar a vida das pessoas, reduzir dificuldades e tornar a jornada de cuidados com a saúde mais tranquila e acessível.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xs md:p-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Nosso Compromisso</h2>
          <div className="mt-4 max-w-3xl space-y-3 text-base leading-relaxed text-slate-600">
            <p>
              Acreditamos que a tecnologia deve aproximar pessoas, simplificar processos e contribuir para uma experiência de cuidado mais humana.
            </p>
            <p>
              Por isso, nossa plataforma foi idealizada com base em valores que orientam cada etapa do nosso trabalho:
            </p>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    {createElement(Icon, { className: 'h-5 w-5', 'aria-hidden': true })}
                  </span>
                  <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
              </article>
            ))}
          </div>

          <p className="mt-7 border-t border-slate-100 pt-6 text-base font-medium leading-relaxed text-slate-800">
            Nossa missão é conectar pacientes às clínicas de sua preferência, permitindo consultar opções, comparar informações e realizar agendamentos com mais autonomia e tranquilidade.
          </p>
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-7 text-white shadow-md md:p-10">
          <div className="flex items-start gap-3">
            <Compass className="mt-1 h-6 w-6 shrink-0 text-emerald-200" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Gerenciar Mais Saúde — Conectando pessoas. Simplificando cuidados. Valorizando vidas.
              </h2>
              <p className="mt-2 text-lg font-medium text-emerald-100">
                Tecnologia para simplificar. Humanidade para cuidar.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl border border-white/15 bg-white/10 p-5"
              >
                <div className="flex items-center gap-2.5">
                  {createElement(Icon, { className: 'h-5 w-5 text-emerald-200', 'aria-hidden': true })}
                  <h3 className="font-semibold text-white">{title}</h3>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-emerald-50">{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 py-7 sm:flex-row md:px-10">
          <button
            type="button"
            onClick={handleReturnHome}
            className="flex items-center gap-3 rounded-lg text-left transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
            aria-label="Voltar para a página inicial"
          >
            <img src={brandLogo} alt="" className="h-10 w-10 object-contain" aria-hidden="true" />
            <span>
              <span className="block text-sm font-bold text-slate-900">Gerenciar Mais Saúde</span>
              <span className="block text-xs text-slate-500">Voltar ao início</span>
            </span>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/?nicho=paciente"
              className="whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              Ir para Paciente
            </Link>
            <Link
              to="/?nicho=clinica"
              className="whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              Ir para Clínica
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AboutPage
