import { useState } from 'react'
import brandLogo from './assets/logo-500-sem-fundo.png'

function App() {
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)
  const [activeAudience, setActiveAudience] = useState('clinic')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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

  const handleAccessSubmit = (event) => {
    event.preventDefault()
  }

  const openAccessModal = (audience) => {
    setActiveAudience(audience)
    setIsAccessModalOpen(true)
  }

  const handleGoToClinicSignup = () => {
    window.location.href = '/cadastro-clinica'
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 md:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={brandLogo}
              alt="Logo Gerenciar Mais Saude"
              className="h-16 w-16 object-contain md:h-20 md:w-20"
            />
            <div>
              <p className="text-lg font-semibold">Gerenciar Mais Saúde</p>
              <p className="text-sm text-slate-500">Porta de entrada para clínicas e pacientes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openAccessModal('clinic')}
              className="rounded-lg border border-emerald-700 bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Sou Clínica
            </button>
            <button
              type="button"
              onClick={() => openAccessModal('patient')}
              className="rounded-lg border border-emerald-600 bg-transparent px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              Sou Paciente
            </button>
          </div>
        </header>

        <section className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
              Marketplace de saude para quem cuida e para quem precisa
            </span>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              Saude sem burocracia para quem cuida e para quem precisa.
            </h1>
            <p className="text-slate-600 md:text-lg">
              A plataforma conecta clinicas e pacientes em uma jornada simples, com
              mais previsibilidade para o atendimento e mais transparencia para a escolha.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => openAccessModal('clinic')}
                className="rounded-lg border border-emerald-700 bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Sou Clínica
              </button>
              <button
                type="button"
                onClick={() => openAccessModal('patient')}
                className="rounded-lg border border-emerald-600 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Sou Paciente
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Benefícios para os dois públicos</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold text-emerald-700">Para Clínicas</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  <li>Redução de no-show e agenda mais organizada.</li>
                  <li>Fluxo comercial com menos tarefas manuais.</li>
                  <li>Recebimento facilitado com suporte a PIX.</li>
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold text-emerald-700">Para Pacientes</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  <li>Agendamento mais simples e rápido.</li>
                  <li>Transparência de preços por atendimento.</li>
                  <li>Busca por clínica com convênio compatível.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
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

        <section className="space-y-6">
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

        <section className="rounded-2xl bg-emerald-600 px-6 py-8 text-center text-white">
          <h2 className="text-2xl font-semibold">Pronto para começar sua jornada na plataforma?</h2>
          <p className="mt-2 text-emerald-50">
            Escolha seu perfil e entre na experiência pensada para clínicas e pacientes.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openAccessModal('clinic')}
              className="rounded-lg bg-white px-6 py-3 font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              Sou Clínica
            </button>
            <button
              type="button"
              onClick={() => openAccessModal('patient')}
              className="rounded-lg border border-white bg-transparent px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Sou Paciente
            </button>
          </div>
        </section>
      </div>

      {isAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Acesso à plataforma</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Escolha seu perfil para continuar. Integração com backend em preparação.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAccessModalOpen(false)}
                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fechar modal"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveAudience('clinic')}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${activeAudience === 'clinic'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
                  }`}
              >
                Acesso Clínica
              </button>
              <button
                type="button"
                onClick={() => setActiveAudience('patient')}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${activeAudience === 'patient'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
                  }`}
              >
                Acesso Paciente
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
    </main>
  )
}

export default App
