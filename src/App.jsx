import { useState } from 'react'

function App() {
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false)
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

  const handleCredentialSubmit = (event) => {
    event.preventDefault()
  }

  const handleGoToClinicSignup = () => {
    window.location.href = '/cadastro-clinica'
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 md:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-lg font-bold text-white">
              G+
            </div>
            <div>
              <p className="text-lg font-semibold">Gerenciar Mais Saúde</p>
              <p className="text-sm text-slate-500">Solução para clínicas e consultórios</p>
              {/* <p className="text-sm text-slate-500">Conectando clínicas e pacientes</p> */}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCredentialModalOpen(true)}
            className="rounded-lg border border-emerald-700 bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Acessar sistema
          </button>
        </header>

        <section className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
              Plataforma de gestão e captação em saude
            </span>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              {/* Reduza no-show e aposente as planilhas na gestão da sua clínica. */}
              Mais facilidade para os pacientes, mais oportunidades para a sua clínica.
            </h1>
            <p className="text-slate-600 md:text-lg">
              O Gerenciar Mais Saúde centraliza o atendimento, qualifica pacientes e
              transforma a captação em um processo organizado e escalável.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Principais benefícios</h2>
            <ul className="space-y-3 text-slate-700">
              <li>Escalabilidade operacional com menos processos manuais.</li>
              <li>Organização da jornada comercial e de agendamento em um só fluxo.</li>
              <li>Qualificação de pacientes antes do contato final da clínica.</li>
              <li>Mais previsibilidade de demanda e redução de no-show.</li>
            </ul>
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
          <h2 className="text-2xl font-semibold">Pronto para transformar a gestão de saúde?</h2>
          <p className="mt-2 text-emerald-50">
            Faça o credenciamento da sua clínica e esteja entre os primeiros parceiros da
            plataforma.
          </p>
          <button
            type="button"
            onClick={() => setIsCredentialModalOpen(true)}
            className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            Credenciar clínica
          </button>
        </section>
      </div>

      {isCredentialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Credenciamento da clínica</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Acesso inicial ao Portal da Clínica. Integração com backend em preparação.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCredentialModalOpen(false)}
                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fechar modal"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCredentialSubmit}>
              <div>
                <label htmlFor="clinic-email" className="mb-1 block text-sm font-medium text-slate-700">
                  E-mail
                </label>
                <input
                  id="clinic-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 placeholder:text-slate-400 focus:ring-2"
                  placeholder="contato@clinica.com.br"
                />
              </div>

              <div>
                <label htmlFor="clinic-password" className="mb-1 block text-sm font-medium text-slate-700">
                  Senha
                </label>
                <input
                  id="clinic-password"
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
                  Entrar no portal
                </button>
              </div>
            </form>

            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">
                Ainda nao e parceiro da plataforma?
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                Credencie sua clinica para aumentar a captacao de pacientes, reduzir
                no-show e organizar seu fluxo comercial.
              </p>
              <button
                type="button"
                onClick={handleGoToClinicSignup}
                className="mt-3 w-full rounded-lg border border-emerald-700 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                Quero credenciar minha clinica
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
