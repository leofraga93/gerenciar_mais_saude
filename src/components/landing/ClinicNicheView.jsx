import { createElement } from 'react'
import { ArrowRight, CalendarCheck2, ClipboardCheck, CreditCard, ShieldCheck } from 'lucide-react'
import { TestimonialsCarousel } from './TestimonialsCarousel'

function ClinicNicheView({ onOpenAuth, onGoToSignup }) {
  return (
    <div className="w-full flex-1 space-y-16 pb-16">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=2000&q=85"
          alt="Equipe médica reunida em ambiente profissional de saúde"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-blue-950/50" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-12 md:px-10 md:py-20">
          <div className="space-y-6 md:col-span-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-200">Para clínicas e consultórios</p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Mais organização para sua equipe. Mais clareza para seus pacientes.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-200">
              Apresente seus serviços, organize sua agenda e facilite a conexão com pessoas que procuram atendimento.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={onGoToSignup}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                Credenciar Minha Clínica <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('clinic')}
                className="rounded-lg border border-white/40 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                Acessar Portal
              </button>
            </div>
          </div>
          <div className="hidden justify-end md:col-span-4 md:flex" aria-hidden="true">
            <div className="flex h-48 w-48 items-center justify-center rounded-full border border-blue-300/20 bg-blue-400/10">
              <ShieldCheck className="h-24 w-24 text-blue-200" strokeWidth={1.2} />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-6xl space-y-16 px-6 md:px-10">
        <section id="beneficios-clinica" className="space-y-7">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Recursos para organizar a operação da clínica</h2>
            <p className="mt-2 text-slate-600">Conheça os recursos que ajudam sua equipe a apresentar serviços e conduzir a rotina de atendimento.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: CalendarCheck2, title: 'Agenda mais organizada', description: 'Acompanhe solicitações e organize os horários da equipe em um só lugar.' },
              { icon: ClipboardCheck, title: 'Menos faltas evitáveis', description: 'Compartilhe confirmações e orientações para que pacientes saibam como se preparar.' },
              { icon: CreditCard, title: 'Recebimentos com clareza', description: 'Visualize as informações financeiras dos atendimentos e acompanhe seus registros.' },
            ].map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  {createElement(Icon, { className: 'h-6 w-6', 'aria-hidden': true })}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="jornada-clinica" className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 md:p-9">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Jornada da clínica: do credenciamento à rotina de atendimento</h2>
          </div>
          <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['01', 'Cadastre sua clínica', 'Informe os dados necessários para iniciar o credenciamento.'],
              ['02', 'Apresente seus serviços', 'Organize procedimentos, valores e convênios aceitos.'],
              ['03', 'Receba solicitações', 'Acompanhe os pedidos de atendimento da sua equipe.'],
              ['04', 'Organize sua agenda', 'Conduza confirmações e atendimentos pelo portal.'],
            ].map(([number, title, description]) => (
              <li key={number} className="rounded-xl border border-blue-100 bg-white p-4">
                <p className="text-sm font-bold text-blue-700">{number}</p>
                <h3 className="mt-2 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <TestimonialsCarousel audience="clinic" />
      </main>
    </div>
  )
}

export default ClinicNicheView
