function App() {
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
              <p className="text-sm text-slate-500">Conectando clínicas e pacientes</p>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500"
          >
            Acessar sistema (em breve)
          </button>
        </header>

        <section className="grid items-center gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
              Plataforma de gestão e captação em saúde
            </span>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              Mais clareza para pacientes, mais oportunidades para clínicas.
            </h1>
            <p className="text-slate-600 md:text-lg">
              Funciona como um leilão virtual de serviços de saúde: clínicas divulgam
              propostas e pacientes escolhem a melhor opção para seu momento.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Principais benefícios</h2>
            <ul className="space-y-3 text-slate-700">
              <li>Comparação transparente entre opções de atendimento.</li>
              <li>Captação recorrente de novos pacientes para clínicas parceiras.</li>
              <li>Vitrine digital para serviços que ainda são pouco conhecidos.</li>
              <li>Jornada simples para encontrar preço, prazo e qualidade.</li>
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
            Em breve, o acesso completo ao sistema estará disponível para clínicas e pacientes.
          </p>
          <button
            type="button"
            disabled
            className="mt-6 cursor-not-allowed rounded-lg bg-white/80 px-6 py-3 font-semibold text-emerald-800"
          >
            Entrar na plataforma (desativado)
          </button>
        </section>
      </div>
    </main>
  )
}

export default App
